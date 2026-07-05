/* ============================================================================
   Home Route
   Phase 4.5 responsibility: clean player dashboard with no admin links.
   ============================================================================ */

import { mockUser } from '../data/mockUser.js';
import { featuredCards } from '../data/mockCards.js';
import { renderCardFrame } from '../components/CardFrame.js';

export function renderHome() {
  const featuredCard = featuredCards[0];

  return `
    <section class="hero-panel">
      <span class="section-kicker">Gacha Prototype</span>
      <h2 class="hero-title">Build the Vault. Pull the Commune.</h2>
      <p class="hero-copy">The player game stays focused on pulling, collecting, battling, and building the Vault. Admin and diagnostic tools are isolated elsewhere.</p>
      <div class="action-row">
        <a class="button button-primary" href="#/pull">Start Pulling</a>
        <a class="button button-secondary" href="#/battle">Battle</a>
        <a class="button button-secondary" href="#/submit">Submit Card</a>
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
          <a class="quick-card" href="#/battle"><strong>Battle</strong><span>Pick a squad and test the current battle loop.</span></a>
          <a class="quick-card" href="#/vault"><strong>Vault</strong><span>Review owned cards pulled into the account.</span></a>
        </div>
      </div>
    </section>
  `;
}
