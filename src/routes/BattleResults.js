/* ============================================================================
   Battle Results Route
   Phase 3 responsibility: deterministic mock battle outcome and rewards.
   Real combat logs, XP writes, currency writes, and loot tables are deferred.
   ============================================================================ */

import { getBattleOutcome } from '../data/mockBattle.js';
import { renderCardFrame } from '../components/CardFrame.js';

export function renderBattleResults({ query }) {
  const result = getBattleOutcome(query.encounter);
  const resultLabel = result.victory ? 'Victory' : 'Survived';

  return `
    <section class="result-banner">
      <span class="section-kicker">Battle Results</span>
      <h2 class="hero-title">${resultLabel}</h2>
      <p class="hero-copy">The Phase 3 battle result is deterministic. Later this screen will read resolved combat, rewards, XP, and drops from the server.</p>
      <div class="action-row">
        <a class="button button-primary" href="#/battle/squad?encounter=${result.encounter.id}">Battle Again</a>
        <a class="button button-secondary" href="#/battle/encounters">Choose New</a>
      </div>
    </section>

    <section class="glass-panel battle-summary-panel">
      <div class="detail-row"><span>Encounter</span><strong>${result.encounter.name}</strong></div>
      <div class="detail-row"><span>Squad Power</span><strong>${result.squadPower}</strong></div>
      <div class="detail-row"><span>Gold</span><strong>◎ ${result.rewards.gold}</strong></div>
      <div class="detail-row"><span>XP</span><strong>${result.rewards.xp}</strong></div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Squad</span>
          <h2 class="section-title">Participants</h2>
        </div>
      </div>
      <div class="card-grid">
        ${result.squad.map((card) => renderCardFrame(card, { href: `#/vault/card/${card.id}` })).join('')}
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Log</span>
          <h2 class="section-title">Combat Summary</h2>
        </div>
      </div>
      <div class="battle-log">
        ${result.log.map((entry) => `<div>${entry}</div>`).join('')}
      </div>
    </section>
  `;
}
