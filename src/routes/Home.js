/* ============================================================================
   Home Route
   Phase 2A responsibility: stage the authenticated daily loop inside the Core
   Commons without changing any resource, economy, or ownership contract.
   ============================================================================ */

import { fetchJson, getApiRoutes } from '../services/apiClient.js';
import { loadVaultCards } from '../data/vaultData.js';
import { escapeHtml } from '../components/format.js';
import { trackTelemetry } from '../services/telemetry.js';

const supportedRarities = new Set(['common', 'uncommon', 'rare', 'legendary', 'mythic']);

function getAggregateStats(card) {
  const stats = card?.stats || {};
  return Number(stats.pow || 0) + Number(stats.def || 0) + Number(stats.spd || 0);
}

function getStrongestVaultCard(cards = []) {
  return [...cards]
    .sort((a, b) => {
      const aggregateDifference = getAggregateStats(b) - getAggregateStats(a);
      if (aggregateDifference !== 0) return aggregateDifference;
      const levelDifference = Number(b?.level || 0) - Number(a?.level || 0);
      if (levelDifference !== 0) return levelDifference;
      return String(a?.name || '').localeCompare(String(b?.name || ''));
    })[0] || null;
}

async function loadHomeResources() {
  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(`${routes.pullResources}?_=${Date.now()}`, { cache: 'no-store' });
    const resources = payload.resources || {};
    return {
      dailyTicketAvailable: resources.dailyTicketAvailable !== false,
      live: true,
    };
  } catch {
    return { dailyTicketAvailable: false, live: false };
  }
}

function getDailyAction(resources) {
  if (!resources.live) {
    return {
      id: 'retry-resources',
      href: '#/home?refresh=1',
      label: 'Daily Ticket',
      ariaLabel: 'Refresh Daily Ticket state',
      state: 'unavailable',
    };
  }

  if (resources.dailyTicketAvailable) {
    return {
      id: 'claim-daily-ticket',
      href: '#/shop?focus=daily',
      label: 'Daily Ticket',
      ariaLabel: 'Claim Daily Ticket',
      state: 'claimable',
    };
  }

  return {
    id: 'use-tickets',
    href: '#/pull',
    label: 'Daily Ticket',
    ariaLabel: 'Use Tickets',
    state: 'claimed',
  };
}

function normalizeRarity(value) {
  const rarity = String(value || 'common').toLowerCase();
  return supportedRarities.has(rarity) ? rarity : 'common';
}

function resolveImageUrl(card) {
  const value = String(
    card?.imageUrl || card?.image_url || card?.artUrl || card?.art_url || card?.imageKey || card?.image_key
      || card?.image_path || card?.image || card?.art_key || card?.object_key || card?.r2_key || '',
  ).trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value;
  return `/api/card-image?key=${encodeURIComponent(value)}`;
}

function normalizeCrop(card) {
  try {
    const rawCrop = card?.crop || card?.crop_json || card?.cropJson || card?.image_crop || card?.imageCrop || {};
    const parsedCrop = typeof rawCrop === 'string' ? JSON.parse(rawCrop || '{}') : rawCrop;
    const crop = parsedCrop?.crop || parsedCrop?.imageCrop || parsedCrop || {};
    const clamp = (value, fallback, min, max) => {
      const numericValue = Number(value);
      return Number.isFinite(numericValue) ? Math.min(Math.max(numericValue, min), max) : fallback;
    };
    return {
      x: clamp(crop.x ?? crop.left, 50, 0, 100),
      y: clamp(crop.y ?? crop.top, 50, 0, 100),
      zoom: clamp(crop.zoom ?? crop.z ?? crop.scale, 1, 1, 3),
    };
  } catch {
    return { x: 50, y: 50, zoom: 1 };
  }
}

function renderFeaturedPortal(card) {
  if (!card) {
    return `
      <a class="home-commons-portal home-commons-portal--empty" href="#/pull" aria-label="Open Pull to begin your collection">
        <span aria-hidden="true">◇</span>
      </a>
    `;
  }

  const imageUrl = resolveImageUrl(card);
  const crop = normalizeCrop(card);
  const art = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="" loading="eager" style="object-position:${crop.x}% ${crop.y}%;transform:scale(${crop.zoom});transform-origin:${crop.x}% ${crop.y}%；">`.replace('；', ';')
    : `<span class="home-commons-portal-symbol" aria-hidden="true">${escapeHtml(card.symbol || '◆')}</span>`;

  return `
    <a class="home-commons-portal" data-rarity="${normalizeRarity(card.rarity)}" href="#/vault/card/${encodeURIComponent(card.id)}" aria-label="Inspect ${escapeHtml(card.name || 'featured card')}">
      ${art}
    </a>
  `;
}

function renderFeaturedNameplate(card) {
  const href = card ? `#/vault/card/${encodeURIComponent(card.id)}` : '#/pull';
  const title = card?.name || 'Awaken the Core';
  const label = card ? `View ${title}` : 'Open Pull to awaken the Core';
  return `
    <a class="home-commons-nameplate${card ? '' : ' home-commons-nameplate--empty'}" href="${href}" aria-label="${escapeHtml(label)}">
      <strong>${escapeHtml(title)}</strong>
    </a>
  `;
}

export async function renderHome() {
  const [vault, resources] = await Promise.all([
    loadVaultCards({ force: true }),
    loadHomeResources(),
  ]);
  const featuredCard = getStrongestVaultCard(vault?.cards || []);
  const dailyAction = getDailyAction(resources);

  return `
    <section class="home-commons-stage" aria-label="Imago Core, The Core Commons">
      ${renderFeaturedNameplate(featuredCard)}
      ${renderFeaturedPortal(featuredCard)}

      <a class="home-commons-core-summon" href="#/pull" aria-label="Open Pull from the Core machine">
        <span>Summon</span>
      </a>

      <a class="home-commons-hotspot home-commons-daily" data-state="${dailyAction.state}" href="${dailyAction.href}" aria-label="${escapeHtml(dailyAction.ariaLabel)}" data-home-smart-action="${dailyAction.id}">
        <strong>${dailyAction.label}</strong>
      </a>

      <a class="home-commons-hotspot home-commons-support home-commons-library" href="#/library">
        <span aria-hidden="true">◇</span>
        <strong>Library</strong>
      </a>
      <a class="home-commons-hotspot home-commons-support home-commons-vault" href="#/vault">
        <span aria-hidden="true">▱</span>
        <strong>Vault</strong>
      </a>

      <a class="home-commons-battle-gate" href="#/battle">
        <span aria-hidden="true">⚔</span>
        <strong>Enter Battle</strong>
      </a>
    </section>
  `;
}

export function initHome(root) {
  root.querySelector('[data-home-smart-action]')?.addEventListener('click', (event) => {
    trackTelemetry('home.next_action_selected', {
      outcome: 'success',
      relatedId: event.currentTarget.getAttribute('data-home-smart-action') || '',
    });
  });
}
