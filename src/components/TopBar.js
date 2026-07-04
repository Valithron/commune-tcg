import { mockUser } from '../data/mockUser.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';
import { formatNumber } from './format.js';

async function loadTopBarTickets() {
  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(routes.pullResources);
    const tickets = Number(payload.resources?.pullTickets);

    return Number.isFinite(tickets) ? tickets : mockUser.pullTickets;
  } catch {
    return mockUser.pullTickets;
  }
}

export async function renderTopBar() {
  const pullTickets = await loadTopBarTickets();

  return `
    <header class="app-topbar">
      <a class="brand-mark" href="#/home" aria-label="Commune TCG Home">
        <span class="brand-kicker">Commune TCG</span>
        <h1 class="brand-title">Gacha</h1>
      </a>
      <div class="resource-row" aria-label="Player resources">
        <a class="resource-pill" href="#/shop" title="Open Ticket Shop">🎟 ${formatNumber(pullTickets)}</a>
        <a class="resource-pill" href="#/shop" title="Open Ticket Shop">◎ ${formatNumber(mockUser.gold)}</a>
      </div>
    </header>
  `;
}
