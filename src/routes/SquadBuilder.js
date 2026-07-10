/* ============================================================================
   Squad Builder Route
   Phase 10F.1 responsibility: player-facing squad slot tray plus thumbnail card
   rows in Available Cards. Mechanics stay the same.
   ============================================================================ */

import { renderCardFrame } from '../components/CardFrame.js';
import { getEncounterById } from '../data/mockBattle.js';
import {
  battleSquadMaxSize,
  buildBattleResultsHref,
  buildSquadBuilderHref,
  fetchBattleInventory,
  fetchSavedBattleSquad,
  getBattleCardKey,
  getBattleSquadPower,
  getEligibleBattleCards,
  getSelectedBattleIds,
  parseSquadCardIds,
  resolveSelectedBattleSquad,
  saveBattleSquad,
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

function renderBattleCardThumb(card) {
  return `
    <div class="battle-card-thumb-frame" aria-hidden="true">
      ${renderCardFrame(card, {
        showOwnership: false,
        showStats: false,
        density: 'thumbnail',
        context: 'battle-squad',
      })}
    </div>
  `;
}

function getSavedSquadLabel(selectionInput) {
  if (selectionInput.source === 'saved-squad') {
    return 'Saved squad loaded';
  }

  if (selectionInput.source === 'url-query') {
    return 'Custom lineup selected';
  }

  if (selectionInput.savedStatus === 'saved-squad-invalid-fell-back') {
    return 'Saved squad needs an update';
  }

  return 'Using strongest available cards';
}

function renderBattleCardRow(card, { selected = false, href = '', disabled = false, note = '' } = {}) {
  const tag = href && !disabled ? 'a' : 'div';
  const hrefAttribute = tag === 'a' ? ` href="${href}"` : '';
  const classes = [
    'battle-card-row',
    'battle-card-row-with-thumb',
    selected ? 'battle-card-row-selected' : '',
    disabled ? 'battle-card-row-disabled' : '',
  ].filter(Boolean).join(' ');

  return `
    <${tag} class="${classes}"${hrefAttribute}>
      ${renderBattleCardThumb(card)}
      <div class="battle-card-row-copy">
        <span class="section-kicker">${escapeHtml(card.rarity)} · ${escapeHtml(card.category)}</span>
        <strong>${escapeHtml(card.name)}</strong>
        <small>Level ${escapeHtml(card.level)} · ${escapeHtml(card.xp)} XP</small>
      </div>
      <div class="battle-card-stat-stack">
        <span aria-label="Attack ${escapeHtml(card.stats?.pow ?? 0)}, Defense ${escapeHtml(card.stats?.def ?? 0)}, Speed ${escapeHtml(card.stats?.spd ?? 0)}">A${escapeHtml(card.stats?.pow ?? 0)} · D${escapeHtml(card.stats?.def ?? 0)} · S${escapeHtml(card.stats?.spd ?? 0)}</span>
        <strong aria-label="Power ${escapeHtml(card.battlePower || 0)}">PWR ${escapeHtml(card.battlePower || 0)}</strong>
        ${note ? `<small>${escapeHtml(note)}</small>` : ''}
      </div>
    </${tag}>
  `;
}

function renderSquadSlots({ encounter, selectedCards }) {
  const selectedIds = getSelectedBattleIds(selectedCards);
  const slots = Array.from({ length: battleSquadMaxSize }, (_, index) => selectedCards[index] || null);

  return `
    <div class="battle-squad-slot-tray">
      ${slots.map((card, index) => {
        const slotNumber = index + 1;

        if (!card) {
          return `
            <div class="battle-squad-slot battle-squad-slot-empty">
              <div class="battle-slot-plus">+</div>
              <strong>Slot ${slotNumber}</strong>
              <span>Tap a card below</span>
            </div>
          `;
        }

        const cardId = getBattleCardKey(card);
        const nextIds = selectedIds.filter((id) => id !== cardId);

        return `
          <a class="battle-squad-slot battle-squad-slot-filled" href="${buildSquadBuilderHref({ encounterId: encounter.id, squadCardIds: nextIds })}">
            <span class="battle-slot-label">Slot ${slotNumber}</span>
            <strong>${escapeHtml(card.name)}</strong>
            <small>Lv ${escapeHtml(card.level)} · PWR ${escapeHtml(card.battlePower || 0)}</small>
            <em>Tap to remove</em>
          </a>
        `;
      }).join('')}
    </div>
  `;
}

function renderAvailableCards({ encounter, cards, selectedCards }) {
  const selectedIds = getSelectedBattleIds(selectedCards);
  const selectedSet = new Set(selectedIds);
  const full = selectedIds.length >= battleSquadMaxSize;

  if (!cards.length) {
    return '<div class="empty-note">No cards are ready for battle yet.</div>';
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
      note: selected ? 'In squad' : (full ? 'Squad full' : 'Tap to add'),
    });
  }).join('');
}

function getSelectionInput({ query, savedSquadPayload }) {
  const queryIds = parseSquadCardIds(query.squadCardIds);
  const savedIds = savedSquadPayload?.validForBattle ? parseSquadCardIds(savedSquadPayload.selectedIds) : [];

  if (queryIds.length) {
    return {
      requestedIds: queryIds,
      source: 'url-query',
      savedStatus: savedSquadPayload?.saved ? 'saved-squad-available' : 'no-saved-squad',
    };
  }

  if (savedIds.length) {
    return {
      requestedIds: savedIds,
      source: 'saved-squad',
      savedStatus: 'loaded-saved-squad',
    };
  }

  return {
    requestedIds: [],
    source: 'default-highest-power',
    savedStatus: savedSquadPayload?.saved ? 'saved-squad-invalid-fell-back' : 'no-saved-squad',
  };
}

export async function renderSquadBuilder({ query }) {
  const encounter = getEncounterById(query.encounter);

  try {
    const [inventory, savedSquadPayload] = await Promise.all([
      fetchBattleInventory(),
      fetchSavedBattleSquad().catch(() => null),
    ]);
    const eligibleCards = getEligibleBattleCards(inventory);
    const selectionInput = getSelectionInput({ query, savedSquadPayload });
    const selection = resolveSelectedBattleSquad(eligibleCards, selectionInput.requestedIds);
    const selectedCards = selection.selected;
    const selectedIds = getSelectedBattleIds(selectedCards);
    const squadPower = getBattleSquadPower(selectedCards);
    const powerDelta = squadPower - encounter.enemyPower;
    const startHref = buildBattleResultsHref({ encounterId: encounter.id, squadCardIds: selectedIds });
    const savedSquadLabel = getSavedSquadLabel(selectionInput);

    return `
      <section class="hero-panel">
        <span class="section-kicker">Squad Builder</span>
        <h2 class="hero-title">Choose your squad.</h2>
        <p class="hero-copy">Fill up to three squad slots, then save your favorite lineup or start battle.</p>
        <div class="action-row"><a class="button button-secondary" href="#/battle/encounters">Change Encounter</a></div>
      </section>

      <section class="glass-panel battle-summary-panel battle-live-panel battle-squad-builder-panel">
        <span class="section-kicker">Your Squad</span>
        <h2 class="section-title">Ready for ${escapeHtml(encounter.name)}</h2>
        <div class="battle-score-grid">
          <div class="battle-score-card"><span>Enemy Power</span><strong>${escapeHtml(encounter.enemyPower)}</strong></div>
          <div class="battle-score-card"><span>Squad Power</span><strong>${escapeHtml(squadPower)}</strong></div>
          <div class="battle-score-card"><span>Outlook</span><strong>${powerDelta >= 0 ? `Favored +${powerDelta}` : `Risky ${powerDelta}`}</strong></div>
        </div>
        ${renderSquadSlots({ encounter, selectedCards })}
        <div class="battle-state-note battle-state-note-preview">
          <strong>${escapeHtml(savedSquadLabel)}</strong>
          <span>${selectedCards.length ? 'These cards will receive battle XP if rewards are claimed.' : 'Tap a card below to fill your first slot.'}</span>
        </div>
        <div class="action-row">
          ${selectedCards.length ? `<a class="button button-primary" href="${startHref}">Start Battle</a>` : '<span class="button button-secondary" aria-disabled="true">Select a Card</span>'}
          ${selectedCards.length ? `<button class="button button-secondary" type="button" data-save-battle-squad data-squad-card-ids="${escapeHtml(selectedIds.join(','))}">Save Squad</button>` : ''}
        </div>
        <div class="empty-note" data-save-battle-squad-status>${savedSquadPayload?.saved ? 'Saved squad available.' : 'No saved squad yet.'}</div>
      </section>

      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">Available Cards</span>
            <h2 class="section-title">Tap cards to add or remove</h2>
          </div>
          <span class="status-pill">${eligibleCards.length} ready</span>
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
        <h2 class="hero-title">Squad unavailable.</h2>
        <p class="hero-copy">Your battle cards could not be loaded, so battle setup is paused for now.</p>
        <div class="action-row"><a class="button button-secondary" href="#/battle">Back to Battle</a></div>
      </section>
      <section class="glass-panel battle-summary-panel">
        <div class="empty-note">${escapeHtml(error.message)}</div>
      </section>
    `;
  }
}

export function initSquadBuilder(root) {
  const button = root.querySelector('[data-save-battle-squad]');
  const status = root.querySelector('[data-save-battle-squad-status]');

  if (!button || !status) {
    return;
  }

  button.addEventListener('click', async () => {
    const squadCardIds = parseSquadCardIds(button.getAttribute('data-squad-card-ids'));
    button.disabled = true;
    button.textContent = 'Saving...';
    status.textContent = 'Saving your squad...';

    try {
      await saveBattleSquad({ squadCardIds });
      status.textContent = 'Saved. This squad will load by default next time.';
      button.textContent = 'Saved';
      button.classList.add('button-resolved');
      button.setAttribute('aria-disabled', 'true');
    } catch (error) {
      status.textContent = error.message;
      button.disabled = false;
      button.textContent = 'Save Squad';
      button.classList.remove('button-resolved');
      button.removeAttribute('aria-disabled');
    }
  });
}
