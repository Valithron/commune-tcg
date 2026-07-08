import { getMockPullResults } from '../data/mockPull.js';
import { renderCardFrame } from '../components/CardFrame.js';
import { clampPullCount } from '../components/format.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';

async function loadSimulatedPull(count) {
  const routes = getApiRoutes();
  const payload = await fetchJson(routes.pullSimulate + '?count=' + encodeURIComponent(count));

  if (!payload?.ok || !Array.isArray(payload.results)) {
    throw new Error(payload?.error || 'No simulation results were returned.');
  }

  return {
    source: 'simulation',
    results: payload.results.map((result) => result.card).filter(Boolean),
    fallbackCount: payload.fallbackCount || 0,
    poolSummary: payload.poolSummary,
    ticketsCopy: '',
    warning: '',
  };
}

async function loadRealPull(count) {
  const routes = getApiRoutes();
  const response = await fetch(routes.pulls, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ count }),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || `Pull failed with ${response.status}`);
  }

  return {
    source: 'real',
    results: payload.results.map((result) => result.ownedCard).filter(Boolean),
    fallbackCount: payload.results.filter((result) => result.fallbackUsed).length,
    poolSummary: payload.poolSummary,
    ticketsCopy: `tickets ${payload.ticketsBefore} -> ${payload.ticketsAfter}`,
    warning: '',
  };
}

async function loadPullResults(count, realPull) {
  try {
    return realPull ? await loadRealPull(count) : await loadSimulatedPull(count);
  } catch (error) {
    if (realPull) {
      return {
        source: 'failed-real',
        results: [],
        fallbackCount: 0,
        poolSummary: null,
        ticketsCopy: '',
        warning: error.message,
      };
    }

    try {
      return await loadSimulatedPull(count);
    } catch {
      return {
        source: 'mock',
        results: getMockPullResults(count),
        fallbackCount: 0,
        poolSummary: null,
        ticketsCopy: '',
        warning: error.message,
      };
    }
  }
}

export async function renderPullResults({ query }) {
  const count = clampPullCount(query.count);
  const realPull = query.real === '1';
  const pull = await loadPullResults(count, realPull);
  const results = pull.results;
  const pullFailed = pull.source === 'failed-real';
  const headline = pullFailed ? 'Pull could not resolve.' : count === 5 ? 'Five cards appear.' : 'A card appears.';
  const sourceLabel = pull.source === 'real' ? 'Real Pull' : pull.source === 'simulation' ? 'No-write Simulation' : pull.source === 'failed-real' ? 'Pull Failed' : 'Mock fallback';
  const poolCopy = pull.poolSummary
    ? `${pull.poolSummary.eligibleCount} eligible · ${pull.poolSummary.approvedSubmissionCount} approved submissions`
    : pull.warning;
  const cardHrefBase = pull.source === 'real' ? '#/vault/card/' : '#/library/card/';

  return `
    <section class="result-banner">
      <span class="section-kicker">Pull Results</span>
      <h2 class="hero-title">${headline}</h2>
      <p class="hero-copy">Phase 10.4 shows live pull failures directly so tickets and Vault state stay clear.</p>
      <div class="action-row">
        <a class="button button-primary" href="#/pull?count=${count}">Pull Again</a>
        <a class="button button-secondary" href="#/pull">Back to Pull</a>
        <a class="button button-secondary" href="#/vault">Go to Vault</a>
      </div>
    </section>

    <div class="empty-note">Source: ${sourceLabel}${pull.ticketsCopy ? ' · ' + pull.ticketsCopy : ''}${poolCopy ? ' · ' + poolCopy : ''}${pull.fallbackCount ? ' · rarity fallback used ' + pull.fallbackCount + 'x' : ''}</div>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Revealed</span>
          <h2 class="section-title">Result Cards</h2>
        </div>
        <span class="status-pill">${count}-Pull</span>
      </div>
      <div class="card-grid result-grid">
        ${results.length ? results.map((card) => renderCardFrame(card, { href: `${cardHrefBase}${card.id}` })).join('') : '<div class="empty-note">No cards were granted.</div>'}
      </div>
    </section>
  `;
}
