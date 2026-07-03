/* ============================================================================
   Top Bar Component
   Phase 2 responsibility: display brand context and link resource pills to Shop.
   ============================================================================ */

import { mockUser } from '../data/mockUser.js';
import { formatNumber } from './format.js';

export function renderTopBar() {
  return `
    <header class="app-topbar">
      <a class="brand-mark" href="#/home" aria-label="Commune TCG Home">
        <span class="brand-kicker">Commune TCG</span>
        <h1 class="brand-title">Gacha</h1>
      </a>
      <div class="resource-row" aria-label="Player resources">
        <a class="resource-pill" href="#/shop" title="Open Ticket Shop">🎟 ${formatNumber(mockUser.pullTickets)}</a>
        <a class="resource-pill" href="#/shop" title="Open Ticket Shop">◎ ${formatNumber(mockUser.gold)}</a>
      </div>
    </header>
  `;
}
