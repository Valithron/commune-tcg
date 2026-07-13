/* ============================================================================
   Library Route
   Phase 4.5 responsibility: clean player Library with no admin/debug links.
   ============================================================================ */

import { loadLibraryCards } from '../data/libraryData.js';
import { renderCardFrame } from '../components/CardFrame.js';
import { escapeHtml } from '../components/format.js';

const characterLabels = {
  sterling: 'Sterling',
  cydney: 'Cydney',
  ryan: 'Ryan',
  gabi: 'Gabi',
  cooper: 'Cooper',
  kenly: 'Kenly',
  ashley: 'Ashley',
};

const rarityRank = {
  common: 1,
  uncommon: 2,
  rare: 3,
  legendary: 4,
  mythic: 5,
};

const filterDefinitions = [
  { key: 'character', label: 'Character', allLabel: 'All Characters', icon: '♙' },
  { key: 'rarity', label: 'Rarity', allLabel: 'All Rarities', icon: '◇' },
  { key: 'creator', label: 'Creator', allLabel: 'All Creators', icon: '◎' },
  { key: 'type', label: 'Type', allLabel: 'All Types', icon: '▰' },
];

const sortOptions = [
  { value: 'default', label: 'Default Order' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'rarity-desc', label: 'Rarity High' },
  { value: 'rarity-asc', label: 'Rarity Low' },
  { value: 'creator-asc', label: 'Creator A-Z' },
  { value: 'newest', label: 'Newest First' },
];

function cleanValue(value) {
  return String(value ?? '').trim();
}

function humanize(value) {
  return cleanValue(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeFilterValue(value) {
  return cleanValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeRarity(rarity) {
  const value = cleanValue(rarity).toLowerCase();

  if (['common', 'uncommon', 'rare', 'legendary', 'mythic'].includes(value)) {
    return value;
  }

  if (value.includes('myth')) return 'mythic';
  if (value.includes('legend')) return 'legendary';
  if (value.includes('uncommon')) return 'uncommon';
  if (value.includes('rare')) return 'rare';

  return 'common';
}

function readFirst(card, keys, fallback = '') {
  for (const key of keys) {
    const value = card?.[key];

    if (value !== undefined && value !== null && cleanValue(value)) {
      return value;
    }
  }

  return fallback;
}

function getCharacterLabel(rawValue) {
  const key = normalizeFilterValue(rawValue);

  return characterLabels[key] || humanize(rawValue);
}

function getCardType(card) {
  return readFirst(card, ['type', 'cardType', 'card_type', 'battleRole', 'battle_role', 'role', 'category'], 'Type');
}

function getCreator(card) {
  return readFirst(card, [
    'creatorDisplayName',
    'creator_display_name',
    'creatorName',
    'creator_name',
    'creator',
    'createdBy',
    'created_by',
    'submitterDisplayName',
    'submitter_display_name',
    'submittedBy',
    'submitted_by',
    'artistName',
    'artist_name',
    'artist',
    'author',
    'username',
    'userName',
  ], '');
}

function getCreatedAt(card) {
  return cleanValue(readFirst(card, ['createdAt', 'created_at', 'approvedAt', 'approved_at', 'updatedAt', 'updated_at'], ''));
}

function getLibraryCardMeta(card, index) {
  const name = cleanValue(card.name) || 'Unnamed Card';
  const characterRaw = readFirst(card, ['cid', 'character_id', 'characterId', 'character', 'person', 'commune_member'], '');
  const typeRaw = getCardType(card);
  const creatorRaw = getCreator(card);
  const rarity = normalizeRarity(card.rarity);
  const characterLabel = getCharacterLabel(characterRaw);
  const typeLabel = humanize(typeRaw) || 'Type';
  const creatorLabel = humanize(creatorRaw);
  const createdAt = getCreatedAt(card);
  const searchText = [
    name,
    rarity,
    characterRaw,
    characterLabel,
    typeRaw,
    typeLabel,
    creatorRaw,
    creatorLabel,
    card.category,
    card.ability,
    card.abilityText,
    card.flavor,
  ].map(cleanValue).filter(Boolean).join(' ').toLowerCase();

  return {
    index,
    name,
    rarity,
    rarityLabel: humanize(rarity),
    rarityRank: rarityRank[rarity] || 0,
    character: normalizeFilterValue(characterRaw),
    characterLabel,
    creator: normalizeFilterValue(creatorRaw),
    creatorLabel,
    type: normalizeFilterValue(typeRaw),
    typeLabel,
    createdAt,
    searchText,
  };
}

function getFilterOptions(cards, key) {
  const options = new Map();

  cards.forEach((card, index) => {
    const meta = getLibraryCardMeta(card, index);
    const value = meta[key];
    const label = meta[`${key}Label`];

    if (value && label) {
      options.set(value, label);
    }
  });

  return Array.from(options, ([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function renderSelectOptions(options) {
  return options.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join('');
}

function renderFilterTile(definition, cards) {
  const options = getFilterOptions(cards, definition.key);

  return `
    <label class="library-filter-tile" data-library-filter-tile="${escapeHtml(definition.key)}">
      <span class="library-filter-icon" aria-hidden="true">${escapeHtml(definition.icon)}</span>
      <span class="library-filter-copy">
        <span>${escapeHtml(definition.label)}</span>
        <strong data-library-filter-display="${escapeHtml(definition.key)}">${escapeHtml(definition.label)}</strong>
      </span>
      <select data-library-filter="${escapeHtml(definition.key)}" aria-label="Filter by ${escapeHtml(definition.label)}">
        <option value="">${escapeHtml(definition.allLabel)}</option>
        ${renderSelectOptions(options)}
      </select>
    </label>
  `;
}

function renderSortTile() {
  return `
    <label class="library-filter-tile library-filter-tile--sort" data-library-sort-tile>
      <span class="library-filter-icon" aria-hidden="true">⇅</span>
      <span class="library-filter-copy">
        <span>Sort</span>
        <strong data-library-sort-display>Sort</strong>
      </span>
      <select data-library-sort aria-label="Sort Library cards">
        ${renderSelectOptions(sortOptions)}
      </select>
    </label>
  `;
}

function renderLibraryControls(cards) {
  return `
    <section class="library-controls" data-library-controls aria-label="Library search and filters">
      <label class="library-search-field">
        <span aria-hidden="true">⌕</span>
        <input data-library-search type="search" inputmode="search" autocomplete="off" placeholder="Search cards..." aria-label="Search Library cards" />
      </label>
      <div class="library-filter-grid">
        ${filterDefinitions.map((definition) => renderFilterTile(definition, cards)).join('')}
        ${renderSortTile()}
      </div>
    </section>
  `;
}

function renderLibraryCard(card, index) {
  const meta = getLibraryCardMeta(card, index);

  return `
    <div
      class="library-card-item"
      data-library-card
      data-library-index="${escapeHtml(String(meta.index))}"
      data-library-name="${escapeHtml(meta.name.toLowerCase())}"
      data-library-rarity="${escapeHtml(meta.rarity)}"
      data-library-rarity-rank="${escapeHtml(String(meta.rarityRank))}"
      data-library-character="${escapeHtml(meta.character)}"
      data-library-creator="${escapeHtml(meta.creator)}"
      data-library-type="${escapeHtml(meta.type)}"
      data-library-created="${escapeHtml(meta.createdAt)}"
      data-library-search="${escapeHtml(meta.searchText)}"
    >
      ${renderCardFrame(card, { href: `#/library/card/${card.id}`, context: 'library', showOwnership: false })}
    </div>
  `;
}

function getDatasetValue(item, key) {
  return item.getAttribute(`data-library-${key}`) || '';
}

function compareItems(sortValue, a, b) {
  const indexA = Number(getDatasetValue(a, 'index')) || 0;
  const indexB = Number(getDatasetValue(b, 'index')) || 0;

  if (sortValue === 'name-asc') return getDatasetValue(a, 'name').localeCompare(getDatasetValue(b, 'name'));
  if (sortValue === 'name-desc') return getDatasetValue(b, 'name').localeCompare(getDatasetValue(a, 'name'));
  if (sortValue === 'rarity-desc') return (Number(getDatasetValue(b, 'rarity-rank')) || 0) - (Number(getDatasetValue(a, 'rarity-rank')) || 0) || indexA - indexB;
  if (sortValue === 'rarity-asc') return (Number(getDatasetValue(a, 'rarity-rank')) || 0) - (Number(getDatasetValue(b, 'rarity-rank')) || 0) || indexA - indexB;
  if (sortValue === 'creator-asc') return getDatasetValue(a, 'creator').localeCompare(getDatasetValue(b, 'creator')) || indexA - indexB;
  if (sortValue === 'newest') {
    const timeA = Date.parse(getDatasetValue(a, 'created')) || 0;
    const timeB = Date.parse(getDatasetValue(b, 'created')) || 0;

    return timeB - timeA || indexB - indexA;
  }

  return indexA - indexB;
}

function syncControlLabels(controls) {
  controls.querySelectorAll('[data-library-filter]').forEach((select) => {
    const key = select.getAttribute('data-library-filter');
    const display = controls.querySelector(`[data-library-filter-display="${key}"]`);
    const tile = controls.querySelector(`[data-library-filter-tile="${key}"]`);
    const selectedLabel = select.selectedOptions[0]?.textContent || '';
    const active = Boolean(select.value);

    if (display) {
      display.textContent = active ? selectedLabel : key.charAt(0).toUpperCase() + key.slice(1);
    }

    tile?.classList.toggle('is-active', active);
  });

  const sort = controls.querySelector('[data-library-sort]');
  const sortDisplay = controls.querySelector('[data-library-sort-display]');
  const sortTile = controls.querySelector('[data-library-sort-tile]');
  const sortActive = sort?.value && sort.value !== 'default';

  if (sortDisplay && sort) {
    sortDisplay.textContent = sortActive ? sort.selectedOptions[0]?.textContent || 'Sort' : 'Sort';
  }

  sortTile?.classList.toggle('is-active', Boolean(sortActive));
}

export async function renderLibrary() {
  const library = await loadLibraryCards();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Every Available Design</span>
      <h2 class="hero-title">The Library</h2>
      <p class="hero-copy">Browse every available card design. Cards shown here are possibilities, not owned copies. Your pulled cards live in the Vault.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/pull">Start Pulling</a>
        <a class="button button-secondary" href="#/vault">Open Your Vault</a>
      </div>
    </section>

    ${renderLibraryControls(library.cards)}

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Card Designs</span>
          <h2 class="section-title">Available in Pulls</h2>
        </div>
        <span class="status-pill" data-library-count>${library.cards.length} cards</span>
      </div>
      <div class="card-grid library-card-grid" data-library-grid>
        ${library.cards.map((card, index) => renderLibraryCard(card, index)).join('')}
      </div>
      <div class="empty-note library-empty" data-library-empty hidden>No Library cards match those filters.</div>
    </section>
  `;
}

export function initLibraryControls(root) {
  const controls = root.querySelector('[data-library-controls]');
  const grid = root.querySelector('[data-library-grid]');
  const cards = Array.from(root.querySelectorAll('[data-library-card]'));
  const search = root.querySelector('[data-library-search]');
  const filters = Array.from(root.querySelectorAll('[data-library-filter]'));
  const sort = root.querySelector('[data-library-sort]');
  const count = root.querySelector('[data-library-count]');
  const empty = root.querySelector('[data-library-empty]');

  if (!controls || !grid || !search || !sort || cards.length === 0) {
    return;
  }

  const applyControls = () => {
    const query = search.value.trim().toLowerCase();
    const activeFilters = filters.map((select) => ({ key: select.getAttribute('data-library-filter'), value: select.value })).filter((filter) => filter.key);
    let visibleCount = 0;

    cards.forEach((card) => {
      const searchMatch = !query || getDatasetValue(card, 'search').includes(query);
      const filtersMatch = activeFilters.every((filter) => !filter.value || getDatasetValue(card, filter.key) === filter.value);
      const visible = searchMatch && filtersMatch;

      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    [...cards]
      .sort((a, b) => compareItems(sort.value, a, b))
      .forEach((card) => grid.appendChild(card));

    if (count) {
      count.textContent = `${visibleCount} ${visibleCount === 1 ? 'card' : 'cards'}`;
    }

    if (empty) {
      empty.hidden = visibleCount !== 0;
    }

    syncControlLabels(controls);
  };

  search.addEventListener('input', applyControls);
  filters.forEach((select) => select.addEventListener('change', applyControls));
  sort.addEventListener('change', applyControls);

  applyControls();
}
