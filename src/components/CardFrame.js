/* ============================================================================
   Card Frame Component
   Phase 7.5 responsibility: single canonical card renderer with density and
   context variants for frame testing, Library, Vault, Pull, and Battle.
   ============================================================================ */

import { escapeHtml, titleCase } from './format.js';
import commonFrameUrl from '../assets/card-frames/card-frame-common.png';
import uncommonFrameUrl from '../assets/card-frames/card-frame-uncommon.png';
import rareFrameUrl from '../assets/card-frames/card-frame-rare.png';
import legendaryFrameUrl from '../assets/card-frames/card-frame-legendary.png';
import mythicFrameUrl from '../assets/card-frames/card-frame-mythic.png';

const rarityFrameAssets = {
  common: commonFrameUrl,
  uncommon: uncommonFrameUrl,
  rare: rareFrameUrl,
  legendary: legendaryFrameUrl,
  mythic: mythicFrameUrl,
};

const characterMap = [
  { key: 'cydney', name: 'Cydney', abbr: 'CY', color: '#789461' },
  { key: 'sterling', name: 'Sterling', abbr: 'ST', color: '#c4c5db' },
  { key: 'ryan', name: 'Ryan', abbr: 'RY', color: '#a98cff' },
  { key: 'gabi', name: 'Gabi', abbr: 'GA', color: '#8ccdff' },
  { key: 'cooper', name: 'Cooper', abbr: 'CO', color: '#ff8f70' },
  { key: 'kenly', name: 'Kenly', abbr: 'KE', color: '#73e1c2' },
  { key: 'ashley', name: 'Ashley', abbr: 'AS', color: '#ff9ccf' },
];

const cardTypeMap = {
  flame: { label: 'Flame', color: '#E85D4F', textColor: '#101014' },
  tide: { label: 'Tide', color: '#2F80ED', textColor: '#f7f9ff' },
  bloom: { label: 'Bloom', color: '#45B36B', textColor: '#101014' },
  volt: { label: 'Volt', color: '#F2C94C', textColor: '#101014' },
  shadow: { label: 'Shadow', color: '#5B3A8E', textColor: '#f7f9ff' },
  radiant: { label: 'Radiant', color: '#F6D77A', textColor: '#101014' },
  neutral: { label: 'Neutral', color: '#A99A86', textColor: '#101014' },
};

function renderStats(stats = {}) {
  return [
    ['POW', stats.pow ?? 1],
    ['DEF', stats.def ?? 1],
    ['SPD', stats.spd ?? 1],
  ].map(([label, value]) => `
    <span class="card-stat">
      <span class="card-stat-label">${label}</span>
      <span class="card-stat-value">${escapeHtml(String(value))}</span>
    </span>
  `).join('');
}

function toCropNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function normalizeCrop(card) {
  const rawCrop = card.crop || card.imageCrop || {};
  const parsedCrop = typeof rawCrop === 'string' ? JSON.parse(rawCrop || '{}') : rawCrop;
  const crop = parsedCrop?.crop || parsedCrop?.imageCrop || parsedCrop || {};
  return {
    x: toCropNumber(crop.x ?? crop.left, 50, 0, 100),
    y: toCropNumber(crop.y ?? crop.top, 50, 0, 100),
    zoom: toCropNumber(crop.zoom ?? crop.z ?? crop.scale, 1, 1, 3),
  };
}

function isLikelyUrl(value) {
  const text = String(value || '');
  return /^https?:\/\//i.test(text) || text.startsWith('/');
}

function imageUrlFromValue(value) {
  const imageValue = String(value || '').trim();
  if (!imageValue) return '';
  if (isLikelyUrl(imageValue)) return imageValue;
  return `/api/card-image?key=${encodeURIComponent(imageValue)}`;
}

function resolveCardImageValue(card) {
  return card.imageUrl || card.image_url || card.artUrl || card.art_url || card.imageKey || card.image_key || card.image_path || card.image || card.art_key || card.object_key || card.r2_key || '';
}

function renderCardArt(card) {
  const imageUrl = imageUrlFromValue(resolveCardImageValue(card));
  if (imageUrl) {
    let crop = { x: 50, y: 50, zoom: 1 };
    try { crop = normalizeCrop(card); } catch { crop = { x: 50, y: 50, zoom: 1 }; }
    const cropStyle = `object-position:${crop.x}% ${crop.y}%;transform:scale(${crop.zoom});transform-origin:${crop.x}% ${crop.y}%;`;
    return `<img class="card-art-image" src="${escapeHtml(imageUrl)}" alt="" loading="lazy" style="${escapeHtml(cropStyle)}" />`;
  }
  return `<span class="card-art-symbol">${escapeHtml(card.symbol || '◆')}</span>`;
}

function normalizeRarity(rarity) {
  const value = String(rarity || 'common').toLowerCase();
  if (['common', 'uncommon', 'rare', 'legendary', 'mythic'].includes(value)) return value;
  if (value.includes('myth')) return 'mythic';
  if (value.includes('legend')) return 'legendary';
  if (value.includes('uncommon')) return 'uncommon';
  if (value.includes('rare')) return 'rare';
  return 'common';
}

function getRarityInitial(rarity) {
  return normalizeRarity(rarity).charAt(0).toUpperCase();
}

function normalizeCharacterKey(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  const normalized = raw.replace(/[^a-z0-9]+/g, '');
  const character = characterMap.find((candidate) => {
    const key = candidate.key.toLowerCase();
    const abbr = candidate.abbr.toLowerCase();
    const name = candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
    return normalized === key || normalized === abbr || normalized === name;
  });
  return character?.key || '';
}

function findCharacter(card) {
  const cid = normalizeCharacterKey(card.cid) || normalizeCharacterKey(card.character) || normalizeCharacterKey(card.character_id) || normalizeCharacterKey(card.characterId);
  return characterMap.find((character) => character.key === cid) || { key: 'unknown', name: 'Unknown', abbr: '??', color: '#9da2b7' };
}

function normalizeCardType(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (cardTypeMap[raw]) return raw;
  if (['support', 'magic', 'mystic', 'holy', 'light'].includes(raw)) return 'radiant';
  if (['battle', 'attack', 'aggressor', 'fire'].includes(raw)) return 'flame';
  if (['water', 'aqua', 'ocean'].includes(raw)) return 'tide';
  if (['defense', 'guardian', 'nature', 'plant'].includes(raw)) return 'bloom';
  if (['training', 'speed', 'electric', 'lightning'].includes(raw)) return 'volt';
  if (['dark', 'darkness'].includes(raw)) return 'shadow';
  if (['craft', 'alchemy', 'utility', 'balanced', 'mundane', 'comedy'].includes(raw)) return 'neutral';
  if (raw.includes('flame') || raw.includes('fire')) return 'flame';
  if (raw.includes('tide') || raw.includes('water')) return 'tide';
  if (raw.includes('bloom') || raw.includes('nature') || raw.includes('plant')) return 'bloom';
  if (raw.includes('volt') || raw.includes('electric')) return 'volt';
  if (raw.includes('shadow') || raw.includes('dark')) return 'shadow';
  if (raw.includes('radiant') || raw.includes('holy') || raw.includes('light')) return 'radiant';
  return 'neutral';
}

function getCardTypeMeta(card) {
  const rawType = card.selectedType || card.selected_type || card.type || card.cardType || card.card_type || card.battleRole || card.battle_role || card.category || 'neutral';
  const typeKey = normalizeCardType(rawType);
  const meta = cardTypeMap[typeKey] || cardTypeMap.neutral;
  return {
    key: typeKey,
    label: card.typeLabel || card.type_label || meta.label,
    color: card.typeColor || card.type_color || meta.color,
    textColor: meta.textColor,
  };
}

function getAbilityIcon(card) {
  return card.abilityIcon || card.ability_icon || card.icon || '✦';
}

function getRarityFrameUrl(rarity) {
  return rarityFrameAssets[normalizeRarity(rarity)] || '';
}

export function getRarityFrameDebugInfo() {
  return {
    total: Object.values(rarityFrameAssets).filter(Boolean).length,
    assets: Object.keys(rarityFrameAssets).map((rarity) => `card-frame-${rarity}.png`),
    resolved: ['common', 'uncommon', 'rare', 'legendary', 'mythic'].map((rarity) => ({
      rarity,
      url: getRarityFrameUrl(rarity),
      bundled: Boolean(getRarityFrameUrl(rarity)),
    })),
  };
}

function renderRarityFrameOverlay(rarity, showRarityFrame) {
  if (!showRarityFrame) return '';
  const frameUrl = getRarityFrameUrl(rarity);
  if (!frameUrl) return '';
  return `<img class="card-rarity-frame-overlay" src="${escapeHtml(frameUrl)}" alt="" aria-hidden="true" loading="lazy" />`;
}

function renderIdentityLine(card, rarity) {
  const character = findCharacter(card);
  const type = getCardTypeMeta(card);
  const abilityIcon = getAbilityIcon(card);
  return `
    <div class="card-identity-line">
      <span class="card-face-pill card-face-pill--circle card-rarity-chip" title="${escapeHtml(titleCase(rarity))}">${escapeHtml(getRarityInitial(rarity))}</span>
      <span class="card-face-pill card-face-pill--circle card-character-chip" style="--character-color:${escapeHtml(character.color)}" title="${escapeHtml(character.name)}">${escapeHtml(character.abbr)}</span>
      <span class="card-face-pill card-type-chip" data-card-type="${escapeHtml(type.key)}" style="--card-type-color:${escapeHtml(type.color)};--card-type-text-color:${escapeHtml(type.textColor)}" title="${escapeHtml(type.label)}">${escapeHtml(type.label)}</span>
      <span class="card-face-pill card-face-pill--circle card-ability-chip" title="Ability placeholder">${escapeHtml(abilityIcon)}</span>
    </div>
  `;
}

function renderOwnershipBadge(card, context, showOwnership) {
  if (!showOwnership || context === 'library') return '';
  return `<div class="card-meta-row"><span class="status-pill">${card.owned ? `Lv ${escapeHtml(String(card.level ?? 1))}` : 'Locked'}</span></div>`;
}

export function renderCardFrame(card, options = {}) {
  const { href = '', showOwnership = true, showStats = true, showRarityFrame = false, density = 'standard', context = 'default' } = options;
  const tagName = href ? 'a' : 'article';
  const hrefAttribute = href ? ` href="${escapeHtml(href)}"` : '';
  const rarity = normalizeRarity(card.rarity || 'common');
  const className = ['tcg-card', `tcg-card--${escapeHtml(density)}`, `tcg-card--context-${escapeHtml(context)}`, showRarityFrame ? 'tcg-card--rarity-frame' : ''].filter(Boolean).join(' ');
  return `
    <${tagName} class="${className}" data-rarity="${escapeHtml(rarity)}"${hrefAttribute} aria-label="${escapeHtml(card.name)} card">
      ${renderOwnershipBadge(card, context, showOwnership)}
      <div class="card-art" aria-hidden="true">
        ${renderCardArt(card)}
      </div>
      ${renderRarityFrameOverlay(rarity, showRarityFrame)}
      <div class="card-nameplate">
        <h3 class="card-title">${escapeHtml(card.name)}</h3>
      </div>
      ${renderIdentityLine(card, rarity)}
      ${showStats ? `<div class="card-stat-row">${renderStats(card.stats)}</div>` : ''}
    </${tagName}>
  `;
}
