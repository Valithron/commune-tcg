import { mockUser } from '../data/mockUser.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';
import { formatNumber } from './format.js';

async function loadTopBarResources() {
  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(routes.pullResources);
    const resources = payload.resources || payload;
    const pullTickets = Number(resources.pullTickets);
    const gold = Number(resources.gold);

    return {
      pullTickets: Number.isFinite(pullTickets) ? pullTickets : mockUser.pullTickets,
      gold: Number.isFinite(gold) ? gold : mockUser.gold,
      live: true,
    };
  } catch {
    return {
      pullTickets: mockUser.pullTickets,
      gold: mockUser.gold,
      live: false,
    };
  }
}

export async function refreshTopBarResources(root = document) {
  const target = root.querySelector('[data-topbar-resources]');

  if (!target) {
    return null;
  }

  const resources = await loadTopBarResources();
  const resourceTitle = resources.live ? 'Live player resources' : 'Fallback player resources';

  target.setAttribute('title', resourceTitle);
  target.innerHTML = `
    <a class="resource-pill" href="#/shop" title="Open Ticket Shop">🎟 ${formatNumber(resources.pullTickets)}</a>
    <a class="resource-pill" href="#/shop" title="Open Ticket Shop">◎ ${formatNumber(resources.gold)}</a>
  `;

  return resources;
}

export async function renderTopBar() {
  const resources = await loadTopBarResources();
  const resourceTitle = resources.live ? 'Live player resources' : 'Fallback player resources';

  return `
    <header class="app-topbar">
      <a class="brand-mark" href="#/home" aria-label="Commune TCG Home">
        <span class="brand-kicker">Commune TCG</span>
        <h1 class="brand-title">Gacha</h1>
      </a>
      <div class="resource-row" aria-label="Player resources" title="${resourceTitle}" data-topbar-resources>
        <a class="resource-pill" href="#/shop" title="Open Ticket Shop">🎟 ${formatNumber(resources.pullTickets)}</a>
        <a class="resource-pill" href="#/shop" title="Open Ticket Shop">◎ ${formatNumber(resources.gold)}</a>
      </div>
    </header>
  `;
}
