/* Pull catalog route: one live Standard Summon and clearly dormant previews. */

import { clampPullCount } from '../components/format.js';
import { initPullConfirmationBottomSheet, renderPullConfirmationBottomSheet } from '../components/PullConfirmationBottomSheet.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';
import { trackTelemetry } from '../services/telemetry.js';

async function loadPullPageData() {
  const routes = getApiRoutes();
  const [resourcesResult, catalogResult] = await Promise.allSettled([
    fetchJson(`${routes.pullResources}?_=${Date.now()}`, { cache: 'no-store' }),
    fetchJson(`${routes.pullCatalog}?_=${Date.now()}`, { cache: 'no-store' }),
  ]);

  const resourcePayload = resourcesResult.status === 'fulfilled' ? resourcesResult.value : null;
  const catalogPayload = catalogResult.status === 'fulfilled' ? catalogResult.value : null;
  return {
    resources: {
      tickets: Number(resourcePayload?.resources?.pullTickets || 0),
      available: Boolean(resourcePayload?.ok),
    },
    pool: catalogPayload?.pools?.find((pool) => pool.id === 'standard') || null,
  };
}

function renderPreviewBanner({ tone, kicker, title, subtitle, mark }) {
  return `
    <article class="pull-banner-card pull-banner-card-dormant" aria-label="${title}, coming soon">
      <div class="pull-banner-preview pull-banner-preview-${tone}" aria-disabled="true">
        <span class="pull-banner-preview-mark" aria-hidden="true">${mark}</span>
        <span class="pull-banner-preview-copy">
          <span class="pull-banner-kicker">${kicker}</span>
          <span class="pull-banner-preview-title">${title}</span>
          <span class="pull-banner-preview-subtitle">${subtitle}</span>
        </span>
        <span class="pull-banner-status">Coming Soon</span>
      </div>
    </article>
  `;
}

export async function renderPull({ query = {} } = {}) {
  const { resources, pool } = await loadPullPageData();
  const selectedCount = clampPullCount(query.count || 1);
  const sheetOpen = query.confirm === '1';

  return `
    <section class="pull-catalog" aria-labelledby="pull-catalog-title">
      <header class="pull-catalog-heading">
        <div>
          <span class="section-kicker">Core Summons</span>
          <h1 class="pull-catalog-title" id="pull-catalog-title">Summon Catalog</h1>
        </div>
        <div class="pull-catalog-actions">
          <span class="resource-pill">🎟 ${resources.tickets}</span>
          <a class="pull-catalog-history" href="#/pull/history">History</a>
        </div>
      </header>

      <div class="pull-banner-list">
        <article class="pull-banner-card pull-banner-card-featured">
          <button class="pull-banner-button pull-banner-button-featured" type="button" data-pull-open="1" aria-label="Open Standard Summon confirmation" ${resources.available ? '' : 'disabled'}>
            <img class="pull-banner-image" src="/assets/standard-banner-ic.png" alt="Seven Imago Core characters being summoned through the Core device" />
            <span class="pull-banner-scrim" aria-hidden="true"></span>
            <span class="pull-banner-copy" aria-hidden="true">
              <span class="pull-banner-kicker">Permanent Pool</span>
              <span class="pull-banner-title">Standard Summon</span>
              <span class="pull-banner-subtitle">Discover Core variants from the foundational collection.</span>
              <span class="pull-banner-cta">Enter Summon</span>
            </span>
          </button>
        </article>

        ${renderPreviewBanner({ tone: 'violet', kicker: 'Featured Slot', title: 'Limited Summon', subtitle: 'A future timed character or theme pool will appear here.', mark: '◇' })}
        ${renderPreviewBanner({ tone: 'blue', kicker: 'Themed Slot', title: 'Core Chronicle', subtitle: 'Reserved for a future narrative collection.', mark: '◈' })}
        ${renderPreviewBanner({ tone: 'gold', kicker: 'Seasonal Slot', title: 'Seasonal Summon', subtitle: 'Reserved for rotating seasonal collections.', mark: '✦' })}
      </div>

      ${resources.available ? '' : '<div class="empty-note">Ticket balance could not be refreshed. Summon controls are paused so no resource can be spent from stale state.</div>'}
      ${pool ? '' : '<div class="empty-note">Pool details are temporarily unavailable. The authoritative Pull endpoint still controls all costs, odds, and grants.</div>'}
    </section>

    ${renderPullConfirmationBottomSheet({ selectedCount, resources, sheetOpen, pool })}
  `;
}

export function initPull(root) {
  root.querySelectorAll('[data-pull-open]').forEach((button) => {
    button.addEventListener('click', () => {
      trackTelemetry('pull.option_selected', {
        outcome: 'success',
        relatedId: 'standard-summon',
      });
    });
  });
  initPullConfirmationBottomSheet(root);
}
