/* ============================================================================
   Pull Results Route
   Phase 10.2 responsibility: render no-write backend pull simulation results
   with deterministic mock fallback.
   ============================================================================ */

import { getMockPullResults } from '../data/mockPull.js';
import { renderCardFrame } from '../components/CardFrame.js';
import { clampPullCount } from '../components/format.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';

async function loadSimulatedPull(count) {
  try {
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
      warning: '',
    };
  } catch (error) {
    return {
      source: 'mock',
      results: getMockPullResults(count),
      fallbackCount: 0,
      poolSummary: null,
      warning: error.message,
    };
  }
}

export async function renderPullResults({ query }) {
  const count = clampPullCount(query.count);
  const simulation = await loadSimulatedPull(count);
  const results = simulation.results;
  const headline = count === 5 ? 'Five cards appear.' : 'A card appears.';
  const sourceLabel = simulation.source === 'simulation' ? 'No-write Simulation' : 'Mock fallback';
  const poolCopy = simulation.poolSummary
    ? `${simulation.poolSummary.eligibleCount} eligible · ${simulation.poolSummary.approvedSubmissionCount} approved submissions`
    : simulation.warning;

  return `
    <section class="result-banner">
      <span class="section-kicker">Pull Results</span>
      <h2 class="hero-title">${headline}</h2>
      <p class="hero-copy">Phase 10.2 simulates results from the pull pool. No tickets are spent and no Vault cards are granted.</p>
      <div class="action-row">
        <a class="button button-primary" href="#/pull/confirm?count=${count}">Simulate Again</a>
        <a class="button button-secondary" href="#/pull">Back to Pull</a>
        <a class="button button-secondary" href="#/vault">Go to Vault</a>
      </div>
    </section>

    <div class="empty-note">Source: ${sourceLabel}${poolCopy ? ' · ' + poolCopy : ''}${simulation.fallbackCount ? ' · rarity fallback used ' + simulation.fallbackCount + 'x' : ''}</div>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Revealed</span>
          <h2 class="section-title">Result Cards</h2>
        </div>
        <span class="status-pill">${count}-Pull</span>
      </div>
      <div class="card-grid result-grid">
        ${results.map((card) => renderCardFrame(card, { href: `#/library/card/${card.id}` })).join('')}
      </div>
    </section>
  `;
}
