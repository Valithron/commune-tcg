import { fetchJson, getApiRoutes } from '../services/apiClient.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatPullResults(results) {
  if (!Array.isArray(results) || !results.length) {
    return 'No card results recorded.';
  }

  return results
    .map((result) => `${result.actualRarity || result.selectedRarity || 'card'} -> ${result.ownedCardId || 'owned card'}`)
    .join(', ');
}

async function loadHistory() {
  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(routes.pullHistory);

    return {
      source: 'Live History',
      pulls: payload.history?.pulls || [],
      warning: '',
    };
  } catch (error) {
    return {
      source: 'Unavailable',
      pulls: [],
      warning: error.message,
    };
  }
}

function renderPullRow(pull) {
  return `
    <article class="admin-row">
      <div>
        <strong>${escapeHtml(`${pull.pullCount}-Pull`)}</strong>
        <span>${escapeHtml(formatPullResults(pull.results))}</span>
      </div>
      <em>🎟 ${escapeHtml(pull.ticketCost)} · ${escapeHtml(pull.createdAt)}</em>
    </article>
  `;
}

export async function renderPullHistory() {
  const history = await loadHistory();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Pull History</span>
      <h2 class="hero-title">Recent pulls.</h2>
      <p class="hero-copy">Phase 10.5 shows recent Sterling pull history from the live pull_history table.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/pull">Back to Pull</a>
        <a class="button button-secondary" href="#/shop">Ticket Shop</a>
      </div>
    </section>

    <div class="empty-note">Source: ${escapeHtml(history.source)}${history.warning ? ' · ' + escapeHtml(history.warning) : ''}</div>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Log</span>
          <h2 class="section-title">Pull Records</h2>
        </div>
        <span class="status-pill">${history.pulls.length}</span>
      </div>
      <div class="admin-table">
        ${history.pulls.length ? history.pulls.map(renderPullRow).join('') : '<div class="empty-note">No pull history yet.</div>'}
      </div>
    </section>
  `;
}
