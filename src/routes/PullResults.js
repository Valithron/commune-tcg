/* Compatibility results route for an already resolved pull. */

import { renderCardFrame } from '../components/CardFrame.js';
import { clampPullCount } from '../components/format.js';
import { readPullRevealPayload } from '../services/pullRevealStore.js';

function getOwnedCardId(card) {
  return card?.ownedCardId || card?.owned_card_id || card?.id || '';
}

export async function renderPullResults({ query = {} } = {}) {
  const payload = readPullRevealPayload();
  const results = Array.isArray(payload?.cards) ? payload.cards.filter(Boolean) : [];
  const count = clampPullCount(payload?.count || query.count || results.length || 1);

  return `
    <section class="result-banner">
      <span class="section-kicker">Pull Results</span>
      <h2 class="hero-title">${results.length ? (count === 5 ? 'Five artifacts revealed.' : 'One artifact revealed.') : 'No saved reveal.'}</h2>
      <p class="hero-copy">Results display only cards already resolved and granted by the authoritative pull endpoint.</p>
      <div class="action-row">
        <a class="button button-primary" href="#/pull/confirm?count=${count}">Pull Again</a>
        <a class="button button-secondary" href="#/vault">Go to Vault</a>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Revealed</span>
          <h2 class="section-title">Result Cards</h2>
        </div>
        <span class="status-pill">${count}-Pull</span>
      </div>
      <div class="card-grid result-grid">
        ${results.length
          ? results.map((card) => renderCardFrame(card, { href: `#/vault/card/${getOwnedCardId(card)}` })).join('')
          : '<div class="empty-note">Reveal state is unavailable. Open the Vault to see previously granted cards.</div>'}
      </div>
    </section>
  `;
}
