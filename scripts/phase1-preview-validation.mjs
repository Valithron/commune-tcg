import assert from 'node:assert/strict';
import { randomInt, randomUUID } from 'node:crypto';
import { unlinkSync, writeFileSync } from 'node:fs';

const baseUrl = String(process.env.PHASE1_PREVIEW_URL || 'https://phase-release-hardening.commune-tcg.pages.dev').replace(/\/$/, '');

function pin() {
  return String(randomInt(0, 10000)).padStart(4, '0');
}

function identifier(prefix) {
  return `${prefix}_${randomUUID().replaceAll('-', '')}`;
}

function client() {
  let cookie = '';
  return {
    get cookiePresent() { return Boolean(cookie); },
    async request(path, { method = 'GET', body, expected = [200] } = {}) {
      const headers = { accept: 'application/json' };
      if (cookie) headers.cookie = cookie;
      if (body !== undefined) headers['content-type'] = 'application/json';
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: 'manual',
      });
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) cookie = setCookie.split(';', 1)[0];
      const text = await response.text();
      let payload = null;
      try { payload = text ? JSON.parse(text) : null; } catch { payload = { text }; }
      assert.ok(expected.includes(response.status), `${method} ${path} returned ${response.status}: ${text.slice(0, 400)}`);
      return { status: response.status, payload };
    },
  };
}

function cardOwners(payload) {
  return (payload?.cards || []).map((card) => card.ownerUserId);
}

const sterlingPin = pin();
const cydneyPin = pin();
const recoverySecretPath = '/tmp/commune-phase1-preview-validation-secrets.json';
writeFileSync(recoverySecretPath, JSON.stringify({ sterlingPin, cydneyPin }), { mode: 0o600 });
const anonymous = client();
const sterling = client();
const sterlingRecovery = client();
const cydney = client();

const report = {
  startedAt: new Date().toISOString(),
  previewUrl: baseUrl,
  accounts: {},
  checks: {},
  mutations: [],
  secretsRecorded: false,
};

const health = await anonymous.request('/api/health');
assert.equal(health.payload?.bindings?.DB, true);
assert.equal(health.payload?.bindings?.CARD_IMAGES, true);
report.checks.bindings = { DB: true, CARD_IMAGES: true };

const beforeUsers = await anonymous.request('/api/auth/users');
const beforeById = Object.fromEntries((beforeUsers.payload?.users || []).map((user) => [user.id, user]));
assert.equal(beforeById.sterling?.pinSet, false, 'Sterling preview slot must be unclaimed before validation.');
assert.equal(beforeById.cydney?.pinSet, false, 'Cydney preview slot must be unclaimed before validation.');

const unauthorizedVault = await anonymous.request('/api/vault', { expected: [401] });
report.checks.unsignedVaultDenied = unauthorizedVault.status === 401;

const sterlingSetup = await sterling.request('/api/auth/setup-pin', {
  method: 'POST',
  body: { slotId: 'sterling', username: 'P1Sterling', pin: sterlingPin, confirm: sterlingPin },
});
assert.equal(sterlingSetup.payload?.user?.id, 'sterling');
assert.equal(sterling.cookiePresent, true);
report.accounts.sterling = { slotId: 'sterling', username: 'P1Sterling', credentialCreated: true };
report.mutations.push('player_auth_users:sterling username and PIN hash', 'player_auth_sessions:sterling setup session');

const cydneySetup = await cydney.request('/api/auth/setup-pin', {
  method: 'POST',
  body: { slotId: 'cydney', username: 'P1Cydney', pin: cydneyPin, confirm: cydneyPin },
});
assert.equal(cydneySetup.payload?.user?.id, 'cydney');
assert.equal(cydney.cookiePresent, true);
report.accounts.cydney = { slotId: 'cydney', username: 'P1Cydney', credentialCreated: true };
report.mutations.push('player_auth_users:cydney username and PIN hash', 'player_auth_sessions:cydney setup session');

const sterlingLogin = await sterlingRecovery.request('/api/auth/login', {
  method: 'POST',
  body: { slotId: 'sterling', pin: sterlingPin },
});
assert.equal(sterlingLogin.payload?.user?.id, 'sterling');
report.mutations.push('player_auth_sessions:sterling recovery session');

const [sterlingMe, cydneyMe, recoveryMe] = await Promise.all([
  sterling.request('/api/auth/me'),
  cydney.request('/api/auth/me'),
  sterlingRecovery.request('/api/auth/me'),
]);
assert.equal(sterlingMe.payload?.user?.id, 'sterling');
assert.equal(cydneyMe.payload?.user?.id, 'cydney');
assert.equal(recoveryMe.payload?.user?.id, 'sterling');
report.checks.authentication = { setup: true, login: true, secondSession: true };

const [sterlingResourcesBefore, cydneyResourcesBefore] = await Promise.all([
  sterling.request('/api/pull-resources'),
  cydney.request('/api/pull-resources'),
]);
assert.equal(sterlingResourcesBefore.payload?.resources?.userId, 'sterling');
assert.equal(cydneyResourcesBefore.payload?.resources?.userId, 'cydney');
assert.equal(sterlingResourcesBefore.payload?.resources?.pullTickets, 12);
assert.equal(cydneyResourcesBefore.payload?.resources?.pullTickets, 12);
assert.equal(sterlingResourcesBefore.payload?.resources?.energy, 10);
assert.equal(sterlingResourcesBefore.payload?.resources?.energyMax, 10);
assert.equal(sterlingResourcesBefore.payload?.resources?.energyRegenIntervalMs, 420000);
report.checks.initialResources = {
  sterling: { tickets: 12, gold: 0, energy: 10 },
  cydney: { tickets: 12, gold: 0, energy: 10 },
  energyRegenIntervalMs: 420000,
};

const [sterlingVaultBefore, cydneyVaultBefore] = await Promise.all([
  sterling.request('/api/vault?owner=cydney'),
  cydney.request('/api/vault?owner=sterling'),
]);
assert.equal(sterlingVaultBefore.payload?.selectedOwnerUserId, 'sterling');
assert.equal(cydneyVaultBefore.payload?.selectedOwnerUserId, 'cydney');
assert.deepEqual([...new Set(cardOwners(sterlingVaultBefore.payload))], ['sterling']);
assert.deepEqual([...new Set(cardOwners(cydneyVaultBefore.payload))], ['cydney']);
assert.equal(sterlingVaultBefore.payload?.totalReturned, 3);
assert.equal(cydneyVaultBefore.payload?.totalReturned, 3);
report.checks.accountIsolation = { callerOwnerOverrideIgnored: true, sterlingVaultCount: 3, cydneyVaultCount: 3 };

const [sterlingInventory, cydneyInventory] = await Promise.all([
  sterling.request('/api/battle-inventory'),
  cydney.request('/api/battle-inventory'),
]);
assert.equal(sterlingInventory.payload?.battleEligibleCount, 3);
assert.equal(cydneyInventory.payload?.battleEligibleCount, 3);

const sterlingSquad = ['phase1_owned_sterling_2', 'phase1_owned_sterling_3', 'phase1_owned_sterling_1'];
const cydneySquad = ['phase1_owned_cydney_1', 'phase1_owned_cydney_2', 'phase1_owned_cydney_3'];

const crossOwnerSquad = await cydney.request('/api/battle-squad', {
  method: 'POST',
  body: { orderedCardIds: sterlingSquad },
  expected: [400],
});
assert.equal(crossOwnerSquad.payload?.ok, false);

await sterling.request('/api/battle-squad', { method: 'POST', body: { orderedCardIds: sterlingSquad } });
await cydney.request('/api/battle-squad', { method: 'POST', body: { orderedCardIds: cydneySquad } });
const [sterlingSavedSquad, cydneySavedSquad] = await Promise.all([
  sterlingRecovery.request('/api/battle-squad'),
  cydney.request('/api/battle-squad'),
]);
assert.deepEqual(sterlingSavedSquad.payload?.selectedIds, sterlingSquad);
assert.deepEqual(cydneySavedSquad.payload?.selectedIds, cydneySquad);
report.checks.squads = { crossOwnerRejected: true, persistedAcrossSession: true, cydneyIndependent: true };
report.mutations.push('user_battle_squads:sterling', 'user_battle_squads:cydney');

const pullRequestId = identifier('pull_phase1');
const pull = await sterling.request('/api/pulls', {
  method: 'POST',
  body: { count: 1, requestId: pullRequestId },
});
assert.equal(pull.payload?.idempotent, false);
assert.equal(pull.payload?.ticketsBefore, 12);
assert.equal(pull.payload?.ticketsAfter, 11);
assert.equal(pull.payload?.results?.length, 1);
const pulledOwnedCardId = pull.payload.results[0].ownedCardId;

const pullRepeat = await sterling.request('/api/pulls', {
  method: 'POST',
  body: { count: 1, requestId: pullRequestId },
});
assert.equal(pullRepeat.payload?.idempotent, true);
assert.equal(pullRepeat.payload?.ticketsAfter, 11);
assert.equal(pullRepeat.payload?.results?.[0]?.ownedCardId, pulledOwnedCardId);

const [sterlingVaultAfterPull, cydneyVaultAfterPull, sterlingPullHistory, cydneyPullHistory] = await Promise.all([
  sterling.request('/api/vault'),
  cydney.request('/api/vault'),
  sterling.request('/api/pull-history'),
  cydney.request('/api/pull-history'),
]);
assert.equal(sterlingVaultAfterPull.payload?.totalReturned, 4);
assert.equal(cydneyVaultAfterPull.payload?.totalReturned, 3);
assert.equal(sterlingPullHistory.payload?.history?.pulls?.length, 1);
assert.equal(cydneyPullHistory.payload?.history?.pulls?.length, 0);
report.checks.pullAndVault = { requestId: pullRequestId, idempotentRetry: true, ticketDebitOnce: true, pulledOwnedCardId, sterlingVaultCount: 4, cydneyVaultCount: 3 };
report.mutations.push(`pull_requests:${pullRequestId}`, `pull_history:${pullRequestId}`, `cards:${pulledOwnedCardId}`, 'user_resources:sterling tickets 12 -> 11');

const dailyClaim = await sterling.request('/api/pull-top-up', {
  method: 'POST',
  body: { offerId: 'daily-free-ticket' },
});
assert.equal(dailyClaim.payload?.ticketsAfter, 12);
const dailyRepeat = await sterling.request('/api/pull-top-up', {
  method: 'POST',
  body: { offerId: 'daily-free-ticket' },
  expected: [409],
});
assert.equal(dailyRepeat.payload?.resources?.pullTickets, 12);
report.checks.dailyTicket = { grantedOnce: true, repeatedClaimRejected: true, mountainDate: dailyClaim.payload?.mountainDate };
report.mutations.push('user_resources:sterling daily ticket claim and ticket 11 -> 12');

const sterlingEventId = identifier('evt');
const sterlingAnalyticsSession = identifier('as');
const telemetry = await sterling.request('/api/telemetry', {
  method: 'POST',
  body: { eventId: sterlingEventId, eventName: 'route.viewed', sessionId: sterlingAnalyticsSession, route: '/vault?private=removed', deviceCategory: 'desktop', browserCategory: 'chromium', outcome: 'success', durationMs: 25, errorCategory: '', relatedId: pulledOwnedCardId },
  expected: [202],
});
assert.equal(telemetry.payload?.accepted, true);
const telemetryRepeat = await sterling.request('/api/telemetry', {
  method: 'POST',
  body: { eventId: sterlingEventId, eventName: 'route.viewed', sessionId: sterlingAnalyticsSession, route: '/vault?private=removed', deviceCategory: 'desktop', browserCategory: 'chromium', outcome: 'success', durationMs: 25, errorCategory: '', relatedId: pulledOwnedCardId },
});
assert.equal(telemetryRepeat.payload?.idempotent, true);

const cydneyEventId = identifier('evt');
const cydneyAnalyticsSession = identifier('as');
await cydney.request('/api/telemetry', {
  method: 'POST',
  body: { eventId: cydneyEventId, eventName: 'session.started', sessionId: cydneyAnalyticsSession, route: '/', deviceCategory: 'phone', browserCategory: 'safari', outcome: 'success', durationMs: 10, errorCategory: '', relatedId: '' },
  expected: [202],
});
const cydneyAdminDenied = await cydney.request('/api/admin/telemetry', { expected: [403] });
assert.equal(cydneyAdminDenied.status, 403);
const telemetryExport = await sterling.request(`/api/admin/telemetry?sessionId=${encodeURIComponent(sterlingAnalyticsSession)}`);
assert.equal(telemetryExport.payload?.requestedBy, 'sterling');
assert.equal(telemetryExport.payload?.events?.length, 1);
assert.equal(telemetryExport.payload?.events?.[0]?.playerId, 'sterling');
assert.equal(telemetryExport.payload?.events?.[0]?.route, '/vault');
const telemetryDelete = await sterling.request('/api/admin/telemetry', {
  method: 'DELETE',
  body: { playerId: 'cydney' },
});
assert.equal(telemetryDelete.payload?.deleted, 1);
const invalidTelemetry = await sterling.request('/api/telemetry', {
  method: 'POST',
  body: { eventId: identifier('evt'), eventName: 'unsupported.event', sessionId: sterlingAnalyticsSession },
  expected: [400],
});
assert.equal(invalidTelemetry.status, 400);
const gameplayAfterTelemetryFailure = await sterling.request('/api/pull-resources');
assert.equal(gameplayAfterTelemetryFailure.payload?.ok, true);
report.checks.telemetry = { accepted: true, deduplicated: true, identityDerived: true, queryStripped: true, nonAdminDenied: true, adminExported: 1, cydneyEventsDeleted: 1, invalidEventIsolatedFromGameplay: true };
report.mutations.push(`telemetry_events:${sterlingEventId}`, `telemetry_events:${cydneyEventId} deleted`, 'telemetry_admin_audit:export', 'telemetry_admin_audit:delete');

const sterlingXpBefore = Object.fromEntries(sterlingVaultAfterPull.payload.cards.filter((card) => sterlingSquad.includes(card.sourceRowId || card.id)).map((card) => [card.sourceRowId || card.id, Number(card.xp || 0)]));
const sterlingAttemptId = identifier('battlephase1');
const battleCreate = await sterling.request('/api/battles', {
  method: 'POST',
  body: { attemptId: sterlingAttemptId, encounterId: 'crossroads-patrol', orderedCardIds: sterlingSquad },
  expected: [201],
});
assert.equal(battleCreate.payload?.idempotent, false);
assert.equal(battleCreate.payload?.energyAfter, 9);
const battleRepeat = await sterling.request('/api/battles', {
  method: 'POST',
  body: { attemptId: sterlingAttemptId, encounterId: 'crossroads-patrol', orderedCardIds: sterlingSquad },
});
assert.equal(battleRepeat.payload?.idempotent, true);

const recovered = await sterlingRecovery.request(`/api/battle-attempt?attemptId=${encodeURIComponent(sterlingAttemptId)}`);
assert.equal(recovered.payload?.pending, true);
assert.equal(recovered.payload?.attempt?.attemptId, sterlingAttemptId);
const cydneyCannotRecover = await cydney.request(`/api/battle-attempt?attemptId=${encodeURIComponent(sterlingAttemptId)}`);
assert.equal(cydneyCannotRecover.payload?.attempt, null);

const finalized = await sterlingRecovery.request('/api/battle-finalize', {
  method: 'POST',
  body: { attemptId: sterlingAttemptId },
});
assert.equal(finalized.payload?.idempotent, false);
assert.equal(finalized.payload?.xpApplied?.length, 3);
assert.ok(finalized.payload.xpApplied.every((item) => Number(item.gainedXp) > 0));
const finalizeRepeat = await sterling.request('/api/battle-finalize', {
  method: 'POST',
  body: { attemptId: sterlingAttemptId },
});
assert.equal(finalizeRepeat.payload?.idempotent, true);

const [sterlingResourcesAfterBattle, sterlingVaultAfterBattle, sterlingHistory, cydneyHistory] = await Promise.all([
  sterling.request('/api/pull-resources'),
  sterling.request('/api/vault'),
  sterling.request('/api/battle-history'),
  cydney.request('/api/battle-history'),
]);
assert.equal(sterlingResourcesAfterBattle.payload?.resources?.energy, 9);
assert.equal(sterlingHistory.payload?.battles?.length, 1);
assert.equal(cydneyHistory.payload?.battles?.length, 0);
const sterlingXpAfter = Object.fromEntries(sterlingVaultAfterBattle.payload.cards.filter((card) => sterlingSquad.includes(card.sourceRowId || card.id)).map((card) => [card.sourceRowId || card.id, Number(card.xp || 0)]));
for (const cardId of sterlingSquad) assert.ok(sterlingXpAfter[cardId] > sterlingXpBefore[cardId], `${cardId} XP did not increase.`);
report.checks.battleSettlement = {
  attemptId: sterlingAttemptId,
  duplicateCreateIdempotent: true,
  recoveredAcrossSession: true,
  crossAccountRecoveryDenied: true,
  duplicateFinalizeIdempotent: true,
  outcome: finalized.payload?.settlement?.outcome,
  reward: finalized.payload?.rewardApplied,
  xpApplications: finalized.payload?.xpApplied?.length,
  energyAfterCreate: 9,
  energyUpdatedAt: sterlingResourcesAfterBattle.payload?.resources?.energyUpdatedAt,
  nextEnergyAt: sterlingResourcesAfterBattle.payload?.resources?.nextEnergyAt,
};
report.mutations.push(`battle_attempts:${sterlingAttemptId}`, 'battle_history:sterling one row', 'user_resources:sterling Energy 10 -> 9 and settlement Gold', 'cards:sterling squad XP');

const cydneyAttemptId = identifier('battlephase1');
await cydney.request('/api/battles', {
  method: 'POST',
  body: { attemptId: cydneyAttemptId, encounterId: 'crossroads-patrol', orderedCardIds: cydneySquad },
  expected: [201],
});
const cydneyRecovered = await cydney.request(`/api/battle-attempt?attemptId=${encodeURIComponent(cydneyAttemptId)}`);
assert.equal(cydneyRecovered.payload?.pending, true);
const surrendered = await cydney.request('/api/battle-finalize', {
  method: 'POST',
  body: { attemptId: cydneyAttemptId, action: 'surrender' },
});
assert.equal(surrendered.payload?.attempt?.status, 'surrendered');
assert.equal(surrendered.payload?.rewardApplied?.gold, 0);
assert.ok(surrendered.payload?.xpApplied?.every((item) => Number(item.gainedXp) > 0));
report.checks.surrenderRecovery = { attemptId: cydneyAttemptId, recovered: true, status: 'surrendered', gold: 0, xpApplications: surrendered.payload?.xpApplied?.length };
report.mutations.push(`battle_attempts:${cydneyAttemptId}`, 'battle_history:cydney one surrendered row', 'user_resources:cydney Energy 10 -> 9', 'cards:cydney squad defeat XP');

const logoutClient = client();
await logoutClient.request('/api/auth/login', { method: 'POST', body: { slotId: 'sterling', pin: sterlingPin } });
await logoutClient.request('/api/auth/logout', { method: 'POST' });
const afterLogout = await logoutClient.request('/api/auth/me', { expected: [401] });
assert.equal(afterLogout.status, 401);
report.checks.logoutInvalidation = true;

report.finishedAt = new Date().toISOString();
report.ok = true;
writeFileSync('/tmp/commune-phase1-preview-validation-report.json', JSON.stringify(report, null, 2), { mode: 0o600 });
unlinkSync(recoverySecretPath);
console.log(JSON.stringify(report, null, 2));
