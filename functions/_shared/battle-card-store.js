/* D1 card-row normalization for battle adapters and inventory. This module does
   not resolve combat; `shared/battle/battle-engine.js` is the sole engine. */

import { normalizeBattleMaxLevel } from './battle-reward-contract.js';
import { calculateEffectiveStats, normalizeBaseStats, normalizeCopyTraits, normalizeProgression, normalizeProgressionRules } from './card-mechanics.js';
import { getCardTypeSummary, normalizeCardType } from './type-config.js';

const imageColumns = ['image_key', 'imageKey', 'image_path', 'image', 'image_url', 'art_url', 'art_key', 'object_key', 'r2_key'];
function safeParseJson(value) { try { return JSON.parse(value || ''); } catch { return null; } }
function toNumber(value, fallback) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function sumStats(stats = {}) { return toNumber(stats.pow, 0) + toNumber(stats.def, 0) + toNumber(stats.spd, 0); }
function readValue(row, candidates, fallback = '') { for (const key of candidates) if (row?.[key] !== undefined && row[key] !== null && row[key] !== '') return row[key]; return fallback; }
function isLikelyUrl(value) { return /^https?:\/\//i.test(String(value || '')) || String(value || '').startsWith('/'); }
function imageUrlFromValue(value) { const imageValue = String(value || '').trim(); if (!imageValue) return ''; return isLikelyUrl(imageValue) ? imageValue : `/api/card-image?key=${encodeURIComponent(imageValue)}`; }
function normalizeRarity(value) { const rarity = String(value || 'common').toLowerCase(); return ['common','uncommon','rare','legendary','mythic'].includes(rarity) ? rarity : rarity.includes('myth') ? 'mythic' : rarity.includes('legend') ? 'legendary' : rarity.includes('uncommon') ? 'uncommon' : rarity.includes('rare') ? 'rare' : 'common'; }
function readProgressionRules(payload) { return normalizeProgressionRules(payload?.progressionRules || payload?.progression_rules || payload || {}); }
function readMaxLevel(payload) { const rules = readProgressionRules(payload); return normalizeBattleMaxLevel(payload?.maxLevel ?? payload?.max_level ?? payload?.levelCap ?? payload?.level_cap ?? rules.maxLevel ?? rules.levelCap, 30); }
function hasMechanicsStats(payload = {}) { return Boolean(payload.baseStats || payload.base_stats || payload.progressionRules || payload.progression_rules || payload.originBonusPercent || payload.origin_bonus_percent || payload.copyTraits || payload.copy_traits); }
function readEffectiveStats(payload, legacyStats) { if (!hasMechanicsStats(payload)) return legacyStats; const progression = { ...normalizeProgression(payload.progression || {}), level: toNumber(payload.level ?? payload.card_level ?? payload.progression?.level, 1), xp: toNumber(payload.xp ?? payload.experience ?? payload.progression?.xp, 0), copies: toNumber(payload.copies ?? payload.progression?.copies, 1) }; return calculateEffectiveStats({ baseStats: normalizeBaseStats(payload.baseStats || payload.base_stats || payload, legacyStats), copyTraits: normalizeCopyTraits(payload.copyTraits || payload.copy_traits || {}), progression, progressionRules: readProgressionRules(payload), originBonusPercent: payload.originBonusPercent ?? payload.origin_bonus_percent ?? 0 }); }
function hasExplicitStat(payload, stats) { return [payload.pow,payload.power,payload.attack,payload.atk,payload.def,payload.defense,payload.spd,payload.speed,stats.pow,stats.power,stats.attack,stats.atk,stats.def,stats.defense,stats.spd,stats.speed].some((value) => value !== undefined && value !== null && value !== ''); }

export function normalizeOwnedBattleCard(row) {
  const parsed = safeParseJson(row.card_json);
  const payload = parsed?.card || parsed?.data?.card || parsed?.data || parsed || {};
  const rawStats = payload.stats || payload.statBlock || {};
  const legacyStats = { pow: toNumber(payload.pow ?? rawStats.pow ?? rawStats.power ?? rawStats.attack ?? rawStats.atk, 1), def: toNumber(payload.def ?? rawStats.def ?? rawStats.defense, 1), spd: toNumber(payload.spd ?? rawStats.spd ?? rawStats.speed, 1) };
  const effectiveStats = readEffectiveStats(payload, legacyStats);
  const imageValue = String(readValue(payload, imageColumns, ''));
  const cardType = normalizeCardType(payload.selectedType || payload.selected_type || payload.type || payload.card_type || 'neutral');
  const typeSummary = getCardTypeSummary(cardType);
  const mechanicsStats = hasMechanicsStats(payload);
  const level = toNumber(payload.level ?? payload.card_level ?? payload.progression?.level, 1);
  const normalized = {
    id: String(payload.id || row.id), sourceRowId: String(row.id), ownerUserId: String(row.owner_user_id || ''), characterId: String(payload.character_id || payload.characterId || payload.character || row.character_id || ''),
    name: String(payload.name || payload.card_name || payload.title || 'Unnamed Card'), rarity: normalizeRarity(payload.rarity), category: String(payload.category || typeSummary.label || 'Vault'), type: cardType, cardType, card_type: cardType, typeLabel: typeSummary.label, typeColor: typeSummary.color,
    level, xp: toNumber(payload.xp ?? payload.experience ?? payload.progression?.xp, 0), maxLevel: readMaxLevel(payload), copies: toNumber(payload.copies ?? payload.copy_count ?? payload.progression?.copies, 1),
    imageKey: isLikelyUrl(imageValue) ? '' : imageValue, imageUrl: imageUrlFromValue(imageValue), crop: payload.crop || payload.crop_json || payload.cropJson || payload.image_crop || {},
    stats: effectiveStats, rawStats: legacyStats, effectiveStats, effective_stats: effectiveStats, baseStats: normalizeBaseStats(payload.baseStats || payload.base_stats || payload, legacyStats),
    battlePower: mechanicsStats ? sumStats(effectiveStats) : sumStats(legacyStats), baseBattlePower: mechanicsStats ? sumStats(effectiveStats) : sumStats(legacyStats), battlePowerSource: mechanicsStats ? 'effective_stats' : 'legacy_stats', createdAt: row.created_at ?? null, updatedAt: row.updated_at ?? null,
  };
  const reasons = [];
  if (!parsed) reasons.push('invalid-card-json');
  if (payload.canBattle === false || payload.battleEligible === false || payload.disabled === true) reasons.push('explicitly-disabled');
  if (!Object.values(normalized.stats).every(Number.isFinite)) reasons.push('invalid-normalized-stats');
  return { ...normalized, eligible: reasons.length === 0, reasons, explicitStatsMapped: parsed ? hasExplicitStat(payload, rawStats) : false };
}

export async function readOwnedBattleRows(env, ownerUserId) {
  const result = await env.DB.prepare(`SELECT id, owner_user_id, character_id, card_json, created_at, updated_at FROM cards WHERE owner_user_id IS NOT NULL AND TRIM(CAST(owner_user_id AS TEXT)) != '' AND CAST(owner_user_id AS TEXT) = ? ORDER BY updated_at DESC, created_at DESC LIMIT 500`).bind(ownerUserId).all();
  return result.results || [];
}

