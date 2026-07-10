import { mockUser } from '../data/mockUser.js';
import { getCachedAuthUser } from '../services/authClient.js';
import { getApiRoutes } from '../services/apiClient.js';
import { formatNumber } from './format.js';

function normalizeResourceValue(value, fallback) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

async function loadTopBarResources(overrides = {}) {
  try {
    const routes = getApiRoutes();
    const response = await fetch(routes.pullResources + '?_=' + Date.now(), {
      cache: 'no-store',
      headers: {
        accept: 'application/json',
        'cache-control': 'no-cache',
      },
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload) {
      throw new Error(payload?.error || `Resource request failed with ${response.status}`);
    }

    const resources = payload.resources || payload;

    return {
      pullTickets: normalizeResourceValue(overrides.pullTickets ?? resources.pullTickets, mockUser.pullTickets),
      gold: normalizeResourceValue(overrides.gold ?? resources.gold, mockUser.gold),
      energy: normalizeResourceValue(overrides.energy ?? resources.energy, 10),
      live: true,
    };
  } catch {
    return {
      pullTickets: normalizeResourceValue(overrides.pullTickets, mockUser.pullTickets),
      gold: normalizeResourceValue(overrides.gold, mockUser.gold),
      energy: normalizeResourceValue(overrides.energy, 10),
      live: Boolean(Number.isFinite(Number(overrides.pullTickets)) || Number.isFinite(Number(overrides.gold))),
    };
  }
}

function renderResourcePills(resources) {
  return `
    <a class="resource-pill" href="#/shop" title="Open Ticket Shop">🎟 ${formatNumber(resources.pullTickets)}</a>
    <a class="resource-pill" href="#/shop" title="Open Ticket Shop">◎ ${formatNumber(resources.gold)}</a>
    <a class="resource-pill" href="#/battle" title="Open Battle Hub">⚡ ${formatNumber(resources.energy)}</a>
  `;
}

function renderUserPill() {
  const user = getCachedAuthUser();
  if (!user) return '';

  return `
    <div class="signed-user-pill" title="Signed-in player">
      <span>Signed in</span>
      <strong>${user.displayName || user.username || user.id}</strong>
      <a href="/api/auth/logout">Log out</a>
    </div>
  `;
}

export async function refreshTopBarResources(root = document, overrides = {}) {
  const target = root.querySelector('[data-topbar-resources]');

  if (!target) {
    return null;
  }

  const resources = await loadTopBarResources(overrides);
  const resourceTitle = resources.live ? 'Live signed-in player resources' : 'Fallback player resources';

  target.setAttribute('title', resourceTitle);
  target.innerHTML = renderResourcePills(resources);

  return resources;
}

export async function renderTopBar() {
  const resources = await loadTopBarResources();
  const resourceTitle = resources.live ? 'Live signed-in player resources' : 'Fallback player resources';

  return `
    <header class="app-topbar">
      <a class="brand-mark" href="#/home" aria-label="Commune TCG Home">
        <span class="brand-kicker">Commune TCG</span>
        <h1 class="brand-title">Gacha</h1>
      </a>
      <div class="topbar-right">
        ${renderUserPill()}
        <div class="resource-row" aria-label="Player resources" title="${resourceTitle}" data-topbar-resources>
          ${renderResourcePills(resources)}
        </div>
      </div>
    </header>
  `;
}
