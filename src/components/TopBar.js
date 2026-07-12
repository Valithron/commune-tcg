import '../styles/energy-modal.css';
import { mockUser } from '../data/mockUser.js';
import { getCachedAuthUser } from '../services/authClient.js';
import { getApiRoutes } from '../services/apiClient.js';
import { formatNumber } from './format.js';

const ENERGY_MAX_FALLBACK = 10;
const ENERGY_REGEN_INTERVAL_MS_FALLBACK = 15 * 60 * 1000;
const ENERGY_REFRESH_RETRY_MS = 15 * 1000;

let topBarController = null;
let energyTicker = null;
let activeRoot = null;
let activeResources = null;
let activeTrigger = null;
let refreshPromise = null;
let nextRefreshAttemptAt = 0;
let activeControllerElement = null;

function normalizeResourceValue(value, fallback) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeTimestamp(value) {
  const timestamp = String(value || '').trim();
  return Number.isFinite(new Date(timestamp).getTime()) ? timestamp : '';
}

function calculateNextEnergyAt({ energy, energyMax, energyUpdatedAt, energyRegenIntervalMs, nextEnergyAt }) {
  const explicit = normalizeTimestamp(nextEnergyAt);
  if (explicit || energy >= energyMax) return explicit;
  const updatedAtMs = new Date(energyUpdatedAt).getTime();
  if (!Number.isFinite(updatedAtMs)) return '';
  return new Date(updatedAtMs + energyRegenIntervalMs).toISOString();
}

function normalizeResources(payload, overrides = {}, { live = false, syncFailed = false, preferServer = false } = {}) {
  const source = payload?.resources || payload || {};
  const chooseValue = (serverValue, overrideValue) => preferServer ? serverValue ?? overrideValue : overrideValue ?? serverValue;
  const energy = normalizeResourceValue(chooseValue(source.energy, overrides.energy), ENERGY_MAX_FALLBACK);
  const energyMax = normalizeResourceValue(chooseValue(source.energyMax, overrides.energyMax), ENERGY_MAX_FALLBACK);
  const energyRegenIntervalMs = normalizeResourceValue(
    chooseValue(source.energyRegenIntervalMs, overrides.energyRegenIntervalMs),
    ENERGY_REGEN_INTERVAL_MS_FALLBACK,
  );
  const energyUpdatedAt = normalizeTimestamp(chooseValue(source.energyUpdatedAt, overrides.energyUpdatedAt));
  const serverNow = normalizeTimestamp(chooseValue(source.serverNow ?? payload?.serverNow, overrides.serverNow));
  const nextEnergyAt = calculateNextEnergyAt({
    energy,
    energyMax,
    energyUpdatedAt,
    energyRegenIntervalMs,
    nextEnergyAt: chooseValue(source.nextEnergyAt, overrides.nextEnergyAt),
  });

  return {
    pullTickets: normalizeResourceValue(chooseValue(source.pullTickets, overrides.pullTickets), mockUser.pullTickets),
    gold: normalizeResourceValue(chooseValue(source.gold, overrides.gold), mockUser.gold),
    energy,
    energyMax,
    energyRegenIntervalMs,
    energyUpdatedAt,
    nextEnergyAt,
    serverNow,
    serverOffsetMs: serverNow ? new Date(serverNow).getTime() - Date.now() : 0,
    live,
    syncFailed,
  };
}

async function loadTopBarResources(overrides = {}, { preferServer = false } = {}) {
  try {
    const routes = getApiRoutes();
    const response = await fetch(routes.pullResources + '?_=' + Date.now(), {
      cache: 'no-store',
      headers: {
        accept: 'application/json',
        'cache-control': 'no-cache',
      },
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload) {
      throw new Error(payload?.error || `Resource request failed with ${response.status}`);
    }

    return normalizeResources(payload, overrides, { live: true, preferServer });
  } catch {
    return normalizeResources({}, overrides, {
      live: false,
      syncFailed: Boolean(overrides && Object.keys(overrides).length),
    });
  }
}

function renderResourceDataAttributes(resources) {
  return [
    `data-pull-tickets="${resources.pullTickets}"`,
    `data-gold="${resources.gold}"`,
    `data-energy-current="${resources.energy}"`,
    `data-energy-max="${resources.energyMax}"`,
    `data-energy-regen-interval-ms="${resources.energyRegenIntervalMs}"`,
    `data-energy-updated-at="${resources.energyUpdatedAt}"`,
    `data-energy-next-at="${resources.nextEnergyAt}"`,
    `data-server-now="${resources.serverNow}"`,
    `data-resources-live="${resources.live}"`,
  ].join(' ');
}

function renderResourcePills(resources) {
  return `
    <a class="resource-pill" href="#/shop" title="Open Ticket Shop">🎟 ${formatNumber(resources.pullTickets)}</a>
    <a class="resource-pill" href="#/shop" title="Open Ticket Shop">◎ ${formatNumber(resources.gold)}</a>
    <button class="resource-pill resource-pill-button energy-resource-pill" type="button" title="View Energy recharge" aria-label="View Energy recharge" aria-haspopup="dialog" aria-controls="energy-recharge-modal" aria-expanded="false" data-energy-pill>⚡ <span data-energy-value>${formatNumber(resources.energy)}</span></button>
  `;
}

function renderUserPill() {
  const user = getCachedAuthUser();
  if (!user) return '';

  return `
    <div class="signed-user-pill" title="Signed-in player">
      <span>Signed in</span>
      <strong>${user.displayName || user.username || user.id}</strong>
      <a href="/api/auth/logout">Log out</a>
    </div>
  `;
}

function setResourceDataset(target, resources) {
  target.dataset.pullTickets = String(resources.pullTickets);
  target.dataset.gold = String(resources.gold);
  target.dataset.energyCurrent = String(resources.energy);
  target.dataset.energyMax = String(resources.energyMax);
  target.dataset.energyRegenIntervalMs = String(resources.energyRegenIntervalMs);
  target.dataset.energyUpdatedAt = resources.energyUpdatedAt;
  target.dataset.energyNextAt = resources.nextEnergyAt;
  target.dataset.serverNow = resources.serverNow;
  target.dataset.resourcesLive = String(resources.live);
}

function readResourcesFromDataset(target) {
  return normalizeResources({
    pullTickets: target.dataset.pullTickets,
    gold: target.dataset.gold,
    energy: target.dataset.energyCurrent,
    energyMax: target.dataset.energyMax,
    energyRegenIntervalMs: target.dataset.energyRegenIntervalMs,
    energyUpdatedAt: target.dataset.energyUpdatedAt,
    nextEnergyAt: target.dataset.energyNextAt,
    serverNow: target.dataset.serverNow,
  }, {}, {
    live: target.dataset.resourcesLive === 'true',
  });
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function syncEnergyView(root = activeRoot) {
  if (!root || !activeResources) return;
  const modal = root.querySelector('[data-energy-modal]');
  const energyValue = root.querySelector('[data-energy-value]');
  const modalValue = root.querySelector('[data-energy-modal-value]');
  const modalMax = root.querySelector('[data-energy-modal-max]');
  const countdown = root.querySelector('[data-energy-countdown]');
  const detail = root.querySelector('[data-energy-detail]');
  const trigger = root.querySelector('[data-energy-pill]');

  if (energyValue) energyValue.textContent = formatNumber(activeResources.energy);
  if (modalValue) modalValue.textContent = formatNumber(activeResources.energy);
  if (modalMax) modalMax.textContent = formatNumber(activeResources.energyMax);
  if (trigger) trigger.setAttribute('aria-expanded', String(Boolean(modal && !modal.hidden)));

  if (!countdown || !detail) return;

  const intervalMinutes = Math.round(activeResources.energyRegenIntervalMs / 60000);
  detail.textContent = `1 Energy every ${intervalMinutes} minutes. Maximum ${activeResources.energyMax}.`;

  if (activeResources.energy >= activeResources.energyMax) {
    countdown.textContent = 'Energy is full.';
    countdown.dataset.state = 'full';
    return;
  }

  const nextEnergyAtMs = new Date(activeResources.nextEnergyAt).getTime();
  if (!Number.isFinite(nextEnergyAtMs)) {
    countdown.textContent = activeResources.syncFailed ? 'Recharge timer unavailable.' : 'Syncing recharge timer…';
    countdown.dataset.state = activeResources.syncFailed ? 'error' : 'syncing';
    return;
  }

  const serverNowMs = Date.now() + activeResources.serverOffsetMs;
  const remainingMs = nextEnergyAtMs - serverNowMs;

  if (remainingMs <= 0) {
    countdown.textContent = activeResources.syncFailed ? 'Waiting for server…' : 'Restoring Energy…';
    countdown.dataset.state = activeResources.syncFailed ? 'error' : 'syncing';
    requestEnergyRefresh();
    return;
  }

  countdown.textContent = `Next Energy in ${formatCountdown(remainingMs)}`;
  countdown.dataset.state = 'counting';
}

function applyResources(root, resources, { rerenderPills = true } = {}) {
  const target = root?.querySelector('[data-topbar-resources]');
  if (!target) return null;

  if (rerenderPills) target.innerHTML = renderResourcePills(resources);
  const resourceTitle = resources.live ? 'Live signed-in player resources' : 'Player resources awaiting server sync';
  target.setAttribute('title', resourceTitle);
  setResourceDataset(target, resources);

  if (activeRoot && activeRoot.contains(target)) {
    activeResources = resources;
    syncEnergyView(activeRoot);
  }

  return resources;
}

export async function refreshTopBarResources(root = document, overrides = {}, options = {}) {
  const target = root.querySelector('[data-topbar-resources]');
  if (!target) return null;
  const resources = await loadTopBarResources(overrides, options);
  return applyResources(root, resources);
}

async function requestEnergyRefresh({ force = false } = {}) {
  if (!activeRoot || refreshPromise) return refreshPromise;
  if (!force && Date.now() < nextRefreshAttemptAt) return null;

  refreshPromise = refreshTopBarResources(activeRoot, activeResources || {}, { preferServer: true })
    .then((resources) => {
      nextRefreshAttemptAt = resources?.syncFailed ? Date.now() + ENERGY_REFRESH_RETRY_MS : 0;
      return resources;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function openEnergyModal(root, trigger) {
  const modal = root.querySelector('[data-energy-modal]');
  if (!modal) return;
  activeTrigger = trigger;
  modal.hidden = false;
  document.body.classList.add('energy-modal-open');
  trigger.setAttribute('aria-expanded', 'true');
  modal.querySelector('[data-energy-dialog]')?.focus();
  syncEnergyView(root);
  requestEnergyRefresh({ force: true });
}

function closeEnergyModal(root, { restoreFocus = true } = {}) {
  const modal = root.querySelector('[data-energy-modal]');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove('energy-modal-open');
  root.querySelector('[data-energy-pill]')?.setAttribute('aria-expanded', 'false');
  if (restoreFocus) {
    const trigger = root.querySelector('[data-energy-pill]') || activeTrigger;
    trigger?.focus();
  }
  activeTrigger = null;
}

function cleanupTopBar() {
  topBarController?.abort();
  topBarController = null;
  if (energyTicker) window.clearInterval(energyTicker);
  energyTicker = null;
  document.body.classList.remove('energy-modal-open');
  activeRoot = null;
  activeResources = null;
  activeTrigger = null;
  refreshPromise = null;
  nextRefreshAttemptAt = 0;
}

export function initTopBar(root = document) {
  cleanupTopBar();

  const resourceTarget = root.querySelector('[data-topbar-resources]');
  const modal = root.querySelector('[data-energy-modal]');
  if (!resourceTarget || !modal) return;

  activeRoot = root;
  activeResources = readResourcesFromDataset(resourceTarget);
  const controller = new AbortController();
  topBarController = controller;

  root.addEventListener('click', (event) => {
    const energyTrigger = event.target.closest?.('[data-energy-pill]');
    if (energyTrigger) {
      openEnergyModal(root, energyTrigger);
      return;
    }

    const closeControl = event.target.closest?.('[data-energy-modal-close]');
    if (closeControl || event.target === modal) {
      closeEnergyModal(root, { restoreFocus: !closeControl?.matches('a') });
    }
  }, { signal: controller.signal });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeEnergyModal(root);
  }, { signal: controller.signal });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') requestEnergyRefresh({ force: true });
  }, { signal: controller.signal });

  energyTicker = window.setInterval(syncEnergyView, 250);
  syncEnergyView(root);
}

const HTMLElementBase = globalThis.HTMLElement || class {};

class EnergyTopBarController extends HTMLElementBase {
  connectedCallback() {
    activeControllerElement = this;
    queueMicrotask(() => {
      if (this.isConnected && activeControllerElement === this) initTopBar(document);
    });
  }

  disconnectedCallback() {
    if (activeControllerElement !== this) return;
    activeControllerElement = null;
    cleanupTopBar();
  }
}

if (globalThis.customElements && !globalThis.customElements.get('energy-topbar-controller')) {
  globalThis.customElements.define('energy-topbar-controller', EnergyTopBarController);
}

export async function renderTopBar() {
  const resources = await loadTopBarResources();
  const resourceTitle = resources.live ? 'Live signed-in player resources' : 'Fallback player resources';

  return `
    <header class="app-topbar">
      <a class="brand-mark" href="#/home" aria-label="Imago Core Home">
        <span class="brand-kicker">Imago</span>
        <h1 class="brand-title">Core</h1>
      </a>
      <div class="topbar-right">
        ${renderUserPill()}
        <div class="resource-row" aria-label="Player resources" title="${resourceTitle}" data-topbar-resources ${renderResourceDataAttributes(resources)}>
          ${renderResourcePills(resources)}
        </div>
      </div>
    </header>
    <div class="energy-modal-backdrop" data-energy-modal hidden>
      <section class="energy-modal" id="energy-recharge-modal" role="dialog" aria-modal="true" aria-labelledby="energy-modal-title" tabindex="-1" data-energy-dialog>
        <button class="energy-modal-close" type="button" aria-label="Close Energy window" data-energy-modal-close>×</button>
        <span class="section-kicker">Player Resource</span>
        <h2 id="energy-modal-title">Energy Recharge</h2>
        <div class="energy-modal-balance" aria-label="Current Energy">
          <span>⚡</span>
          <strong data-energy-modal-value>${formatNumber(resources.energy)}</strong>
          <small>/ <span data-energy-modal-max>${formatNumber(resources.energyMax)}</span></small>
        </div>
        <p class="energy-modal-countdown" data-energy-countdown>Syncing recharge timer…</p>
        <p class="energy-modal-detail" data-energy-detail>1 Energy every 15 minutes. Maximum 10.</p>
        <a class="button button-secondary energy-modal-action" href="#/battle" data-energy-modal-close>Open Battle</a>
      </section>
    </div>
    <energy-topbar-controller hidden aria-hidden="true"></energy-topbar-controller>
  `;
}
