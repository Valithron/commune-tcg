/* ============================================================================
   Squad Builder Route
   Phase 3 responsibility: static squad review before battle results.
   Drag/drop, saved squads, validation, and server writes are deferred.
   ============================================================================ */

import { ownedCards } from '../data/mockCards.js';
import { getDefaultSquad, getEncounterById, getSquadPower } from '../data/mockBattle.js';
import { renderCardFrame } from '../components/CardFrame.js';

export function renderSquadBuilder({ query }) {
  const encounter = getEncounterById(query.encounter);
  const squad = getDefaultSquad();
  const squadPower = getSquadPower(squad);
  const powerDelta = squadPower - encounter.enemyPower;

  return `
    <section class="hero-panel">
      <span class="section-kicker">Squad Builder</span>
      <h2 class="hero-title">Review the lineup.</h2>
      <p class="hero-copy">Phase 3 uses a locked mock squad. Later this screen will support slot editing, saved squads, and battle validation.</p>
      <div class="action-row"><a class="button button-secondary" href="#/battle/encounters">Change Encounter</a></div>
    </section>

    <section class="glass-panel battle-summary-panel">
      <div class="detail-row"><span>Encounter</span><strong>${encounter.name}</strong></div>
      <div class="detail-row"><span>Enemy Power</span><strong>${encounter.enemyPower}</strong></div>
      <div class="detail-row"><span>Squad Power</span><strong>${squadPower}</strong></div>
      <div class="detail-row"><span>Forecast</span><strong>${powerDelta >= 0 ? `Favored +${powerDelta}` : `Risky ${powerDelta}`}</strong></div>
      <div class="action-row"><a class="button button-primary" href="#/battle/results?encounter=${encounter.id}">Start Battle</a></div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Selected</span>
          <h2 class="section-title">Active Squad</h2>
        </div>
        <span class="status-pill">${squad.length}/3</span>
      </div>
      <div class="card-grid">
        ${squad.map((card) => renderCardFrame(card, { href: `#/vault/card/${card.id}` })).join('')}
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Bench</span>
          <h2 class="section-title">Owned Cards</h2>
        </div>
      </div>
      <div class="bench-list">
        ${ownedCards.map((card) => `
          <a class="bench-row" href="#/vault/card/${card.id}">
            <span>${card.name}</span>
            <strong>P${card.stats.pow} D${card.stats.def} S${card.stats.spd}</strong>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}
