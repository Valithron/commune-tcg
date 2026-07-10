/* Authoritative pending-attempt lifecycle. D1 writes are guarded by status and
   settlement tokens so duplicate create/finalize/surrender calls are harmless. */

import { BATTLE_RULES_VERSION, MVP_VERSION } from '../../shared/battle/battle-config.js';
import { getEncounterById } from '../../shared/battle/encounter-registry.js';
import { normalizeBattleMaxLevel, previewLevelFromXp } from './battle-reward-contract.js';
import { createAuthoritativeBattleResult } from './battle-adapter.js';

export const BATTLE_ATTEMPT_SCHEMA_VERSION = 'battle-attempts-1.0.0';
export const DEFAULT_ENERGY = 10;

const attemptTableSql = `
  CREATE TABLE IF NOT EXISTS battle_attempts (
    attempt_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL,
    encounter_id TEXT NOT NULL,
    encounter_version TEXT NOT NULL,
    rules_version TEXT NOT NULL,
    mvp_version TEXT NOT NULL,
    seed TEXT NOT NULL,
    ordered_card_ids TEXT NOT NULL,
    result_json TEXT NOT NULL,
    settlement_json TEXT,
    settlement_token TEXT,
    energy_spent INTEGER NOT NULL DEFAULT 0,
    surrender INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    finalized_at TEXT
  )
`;

const dailyTableSql = `
  CREATE TABLE IF NOT EXISTS battle_daily_victories (
    user_id TEXT NOT NULL,
    encounter_id TEXT NOT NULL,
    local_date TEXT NOT NULL,
    attempt_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, encounter_id, local_date)
  )
`;

const historyTableSql = `
  CREATE TABLE IF NOT EXISTS battle_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    encounter_id TEXT NOT NULL,
    victory INTEGER NOT NULL,
    squad_power INTEGER NOT NULL,
    enemy_power INTEGER NOT NULL,
    result_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`;

function safeParse(value, fallback = null) { try { return JSON.parse(value || ''); } catch { return fallback; } }
function buildId(prefix) { return `${prefix}_${Date.now()}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`; }
async function columnExists(env, table, column) { const result = await env.DB.prepare(`PRAGMA table_info(${table})`).all(); return (result.results || []).some((item) => item.name === column); }

export async function ensureBattleAttemptSchemas(env, { ownerUserId = '', now = new Date().toISOString() } = {}) {
  await env.DB.prepare(attemptTableSql).run();
  await env.DB.prepare(dailyTableSql).run();
  await env.DB.prepare(historyTableSql).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_battle_attempts_user_status ON battle_attempts (user_id, status, created_at)').run();
  await env.DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_battle_attempts_one_active_per_user ON battle_attempts (user_id) WHERE status IN ('pending', 'settling')`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_battle_history_user_created ON battle_history (user_id, created_at)').run();
  if (!(await columnExists(env, 'battle_history', 'attempt_id'))) await env.DB.prepare('ALTER TABLE battle_history ADD COLUMN attempt_id TEXT').run();
  await env.DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_battle_history_user_attempt ON battle_history (user_id, attempt_id) WHERE attempt_id IS NOT NULL AND TRIM(attempt_id) != ''`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_resources (user_id TEXT PRIMARY KEY, pull_tickets INTEGER NOT NULL DEFAULT 0, gold INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`).run();
  if (!(await columnExists(env, 'user_resources', 'energy'))) await env.DB.prepare(`ALTER TABLE user_resources ADD COLUMN energy INTEGER NOT NULL DEFAULT ${DEFAULT_ENERGY}`).run();
  if (!(await columnExists(env, 'user_resources', 'energy_updated_at'))) await env.DB.prepare('ALTER TABLE user_resources ADD COLUMN energy_updated_at TEXT').run();
  if (ownerUserId) await env.DB.prepare(`INSERT OR IGNORE INTO user_resources (user_id, pull_tickets, gold, energy, energy_updated_at, created_at, updated_at) VALUES (?, 0, 0, ?, ?, ?, ?)`).bind(ownerUserId, DEFAULT_ENERGY, now, now, now).run();
}

export async function readAttempt(env, { userId, attemptId }) {
  const row = await env.DB.prepare(`SELECT attempt_id AS attemptId, user_id AS userId, status, encounter_id AS encounterId, encounter_version AS encounterVersion, rules_version AS rulesVersion, mvp_version AS mvpVersion, seed, ordered_card_ids AS orderedCardIds, result_json AS resultJson, settlement_json AS settlementJson, settlement_token AS settlementToken, energy_spent AS energySpent, surrender, created_at AS createdAt, finalized_at AS finalizedAt FROM battle_attempts WHERE user_id = ? AND attempt_id = ? LIMIT 1`).bind(userId, attemptId).first();
  return hydrateAttempt(row);
}

export async function readLatestPendingAttempt(env, { userId }) {
  const row = await env.DB.prepare(`SELECT attempt_id AS attemptId, user_id AS userId, status, encounter_id AS encounterId, encounter_version AS encounterVersion, rules_version AS rulesVersion, mvp_version AS mvpVersion, seed, ordered_card_ids AS orderedCardIds, result_json AS resultJson, settlement_json AS settlementJson, settlement_token AS settlementToken, energy_spent AS energySpent, surrender, created_at AS createdAt, finalized_at AS finalizedAt FROM battle_attempts WHERE user_id = ? AND status IN ('pending', 'settling') ORDER BY created_at DESC LIMIT 1`).bind(userId).first();
  return hydrateAttempt(row);
}

function hydrateAttempt(row) {
  if (!row) return null;
  return { ...row, energySpent: Number(row.energySpent), surrender: Boolean(row.surrender), orderedCardIds: safeParse(row.orderedCardIds, []), result: safeParse(row.resultJson, {}), settlement: safeParse(row.settlementJson, null) };
}

export async function createPendingBattleAttempt(env, { userId, userDisplayName, attemptId, encounterId, orderedCardIds, now = new Date().toISOString() }) {
  await ensureBattleAttemptSchemas(env, { ownerUserId: userId, now });
  const existing = await readAttempt(env, { userId, attemptId });
  if (existing) return { ok: true, idempotent: true, attempt: existing };
  const pending = await readLatestPendingAttempt(env, { userId });
  if (pending) return { ok: false, status: 409, code: 'pending-battle-exists', error: 'Finish or surrender the current battle before beginning another.', pendingAttemptId: pending.attemptId };
  const encounter = getEncounterById(encounterId);
  if (!encounter) return { ok: false, status: 404, code: 'encounter-not-found', error: 'Encounter not found.' };
  const resources = await env.DB.prepare('SELECT energy FROM user_resources WHERE user_id = ? LIMIT 1').bind(userId).first();
  if (Number(resources?.energy || 0) < encounter.energyCost) return { ok: false, status: 409, code: 'insufficient-energy', error: 'Not enough Energy.', energy: Number(resources?.energy || 0), energyCost: encounter.energyCost };
  const seed = crypto.randomUUID();
  const authoritative = await createAuthoritativeBattleResult(env, { ownerUserId: userId, ownerDisplayName: userDisplayName, encounterId, orderedCardIds, seed });
  if (!authoritative.ok) return { ...authoritative, code: authoritative.errors?.[0] || 'battle-validation-failed', error: 'Battle validation failed.' };
  const storedResult = {
    schemaVersion: BATTLE_ATTEMPT_SCHEMA_VERSION,
    rulesVersion: authoritative.combat.rulesVersion,
    encounterVersion: encounter.version,
    mvpVersion: MVP_VERSION,
    ownerUserId: userId,
    ownerDisplayName: userDisplayName,
    encounter,
    orderedCardIds: authoritative.orderedCardIds,
    playerSnapshot: authoritative.combat.initialState.player,
    enemySnapshot: authoritative.combat.initialState.enemy,
    squadPower: authoritative.squadPower,
    enemyPower: authoritative.enemyPower,
    combat: authoritative.combat,
  };
  const statements = [
    env.DB.prepare(`INSERT INTO battle_attempts (attempt_id, user_id, status, encounter_id, encounter_version, rules_version, mvp_version, seed, ordered_card_ids, result_json, energy_spent, surrender, created_at) SELECT ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, 0, ? WHERE EXISTS (SELECT 1 FROM user_resources WHERE user_id = ? AND energy >= ?)`).bind(attemptId, userId, encounter.id, encounter.version, BATTLE_RULES_VERSION, MVP_VERSION, seed, JSON.stringify(authoritative.orderedCardIds), JSON.stringify(storedResult), encounter.energyCost, now, userId, encounter.energyCost),
    env.DB.prepare(`UPDATE user_resources SET energy = energy - ?, energy_updated_at = ?, updated_at = ? WHERE user_id = ? AND energy >= ? AND EXISTS (SELECT 1 FROM battle_attempts WHERE attempt_id = ? AND user_id = ? AND status = 'pending')`).bind(encounter.energyCost, now, now, userId, encounter.energyCost, attemptId, userId),
  ];
  try { await env.DB.batch(statements); } catch (error) {
    const raced = await readAttempt(env, { userId, attemptId });
    if (raced) return { ok: true, idempotent: true, attempt: raced };
    const active = await readLatestPendingAttempt(env, { userId });
    if (active) return { ok: false, status: 409, code: 'pending-battle-exists', error: 'Finish or surrender the current battle before beginning another.', pendingAttemptId: active.attemptId };
    throw error;
  }
  const attempt = await readAttempt(env, { userId, attemptId });
  if (!attempt) return { ok: false, status: 409, code: 'attempt-create-failed', error: 'Battle attempt could not be committed; no Energy was spent.' };
  const after = await env.DB.prepare('SELECT energy FROM user_resources WHERE user_id = ? LIMIT 1').bind(userId).first();
  return { ok: true, idempotent: false, attempt, energyAfter: Number(after?.energy || 0) };
}

function localDate(now, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(now));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function rewardForAttempt(attempt, { surrendered = false, firstDailyVictory = false } = {}) {
  const encounter = attempt.result.encounter;
  const victory = attempt.result.combat.outcome === 'victory' && !surrendered;
  const normal = victory ? encounter.rewards.victory : encounter.rewards.defeat;
  const baseXp = victory ? normal.xpPerCard : Math.round(encounter.rewards.victory.xpPerCard * normal.xpMultiplier);
  const bonus = victory && firstDailyVictory ? encounter.rewards.firstDailyVictory : { gold: 0, xpPerCard: 0 };
  return { victory, surrendered, gold: Number(normal.gold || 0) + Number(bonus.gold || 0), baseGold: Number(normal.gold || 0), bonusGold: Number(bonus.gold || 0), xpPerCard: baseXp + Number(bonus.xpPerCard || 0), baseXpPerCard: baseXp, bonusXpPerCard: Number(bonus.xpPerCard || 0), firstDailyVictory, pullTickets: 0, drops: [] };
}

async function reserveDailyVictory(env, attempt, now, surrendered) {
  if (surrendered || attempt.result.combat.outcome !== 'victory') return false;
  const encounter = attempt.result.encounter;
  const date = localDate(now, encounter.dailyResetTimeZone || 'America/Denver');
  await env.DB.prepare(`INSERT OR IGNORE INTO battle_daily_victories (user_id, encounter_id, local_date, attempt_id, created_at) VALUES (?, ?, ?, ?, ?)`).bind(attempt.userId, encounter.id, date, attempt.attemptId, now).run();
  const row = await env.DB.prepare(`SELECT attempt_id AS attemptId FROM battle_daily_victories WHERE user_id = ? AND encounter_id = ? AND local_date = ? LIMIT 1`).bind(attempt.userId, encounter.id, date).first();
  return row?.attemptId === attempt.attemptId;
}

function readCardPayload(cardJson) { const parsed = safeParse(cardJson, null); return { parsed, payload: parsed?.card || parsed?.data?.card || parsed?.data || parsed || {} }; }
function cardMaxLevel(payload) { const rules = payload.progressionRules || payload.progression_rules || {}; return normalizeBattleMaxLevel(payload.maxLevel ?? payload.max_level ?? payload.levelCap ?? payload.level_cap ?? rules.maxLevel ?? rules.levelCap, 30); }
function updateProgressionPayload(payload, application, battleId, now) { const progression = payload.progression && typeof payload.progression === 'object' ? payload.progression : {}; return { ...payload, xp: application.nextXp, experience: application.nextXp, level: application.nextLevel, card_level: application.nextLevel, progression: { ...progression, xp: application.nextXp, level: application.nextLevel }, battle_xp_updated_at: now, last_battle_id: battleId, last_battle_at: now }; }
function updatedCardJson(cardJson, application, battleId, now) {
  const { parsed, payload } = readCardPayload(cardJson);
  const updated = updateProgressionPayload(payload, application, battleId, now);
  if (parsed?.card) return JSON.stringify({ ...parsed, card: updated });
  if (parsed?.data?.card) return JSON.stringify({ ...parsed, data: { ...parsed.data, card: updated } });
  if (parsed?.data) return JSON.stringify({ ...parsed, data: updated });
  return JSON.stringify(updated);
}

async function buildXpApplications(env, attempt, reward, battleId, now) {
  const applications = [];
  for (const sourceRowId of attempt.orderedCardIds) {
    const row = await env.DB.prepare(`SELECT id, card_json AS cardJson FROM cards WHERE id = ? AND CAST(owner_user_id AS TEXT) = ? LIMIT 1`).bind(sourceRowId, attempt.userId).first();
    if (!row) throw Object.assign(new Error('Owned card disappeared before settlement.'), { code: 'settlement-card-missing', status: 409 });
    const { payload } = readCardPayload(row.cardJson);
    const previousLevel = Number(payload.level ?? payload.card_level ?? payload.progression?.level ?? 1);
    const previousXp = Number(payload.xp ?? payload.experience ?? payload.progression?.xp ?? 0);
    const maxLevel = cardMaxLevel(payload);
    const preview = previewLevelFromXp({ currentLevel: previousLevel, currentXp: previousXp, gainedXp: reward.xpPerCard, maxLevel });
    const application = { cardId: sourceRowId, sourceRowId, cardTitle: payload.name || payload.card_name || 'Card', previousLevel, previousXp, maxLevel, gainedXp: reward.xpPerCard, nextLevel: preview.nextLevelPreview, nextXp: preview.nextXpPreview, xpIntoCurrentLevel: preview.xpIntoCurrentLevelPreview, xpToNextLevel: preview.xpToNextLevelPreview, levelsGained: preview.levelsGained, maxLevelReached: preview.maxLevelReached };
    applications.push({ ...application, updatedCardJson: updatedCardJson(row.cardJson, application, battleId, now) });
  }
  return applications;
}

export async function finalizeBattleAttempt(env, { userId, attemptId, surrender = false, now = new Date().toISOString() }) {
  await ensureBattleAttemptSchemas(env, { ownerUserId: userId, now });
  let attempt = await readAttempt(env, { userId, attemptId });
  if (!attempt) return { ok: false, status: 404, code: 'battle-attempt-not-found', error: 'Battle attempt not found.' };
  if (attempt.status === 'finalized' || attempt.status === 'surrendered') return { ok: true, idempotent: true, attempt, settlement: attempt.settlement };
  if (attempt.status !== 'pending') return { ok: false, status: 409, code: 'battle-attempt-settling', error: 'Battle settlement is already in progress.' };
  const firstDailyVictory = await reserveDailyVictory(env, attempt, now, surrender);
  const reward = rewardForAttempt(attempt, { surrendered: surrender, firstDailyVictory });
  const settlementToken = crypto.randomUUID();
  const battleId = buildId('battle');
  const xpApplied = await buildXpApplications(env, attempt, reward, battleId, now);
  const before = await env.DB.prepare('SELECT gold, energy FROM user_resources WHERE user_id = ? LIMIT 1').bind(userId).first();
  const settlement = { battleId, attemptId, outcome: surrender ? 'defeat' : attempt.result.combat.outcome, surrender, reward, xpApplied: xpApplied.map(({ updatedCardJson: _, ...application }) => application), resourcesBefore: { gold: Number(before?.gold || 0), energy: Number(before?.energy || 0) }, resourcesAfter: { gold: Number(before?.gold || 0) + reward.gold, energy: Number(before?.energy || 0) }, finalizedAt: now };
  const historyJson = JSON.stringify({ ...attempt.result, attemptId, battleId, status: surrender ? 'surrendered' : 'finalized', surrender, rewardApplied: reward, xpApplied: settlement.xpApplied, settlement, finalizedAt: now });
  const guard = `EXISTS (SELECT 1 FROM battle_attempts WHERE attempt_id = ? AND user_id = ? AND status = 'settling' AND settlement_token = ?)`;
  const statements = [
    env.DB.prepare(`UPDATE battle_attempts SET status = 'settling', settlement_token = ? WHERE attempt_id = ? AND user_id = ? AND status = 'pending'`).bind(settlementToken, attemptId, userId),
    env.DB.prepare(`UPDATE user_resources SET gold = gold + ?, updated_at = ? WHERE user_id = ? AND ${guard}`).bind(reward.gold, now, userId, attemptId, userId, settlementToken),
    ...xpApplied.map((application) => env.DB.prepare(`UPDATE cards SET card_json = ?, updated_at = ? WHERE id = ? AND CAST(owner_user_id AS TEXT) = ? AND ${guard}`).bind(application.updatedCardJson, now, application.sourceRowId, userId, attemptId, userId, settlementToken)),
    env.DB.prepare(`INSERT INTO battle_history (id, attempt_id, user_id, encounter_id, victory, squad_power, enemy_power, result_json, created_at) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE ${guard}`).bind(battleId, attemptId, userId, attempt.encounterId, reward.victory ? 1 : 0, attempt.result.squadPower, attempt.result.enemyPower, historyJson, now, attemptId, userId, settlementToken),
    env.DB.prepare(`UPDATE battle_attempts SET status = ?, surrender = ?, settlement_json = ?, finalized_at = ?, settlement_token = NULL WHERE attempt_id = ? AND user_id = ? AND status = 'settling' AND settlement_token = ?`).bind(surrender ? 'surrendered' : 'finalized', surrender ? 1 : 0, JSON.stringify(settlement), now, attemptId, userId, settlementToken),
  ];
  await env.DB.batch(statements);
  attempt = await readAttempt(env, { userId, attemptId });
  return { ok: true, idempotent: false, attempt, settlement: attempt.settlement };
}

export function attemptForClient(attempt) {
  if (!attempt) return null;
  return { attemptId: attempt.attemptId, status: attempt.status, encounterId: attempt.encounterId, encounterVersion: attempt.encounterVersion, rulesVersion: attempt.rulesVersion, mvpVersion: attempt.mvpVersion, seed: attempt.seed, orderedCardIds: attempt.orderedCardIds, energySpent: attempt.energySpent, surrender: attempt.surrender, createdAt: attempt.createdAt, finalizedAt: attempt.finalizedAt, result: attempt.result, settlement: attempt.settlement };
}
