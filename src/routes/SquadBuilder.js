/* Explicit left/center/right formation with tap placement, tap swap, filters,
   canonical CardFrame rendering, and engine-backed isolated-lane forecasts. */

import { renderCardFrame } from '../components/CardFrame.js';
import { toRenderableBattleCard } from '../components/battle/BattleCard.js';
import { createBattleAttempt, fetchBattleEncounters, fetchFormationForecast } from '../services/battleApi.js';
import { fetchBattleInventory, fetchSavedBattleSquad, getBattleCardKey, getBattleSquadPower, getEligibleBattleCards, parseSquadCardIds, resolveSelectedBattleSquad, saveBattleSquad } from '../services/battleSquadSelection.js';

const lanes = ['left', 'center', 'right'];
function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function cardStats(card) { return { atk: Number(card.stats?.atk ?? card.stats?.pow ?? 0), def: Number(card.stats?.def ?? 0), spd: Number(card.stats?.spd ?? 0) }; }
function power(card) { const stats = cardStats(card); return Number(card.battlePower ?? stats.atk + stats.def + stats.spd); }

function renderSlot(card, lane, index) {
  if (!card) return `<button class="formation-slot is-empty" type="button" data-formation-slot="${index}"><span>${lane}</span><strong>+</strong><small>Tap, then choose a card</small><em data-forecast-lane="${lane}">Awaiting card</em></button>`;
  return `<button class="formation-slot is-filled" type="button" data-formation-slot="${index}" data-card-id="${escapeHtml(getBattleCardKey(card))}"><span>${lane}</span><div>${renderCardFrame(card, { showOwnership: false, showStats: false, density: 'thumbnail', context: 'battle-formation' })}</div><strong>${escapeHtml(card.name)}</strong><small>Lv ${escapeHtml(card.level)} · PWR ${escapeHtml(power(card))}</small><em data-forecast-lane="${lane}">Calculating…</em></button>`;
}

function renderEnemy(encounter, lane) {
  const source = encounter.enemies[lane];
  const stats = source.stats;
  const card = toRenderableBattleCard({ ...source, instanceId: source.id, lane, power: stats.atk + stats.def + stats.spd });
  return `<div class="formation-enemy"><span>${lane}</span>${renderCardFrame(card, { showOwnership: false, showStats: false, density: 'thumbnail', context: 'battle-formation-enemy' })}<strong>${escapeHtml(source.name)}</strong><small>${escapeHtml(source.type)} · PWR ${escapeHtml(card.battlePower)}</small></div>`;
}

function renderVaultCard(card, selectedIds) {
  const id = getBattleCardKey(card);
  const selected = selectedIds.includes(id);
  const stats = cardStats(card);
  return `<button class="formation-vault-card${selected ? ' is-selected' : ''}" type="button" data-vault-card-id="${escapeHtml(id)}" data-name="${escapeHtml(card.name.toLowerCase())}" data-type="${escapeHtml(card.type || card.cardType || 'neutral')}" data-rarity="${escapeHtml(card.rarity)}" data-power="${power(card)}" data-level="${escapeHtml(card.level || 1)}"><div>${renderCardFrame(card, { showOwnership: false, showStats: false, density: 'thumbnail', context: 'battle-formation-vault' })}</div><span><strong>${escapeHtml(card.name)}</strong><small>${escapeHtml(card.rarity)} · ${escapeHtml(card.typeLabel || card.type || 'Neutral')}</small><em>ATK ${stats.atk} · DEF ${stats.def} · SPD ${stats.spd}</em></span><b>PWR ${power(card)}</b></button>`;
}

export async function renderSquadBuilder({ query }) {
  try {
    const [encountersPayload, inventory, saved] = await Promise.all([fetchBattleEncounters(), fetchBattleInventory(), fetchSavedBattleSquad().catch(() => null)]);
    const encounter = encountersPayload.encounters.find((item) => item.id === query.encounter) || encountersPayload.encounters[0];
    const cards = getEligibleBattleCards(inventory);
    const queryIds = parseSquadCardIds(query.squadCardIds);
    const savedIds = saved?.validForBattle ? parseSquadCardIds(saved.selectedIds) : [];
    const requestedIds = queryIds.length ? queryIds : savedIds;
    const selected = resolveSelectedBattleSquad(cards, requestedIds).selected.slice(0, 3);
    const selectedIds = selected.map(getBattleCardKey);
    const slots = lanes.map((_, index) => selected[index] || null);
    return `<section class="formation-page" data-formation-root data-encounter-id="${escapeHtml(encounter.id)}" data-formation-ids="${escapeHtml(selectedIds.join(','))}">
      <header class="formation-header"><div><span class="section-kicker">Prepare Squad</span><h1>${escapeHtml(encounter.name)}</h1><p>${escapeHtml(encounter.rulesText)}</p></div><a class="button button-secondary" href="#/battle/encounters">Change Encounter</a></header>
      <section class="formation-board"><div class="formation-row formation-enemy-row">${lanes.map((lane) => renderEnemy(encounter, lane)).join('')}</div><p class="formation-forecast-note"><strong>Lane forecasts exclude reinforcement.</strong> They estimate each isolated matchup and are not guarantees.</p><div class="formation-row formation-player-row">${slots.map((card, index) => renderSlot(card, lanes[index], index)).join('')}</div></section>
      <section class="formation-summary"><div><span>Squad Power</span><strong data-squad-power>${escapeHtml(getBattleSquadPower(selected))}</strong></div><div><span>Formation</span><strong>${selected.length}/3</strong></div><button class="button button-secondary" type="button" data-save-formation ${selected.length === 3 ? '' : 'disabled'}>Save Formation</button><button class="button button-primary" type="button" data-begin-battle ${selected.length === 3 ? '' : 'disabled'}>Begin Battle · 1 Energy</button><p data-formation-status></p></section>
      <section class="formation-vault"><div class="section-heading"><div><span class="section-kicker">Your Vault</span><h2>Choose owned cards</h2></div><span class="status-pill">${cards.length} eligible</span></div><div class="formation-filters"><input type="search" placeholder="Search cards" data-formation-search><select data-formation-type><option value="">All types</option>${['flame','tide','bloom','volt','shadow','radiant','neutral'].map((value) => `<option value="${value}">${value[0].toUpperCase() + value.slice(1)}</option>`).join('')}</select><select data-formation-rarity><option value="">All rarities</option>${['common','uncommon','rare','legendary','mythic'].map((value) => `<option value="${value}">${value[0].toUpperCase() + value.slice(1)}</option>`).join('')}</select><select data-formation-sort><option value="power">Power</option><option value="level">Level</option><option value="recent">Recent</option><option value="favorite">Favorite</option></select></div><div class="formation-vault-list" data-formation-list>${cards.map((card) => renderVaultCard(card, selectedIds)).join('')}</div></section>
    </section>`;
  } catch (error) {
    return `<section class="hero-panel"><span class="section-kicker">Prepare Squad</span><h1 class="hero-title">Formation unavailable.</h1><p>${escapeHtml(error.message)}</p><a class="button button-secondary" href="#/battle/encounters">Choose Encounter</a></section>`;
  }
}

function formationHref(encounterId, ids) { const params = new URLSearchParams({ encounter: encounterId }); if (ids.filter(Boolean).length) params.set('squadCardIds', ids.filter(Boolean).join(',')); return `#/battle/squad?${params}`; }

export function initSquadBuilder(root) {
  const page = root.querySelector('[data-formation-root]');
  if (!page) return;
  const encounterId = page.dataset.encounterId;
  const ids = parseSquadCardIds(page.dataset.formationIds);
  const activeKey = `commune-battle-active-slot:${encounterId}`;
  let activeSlot = Number(sessionStorage.getItem(activeKey));
  if (!Number.isInteger(activeSlot) || activeSlot < 0 || activeSlot > 2) activeSlot = Math.max(0, ids.findIndex((id) => !id));
  const slots = [...page.querySelectorAll('[data-formation-slot]')];
  const markActive = () => slots.forEach((slot, index) => slot.classList.toggle('is-active', index === activeSlot));
  markActive();

  slots.forEach((slot, index) => slot.addEventListener('click', () => {
    if (activeSlot !== index && ids[activeSlot] && ids[index]) {
      [ids[activeSlot], ids[index]] = [ids[index], ids[activeSlot]];
      sessionStorage.setItem(activeKey, String(index));
      window.location.hash = formationHref(encounterId, ids);
      return;
    }
    activeSlot = index;
    sessionStorage.setItem(activeKey, String(index));
    markActive();
  }));

  page.querySelectorAll('[data-vault-card-id]').forEach((button) => button.addEventListener('click', () => {
    const cardId = button.dataset.vaultCardId;
    const existing = ids.indexOf(cardId);
    if (existing >= 0 && existing !== activeSlot) [ids[existing], ids[activeSlot]] = [ids[activeSlot], ids[existing]];
    else ids[activeSlot] = cardId;
    const nextEmpty = [0, 1, 2].find((index) => !ids[index]);
    sessionStorage.setItem(activeKey, String(nextEmpty ?? activeSlot));
    window.location.hash = formationHref(encounterId, ids);
  }));

  const search = page.querySelector('[data-formation-search]');
  const type = page.querySelector('[data-formation-type]');
  const rarity = page.querySelector('[data-formation-rarity]');
  const sort = page.querySelector('[data-formation-sort]');
  const filter = () => {
    const cards = [...page.querySelectorAll('[data-vault-card-id]')];
    const term = search.value.trim().toLowerCase();
    cards.forEach((card) => { card.hidden = Boolean((term && !card.dataset.name.includes(term)) || (type.value && card.dataset.type !== type.value) || (rarity.value && card.dataset.rarity !== rarity.value)); });
    cards.sort((a, b) => Number(b.dataset[sort.value] || 0) - Number(a.dataset[sort.value] || 0)).forEach((card) => page.querySelector('[data-formation-list]').append(card));
  };
  [search, type, rarity, sort].forEach((control) => control.addEventListener('input', filter));

  const status = page.querySelector('[data-formation-status]');
  page.querySelector('[data-save-formation]')?.addEventListener('click', async (event) => {
    event.currentTarget.disabled = true; status.textContent = 'Saving left, center, and right…';
    try { await saveBattleSquad({ squadCardIds: ids }); status.textContent = 'Formation saved.'; event.currentTarget.textContent = 'Saved'; }
    catch (error) { status.textContent = error.message; event.currentTarget.disabled = false; }
  });
  page.querySelector('[data-begin-battle]')?.addEventListener('click', async (event) => {
    event.currentTarget.disabled = true; event.currentTarget.textContent = 'Locking Formation…'; status.textContent = 'Creating the authoritative battle…';
    try {
      await saveBattleSquad({ squadCardIds: ids });
      const payload = await createBattleAttempt({ encounterId, orderedCardIds: ids });
      sessionStorage.removeItem(`commune-battle-entered:${payload.attempt.attemptId}`);
      window.location.hash = `#/battle/arena?attemptId=${encodeURIComponent(payload.attempt.attemptId)}`;
    } catch (error) { status.textContent = error.message; event.currentTarget.disabled = false; event.currentTarget.textContent = 'Begin Battle · 1 Energy'; }
  });

  if (ids.length === 3) fetchFormationForecast({ encounterId, orderedCardIds: ids }).then((payload) => payload.forecasts.forEach((forecast) => { const target = page.querySelector(`[data-forecast-lane="${forecast.lane}"]`); if (target) { target.textContent = forecast.label; target.className = `forecast-${forecast.label.toLowerCase()}`; target.setAttribute('aria-label', `${forecast.label} isolated lane forecast`); } })).catch(() => { page.querySelectorAll('[data-forecast-lane]').forEach((target) => { target.textContent = 'Forecast unavailable'; }); });
}
