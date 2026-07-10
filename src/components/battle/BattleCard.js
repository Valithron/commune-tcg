/* Battle-only extension around the canonical CardFrame renderer. */

import { renderCardFrame } from '../CardFrame.js';

function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }

export function toRenderableBattleCard(card) {
  return { ...card, id: card.instanceId || card.id, cardType: card.type, stats: { pow: card.stats?.atk ?? card.stats?.pow ?? 0, def: card.stats?.def ?? 0, spd: card.stats?.spd ?? 0 }, battlePower: card.power ?? ((card.stats?.atk || 0) + (card.stats?.def || 0) + (card.stats?.spd || 0)), imageUrl: card.imageUrl || '', imageKey: card.imageKey || '', crop: card.crop || {} };
}

export function renderBattleCard(card, { side = card.side || 'player', lane = card.lane || 'center', currentHp = card.currentHp ?? card.maxHp, maxHp = card.maxHp, compact = true } = {}) {
  const renderable = toRenderableBattleCard(card);
  const hpPercent = Math.max(0, Math.min(100, currentHp / maxHp * 100));
  const charge = card.doubleStrike?.charge || 0;
  const hp = `<div class="battle-hp" aria-label="${escapeHtml(currentHp)} of ${escapeHtml(maxHp)} HP"><span class="battle-hp-fill" data-hp-fill style="width:${hpPercent}%"></span><small data-hp-label>${escapeHtml(currentHp)} / ${escapeHtml(maxHp)} HP</small></div>`;
  const meter = card.doubleStrike?.eligible ? `<div class="battle-charge" aria-label="Double-Strike charge ${escapeHtml(charge)} of 100"><span data-charge-fill style="width:${Math.min(100, charge)}%"></span></div>` : '';
  return `<button class="battle-field-card ${side === 'enemy' ? 'is-enemy' : 'is-player'}" type="button" data-battle-card-id="${escapeHtml(card.instanceId || card.id)}" data-side="${escapeHtml(side)}" data-lane="${escapeHtml(lane)}" data-current-hp="${escapeHtml(currentHp)}" data-max-hp="${escapeHtml(maxHp)}" data-charge="${escapeHtml(charge)}" aria-label="Inspect ${escapeHtml(card.name)}">${side === 'player' ? hp : ''}<div class="battle-field-frame">${renderCardFrame(renderable, { showOwnership: false, showStats: false, density: compact ? 'thumbnail' : 'standard', context: 'battle-arena' })}</div>${side === 'enemy' ? hp : ''}${meter}</button>`;
}

export function renderBattleInspection(card) {
  const renderable = toRenderableBattleCard(card);
  const crit = Math.min(10, 5 + Math.min(5, Math.max(0, card.stats.spd / ((card.stats.atk + card.stats.def) / 2) - 1) * 10));
  return `<div class="battle-inspection-backdrop" data-close-inspection><section class="battle-inspection" role="dialog" aria-modal="true" aria-label="${escapeHtml(card.name)} battle details" data-inspection-panel><button class="battle-inspection-close" type="button" data-close-inspection aria-label="Close inspection">×</button><div class="battle-inspection-card">${renderCardFrame(renderable, { showOwnership: false, showStats: true, density: 'standard', context: 'battle-inspection' })}</div><div class="battle-inspection-info"><span class="section-kicker">Battle Snapshot</span><h2>${escapeHtml(card.name)}</h2><strong>${escapeHtml(card.currentHp)} / ${escapeHtml(card.maxHp)} HP</strong><dl><div><dt>ATK</dt><dd>${escapeHtml(card.stats.atk)}</dd></div><div><dt>DEF</dt><dd>${escapeHtml(card.stats.def)}</dd></div><div><dt>SPD</dt><dd>${escapeHtml(card.stats.spd)}</dd></div><div><dt>Crit</dt><dd>${crit.toFixed(1)}%</dd></div></dl>${card.doubleStrike?.eligible ? `<p>Double-Strike: ${escapeHtml(card.doubleStrike.charge)} / 100 · ${escapeHtml(card.doubleStrike.tier)}</p>` : '<p>Double-Strike: Not eligible</p>'}</div></section></div>`;
}

