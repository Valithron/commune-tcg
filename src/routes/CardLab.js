/* ============================================================================
   Card Lab Route
   Phase 7.5 responsibility: live card-frame inspection using real Library data,
   title-length samples, rarity samples, and full detail-sheet preview. No writes.
   ============================================================================ */

import { loadLibraryCards } from '../data/libraryData.js';
import { renderCardFrame } from '../components/CardFrame.js';
import { escapeHtml, titleCase } from '../components/format.js';

const titleLimit = 25;
const sampleDefinitions = [
  { key: 'shortest', label: 'Shortest', percentile: 0 },
  { key: 'p25', label: '25th Percentile', percentile: 0.25 },
  { key: 'median', label: 'Median', percentile: 0.5 },
  { key: 'p80', label: '80th Percentile', percentile: 0.8 },
  { key: 'longest', label: 'Longest', percentile: 1 },
];

const rarityDefinitions = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];
const unknownValue = 'Not mapped yet';

const densityRows = [
  {
    density: 'showcase',
    title: 'Showcase Size',
    note: 'Large desktop inspection size for shape, crop, title, rarity, and footer checks.',
  },
  {
    density: 'standard',
    title: 'Standard Mobile Size',
    note: 'Normal collection and mobile card sizing target.',
  },
  {
    density: 'thumbnail',
    title: 'Thumbnail Size',
    note: 'Small collection, result, and compressed-list stress test.',
  },
];

function titleLength(card) {
  return String(card.name || '').length;
}

function normalizeRarity(rarity) {
  const value = String(rarity || 'common').toLowerCase();
  return rarityDefinitions.includes(value) ? value : 'common';
}

function readCardValue(card, keys, fallback = unknownValue) {
  for (const key of keys) {
    const value = card?.[key];

    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        return value.length ? value.join(', ') : fallback;
      }

      return value;
    }
  }

  return fallback;
}

function formatBoolean(value, fallback = unknownValue) {
  if (value === true) {
    return 'Yes';
  }

  if (value === false) {
    return 'No';
  }

  return fallback;
}

function withLabRarity(card, rarity, note) {
  if (!card) {
    return null;
  }

  return {
    ...card,
    id: `${card.id || card.name}-lab-${rarity}`,
    rarity,
    labRarityNote: note,
  };
}

function selectTitleSamples(cards) {
  const sortedCards = [...cards].sort((a, b) => titleLength(a) - titleLength(b));
  const usedIds = new Set();

  return sampleDefinitions.map((definition) => {
    if (!sortedCards.length) {
      return { ...definition, card: null };
    }

    const targetIndex = Math.round(definition.percentile * (sortedCards.length - 1));
    const rankedCandidates = sortedCards
      .map((card, index) => ({ card, index, distance: Math.abs(index - targetIndex) }))
      .sort((a, b) => a.distance - b.distance || titleLength(a.card) - titleLength(b.card));

    const match = rankedCandidates.find(({ card }) => !usedIds.has(String(card.id))) || rankedCandidates[0];
    usedIds.add(String(match.card.id));

    return {
      ...definition,
      card: match.card,
      index: match.index,
      metaLine: `${titleLength(match.card)} chars · ${titleCase(normalizeRarity(match.card.rarity))}`,
    };
  });
}

function selectRaritySamples(cards) {
  const usedIds = new Set();
  const actualByRarity = new Map(rarityDefinitions.map((rarity) => [rarity, []]));

  cards.forEach((card) => {
    actualByRarity.get(normalizeRarity(card.rarity)).push(card);
  });

  const findUnused = (candidates) => candidates.find((card) => !usedIds.has(String(card.id))) || candidates[0] || null;
  const fallbackCards = cards.length ? cards : [];

  return rarityDefinitions.map((rarity) => {
    const actualCard = findUnused(actualByRarity.get(rarity) || []);

    if (actualCard) {
      usedIds.add(String(actualCard.id));
      return {
        key: rarity,
        label: titleCase(rarity),
        card: actualCard,
        metaLine: `${titleLength(actualCard)} chars · live ${titleCase(rarity)}`,
      };
    }

    const fallbackSource = rarity === 'mythic'
      ? findUnused(actualByRarity.get('legendary') || []) || findUnused(fallbackCards)
      : findUnused(fallbackCards);
    const fallbackCard = withLabRarity(fallbackSource, rarity, rarity === 'mythic' ? 'Legendary rendered as Mythic' : 'Lab rarity override');

    if (fallbackSource) {
      usedIds.add(String(fallbackSource.id));
    }

    return {
      key: rarity,
      label: titleCase(rarity),
      card: fallbackCard,
      metaLine: fallbackCard
        ? `${titleLength(fallbackCard)} chars · ${fallbackCard.labRarityNote}`
        : `No ${titleCase(rarity)} sample`,
    };
  });
}

function getDetailCard(titleSamples, cards) {
  return titleSamples.find((sample) => sample.key === 'longest')?.card
    || titleSamples.find((sample) => sample.card)?.card
    || cards[0]
    || null;
}

function renderDetailRow(label, value) {
  return `
    <div class="detail-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value || unknownValue))}</strong>
    </div>
  `;
}

function renderDetailGroup(title, rows) {
  return `
    <section class="card-lab-detail-group">
      <h4>${escapeHtml(title)}</h4>
      <div class="detail-list">
        ${rows.map(([label, value]) => renderDetailRow(label, value)).join('')}
      </div>
    </section>
  `;
}

function getDetailGroups(card, library, sourceLabel, artStatus) {
  const stats = card.stats || {};
  const owned = card.owned ?? false;
  const imageKey = card.imageKey || readCardValue(card, ['image_key', 'imagePath', 'image_path', 'art_key'], unknownValue);
  const imageUrl = card.imageUrl ? 'Proxy URL mapped' : readCardValue(card, ['image_url', 'art_url'], unknownValue);

  return [
    {
      title: 'Identity',
      rows: [
        ['Name', card.name],
        ['Rarity', titleCase(normalizeRarity(card.rarity))],
        ['Type', readCardValue(card, ['type', 'cardType', 'card_type'])],
        ['Category', readCardValue(card, ['category', 'class', 'archetype'])],
        ['Faction', readCardValue(card, ['faction', 'team', 'affinity'])],
        ['Set / Collection', readCardValue(card, ['set', 'setName', 'collection'])],
        ['Card ID', card.id],
        ['Title Length', `${titleLength(card)} / ${titleLimit} characters`],
      ],
    },
    {
      title: 'Creator and Provenance',
      rows: [
        ['Card Creator', readCardValue(card, ['creator', 'createdBy', 'creator_name', 'author'])],
        ['Submitted By', readCardValue(card, ['submittedBy', 'submitted_by', 'submitter'])],
        ['Approved By', readCardValue(card, ['approvedBy', 'approved_by', 'moderator'])],
        ['Minted Date', readCardValue(card, ['mintedAt', 'minted_at', 'created_at'])],
        ['Source Pool', readCardValue(card, ['sourcePool', 'source_pool', 'pool'])],
        ['Prompt / Source Note', readCardValue(card, ['prompt', 'sourceNote', 'source_note'])],
      ],
    },
    {
      title: 'Art',
      rows: [
        ['Art Status', artStatus],
        ['Image Key', imageKey],
        ['Image URL', imageUrl],
        ['Artist Credit', readCardValue(card, ['artist', 'artistCredit', 'artist_credit'])],
        ['Crop Metadata', readCardValue(card, ['crop', 'cropData', 'crop_data', 'objectPosition'])],
      ],
    },
    {
      title: 'Gameplay',
      rows: [
        ['POW', stats.pow ?? 1],
        ['DEF', stats.def ?? 1],
        ['SPD', stats.spd ?? 1],
        ['Ability', readCardValue(card, ['ability', 'abilityText', 'ability_text'])],
        ['Ability Type', readCardValue(card, ['abilityType', 'ability_type'])],
        ['Ability Trigger', readCardValue(card, ['trigger', 'abilityTrigger', 'ability_trigger'])],
        ['Cooldown', readCardValue(card, ['cooldown', 'abilityCooldown', 'ability_cooldown'])],
        ['Passive Effect', readCardValue(card, ['passive', 'passiveEffect', 'passive_effect'])],
        ['Battle Role', readCardValue(card, ['role', 'battleRole', 'battle_role'])],
        ['Targeting Rule', readCardValue(card, ['targeting', 'targetRule', 'target_rule'])],
        ['Synergy Tags', readCardValue(card, ['tags', 'synergyTags', 'synergy_tags'])],
      ],
    },
    {
      title: 'Economy',
      rows: [
        ['Passive Income', readCardValue(card, ['passiveIncome', 'passive_income', 'income'])],
        ['Income Interval', readCardValue(card, ['incomeInterval', 'income_interval'])],
        ['Gold Value', readCardValue(card, ['goldValue', 'gold_value', 'value'])],
        ['Shard / Dust Value', readCardValue(card, ['dustValue', 'dust_value', 'shardValue', 'shard_value'])],
        ['Pull Weight', readCardValue(card, ['pullWeight', 'pull_weight', 'weight'])],
        ['Duplicate Conversion', readCardValue(card, ['duplicateValue', 'duplicate_value', 'dupeValue'])],
      ],
    },
    {
      title: 'Ownership and Progression',
      rows: [
        ['Ownership Context', 'Not shown in Library'],
        ['Owned', formatBoolean(owned)],
        ['Owned Copies', card.copies ?? 0],
        ['Level', card.level ?? 1],
        ['XP', readCardValue(card, ['xp', 'experience'], '0')],
        ['XP To Next Level', readCardValue(card, ['xpToNext', 'xp_to_next', 'nextLevelXp'])],
        ['Ascension State', readCardValue(card, ['ascension', 'ascensionState', 'ascension_state'])],
        ['Equipped State', readCardValue(card, ['equipped', 'equippedState', 'equipped_state'])],
        ['Locked State', readCardValue(card, ['locked', 'lockedState', 'locked_state'])],
      ],
    },
    {
      title: 'Text and Lore',
      rows: [
        ['Flavor Text', card.flavor || unknownValue],
        ['Lore Note', readCardValue(card, ['lore', 'loreNote', 'lore_note'])],
        ['Admin Notes', readCardValue(card, ['adminNotes', 'admin_notes', 'notes'])],
      ],
    },
    {
      title: 'Moderation and Visibility',
      rows: [
        ['Approval Status', readCardValue(card, ['status', 'approvalStatus', 'approval_status'])],
        ['Visibility', readCardValue(card, ['visibility', 'publicState', 'public_state'])],
        ['Flags', readCardValue(card, ['flags', 'moderationFlags', 'moderation_flags'])],
        ['Last Updated', readCardValue(card, ['updatedAt', 'updated_at'])],
      ],
    },
    {
      title: 'Data and Debug',
      rows: [
        ['Data Source', sourceLabel],
        ['Source Table', library.table || unknownValue],
        ['Raw Rarity Mapping', card.rarity || unknownValue],
        ['Stats Mapping Status', stats.pow || stats.def || stats.spd ? 'Mapped' : 'Defaulted'],
        ['Missing Fields Note', 'Unknown fields display as Not mapped yet'],
      ],
    },
  ];
}

function renderDetailPreview(card, library) {
  if (!card) {
    return '<section class="glass-panel card-lab-detail-preview"><div class="empty-note">No card available for detail preview.</div></section>';
  }

  const stats = card.stats || {};
  const sourceLabel = library.source === 'backend'
    ? `Live D1${library.table ? ` · ${library.table}` : ''}`
    : 'Mock fallback';
  const artStatus = card.imageUrl || card.imageKey ? 'Image mapped' : 'No image mapped';
  const detailGroups = getDetailGroups(card, library, sourceLabel, artStatus);

  return `
    <section class="glass-panel card-lab-detail-preview">
      <div class="card-lab-detail-copy">
        <span class="section-kicker">Detail Preview</span>
        <h2 class="section-title">Stats Screen Layout</h2>
        <p class="body-copy">This preview keeps the collectible card face clean while moving creator, gameplay, economy, progression, source, moderation, and debug metadata into the surrounding stat sheet.</p>
      </div>
      <div class="card-lab-detail-layout">
        <div class="card-lab-detail-card-stage" data-card-frame-tuner-stage data-tuner-id="showcase" data-tuner-title="Large Card Maker">
          ${renderCardFrame(card, {
            density: 'showcase',
            context: 'library',
            showOwnership: false,
            showStats: true,
          })}
        </div>
        <div class="card-lab-detail-sheet" data-card-frame-tuner-panel-target="showcase">
          <div>
            <span class="section-kicker">Selected Card</span>
            <h3 class="detail-title">${escapeHtml(card.name)}</h3>
            <p class="body-copy">${escapeHtml(card.flavor || 'No flavor text is mapped for this card yet.')}</p>
          </div>
          <div class="stat-grid card-lab-detail-stat-grid">
            <div class="stat-panel"><span class="stat-label">POW</span><strong class="stat-value">${escapeHtml(String(stats.pow ?? 1))}</strong></div>
            <div class="stat-panel"><span class="stat-label">DEF</span><strong class="stat-value">${escapeHtml(String(stats.def ?? 1))}</strong></div>
            <div class="stat-panel"><span class="stat-label">SPD</span><strong class="stat-value">${escapeHtml(String(stats.spd ?? 1))}</strong></div>
          </div>
          <div class="card-lab-detail-groups">
            ${detailGroups.map((group) => renderDetailGroup(group.title, group.rows)).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderStandardTunerPreview(card) {
  if (!card) {
    return '<section class="glass-panel card-lab-standard-tuner-preview"><div class="empty-note">No card available for standard tuner.</div></section>';
  }

  return `
    <section class="glass-panel card-lab-standard-tuner-preview">
      <div class="card-lab-detail-copy">
        <span class="section-kicker">Standard Card Maker</span>
        <h2 class="section-title">Edit the standard size.</h2>
        <p class="body-copy">This is a separate editable standard-size copy. Use this when the large card looks good but the normal collection size needs manual tuning.</p>
      </div>
      <div class="card-lab-standard-tuner-layout">
        <div class="card-lab-standard-tuner-card-stage" data-card-frame-tuner-stage data-tuner-id="standard" data-tuner-title="Standard Card Maker">
          ${renderCardFrame(card, {
            density: 'standard',
            context: 'library',
            showOwnership: false,
            showStats: true,
          })}
        </div>
        <div class="card-lab-standard-tuner-sheet" data-card-frame-tuner-panel-target="standard">
          <div>
            <span class="section-kicker">Selected Card</span>
            <h3 class="detail-title">${escapeHtml(card.name)}</h3>
            <p class="body-copy">Standard tuning is stored separately from the large-card tuner and outputs standard-specific ratios.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSampleMeta(sample) {
  if (!sample.card) {
    return '<div class="card-lab-meta"><strong>No card</strong><span>No Library cards loaded.</span></div>';
  }

  return `
    <div class="card-lab-meta">
      <strong>${escapeHtml(sample.label)}</strong>
      <span>${escapeHtml(sample.metaLine || `${titleLength(sample.card)} chars · ${titleCase(normalizeRarity(sample.card.rarity))}`)}</span>
    </div>
  `;
}

function renderCardCell(sample, density) {
  if (!sample.card) {
    return '<div class="card-lab-cell"><div class="empty-note">No card available.</div></div>';
  }

  return `
    <article class="card-lab-cell card-lab-cell--${escapeHtml(density)}">
      ${renderSampleMeta(sample)}
      <div class="card-lab-card-stage">
        ${renderCardFrame(sample.card, {
          density,
          context: 'library',
          showOwnership: false,
          showStats: true,
        })}
      </div>
      <div class="card-lab-title-readout">${escapeHtml(sample.card.name)}</div>
    </article>
  `;
}

function renderSampleRow({ density, rowLabel, rowTitle, rowNote, samples }) {
  return `
    <div class="card-lab-subsection">
      <div class="card-lab-subheading">
        <div>
          <span class="section-kicker">${escapeHtml(rowLabel)}</span>
          <h3 class="card-lab-row-title">${escapeHtml(rowTitle)}</h3>
        </div>
        <span class="status-pill">5 cards</span>
      </div>
      <p class="body-copy card-lab-note">${escapeHtml(rowNote)}</p>
      <div class="card-lab-row card-lab-row--${escapeHtml(density)}">
        ${samples.map((sample) => renderCardCell(sample, density)).join('')}
      </div>
    </div>
  `;
}

function renderDensitySection(row, titleSamples, raritySamples) {
  return `
    <section class="card-lab-section">
      <div class="section-heading card-lab-section-heading">
        <div>
          <span class="section-kicker">${escapeHtml(row.density)}</span>
          <h2 class="section-title">${escapeHtml(row.title)}</h2>
        </div>
      </div>
      <p class="body-copy card-lab-note">${escapeHtml(row.note)}</p>
      ${renderSampleRow({
        density: row.density,
        rowLabel: 'Title length',
        rowTitle: `${row.title} Title Samples`,
        rowNote: 'Shortest, 25th percentile, median, 80th percentile, and longest title strings.',
        samples: titleSamples,
      })}
      ${renderSampleRow({
        density: row.density,
        rowLabel: 'Rarity spread',
        rowTitle: `${row.title} Rarity Samples`,
        rowNote: 'Common, Uncommon, Rare, Legendary, and Mythic frames. Missing rarities are rendered as lab-only overrides.',
        samples: raritySamples,
      })}
    </section>
  `;
}

export async function renderCardLab() {
  const library = await loadLibraryCards();
  const titleSamples = selectTitleSamples(library.cards);
  const raritySamples = selectRaritySamples(library.cards);
  const detailCard = getDetailCard(titleSamples, library.cards);
  const sourceLabel = library.source === 'backend'
    ? `Live D1${library.table ? ` · ${library.table}` : ''}`
    : 'Mock fallback';

  return `
    <section class="hero-panel card-lab-hero">
      <span class="section-kicker">Card Lab</span>
      <h2 class="hero-title">Stress the frame.</h2>
      <p class="hero-copy">Live detail, title-length, and rarity samples from the Library render before we lock the production overlay shape.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/library">Back to Library</a>
        <a class="button button-secondary" href="#/inventory">Inventory</a>
      </div>
    </section>

    <section class="glass-panel card-lab-summary">
      <div class="detail-list">
        <div class="detail-row"><span>Source</span><strong>${escapeHtml(sourceLabel)}</strong></div>
        <div class="detail-row"><span>Total Cards</span><strong>${escapeHtml(String(library.cards.length))}</strong></div>
        <div class="detail-row"><span>Title Limit Target</span><strong>${titleLimit} characters</strong></div>
        <div class="detail-row"><span>Title Rule</span><strong>One line, no ellipsis</strong></div>
      </div>
    </section>

    ${renderDetailPreview(detailCard, library)}
    ${renderStandardTunerPreview(detailCard)}

    <div class="card-lab">
      ${densityRows.map((row) => renderDensitySection(row, titleSamples, raritySamples)).join('')}
    </div>
  `;
}
