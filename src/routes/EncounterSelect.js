/* ============================================================================
   Encounter Select Route
   Phase 6 responsibility: select a mock encounter for backend-connected battle
   resolution. Filtering, unlocks, timers, and enemy image art are deferred.
   ============================================================================ */

import { mockEncounters } from '../data/mockBattle.js';

export function renderEncounterSelect() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Choose Encounter</span>
      <h2 class="hero-title">Pick the next fight.</h2>
      <p class="hero-copy">Encounters still use the prototype roster, but Battle Results can now resolve the selected fight through the backend reward path.</p>
      <div class="action-row"><a class="button button-secondary" href="#/battle">Back to Battle</a></div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Enemy Pool</span>
          <h2 class="section-title">Open Encounters</h2>
        </div>
        <span class="status-pill">${mockEncounters.length} ready</span>
      </div>
      <div class="encounter-grid">
        ${mockEncounters.map((encounter) => `
          <article class="encounter-card">
            <span class="section-kicker">${encounter.difficulty}</span>
            <h3>${encounter.name}</h3>
            <p>${encounter.description}</p>
            <div class="battle-meta-row">
              <span>Enemy ${encounter.enemyPower}</span>
              <span>⚡ deferred</span>
              <span>◎ ${encounter.rewardGold}</span>
            </div>
            <a class="button button-primary" href="#/battle/squad?encounter=${encounter.id}">Select</a>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}
