import { getApiRoutes } from './apiClient.js';

const sessionKey = 'commune-analytics-session-v1';
const startedKey = 'commune-analytics-session-started-v1';
const recentPullKey = 'commune-telemetry-recent-pull-v1';
let lastRoute = '';
let lastRouteAt = 0;

function randomId(prefix) {
  const random = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID().replaceAll('-', '')
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

function analyticsSessionId() {
  try {
    const stored = window.sessionStorage.getItem(sessionKey);
    if (stored) return stored;
    const created = randomId('as');
    window.sessionStorage.setItem(sessionKey, created);
    return created;
  } catch {
    return randomId('as');
  }
}

function routePath() {
  const raw = globalThis.window?.location?.hash?.replace(/^#/, '').split('?')[0] || '/home';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

function deviceCategory() {
  const width = Number(globalThis.window?.innerWidth || 0);
  const touch = Number(globalThis.navigator?.maxTouchPoints || 0) > 0;
  if (touch && width > 0 && width <= 600) return 'phone';
  if (touch && width > 600 && width <= 1100) return 'tablet';
  return width ? 'desktop' : 'unknown';
}

function browserCategory() {
  const agent = String(globalThis.navigator?.userAgent || '').toLowerCase();
  if (/firefox/.test(agent)) return 'firefox';
  if (/safari/.test(agent) && !/chrome|crios|chromium|android/.test(agent)) return 'safari';
  if (/chrome|crios|chromium|edg/.test(agent)) return 'chromium';
  return agent ? 'other' : 'unknown';
}

export function telemetryErrorCategory(error) {
  const status = Number(error?.status || 0);
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();
  if (!globalThis.navigator?.onLine || message.includes('offline') || message.includes('network')) return 'offline';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'missing';
  if (status === 409 || code.includes('conflict') || code.includes('pending')) return message.includes('energy') || message.includes('ticket') || message.includes('gold') ? 'insufficient-resources' : 'conflict';
  if (status >= 500) return 'server';
  if (message.includes('timeout')) return 'timeout';
  if (message.includes('playback') || message.includes('animation')) return 'playback';
  if (status >= 400) return 'validation';
  return 'unknown';
}

export function trackTelemetry(eventName, fields = {}) {
  try {
    const payload = {
      eventId: randomId('evt'),
      eventName,
      sessionId: analyticsSessionId(),
      route: fields.route || routePath(),
      deviceCategory: deviceCategory(),
      browserCategory: browserCategory(),
      outcome: fields.outcome || 'unknown',
      durationMs: fields.durationMs ?? null,
      errorCategory: fields.errorCategory || '',
      relatedId: fields.relatedId || '',
    };
    fetch(getApiRoutes().telemetry, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).then((response) => {
      if (!response.ok) console.warn('Telemetry delivery failed.');
    }).catch(() => { console.warn('Telemetry delivery failed.'); });
  } catch {
    // Telemetry must never change gameplay behavior.
    console.warn('Telemetry delivery failed.');
  }
}

export function trackSessionStarted() {
  try {
    const sessionId = analyticsSessionId();
    if (window.sessionStorage.getItem(startedKey) === sessionId) return;
    window.sessionStorage.setItem(startedKey, sessionId);
    trackTelemetry('session.started', { outcome: 'success' });
  } catch {
    trackTelemetry('session.started', { outcome: 'success' });
  }
}

export function trackRouteView(route = routePath()) {
  const now = Date.now();
  if (route === lastRoute && now - lastRouteAt < 750) return;
  lastRoute = route;
  lastRouteAt = now;
  trackTelemetry('route.viewed', { route, outcome: 'success' });
  if (route === '/vault') {
    try {
      const pullId = window.sessionStorage.getItem(recentPullKey) || '';
      if (pullId) {
        trackTelemetry('vault.viewed_after_pull', { route, outcome: 'success', relatedId: pullId });
        window.sessionStorage.removeItem(recentPullKey);
      }
    } catch {
      // Browser storage is optional.
    }
  }
}

export function markRecentPull(pullId) {
  try {
    if (pullId) window.sessionStorage.setItem(recentPullKey, String(pullId));
  } catch {
    // Browser storage is optional.
  }
}

export function resetTelemetrySession() {
  try {
    window.sessionStorage.removeItem(sessionKey);
    window.sessionStorage.removeItem(startedKey);
    window.sessionStorage.removeItem(recentPullKey);
  } catch {
    // Browser storage is optional.
  }
  lastRoute = '';
  lastRouteAt = 0;
}
