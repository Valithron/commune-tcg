const PULL_REVEAL_STORAGE_KEY = 'commune:pullReveal:v1';

function canUseSessionStorage() {
  return typeof window !== 'undefined' && Boolean(window.sessionStorage);
}

export function savePullRevealPayload(payload) {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(PULL_REVEAL_STORAGE_KEY, JSON.stringify({
    ...payload,
    storedAt: new Date().toISOString(),
  }));
}

export function readPullRevealPayload() {
  if (!canUseSessionStorage()) {
    return null;
  }

  const rawPayload = window.sessionStorage.getItem(PULL_REVEAL_STORAGE_KEY);
  if (!rawPayload) {
    return null;
  }

  try {
    return JSON.parse(rawPayload);
  } catch {
    window.sessionStorage.removeItem(PULL_REVEAL_STORAGE_KEY);
    return null;
  }
}

export function clearPullRevealPayload() {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(PULL_REVEAL_STORAGE_KEY);
}
