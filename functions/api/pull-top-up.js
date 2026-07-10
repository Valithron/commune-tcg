import { getSessionUser } from '../_shared/auth.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';
import { temporaryStartingTickets } from '../_shared/pull-engine.js';

const mountainTimeZone = 'America/Denver';

const shopOffers = {
  'daily-free-ticket': {
    id: 'daily-free-ticket',
    title: 'Daily Ticket',
    ticketAmount: 1,
    goldCost: 0,
    daily: true,
  },
  'gold-ticket-bundle': {
    id: 'gold-ticket-bundle',
    title: 'Gold Exchange',
    ticketAmount: 5,
    goldCost: 1000,
    daily: false,
  },
  'founders-cache': {
    id: 'founders-cache',
    title: 'Founder Cache',
    ticketAmount: 12,
    goldCost: 2000,
    daily: false,
  },
};

const legacyAmountToOfferId = {
  1: 'daily-free-ticket',
  5: 'gold-ticket-bundle',
  12: 'founders-cache',
};

const userResourcesSql = `
  CREATE TABLE IF NOT EXISTS user_resources (
    user_id TEXT PRIMARY KEY,
    pull_tickets INTEGER NOT NULL,
    gold INTEGER NOT NULL,
    daily_ticket_claimed_on TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

function getMountainDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: mountainTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeOffer(payload) {
  const explicitOfferId = String(payload.offerId || payload.offer_id || '').trim();
  if (shopOffers[explicitOfferId]) {
    return shopOffers[explicitOfferId];
  }

  const legacyOfferId = legacyAmountToOfferId[Number(payload.amount)];
  return shopOffers[legacyOfferId] || shopOffers['daily-free-ticket'];
}

async function columnExists(env, tableName, columnName) {
  const result = await env.DB.prepare(`PRAGMA table_info(${tableName})`).all();
  return (result.results || []).some((column) => column.name === columnName);
}

async function ensureResources(env, now, user) {
  await env.DB.prepare(userResourcesSql).run();

  if (!(await columnExists(env, 'user_resources', 'daily_ticket_claimed_on'))) {
    await env.DB.prepare('ALTER TABLE user_resources ADD COLUMN daily_ticket_claimed_on TEXT').run();
  }

  await env.DB.prepare(`
    INSERT OR IGNORE INTO user_resources (user_id, pull_tickets, gold, daily_ticket_claimed_on, created_at, updated_at)
    VALUES (?, ?, ?, NULL, ?, ?)
  `).bind(user.id, temporaryStartingTickets, 0, now, now).run();
}

async function readResources(env, user) {
  return env.DB.prepare(`
    SELECT
      user_id AS userId,
      pull_tickets AS pullTickets,
      gold,
      daily_ticket_claimed_on AS dailyTicketClaimedOn,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM user_resources
    WHERE user_id = ?
    LIMIT 1
  `).bind(user.id).first();
}

function shapeResources(row, user, mountainDate) {
  const claimedOn = row?.dailyTicketClaimedOn || '';

  return {
    userId: row?.userId || user.id,
    ownerDisplayName: user.displayName,
    pullTickets: Number(row?.pullTickets || 0),
    gold: Number(row?.gold || 0),
    dailyTicketClaimedOn: claimedOn,
    dailyTicketAvailable: claimedOn !== mountainDate,
    mountainDate,
    dailyResetTimeZone: mountainTimeZone,
    createdAt: row?.createdAt || '',
    updatedAt: row?.updatedAt || '',
  };
}

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return request.json();
  }

  const formData = await request.formData();

  return {
    offerId: formData.get('offerId'),
    amount: formData.get('amount'),
  };
}

async function applyDailyOffer(env, { offer, user, before, now, mountainDate }) {
  if (before?.dailyTicketClaimedOn === mountainDate) {
    return {
      ok: false,
      status: 409,
      error: 'Daily ticket already claimed. It resets at midnight Mountain Time.',
    };
  }

  const result = await env.DB.prepare(`
    UPDATE user_resources
    SET pull_tickets = pull_tickets + ?, daily_ticket_claimed_on = ?, updated_at = ?
    WHERE user_id = ? AND COALESCE(daily_ticket_claimed_on, '') != ?
  `).bind(offer.ticketAmount, mountainDate, now, user.id, mountainDate).run();

  if (Number(result?.meta?.changes || 0) < 1) {
    return {
      ok: false,
      status: 409,
      error: 'Daily ticket already claimed. It resets at midnight Mountain Time.',
    };
  }

  return { ok: true };
}

async function applyGoldOffer(env, { offer, user, before, now }) {
  const goldBefore = Number(before?.gold || 0);

  if (goldBefore < offer.goldCost) {
    return {
      ok: false,
      status: 409,
      error: `Not enough gold. ${offer.title} costs ${offer.goldCost} gold.`,
    };
  }

  const result = await env.DB.prepare(`
    UPDATE user_resources
    SET pull_tickets = pull_tickets + ?, gold = gold - ?, updated_at = ?
    WHERE user_id = ? AND gold >= ?
  `).bind(offer.ticketAmount, offer.goldCost, now, user.id, offer.goldCost).run();

  if (Number(result?.meta?.changes || 0) < 1) {
    return {
      ok: false,
      status: 409,
      error: `Not enough gold. ${offer.title} costs ${offer.goldCost} gold.`,
    };
  }

  return { ok: true };
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in before buying tickets.', 401);

    const now = new Date().toISOString();
    const mountainDate = getMountainDateKey(new Date(now));
    const payload = await readPayload(request);
    const offer = normalizeOffer(payload || {});

    await ensureResources(env, now, user);

    const beforeRow = await readResources(env, user);
    const before = shapeResources(beforeRow, user, mountainDate);
    const application = offer.daily
      ? await applyDailyOffer(env, { offer, user, before, now, mountainDate })
      : await applyGoldOffer(env, { offer, user, before, now });

    if (!application.ok) {
      return jsonResponse({
        ok: false,
        source: 'D1 user_resources',
        phase: 'auth-current-user-ticket-shop',
        userId: user.id,
        ownerDisplayName: user.displayName,
        offerId: offer.id,
        error: application.error,
        resources: before,
      }, { status: application.status || 409 });
    }

    const after = shapeResources(await readResources(env, user), user, mountainDate);

    return jsonResponse({
      ok: true,
      source: 'D1 user_resources',
      phase: 'auth-current-user-ticket-shop',
      userId: user.id,
      ownerDisplayName: user.displayName,
      offerId: offer.id,
      offerTitle: offer.title,
      amount: offer.ticketAmount,
      ticketAmount: offer.ticketAmount,
      goldCost: offer.goldCost,
      daily: offer.daily,
      mountainDate,
      dailyResetTimeZone: mountainTimeZone,
      ticketsBefore: before.pullTickets,
      ticketsAfter: after.pullTickets,
      goldBefore: before.gold,
      goldAfter: after.gold,
      resources: after,
      warnings: offer.daily
        ? ['Daily ticket claim is limited by America/Denver calendar date.']
        : ['Gold was deducted from the signed-in user_resources row.'],
    });
  } catch (error) {
    return errorResponse('Failed to buy pull tickets.', 500, error.message);
  }
}
