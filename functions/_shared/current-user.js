/* ============================================================================
   Current User Helper
   Purpose: centralize the temporary active-user contract until real auth lands.
   ============================================================================ */

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

export function resolveCurrentUser(request) {
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
