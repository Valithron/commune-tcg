/* ============================================================================
   Commune TCG Gacha - App Bootstrap
   Phase 7.6 responsibility: wire static, async read-model, card-lab, card title
   fitting, and Card Lab-only frame tuner routes. Do not put route-specific UI
   or backend behavior in this file.
   ============================================================================ */

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/cards.css';
import './styles/card-geometry-test.css';
import './styles/battle.css';
import './styles/phase4.css';
import './styles/card-lab.css';

import { renderAppShell } from './components/AppShell.js';
import { fitCardTitles } from './components/cardTitleFit.js';
import { renderHome } from './routes/Home.js';
import { renderPull } from './routes/Pull.js';
import { renderPullConfirm } from './routes/PullConfirm.js';
import { renderPullResults } from './routes/PullResults.js';
import { renderVault } from './routes/Vault.js';
import { renderVaultCardDetail } from './routes/VaultCardDetail.js';
import { renderLibrary } from './routes/Library.js';
import { renderLibraryCardDetail } from './routes/LibraryCardDetail.js';
import { renderTicketShop } from './routes/TicketShop.js';
import { renderBattleHub } from './routes/BattleHub.js';
import { renderEncounterSelect } from './routes/EncounterSelect.js';
import { renderSquadBuilder } from './routes/SquadBuilder.js';
import { renderBattleResults } from './routes/BattleResults.js';
import { renderSubmitCard } from './routes/SubmitCard.js';
import { renderAdminDashboard } from './routes/AdminDashboard.js';
import { renderBackendStatus } from './routes/BackendStatus.js';
import { renderResourceInventory } from './routes/ResourceInventory.js';
import { renderCardLab } from './routes/CardLab.js';
import { initCardFrameTuner } from './routes/cardFrameTuner.js';

const appRoot = document.querySelector('#app');
let renderToken = 0;

const routeDefinitions = [
  { pattern: '/home', navRoute: '/home', render: renderHome },
  { pattern: '/pull', navRoute: '/pull', render: renderPull },
  { pattern: '/pull/confirm', navRoute: '/pull', render: renderPullConfirm },
  { pattern: '/pull/results', navRoute: '/pull', render: renderPullResults },
  { pattern: '/vault', navRoute: '/vault', render: renderVault },
  { pattern: '/vault/card/:cardId', navRoute: '/vault', render: renderVaultCardDetail },
  { pattern: '/library', navRoute: '/library', render: renderLibrary },
  { pattern: '/library/card/:cardId', navRoute: '/library', render: renderLibraryCardDetail },
  { pattern: '/shop', navRoute: '/pull', render: renderTicketShop },
  { pattern: '/battle', navRoute: '/battle', render: renderBattleHub },
  { pattern: '/battle/encounters', navRoute: '/battle', render: renderEncounterSelect },
  { pattern: '/battle/squad', navRoute: '/battle', render: renderSquadBuilder },
  { pattern: '/battle/results', navRoute: '/battle', render: renderBattleResults },
  { pattern: '/submit', navRoute: '/library', render: renderSubmitCard },
  { pattern: '/admin', navRoute: '/home', render: renderAdminDashboard },
  { pattern: '/backend', navRoute: '/home', render: renderBackendStatus },
  { pattern: '/inventory', navRoute: '/home', render: renderResourceInventory },
  { pattern: '/card-lab', navRoute: '/library', render: renderCardLab },
];

function parseHashRoute() {
  const rawHash = window.location.hash.replace('#', '') || '/home';
  const [path, queryString = ''] = rawHash.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryString));

  return {
    path: path || '/home',
    query,
  };
}

function matchPattern(path, pattern) {
  const pathParts = path.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);

  if (pathParts.length !== patternParts.length) {
    return null;
  }

  return patternParts.reduce((params, patternPart, index) => {
    if (params === null) {
      return null;
    }

    const pathPart = pathParts[index];

    if (patternPart.startsWith(':')) {
      return {
        ...params,
        [patternPart.slice(1)]: decodeURIComponent(pathPart),
      };
    }

    return patternPart === pathPart ? params : null;
  }, {});
}

function resolveRoute(path) {
  for (const route of routeDefinitions) {
    const params = matchPattern(path, route.pattern);

    if (params) {
      return {
        ...route,
        params,
      };
    }
  }

  return null;
}

function renderError(error) {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Route Error</span>
      <h2 class="hero-title">Something failed.</h2>
      <p class="hero-copy">${error.message}</p>
      <div class="action-row"><a class="button button-secondary" href="#/home">Back Home</a></div>
    </section>
  `;
}

async function render() {
  const currentToken = ++renderToken;
  const { path, query } = parseHashRoute();
  const matchedRoute = resolveRoute(path) || resolveRoute('/home');

  if (!resolveRoute(path)) {
    window.history.replaceState(null, '', '#/home');
  }

  try {
    const content = await matchedRoute.render({ params: matchedRoute.params, query });

    if (currentToken !== renderToken) {
      return;
    }

    appRoot.innerHTML = renderAppShell({
      activeRoute: matchedRoute.navRoute,
      content,
    });

    fitCardTitles(appRoot);

    if (matchedRoute.pattern === '/card-lab') {
      initCardFrameTuner(appRoot);
    }
  } catch (error) {
    appRoot.innerHTML = renderAppShell({
      activeRoute: matchedRoute.navRoute,
      content: renderError(error),
    });
  }
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);
