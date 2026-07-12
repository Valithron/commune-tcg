export const ENERGY_MAX = 10;
export const ENERGY_REGEN_INTERVAL_MS = 7 * 60 * 1000;

async function columnExists(env, tableName, columnName) {
  const result = await env.DB.prepare(`PRAGMA table_info(${tableName})`).all();
  return (result.results || []).some((column) => column.name === columnName);
}

function isDuplicateColumnError(error) {
  return String(error?.message || error || '').toLowerCase().includes('duplicate column');
}

export async function ensureEnergyColumns(env) {
  if (!(await columnExists(env, 'user_resources', 'energy'))) {
    try {
      await env.DB.prepare(`ALTER TABLE user_resources ADD COLUMN energy INTEGER NOT NULL DEFAULT ${ENERGY_MAX}`).run();
    } catch (error) {
      if (!isDuplicateColumnError(error)) throw error;
    }
  }

  if (!(await columnExists(env, 'user_resources', 'energy_updated_at'))) {
    try {
      await env.DB.prepare('ALTER TABLE user_resources ADD COLUMN energy_updated_at TEXT').run();
    } catch (error) {
      if (!isDuplicateColumnError(error)) throw error;
    }
  }
}

function parseNow(now) {
  const value = new Date(now);
  if (!Number.isFinite(value.getTime())) throw new Error('A valid Energy reconciliation time is required.');
  return value;
}

function persistedEnergy(row) {
  const energy = Number(row?.energy);
  if (!Number.isInteger(energy) || energy < 0 || energy > ENERGY_MAX) {
    throw new Error('Persisted Energy is outside the supported range.');
  }
  return energy;
}

function reconciliationPlan(row, nowDate) {
  const energy = persistedEnergy(row);
  const nowMs = nowDate.getTime();
  const rawTimestamp = row?.energyUpdatedAt ?? null;
  const timestampMs = rawTimestamp ? new Date(rawTimestamp).getTime() : Number.NaN;

  if (!rawTimestamp || !Number.isFinite(timestampMs) || timestampMs > nowMs) {
    return {
      shouldWrite: true,
      energy,
      energyUpdatedAt: nowDate.toISOString(),
      regenerated: 0,
      timestampStatus: !rawTimestamp ? 'backfilled-missing' : Number.isFinite(timestampMs) ? 'backfilled-future' : 'backfilled-malformed',
    };
  }

  if (energy === ENERGY_MAX) {
    return {
      shouldWrite: false,
      energy,
      energyUpdatedAt: rawTimestamp,
      regenerated: 0,
      timestampStatus: 'at-cap',
    };
  }

  const completedIntervals = Math.floor((nowMs - timestampMs) / ENERGY_REGEN_INTERVAL_MS);
  if (completedIntervals < 1) {
    return {
      shouldWrite: false,
      energy,
      energyUpdatedAt: rawTimestamp,
      regenerated: 0,
      timestampStatus: 'partial-interval',
    };
  }

  const nextEnergy = Math.min(ENERGY_MAX, energy + completedIntervals);
  const regenerated = nextEnergy - energy;
  const reachedCap = nextEnergy === ENERGY_MAX;
  const nextTimestampMs = reachedCap
    ? nowMs
    : timestampMs + completedIntervals * ENERGY_REGEN_INTERVAL_MS;

  return {
    shouldWrite: true,
    energy: nextEnergy,
    energyUpdatedAt: new Date(nextTimestampMs).toISOString(),
    regenerated,
    timestampStatus: reachedCap ? 'regenerated-to-cap' : 'regenerated',
  };
}

function changedRows(result) {
  return Number(result?.meta?.changes ?? result?.changes ?? 0);
}

async function readEnergyRow(env, userId) {
  return env.DB.prepare(`
    SELECT energy, energy_updated_at AS energyUpdatedAt
    FROM user_resources
    WHERE user_id = ?
    LIMIT 1
  `).bind(userId).first();
}

export async function reconcileEnergy(env, { userId, now = new Date().toISOString() }) {
  const nowDate = parseNow(now);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const row = await readEnergyRow(env, userId);
    if (!row) return null;

    const plan = reconciliationPlan(row, nowDate);
    if (!plan.shouldWrite) return plan;

    const result = await env.DB.prepare(`
      UPDATE user_resources
      SET energy = ?, energy_updated_at = ?, updated_at = ?
      WHERE user_id = ? AND energy = ? AND energy_updated_at IS ?
    `).bind(
      plan.energy,
      plan.energyUpdatedAt,
      nowDate.toISOString(),
      userId,
      Number(row.energy),
      row.energyUpdatedAt ?? null,
    ).run();

    if (changedRows(result) === 1) return plan;
  }

  throw new Error('Energy changed concurrently; retry the request.');
}
