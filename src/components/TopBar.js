/* ============================================================================
   Top Bar Component
   Phase 1 responsibility: display brand context and mock resource values.
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
        <span class="resource-pill" title="Pull Tickets">🎟 ${formatNumber(mockUser.pullTickets)}</span>
        <span class="resource-pill" title="Gold">◎ ${formatNumber(mockUser.gold)}</span>
      </div>
    </header>
  `;
}
