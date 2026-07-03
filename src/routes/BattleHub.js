/* ============================================================================
   Battle Hub Route
   Phase 3 responsibility: static battle entry point and encounter loop gateway.
   Real stamina, matchmaking, cooldowns, and battle history are deferred.
   ============================================================================ */

import { mockEncounters, getDefaultSquad, getSquadPower } from '../data/mockBattle.js';

export function renderBattleHub() {
  const squad = getDefaultSquad();
  const squadPower = getSquadPower(squad);
  const nextEncounter = mockEncounters[0];

  return `
    <section class="hero-panel">
      <span class="section-kicker">Battle</span>
      <h2 class="hero-title">Send the squad.</h2>
      <p class="hero-copy">Phase 3 adds the static battle loop: choose an encounter, review your squad, and view deterministic results.</p>
      <div class="action-row">
        <a class="button button-primary" href="#/battle/encounters">Choose Encounter</a>
        <a class="button button-secondary" href="#/battle/squad?encounter=${nextEncounter.id}">Review Squad</a>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Readiness</span>
          <h2 class="section-title">Squad Status</h2>
        </div>
        <span class="status-pill">Power ${squadPower}</span>
      </div>
      <div class="stat-grid">
        <div class="stat-panel"><span class="stat-label">Squad</span><span class="stat-value">${squad.length}</span></div>
        <div class="stat-panel"><span class="stat-label">Energy</span><span class="stat-value">24</span></div>
        <div class="stat-panel"><span class="stat-label">Wins</span><span class="stat-value">7</span></div>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Encounters</span>
          <h2 class="section-title">Available Battles</h2>
        </div>
      </div>
      <div class="encounter-grid">
        ${mockEncounters.map((encounter) => `
          <a class="encounter-card" href="#/battle/squad?encounter=${encounter.id}">
            <span class="section-kicker">${encounter.difficulty}</span>
            <h3>${encounter.name}</h3>
            <p>${encounter.description}</p>
            <div class="battle-meta-row">
              <span>Power ${encounter.enemyPower}</span>
              <span>⚡ ${encounter.staminaCost}</span>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}
