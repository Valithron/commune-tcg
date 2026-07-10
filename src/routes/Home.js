/* ============================================================================
   Home Route
   Phase auth-current-user responsibility: mark the signed-in player clearly,
   keep the player dashboard focused on game routes, and feature the strongest
   card from the signed-in player's Vault.
   ============================================================================ */

import { mockUser } from '../data/mockUser.js';
import { getCachedAuthUser } from '../services/authClient.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';
import { loadVaultCards } from '../data/vaultData.js';
import { renderCardFrame } from '../components/CardFrame.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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

async function loadHomePullResources() {
  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(routes.pullResources, { cache: 'no-store' });
    return payload.resources || null;
  } catch {
    return null;
  }
}

function renderHomeActions({ dailyPullAvailable }) {
  const dailyClass = dailyPullAvailable ? ' home-daily-pull-available' : '';
  const dailyText = dailyPullAvailable ? 'Ready to claim now.' : 'Already claimed today.';

  return `
    <div class="home-feature-actions">
      <a class="home-feature-button${dailyClass}" href="#/pull">
        <strong>Daily Pull</strong>
        <span>${dailyText}</span>
      </a>
      <a class="home-feature-button" href="#/battle">
        <strong>Battle</strong>
        <span>Pick a squad and test the current battle loop.</span>
      </a>
    </div>
  `;
}

function renderVaultHighlight(strongestCard, displayName, actionState) {
  if (!strongestCard) {
    return `
      <div class="home-feature-empty">
        <strong>No Vault cards yet</strong>
        <span>Pull some cards first, then ${escapeHtml(displayName)}'s strongest owned card will appear here.</span>
      </div>
      ${renderHomeActions(actionState)}
    `;
  }

  return `
    <div class="home-feature-card">
      ${renderCardFrame(strongestCard, {
        href: `#/vault/card/${strongestCard.id}`,
        context: 'vault',
      })}
    </div>
    ${renderHomeActions(actionState)}
  `;
}

export async function renderHome() {
  const user = getCachedAuthUser();
  const displayName = user?.displayName || user?.username || 'Player';
  const [vault, pullResources] = await Promise.all([
    loadVaultCards({ force: true }),
    loadHomePullResources(),
  ]);
  const strongestCard = getStrongestVaultCard(vault?.cards || []);
  const strongestTotal = strongestCard ? getAggregateStats(strongestCard) : 0;
  const dailyPullAvailable = pullResources?.dailyTicketAvailable ?? mockUser.dailyPullReady;

  return `
    <section class="hero-panel">
      <span class="section-kicker">Gacha Prototype</span>
      <h2 class="hero-title">Build the Vault. Pull the Commune.</h2>
      <p class="hero-copy">Signed in as ${escapeHtml(displayName)}. Pulls, resources, submissions, and Vault reads now use the active player session where wired.</p>
      <div class="action-row">
        <a class="button button-primary" href="#/pull/confirm?count=5">Start Pulling</a>
        <a class="button button-secondary" href="#/battle">Battle</a>
        <a class="button button-secondary" href="#/submit">Submit Card</a>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Account</span>
          <h2 class="section-title">Signed-in Player</h2>
        </div>
        <span class="status-pill">${escapeHtml(displayName)}</span>
      </div>
      <div class="home-account-card">
        <strong>${escapeHtml(displayName)}'s active session</strong>
        <span>Player slot: ${escapeHtml(user?.id || 'unknown')}. This marker appears from the auth session, not a temporary Sterling fallback.</span>
        <div class="action-row">
          <a class="button button-secondary" href="#/vault">Open ${escapeHtml(displayName)}'s Vault</a>
          <a class="button button-secondary" href="/api/auth/logout">Log out</a>
        </div>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Account</span>
          <h2 class="section-title">Today</h2>
        </div>
        <span class="status-pill">Lv ${mockUser.level}</span>
      </div>
      <div class="stat-grid">
        <div class="stat-panel"><span class="stat-label">Vault</span><span class="stat-value">${vault?.cards?.length || 0}</span></div>
        <div class="stat-panel"><span class="stat-label">Library</span><span class="stat-value">${mockUser.librarySeen}</span></div>
        <div class="stat-panel"><span class="stat-label">Streak</span><span class="stat-value">${mockUser.streakDays}</span></div>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Vault Highlight</span>
          <h2 class="section-title">Strongest Owned Card</h2>
        </div>
        <span class="status-pill">${strongestTotal} Total</span>
      </div>
      <div class="home-feature-split">
        ${renderVaultHighlight(strongestCard, displayName, { dailyPullAvailable })}
      </div>
    </section>
  `;
}
