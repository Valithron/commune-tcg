/* ============================================================================
   Vault Route
   Phase auth-current-user responsibility: render the signed-in player's Vault.
   ============================================================================ */

import { renderCardFrame } from '../components/CardFrame.js';
import { escapeHtml } from '../components/format.js';
import { loadVaultCards } from '../data/vaultData.js';

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

function formatVaultOwnerName(vault) {
  return String(vault.ownerDisplayName || vault.selectedOwnerUserId || 'User')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'User';
}

function getCharacterLabel(rawValue) {
  const key = normalizeFilterValue(rawValue);

  return characterLabels[key] || humanize(rawValue);
}

function getCardType(card) {
  return readFirst(card, ['selectedType', 'selected_type', 'type', 'cardType', 'card_type', 'battleRole', 'battle_role', 'role', 'category'], 'Type');
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
  return cleanValue(readFirst(card, ['pulledAt', 'pulled_at', 'createdAt', 'created_at', 'approvedAt', 'approved_at', 'updatedAt', 'updated_at'], ''));
}

function getVaultCardMeta(card, index) {
  const name = cleanValue(card.name || card.title) || 'Unnamed Card';
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
    card.duplicateGroupLabel,
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
    const meta = getVaultCardMeta(card, index);
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
      <select data-library-sort aria-label="Sort Vault cards">
        ${renderSelectOptions(sortOptions)}
      </select>
    </label>
  `;
}

function renderVaultControls(cards) {
  return `
    <section class="library-controls vault-controls" data-library-controls aria-label="Vault search and filters">
      <label class="library-search-field">
        <span aria-hidden="true">⌕</span>
        <input data-library-search type="search" inputmode="search" autocomplete="off" placeholder="Search cards..." aria-label="Search Vault cards" />
      </label>
      <div class="library-filter-grid">
        ${filterDefinitions.map((definition) => renderFilterTile(definition, cards)).join('')}
        ${renderSortTile()}
      </div>
    </section>
  `;
}

function renderVaultCard(card, index) {
  const meta = getVaultCardMeta(card, index);
  const duplicateCount = Number(card.duplicateGroupCount || 1);
  const duplicateIndex = Number(card.duplicateGroupIndex || 1);
  const duplicateBadge = duplicateCount > 1
    ? `<span class="status-pill vault-copy-pill" style="position:absolute;left:0.45rem;top:0.45rem;z-index:4;min-height:1.45rem;padding:0.2rem 0.5rem;background:rgba(8,10,20,0.82);box-shadow:0 0.35rem 1rem rgba(0,0,0,0.25);" aria-label="Duplicate copy ${duplicateIndex} of ${duplicateCount}">Copy ${duplicateIndex}/${duplicateCount}</span>`
    : '';

  return `
    <div
      class="library-card-item vault-card-slot"
      style="position:relative;min-width:0;"
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
      data-duplicate-group="${escapeHtml(card.duplicateGroupKey || card.id || '')}"
    >
      ${duplicateBadge}
      ${renderCardFrame(card, { href: `#/vault/card/${card.id}`, context: 'vault' })}
    </div>
  `;
}

export async function renderVault() {
  const vault = await loadVaultCards({ force: true });
  const ownerName = formatVaultOwnerName(vault);

  return `
    <section class="hero-panel">
      <span class="section-kicker">Owned Cards</span>
      <h2 class="hero-title">${ownerName}'s Vault</h2>
      <p class="hero-copy">This Vault is scoped to the currently signed-in player. Duplicate copies are grouped together by card template while preserving each owned copy.</p>
    </section>

    ${renderVaultControls(vault.cards)}

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Collection</span>
          <h2 class="section-title">Owned Cards</h2>
        </div>
        <span class="status-pill" data-library-count>${vault.cards.length} owned</span>
      </div>
      <div class="card-grid vault-card-grid" data-library-grid>
        ${vault.cards.map((card, index) => renderVaultCard(card, index)).join('')}
      </div>
      <div class="empty-note library-empty" data-library-empty hidden>No Vault cards match those filters.</div>
    </section>
  `;
}
