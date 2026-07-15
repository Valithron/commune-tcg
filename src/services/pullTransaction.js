/* Coordinates one authoritative pull request across catalog, cinematic, and repull flows. */

import { clearVaultCache } from '../data/vaultData.js';
import { clampPullCount } from '../components/format.js';
import { getApiRoutes } from './apiClient.js';
import { readPullRevealPayload, savePullRevealPayload } from './pullRevealStore.js';
import { markRecentPull, telemetryErrorCategory, trackTelemetry } from './telemetry.js';

const pendingKey = 'imago:pendingPull:v2';
const inFlight = new Map();

function canStore() {
  return typeof window !== 'undefined' && Boolean(window.sessionStorage);
}

function readStoredPending() {
  if (!canStore()) return null;
  try {
    return JSON.parse(window.sessionStorage.getItem(pendingKey) || 'null');
  } catch {
    window.sessionStorage.removeItem(pendingKey);
    return null;
  }
}

function writeStoredPending(value) {
  if (!canStore()) return;
  if (!value) window.sessionStorage.removeItem(pendingKey);
  else window.sessionStorage.setItem(pendingKey, JSON.stringify(value));
}

function createRequestId() {
  const randomPart = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID().replaceAll('-', '')
    : Math.random().toString(36).slice(2);
  return `pull_${Date.now()}_${randomPart}`;
}

export function readPendingPullTransaction() {
  return readStoredPending();
}

function normalizePending({ count, source, forceNew }) {
  const safeCount = clampPullCount(count || 1);
  const existing = readStoredPending();
  if (!forceNew && existing?.requestId && Number(existing.count) === safeCount) return existing;
  if (existing?.requestId && existing.status === 'pending' && Number(existing.count) === safeCount) return existing;

  const pending = {
    requestId: createRequestId(),
    count: safeCount,
    source: source || 'initial',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  writeStoredPending(pending);
  return pending;
}

function buildRevealPayload(payload, pending) {
  const cards = (payload.results || []).map((result) => result.ownedCard).filter(Boolean);
  if (cards.length !== Number(pending.count)) {
    throw new Error('The pull resolved, but not all cards were returned for reveal.');
  }

  return {
    mode: Number(pending.count) === 5 ? 'multi' : 'single',
    source: 'real',
    count: Number(pending.count),
    cards,
    pullId: payload.pullId || pending.requestId,
    requestId: pending.requestId,
    ticketsBefore: payload.ticketsBefore,
    ticketsAfter: payload.ticketsAfter,
    poolSummary: payload.poolSummary,
    fallbackCount: (payload.results || []).filter((result) => result.fallbackUsed).length,
  };
}

async function executePending(pending) {
  const existingPromise = inFlight.get(pending.requestId);
  if (existingPromise) return existingPromise;

  const promise = (async () => {
    const routes = getApiRoutes();
    const startedAt = performance.now();
    trackTelemetry('pull.started', { outcome: 'success', relatedId: pending.requestId });

    try {
      const response = await fetch(routes.pulls, {
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({ count: Number(pending.count), requestId: pending.requestId }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        throw Object.assign(new Error(payload?.error || `Pull failed with ${response.status}`), { status: response.status });
      }

      const revealPayload = buildRevealPayload(payload, pending);
      savePullRevealPayload(revealPayload);
      clearVaultCache();
      markRecentPull(revealPayload.pullId);
      trackTelemetry('pull.completed', {
        outcome: 'success',
        durationMs: performance.now() - startedAt,
        relatedId: revealPayload.pullId,
      });
      writeStoredPending(null);
      return revealPayload;
    } catch (error) {
      writeStoredPending({
        ...pending,
        status: 'error',
        error: error.message,
        updatedAt: new Date().toISOString(),
      });
      trackTelemetry('pull.interrupted', {
        outcome: 'interrupted',
        durationMs: performance.now() - startedAt,
        errorCategory: telemetryErrorCategory(error),
        relatedId: pending.requestId,
      });
      throw error;
    } finally {
      inFlight.delete(pending.requestId);
    }
  })();

  inFlight.set(pending.requestId, promise);
  return promise;
}

export function beginPullTransaction({ count = 1, source = 'initial', forceNew = false } = {}) {
  const pending = normalizePending({ count, source, forceNew });
  return executePending({ ...pending, status: 'pending' });
}

export function resumePendingPullTransaction({ count = 1 } = {}) {
  const existingReveal = readPullRevealPayload();
  const pending = readStoredPending();
  if (!pending?.requestId) {
    if (existingReveal?.cards?.length) return Promise.resolve(existingReveal);
    return Promise.reject(new Error('No pending pull transaction was found.'));
  }

  const safeCount = clampPullCount(count || pending.count || 1);
  if (Number(pending.count) !== safeCount) {
    return Promise.reject(new Error('The pending pull count does not match this reveal.'));
  }

  if (pending.status === 'error') {
    trackTelemetry('retry.attempted', { outcome: 'success', relatedId: pending.requestId });
  }
  writeStoredPending({ ...pending, status: 'pending', error: '' });
  return executePending({ ...pending, status: 'pending' });
}
