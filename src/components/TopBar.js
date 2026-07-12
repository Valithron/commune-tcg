import '../styles/energy-modal.css';
import { mockUser } from '../data/mockUser.js';
import { getCachedAuthUser } from '../services/authClient.js';
import { getApiRoutes } from '../services/apiClient.js';
import { formatNumber } from './format.js';

const ENERGY_MAX_FALLBACK = 10;
const ENERGY_REGEN_INTERVAL_MS_FALLBACK = 15 * 60 * 1000;
const ENERGY_REFRESH_RETRY_MS = 15 * 1000;

let controller = null;
let ticker = null;
let activeRoot = null;
let activeResources = null;
let refreshPromise = null;
let retryAfter = 0;
let controllerElement = null;

function numberOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function timestampOrEmpty(value) {
  const timestamp = String(value || '').trim();
  return Number.isFinite(new Date(timestamp).getTime()) ? timestamp : '';
}

function normalizeResources(payload = {}, fallback = {}, preferServer = false) {
  const source = payload.resources || payload;
  const pick = (serverValue, fallbackValue) => preferServer
    ? serverValue ?? fallbackValue
    : fallbackValue ?? serverValue;
  const energy = numberOr(pick(source.energy, fallback.energy), ENERGY_MAX_FALLBACK);
  const energyMax = numberOr(pick(source.energyMax, fallback.energyMax), ENERGY_MAX_FALLBACK);
  const energyRegenIntervalMs = numberOr(
    pick(source.energyRegenIntervalMs, fallback.energyRegenIntervalMs),
    ENERGY_REGEN_INTERVAL_MS_FALLBACK,
  );
  const energyUpdatedAt = timestampOrEmpty(pick(source.energyUpdatedAt, fallback.energyUpdatedAt));
  const serverNow = timestampOrEmpty(pick(source.serverNow ?? payload.serverNow, fallback.serverNow));
  let nextEnergyAt = timestampOrEmpty(pick(source.nextEnergyAt, fallback.nextEnergyAt));

  if (!nextEnergyAt && energy < energyMax && energyUpdatedAt) {
    nextEnergyAt = new Date(new Date(energyUpdatedAt).getTime() + energyRegenIntervalMs).toISOString();
  }

  return {
    pullTickets: numberOr(pick(source.pullTickets, fallback.pullTickets), mockUser.pullTickets),
    gold: numberOr(pick(source.gold, fallback.gold), mockUser.gold),
    energy,
    energyMax,
    energyRegenIntervalMs,
    energyUpdatedAt,
    nextEnergyAt,
    serverNow,
    serverOffsetMs: serverNow ? new Date(serverNow).getTime() - Date.now() : 0,
    live: Boolean(payload.resources || payload.ok),
    syncFailed: false,
  };
}

async function loadResources(fallback = {}, { preferServer = false } = {}) {
  try {
    const response = await fetch(`${getApiRoutes().pullResources}?_=${Date.now()}`, {
      cache: 'no-store',
      headers: { accept: 'application/json', 'cache-control': 'no-cache' },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload) throw new Error(payload?.error || `Resource request failed with ${response.status}`);
    return normalizeResources(payload, fallback, preferServer);
  } catch {
    return { ...normalizeResources({}, fallback), live: false, syncFailed: true };
  }
}

function resourceAttributes(resources) {
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

function writeDataset(target, resources) {
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

function readDataset(target) {
  return normalizeResources({
    pullTickets: target.dataset.pullTickets,
    gold: target.dataset.gold,
    energy: target.dataset.energyCurrent,
    energyMax: target.dataset.energyMax,
    energyRegenIntervalMs: target.dataset.energyRegenIntervalMs,
    energyUpdatedAt: target.dataset.energyUpdatedAt,
    nextEnergyAt: target.dataset.energyNextAt,
    serverNow: target.dataset.serverNow,
  });
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

function updateEnergyView() {
  if (!activeRoot || !activeResources) return;
  const modal = activeRoot.querySelector('[data-energy-modal]');
  const trigger = activeRoot.querySelector('[data-energy-pill]');
  const topValue = activeRoot.querySelector('[data-energy-value]');
  const modalValue = activeRoot.querySelector('[data-energy-modal-value]');
  const modalMax = activeRoot.querySelector('[data-energy-modal-max]');
  const countdown = activeRoot.querySelector('[data-energy-countdown]');
  const detail = activeRoot.querySelector('[data-energy-detail]');

  if (topValue) topValue.textContent = formatNumber(activeResources.energy);
  if (modalValue) modalValue.textContent = formatNumber(activeResources.energy);
  if (modalMax) modalMax.textContent = formatNumber(activeResources.energyMax);
  if (trigger) trigger.setAttribute('aria-expanded', String(Boolean(modal && !modal.hidden)));
  if (!countdown || !detail) return;

  detail.textContent = `1 Energy every ${Math.round(activeResources.energyRegenIntervalMs / 60000)} minutes. Maximum ${activeResources.energyMax}.`;

  if (activeResources.energy >= activeResources.energyMax) {
    countdown.textContent = 'Energy is full.';
    countdown.dataset.state = 'full';
    return;
  }

  const nextAt = new Date(activeResources.nextEnergyAt).getTime();
  if (!Number.isFinite(nextAt)) {
    countdown.textContent = activeResources.syncFailed ? 'Recharge timer unavailable.' : 'Syncing recharge timer…';
    countdown.dataset.state = activeResources.syncFailed ? 'error' : 'syncing';
    return;
  }

  const remaining = nextAt - (Date.now() + activeResources.serverOffsetMs);
  if (remaining <= 0) {
    countdown.textContent = 'Restoring Energy…';
    countdown.dataset.state = 'syncing';
    requestRefresh();
    return;
  }

  countdown.textContent = `Next Energy in ${formatCountdown(remaining)}`;
  countdown.dataset.state = 'counting';
}

function applyResources(root, resources) {
  const target = root?.querySelector('[data-topbar-resources]');
  if (!target) return null;
  target.innerHTML = renderResourcePills(resources);
  target.title = resources.live ? 'Live signed-in player resources' : 'Player resources awaiting server sync';
  writeDataset(target, resources);
  if (activeRoot?.contains(target)) {
    activeResources = resources;
    updateEnergyView();
  }
  return resources;
}

export async function refreshTopBarResources(root = document, fallback = {}, options = {}) {
  const target = root.querySelector('[data-topbar-resources]');
  if (!target) return null;
  return applyResources(root, await loadResources(fallback, options));
}

async function requestRefresh({ force = false } = {}) {
  if (!activeRoot || refreshPromise) return refreshPromise;
  if (!force && Date.now() < retryAfter) return null;

  refreshPromise = refreshTopBarResources(activeRoot, activeResources || {}, { preferServer: true })
    .then((resources) => {
      retryAfter = resources?.syncFailed ? Date.now() + ENERGY_REFRESH_RETRY_MS : 0;
      return resources;
    })
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

function openModal() {
  const modal = activeRoot?.querySelector('[data-energy-modal]');
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add('energy-modal-open');
  modal.querySelector('[data-energy-dialog]')?.focus();
  updateEnergyView();
  requestRefresh({ force: true });
}

function closeModal({ restoreFocus = true } = {}) {
  const modal = activeRoot?.querySelector('[data-energy-modal]');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove('energy-modal-open');
  activeRoot.querySelector('[data-energy-pill]')?.setAttribute('aria-expanded', 'false');
  if (restoreFocus) activeRoot.querySelector('[data-energy-pill]')?.focus();
}

function cleanup() {
  controller?.abort();
  controller = null;
  if (ticker) clearInterval(ticker);
  ticker = null;
  document.body.classList.remove('energy-modal-open');
  activeRoot = null;
  activeResources = null;
  refreshPromise = null;
  retryAfter = 0;
}

export function initTopBar(root = document) {
  cleanup();
  const target = root.querySelector('[data-topbar-resources]');
  const modal = root.querySelector('[data-energy-modal]');
  if (!target || !modal) return;

  activeRoot = root;
  activeResources = readDataset(target);
  controller = new AbortController();

  root.addEventListener('click', (event) => {
    if (event.target.closest?.('[data-energy-pill]')) return openModal();
    const closeControl = event.target.closest?.('[data-energy-modal-close]');
    if (closeControl || event.target === modal) closeModal({ restoreFocus: !closeControl?.matches('a') });
  }, { signal: controller.signal });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  }, { signal: controller.signal });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') requestRefresh({ force: true });
  }, { signal: controller.signal });

  ticker = setInterval(updateEnergyView, 250);
  updateEnergyView();
}

const HTMLElementBase = globalThis.HTMLElement || class {};
class EnergyTopBarController extends HTMLElementBase {
  connectedCallback() {
    controllerElement = this;
    queueMicrotask(() => {
      if (this.isConnected && controllerElement === this) initTopBar(document);
    });
  }

  disconnectedCallback() {
    if (controllerElement !== this) return;
    controllerElement = null;
    cleanup();
  }
}

if (globalThis.customElements && !customElements.get('energy-topbar-controller')) {
  customElements.define('energy-topbar-controller', EnergyTopBarController);
}

export async function renderTopBar() {
  const resources = await loadResources();
  const resourceTitle = resources.live ? 'Live signed-in player resources' : 'Fallback player resources';

  return `
    <header class="app-topbar">
      <a class="brand-mark" href="#/home" aria-label="Imago Core Home">
        <span class="brand-kicker">Imago</span>
        <h1 class="brand-title">Core</h1>
      </a>
      <div class="topbar-right">
        ${renderUserPill()}
        <div class="resource-row" aria-label="Player resources" title="${resourceTitle}" data-topbar-resources ${resourceAttributes(resources)}>
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
