import { getSessionUser } from '../_shared/auth.js';
import { ENERGY_MAX, ensureEnergyColumns, reconcileEnergy } from '../_shared/energy.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';
import { temporaryStartingTickets } from '../_shared/pull-engine.js';

const mountainTimeZone = 'America/Denver';

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

async function columnExists(env, tableName, columnName) {
  const result = await env.DB.prepare(`PRAGMA table_info(${tableName})`).all();
  return (result.results || []).some((column) => column.name === columnName);
}

function isDuplicateColumnError(error) {
  return String(error?.message || error || '').toLowerCase().includes('duplicate column');
}

async function ensureDailyTicketColumn(env) {
  if (await columnExists(env, 'user_resources', 'daily_ticket_claimed_on')) {
    return;
  }

  try {
    await env.DB.prepare('ALTER TABLE user_resources ADD COLUMN daily_ticket_claimed_on TEXT').run();
  } catch (error) {
    if (!isDuplicateColumnError(error)) {
      throw error;
    }
  }
}

async function ensureResources(env, now, user) {
  await env.DB.prepare(userResourcesSql).run();
  await ensureDailyTicketColumn(env);
  await ensureEnergyColumns(env);

  await env.DB.prepare(`
    INSERT OR IGNORE INTO user_resources (user_id, pull_tickets, gold, daily_ticket_claimed_on, energy, energy_updated_at, created_at, updated_at)
    VALUES (?, ?, ?, NULL, ?, ?, ?, ?)
  `).bind(user.id, temporaryStartingTickets, 0, ENERGY_MAX, now, now, now).run();
}

async function readResources(env, user) {
  return env.DB.prepare(`
    SELECT
      user_id AS userId,
      pull_tickets AS pullTickets,
      gold,
      daily_ticket_claimed_on AS dailyTicketClaimedOn,
      energy,
      energy_updated_at AS energyUpdatedAt,
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
    energy: Number(row?.energy ?? 10),
    energyUpdatedAt: row?.energyUpdatedAt || '',
    dailyTicketClaimedOn: claimedOn,
    dailyTicketAvailable: claimedOn !== mountainDate,
    mountainDate,
    dailyResetTimeZone: mountainTimeZone,
    createdAt: row?.createdAt || '',
    updatedAt: row?.updatedAt || '',
    bootstrapped: Boolean(row),
    tableExists: true,
  };
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in to read pull resources.', 401);

    const now = new Date().toISOString();
    const mountainDate = getMountainDateKey(new Date(now));
    await ensureResources(env, now, user);
    const energyReconciliation = await reconcileEnergy(env, { userId: user.id, now });
    const resources = shapeResources(await readResources(env, user), user, mountainDate);

    return jsonResponse({
      ok: true,
      source: 'D1 user_resources',
      phase: 'auth-current-user-ticket-shop',
      readOnly: false,
      schemaEnsured: true,
      userId: user.id,
      ownerDisplayName: user.displayName,
      resources,
      energyReconciliation,
      warnings: ['This endpoint reads the signed-in player resource row and reconciles elapsed Energy before returning it.'],
    });
  } catch (error) {
    return errorResponse('Failed to read pull resources.', 500, error.message);
  }
}
