/* ============================================================================
   Encounter Select Route
   Phase 3 responsibility: static list of mock encounters for battle entry.
   Filtering, unlocks, timers, and enemy image art are deferred.
   ============================================================================ */

import { mockEncounters } from '../data/mockBattle.js';

export function renderEncounterSelect() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Choose Encounter</span>
      <h2 class="hero-title">Pick the next fight.</h2>
      <p class="hero-copy">Each encounter currently uses deterministic mock values. Later this will connect to encounter tables and battle history.</p>
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
              <span>⚡ ${encounter.staminaCost}</span>
              <span>◎ ${encounter.rewardGold}</span>
            </div>
            <a class="button button-primary" href="#/battle/squad?encounter=${encounter.id}">Select</a>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}
