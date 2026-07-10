/* Battle mode entry and pending-attempt recovery surface. */

import { fetchBattleEncounters, recoverBattleAttempt } from '../services/battleApi.js';
import { getApiRoutes } from '../services/apiClient.js';

function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }

async function fetchEnergy() {
  const response = await fetch(`${getApiRoutes().pullResources}?_=${Date.now()}`, { headers: { accept: 'application/json' } });
  const payload = await response.json();
  return Number(payload.resources?.energy ?? 10);
}

export async function renderBattleHub() {
  try {
    const [encounters, recovery, energy] = await Promise.all([fetchBattleEncounters(), recoverBattleAttempt().catch(() => ({ attempt: null })), fetchEnergy().catch(() => 10)]);
    const daily = encounters.encounters[0];
    const pending = recovery.attempt?.status === 'pending' ? recovery.attempt : null;
    return `<section class="hero-panel battle-hub-hero"><span class="section-kicker">Battle</span><h1 class="hero-title">Deploy your formation.</h1><p class="hero-copy">Prepare three lanes, then watch one server-authoritative battle unfold.</p><div class="action-row"><a class="button button-primary" href="#/battle/encounters">Choose Encounter</a><a class="button button-secondary" href="#/battle/squad?encounter=${encodeURIComponent(daily.id)}">Edit Formation</a></div></section>
      ${pending ? `<section class="glass-panel battle-pending-card"><span class="section-kicker">Unfinished Battle</span><h2>${escapeHtml(pending.result.encounter.name)}</h2><p>The stored result is safe and cannot reroll.</p><div class="action-row"><a class="button button-primary" href="#/battle/arena?attemptId=${encodeURIComponent(pending.attemptId)}">Resume Battle</a><a class="button button-secondary" href="#/battle/results?attemptId=${encodeURIComponent(pending.attemptId)}">Skip to Results</a></div></section>` : ''}
      <section><div class="section-heading"><div><span class="section-kicker">Battle Modes</span><h2 class="section-title">Choose how to fight</h2></div><span class="status-pill">⚡ ${escapeHtml(energy)} Energy</span></div><div class="encounter-grid"><a class="encounter-card" href="#/battle/encounters"><span class="section-kicker">Daily Skirmish</span><h3>${escapeHtml(daily.name)}</h3><p>Repeatable Gold and full-squad XP. First victory each Mountain Time day grants a bonus.</p><div class="battle-meta-row"><span>PWR ${daily.recommendedPowerRange.min}–${daily.recommendedPowerRange.max}</span><span>⚡ ${daily.energyCost}</span></div></a><article class="encounter-card is-disabled"><span class="section-kicker">Challenge</span><h3>Curated Challenges</h3><p>Stronger formation puzzles are coming after the first battle is validated.</p></article><article class="encounter-card is-disabled"><span class="section-kicker">Seasonal Boss</span><h3>Seasonal Encounters</h3><p>Major limited battles remain intentionally deferred.</p></article></div></section>`;
  } catch (error) {
    return `<section class="hero-panel"><span class="section-kicker">Battle</span><h1 class="hero-title">Battle Hub unavailable.</h1><p>${escapeHtml(error.message)}</p></section>`;
  }
}
