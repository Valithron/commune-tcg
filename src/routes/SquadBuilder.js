/* ============================================================================
   Squad Builder Route
   Phase 7 responsibility: select real backend-owned battle cards and pass the
   exact selected card row IDs into the player battle resolver.
   ============================================================================ */

import { getEncounterById } from '../data/mockBattle.js';
import {
  battleSquadMaxSize,
  buildBattleResultsHref,
  buildSquadBuilderHref,
  fetchBattleInventory,
  getBattleCardKey,
  getBattleSquadPower,
  getEligibleBattleCards,
  getSelectedBattleIds,
  resolveSelectedBattleSquad,
  toggleBattleCardSelection,
} from '../services/battleSquadSelection.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderBattleCardRow(card, { selected = false, href = '', disabled = false, note = '' } = {}) {
  const tag = href && !disabled ? 'a' : 'div';
  const hrefAttribute = tag === 'a' ? ` href="${href}"` : '';
  const classes = [
    'battle-card-row',
    selected ? 'battle-card-row-selected' : '',
    disabled ? 'battle-card-row-disabled' : '',
  ].filter(Boolean).join(' ');

  return `
    <${tag} class="${classes}"${hrefAttribute}>
      <div>
        <span class="section-kicker">${escapeHtml(card.rarity)} · ${escapeHtml(card.category)}</span>
        <strong>${escapeHtml(card.name)}</strong>
        <small>Lv ${escapeHtml(card.level)} · XP ${escapeHtml(card.xp)} · ${escapeHtml(card.sourceRowId || card.id)}</small>
      </div>
      <div class="battle-card-stat-stack">
        <span>P${escapeHtml(card.stats?.pow ?? 0)} D${escapeHtml(card.stats?.def ?? 0)} S${escapeHtml(card.stats?.spd ?? 0)}</span>
        <strong>${escapeHtml(card.battlePower || 0)}</strong>
        ${note ? `<small>${escapeHtml(note)}</small>` : ''}
      </div>
    </${tag}>
  `;
}

function renderSelectedSquad({ encounter, selectedCards }) {
  const selectedIds = getSelectedBattleIds(selectedCards);

  if (!selectedCards.length) {
    return `
      <div class="empty-note">No eligible cards selected. Pick at least one owned card before starting battle.</div>
    `;
  }

  return selectedCards.map((card) => {
    const cardId = getBattleCardKey(card);
    const nextIds = selectedIds.filter((id) => id !== cardId);

    return renderBattleCardRow(card, {
      selected: true,
      href: buildSquadBuilderHref({ encounterId: encounter.id, squadCardIds: nextIds }),
      note: 'Tap to remove',
    });
  }).join('');
}

function renderAvailableCards({ encounter, cards, selectedCards }) {
  const selectedIds = getSelectedBattleIds(selectedCards);
  const selectedSet = new Set(selectedIds);
  const full = selectedIds.length >= battleSquadMaxSize;

  if (!cards.length) {
    return '<div class="empty-note">No backend-owned cards are battle eligible yet.</div>';
  }

  return cards.map((card) => {
    const cardId = getBattleCardKey(card);
    const selected = selectedSet.has(cardId);
    const nextIds = toggleBattleCardSelection({ selectedIds, cardId });
    const canAdd = selected || !full;

    return renderBattleCardRow(card, {
      selected,
      disabled: !canAdd,
      href: canAdd ? buildSquadBuilderHref({ encounterId: encounter.id, squadCardIds: nextIds }) : '',
      note: selected ? 'Selected' : (full ? 'Squad full' : 'Tap to add'),
    });
  }).join('');
}

export async function renderSquadBuilder({ query }) {
  const encounter = getEncounterById(query.encounter);

  try {
    const inventory = await fetchBattleInventory();
    const eligibleCards = getEligibleBattleCards(inventory);
    const selection = resolveSelectedBattleSquad(eligibleCards, query.squadCardIds);
    const selectedCards = selection.selected;
    const selectedIds = getSelectedBattleIds(selectedCards);
    const squadPower = getBattleSquadPower(selectedCards);
    const powerDelta = squadPower - encounter.enemyPower;
    const startHref = buildBattleResultsHref({ encounterId: encounter.id, squadCardIds: selectedIds });

    return `
      <section class="hero-panel">
        <span class="section-kicker">Squad Builder</span>
        <h2 class="hero-title">Pick the lineup.</h2>
        <p class="hero-copy">This screen now uses real backend-owned battle cards. The selected row IDs are passed into Resolve Battle, so these are the cards that receive XP.</p>
        <div class="action-row"><a class="button button-secondary" href="#/battle/encounters">Change Encounter</a></div>
      </section>

      <section class="glass-panel battle-summary-panel battle-live-panel">
        <span class="section-kicker">Backend Selection</span>
        <h2 class="section-title">Selected squad writes to these cards</h2>
        <div class="detail-row"><span>Encounter</span><strong>${escapeHtml(encounter.name)}</strong></div>
        <div class="detail-row"><span>Enemy Power</span><strong>${escapeHtml(encounter.enemyPower)}</strong></div>
        <div class="detail-row"><span>Squad Power</span><strong>${escapeHtml(squadPower)}</strong></div>
        <div class="detail-row"><span>Forecast</span><strong>${powerDelta >= 0 ? `Favored +${powerDelta}` : `Risky ${powerDelta}`}</strong></div>
        <div class="detail-row"><span>Selection Source</span><strong>${escapeHtml(selection.selectionSource)}</strong></div>
        <div class="detail-row"><span>Selected IDs</span><strong>${escapeHtml(selectedIds.join(', ') || 'none')}</strong></div>
        <div class="action-row">
          ${selectedCards.length ? `<a class="button button-primary" href="${startHref}">Start Battle</a>` : '<span class="button button-secondary" aria-disabled="true">Select a Card</span>'}
        </div>
      </section>

      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">Selected</span>
            <h2 class="section-title">Active backend squad</h2>
          </div>
          <span class="status-pill">${selectedCards.length}/${battleSquadMaxSize}</span>
        </div>
        <div class="battle-card-list">
          ${renderSelectedSquad({ encounter, selectedCards })}
        </div>
      </section>

      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">Owned Backend Cards</span>
            <h2 class="section-title">Tap cards to select or remove</h2>
          </div>
          <span class="status-pill">${eligibleCards.length} eligible</span>
        </div>
        <div class="battle-card-list">
          ${renderAvailableCards({ encounter, cards: eligibleCards, selectedCards })}
        </div>
      </section>
    `;
  } catch (error) {
    return `
      <section class="hero-panel">
        <span class="section-kicker">Squad Builder</span>
        <h2 class="hero-title">Inventory failed.</h2>
        <p class="hero-copy">The backend battle inventory could not be loaded, so the real squad selector cannot safely start a battle.</p>
        <div class="action-row"><a class="button button-secondary" href="#/battle">Back to Battle</a></div>
      </section>
      <section class="glass-panel battle-summary-panel">
        <div class="empty-note">${escapeHtml(error.message)}</div>
      </section>
    `;
  }
}
