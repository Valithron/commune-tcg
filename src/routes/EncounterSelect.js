/* ============================================================================
   Encounter Select Route
   Phase 10D responsibility: player-facing encounter card polish. Mechanics stay
   the same: encounter selection still routes into Squad Builder.
   ============================================================================ */

import { mockEncounters } from '../data/mockBattle.js';
import {
  fetchBattleInventory,
  fetchSavedBattleSquad,
  getBattleSquadPower,
  getEligibleBattleCards,
  parseSquadCardIds,
  resolveSelectedBattleSquad,
} from '../services/battleSquadSelection.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getDifficultyClass(difficulty = '') {
  const key = String(difficulty).toLowerCase();

  if (key.includes('hard')) {
    return 'battle-difficulty-hard';
  }

  if (key.includes('medium')) {
    return 'battle-difficulty-medium';
  }

  return 'battle-difficulty-easy';
}

function getEncounterOutlook(encounter, squadPower) {
  const delta = Number(squadPower || 0) - Number(encounter.enemyPower || 0);

  if (delta >= 10) {
    return 'Favored';
  }

  if (delta >= 0) {
    return 'Even Match';
  }

  return 'Dangerous';
}

function renderEncounterCard(encounter, squadPower) {
  const outlook = getEncounterOutlook(encounter, squadPower);

  return `
    <article class="encounter-card encounter-card-polished">
      <div class="encounter-card-topline">
        <span class="battle-difficulty-pill ${getDifficultyClass(encounter.difficulty)}">${escapeHtml(encounter.difficulty)}</span>
        <span class="encounter-element-pill">${escapeHtml(encounter.element)}</span>
      </div>
      <div class="encounter-portrait-panel" aria-hidden="true">
        <span>${escapeHtml(encounter.name.slice(0, 1))}</span>
      </div>
      <div>
        <h3>${escapeHtml(encounter.name)}</h3>
        <p>${escapeHtml(encounter.description)}</p>
      </div>
      <div class="battle-score-grid encounter-score-grid">
        <div class="battle-score-card"><span>Rec. Power</span><strong>${escapeHtml(encounter.enemyPower)}</strong></div>
        <div class="battle-score-card"><span>Your Power</span><strong>${escapeHtml(squadPower)}</strong></div>
        <div class="battle-score-card"><span>Outlook</span><strong>${escapeHtml(outlook)}</strong></div>
      </div>
      <div class="battle-reward-grid encounter-reward-grid">
        <div class="battle-reward-card battle-reward-card-gold"><span>Gold</span><strong>◎ ${escapeHtml(encounter.rewardGold)}</strong></div>
        <div class="battle-reward-card"><span>Squad XP</span><strong>+${escapeHtml(encounter.rewardXp)}</strong></div>
      </div>
      <a class="button button-primary" href="#/battle/squad?encounter=${encodeURIComponent(encounter.id)}">Select Encounter</a>
    </article>
  `;
}

export async function renderEncounterSelect() {
  try {
    const [inventory, savedSquadPayload] = await Promise.all([
      fetchBattleInventory(),
      fetchSavedBattleSquad().catch(() => null),
    ]);
    const eligibleCards = getEligibleBattleCards(inventory);
    const savedIds = savedSquadPayload?.validForBattle ? parseSquadCardIds(savedSquadPayload.selectedIds) : [];
    const selection = resolveSelectedBattleSquad(eligibleCards, savedIds);
    const selectedCards = selection.selected;
    const squadPower = getBattleSquadPower(selectedCards);

    return `
      <section class="hero-panel battle-encounter-hero">
        <span class="section-kicker">Choose Encounter</span>
        <h2 class="hero-title">Pick the next fight.</h2>
        <p class="hero-copy">Compare each enemy against your current squad, then choose a fight and confirm your lineup.</p>
        <div class="battle-score-grid">
          <div class="battle-score-card"><span>Your Squad</span><strong>${escapeHtml(selectedCards.length)}/3</strong></div>
          <div class="battle-score-card"><span>Squad Power</span><strong>${escapeHtml(squadPower)}</strong></div>
          <div class="battle-score-card"><span>Encounters</span><strong>${escapeHtml(mockEncounters.length)}</strong></div>
        </div>
        <div class="action-row"><a class="button button-secondary" href="#/battle">Back to Battle</a><a class="button button-secondary" href="#/battle/squad">Edit Squad</a></div>
      </section>

      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">Open Encounters</span>
            <h2 class="section-title">Choose your challenge</h2>
          </div>
          <span class="status-pill">${mockEncounters.length} ready</span>
        </div>
        <div class="encounter-grid encounter-grid-polished">
          ${mockEncounters.map((encounter) => renderEncounterCard(encounter, squadPower)).join('')}
        </div>
      </section>
    `;
  } catch (error) {
    return `
      <section class="hero-panel">
        <span class="section-kicker">Choose Encounter</span>
        <h2 class="hero-title">Encounters unavailable.</h2>
        <p class="hero-copy">Your squad could not be loaded, so encounter comparison is paused for now.</p>
        <div class="action-row"><a class="button button-secondary" href="#/battle">Back to Battle</a></div>
      </section>
      <section class="glass-panel battle-summary-panel">
        <div class="empty-note">${escapeHtml(error.message)}</div>
      </section>
    `;
  }
}
