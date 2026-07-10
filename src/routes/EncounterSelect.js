/* Canonical encounter preview. Encounter choice and formation remain separate. */

import { renderCardFrame } from '../components/CardFrame.js';
import { toRenderableBattleCard } from '../components/battle/BattleCard.js';
import { fetchBattleEncounters } from '../services/battleApi.js';

function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function enemies(encounter) { return ['left', 'center', 'right'].map((lane) => ({ ...encounter.enemies[lane], lane, instanceId: encounter.enemies[lane].id, power: Object.values(encounter.enemies[lane].stats).reduce((sum, value) => sum + Number(value), 0) })); }

function renderEnemy(card) {
  return `<div class="encounter-enemy"><span>${escapeHtml(card.lane)}</span>${renderCardFrame(toRenderableBattleCard(card), { showOwnership: false, showStats: true, density: 'thumbnail', context: 'battle-encounter' })}<strong>${escapeHtml(card.name)}</strong><small>${escapeHtml(card.type)} · PWR ${escapeHtml(card.power)}</small></div>`;
}

function renderEncounter(encounter) {
  const reward = encounter.rewards.victory;
  return `<article class="encounter-preview-card">
    <header><div><span class="section-kicker">${escapeHtml(encounter.mode.replace(/-/g, ' '))}</span><h2>${escapeHtml(encounter.name)}</h2></div><span class="battle-difficulty-pill battle-difficulty-easy">${escapeHtml(encounter.difficulty)}</span></header>
    <div class="encounter-art-treatment ${escapeHtml(encounter.background.className)}"><div class="encounter-enemy-row">${enemies(encounter).map(renderEnemy).join('')}</div></div>
    <div class="encounter-detail-grid"><div><span>Enemy Squad Power</span><strong>${escapeHtml(encounter.enemySquadPower)}</strong></div><div><span>Recommended</span><strong>${escapeHtml(encounter.recommendedPowerRange.min)}–${escapeHtml(encounter.recommendedPowerRange.max)}</strong></div><div><span>Energy</span><strong>${escapeHtml(encounter.energyCost)}</strong></div><div><span>Base Rewards</span><strong>${escapeHtml(reward.gold)} Gold · ${escapeHtml(reward.xpPerCard)} XP</strong></div></div>
    <p class="encounter-rule"><strong>Encounter rule:</strong> ${escapeHtml(encounter.rulesText)}</p>
    <a class="button button-primary" href="#/battle/squad?encounter=${encodeURIComponent(encounter.id)}">Prepare Squad</a>
  </article>`;
}

export async function renderEncounterSelect() {
  try {
    const payload = await fetchBattleEncounters();
    return `<section class="hero-panel battle-encounter-hero"><span class="section-kicker">Choose Encounter</span><h1 class="hero-title">Choose your next fight.</h1><p class="hero-copy">Inspect all three enemy lanes before committing your formation.</p><div class="action-row"><a class="button button-secondary" href="#/battle">Battle Hub</a></div></section><section class="encounter-preview-list">${payload.encounters.map(renderEncounter).join('')}</section>`;
  } catch (error) {
    return `<section class="hero-panel"><span class="section-kicker">Choose Encounter</span><h1 class="hero-title">Encounters unavailable.</h1><p class="hero-copy">${escapeHtml(error.message)}</p><a class="button button-secondary" href="#/battle">Battle Hub</a></section>`;
  }
}
