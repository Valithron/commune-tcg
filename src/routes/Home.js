/* ============================================================================
   Home Route
   Phase 1 responsibility: player dashboard, quick actions, and prototype status.
   ============================================================================ */

import { mockUser } from '../data/mockUser.js';
import { featuredCards } from '../data/mockCards.js';
import { renderCardFrame } from '../components/CardFrame.js';

export function renderHome() {
  const featuredCard = featuredCards[0];

  return `
    <section class="hero-panel">
      <span class="section-kicker">Phase 1 Prototype</span>
      <h2 class="hero-title">Build the Vault. Pull the Commune.</h2>
      <p class="hero-copy">A clean mobile shell for the gacha version of Commune TCG. Current data is mocked while the design system, routes, and card renderer stabilize.</p>
      <div class="action-row">
        <a class="button button-primary" href="#/pull">Start Pulling</a>
        <a class="button button-secondary" href="#/vault">View Vault</a>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Account</span>
          <h2 class="section-title">Today</h2>
        </div>
        <span class="status-pill">Lv ${mockUser.level}</span>
      </div>
      <div class="stat-grid">
        <div class="stat-panel"><span class="stat-label">Vault</span><span class="stat-value">${mockUser.vaultCount}</span></div>
        <div class="stat-panel"><span class="stat-label">Library</span><span class="stat-value">${mockUser.librarySeen}</span></div>
        <div class="stat-panel"><span class="stat-label">Streak</span><span class="stat-value">${mockUser.streakDays}</span></div>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Featured</span>
          <h2 class="section-title">Archive Highlight</h2>
        </div>
      </div>
      <div class="card-grid">
        ${renderCardFrame(featuredCard)}
        <div class="quick-grid">
          <a class="quick-card" href="#/pull"><strong>Daily Pull</strong><span>${mockUser.dailyPullReady ? 'Ready to claim in the prototype flow.' : 'Already claimed today.'}</span></a>
          <a class="quick-card" href="#/library"><strong>Library</strong><span>Preview the global pool before backend rules exist.</span></a>
        </div>
      </div>
    </section>
  `;
}
