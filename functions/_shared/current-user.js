/* ============================================================================
   Current User Helper
   Purpose: centralize the active player contract for APIs that create or own data.
   ============================================================================ */

import { getSessionUser } from './auth.js';

export const temporaryCurrentUser = {
  id: 'sterling',
  displayName: 'Sterling',
};

function cleanText(value, maxLength = 120) {
  return String(value || '').trim().slice(0, maxLength);
}

function cleanUserId(value) {
  return cleanText(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '') || temporaryCurrentUser.id;
}

function displayNameFromEmail(email) {
  const localPart = cleanText(email).split('@')[0] || '';
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || temporaryCurrentUser.displayName;
}

export async function resolveCurrentUser(request, env = null) {
  if (env?.DB) {
    const sessionUser = await getSessionUser(request, env).catch(() => null);
    if (sessionUser?.id) {
      return {
        id: sessionUser.id,
        displayName: sessionUser.displayName || sessionUser.username || sessionUser.id,
        username: sessionUser.username || '',
        source: 'player-auth-session',
      };
    }
  }

  const headers = request?.headers;
  const accessEmail = headers?.get('cf-access-authenticated-user-email') || '';

  if (accessEmail) {
    return {
      id: cleanUserId(accessEmail),
      displayName: displayNameFromEmail(accessEmail),
      source: 'cloudflare-access',
    };
  }

  return {
    ...temporaryCurrentUser,
    source: 'temporary-active-user',
  };
}
