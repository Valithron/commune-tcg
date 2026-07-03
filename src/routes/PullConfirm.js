/* ============================================================================
   Pull Confirmation Route
   Phase 2 responsibility: review mock ticket cost before navigating to results.
   No currency is spent in this static prototype.
   ============================================================================ */

import { mockUser } from '../data/mockUser.js';
import { pullOptions, rarityOdds } from '../data/mockPull.js';
import { clampPullCount } from '../components/format.js';

export function renderPullConfirm({ query }) {
  const count = clampPullCount(query.count);
  const option = pullOptions[count];
  const canAfford = mockUser.pullTickets >= option.ticketCost;

  return `
    <section class="hero-panel">
      <span class="section-kicker">Confirm Pull</span>
      <h2 class="hero-title">${option.label}</h2>
      <p class="hero-copy">${option.description} This confirmation screen is static and does not spend tickets yet.</p>
    </section>

    <section class="glass-panel confirm-panel">
      <div class="detail-list">
        <div class="detail-row"><span>Ticket Cost</span><strong>🎟 ${option.ticketCost}</strong></div>
        <div class="detail-row"><span>Current Tickets</span><strong>🎟 ${mockUser.pullTickets}</strong></div>
        <div class="detail-row"><span>Status</span><strong>${canAfford ? 'Ready' : 'Need more tickets'}</strong></div>
      </div>
      <div class="action-row">
        <a class="button button-primary" href="#/pull/results?count=${count}">Reveal Results</a>
        <a class="button button-secondary" href="#/pull">Cancel</a>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Mock Odds</span>
          <h2 class="section-title">Rarity Preview</h2>
        </div>
      </div>
      <div class="odds-list">
        ${rarityOdds.map((entry) => `
          <div class="detail-row"><span>${entry.rarity}</span><strong>${entry.odds}</strong></div>
        `).join('')}
      </div>
    </section>
  `;
}
