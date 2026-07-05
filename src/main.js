/* ============================================================================
   Commune TCG Gacha - App Bootstrap
   Phase 5.5 responsibility: keep player routes separate while adding an
   admin-only battle reward check route.
   ============================================================================ */

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/admin.css';

// Card system styles: foundation, density overrides, detail layout, then dev tools.
import './styles/cards.css';
import './styles/card-showcase.css';
import './styles/card-standard.css';
import './styles/card-thumbnail.css';
import './styles/card-detail.css';
import './styles/card-lab.css';
import './styles/card-standard-tuner.css';

import './styles/battle.css';
import './styles/phase4.css';

import { renderAppShell } from './components/AppShell.js';
import { renderAdminShell } from './components/AdminShell.js';
import { fitCardTitles } from './components/cardTitleFit.js';
import { renderHome } from './routes/Home.js';
import { renderPull } from './routes/Pull.js';
import { renderPullConfirm } from './routes/PullConfirm.js';
import { renderPullResults } from './routes/PullResults.js';
import { renderPullHistory } from './routes/PullHistory.js';
import { renderVault } from './routes/Vault.js';
import { renderVaultCardDetail } from './routes/VaultCardDetail.js';
import { renderLibrary } from './routes/Library.js';
import { renderLibraryCardDetail } from './routes/LibraryCardDetail.js';
import { initTicketShop, renderTicketShop } from './routes/TicketShop.js';
import { renderBattleHub } from './routes/BattleHub.js';
import { renderEncounterSelect } from './routes/EncounterSelect.js';
import { renderSquadBuilder } from './routes/SquadBuilder.js';
import { renderBattleResults } from './routes/BattleResults.js';
import { initSubmitCardForm, renderSubmitCard } from './routes/SubmitCard.js';
import { renderAdminIndex } from './routes/AdminIndex.js';
import { initAdminBattleTest, renderAdminBattleTest } from './routes/AdminBattleTest.js';
import { renderAdminDashboard } from './routes/AdminDashboard.js';
import { initAdminSubmissionDetail, renderAdminSubmissionDetail } from './routes/AdminSubmissionDetail.js';
import { renderBackendStatus } from './routes/BackendStatus.js';
import { renderResourceInventory } from './routes/ResourceInventory.js';
import { renderCardLab } from './routes/CardLab.js';
import { initCardFrameTuner } from './routes/cardFrameTuner.js';

const appRoot = document.querySelector('#app');
let renderToken = 0;

const routeDefinitions = [
  { pattern: '/home', navRoute: '/home', shell: 'player', render: renderHome },
  { pattern: '/pull', navRoute: '/pull', shell: 'player', render: renderPull },
  { pattern: '/pull/confirm', navRoute: '/pull', shell: 'player', render: renderPullConfirm },
  { pattern: '/pull/results', navRoute: '/pull', shell: 'player', render: renderPullResults },
  { pattern: '/pull/history', navRoute: '/pull', shell: 'player', render: renderPullHistory },
  { pattern: '/vault', navRoute: '/vault', shell: 'player', render: renderVault },
  { pattern: '/vault/card/:cardId', navRoute: '/vault', shell: 'player', render: renderVaultCardDetail },
  { pattern: '/library', navRoute: '/library', shell: 'player', render: renderLibrary },
  { pattern: '/library/card/:cardId', navRoute: '/library', shell: 'player', render: renderLibraryCardDetail },
  { pattern: '/shop', navRoute: '/pull', shell: 'player', render: renderTicketShop },
  { pattern: '/battle', navRoute: '/battle', shell: 'player', render: renderBattleHub },
  { pattern: '/battle/encounters', navRoute: '/battle', shell: 'player', render: renderEncounterSelect },
  { pattern: '/battle/squad', navRoute: '/battle', shell: 'player', render: renderSquadBuilder },
  { pattern: '/battle/results', navRoute: '/battle', shell: 'player', render: renderBattleResults },
  { pattern: '/submit', navRoute: '/library', shell: 'player', render: renderSubmitCard },
  { pattern: '/admin', navRoute: '/admin', shell: 'admin', render: renderAdminIndex },
  { pattern: '/admin/battle-check', navRoute: '/admin/battle-check', shell: 'admin', render: renderAdminBattleTest },
  { pattern: '/admin/submissions', navRoute: '/admin/submissions', shell: 'admin', render: renderAdminDashboard },
  { pattern: '/admin/submission/:submissionId', navRoute: '/admin/submissions', shell: 'admin', render: renderAdminSubmissionDetail },
  { pattern: '/admin/backend', navRoute: '/admin/backend', shell: 'admin', render: renderBackendStatus },
  { pattern: '/admin/inventory', navRoute: '/admin/inventory', shell: 'admin', render: renderResourceInventory },
  { pattern: '/admin/card-lab', navRoute: '/admin/card-lab', shell: 'admin', render: renderCardLab },
];

const legacyAdminRedirects = {
  '/backend': '/admin/backend',
  '/inventory': '/admin/inventory',
  '/card-lab': '/admin/card-lab',
};

function parseHashRoute() {
  const rawHash = window.location.hash.replace('#', '') || '/home';
  const [path, queryString = ''] = rawHash.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryString));

  return {
    path: path || '/home',
    query,
  };
}

function setHashRoute(path) {
  window.history.replaceState(null, '', '#' + path);
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

function getFallbackPath(path) {
  return path.startsWith('/admin') ? '/admin' : '/home';
}

function renderError(error, shell) {
  const fallbackHref = shell === 'admin' ? '#/admin' : '#/home';
  const fallbackLabel = shell === 'admin' ? 'Back to Admin' : 'Back Home';

  return `
    <section class="hero-panel">
      <span class="section-kicker">Route Error</span>
      <h2 class="hero-title">Something failed.</h2>
      <p class="hero-copy">${error.message}</p>
      <div class="action-row"><a class="button button-secondary" href="${fallbackHref}">${fallbackLabel}</a></div>
    </section>
  `;
}

function renderShell(route, content) {
  if (route.shell === 'admin') {
    return renderAdminShell({
      activeRoute: route.navRoute,
      content,
    });
  }

  return renderAppShell({
    activeRoute: route.navRoute,
    content,
  });
}

async function render() {
  const currentToken = ++renderToken;
  const { path, query } = parseHashRoute();
  const redirectedPath = legacyAdminRedirects[path] || path;
  const fallbackPath = getFallbackPath(redirectedPath);
  const matchedRoute = resolveRoute(redirectedPath) || resolveRoute(fallbackPath);

  if (redirectedPath !== path || !resolveRoute(redirectedPath)) {
    setHashRoute(resolveRoute(redirectedPath) ? redirectedPath : fallbackPath);
  }

  try {
    const content = await matchedRoute.render({ params: matchedRoute.params, query });

    if (currentToken !== renderToken) {
      return;
    }

    appRoot.innerHTML = await renderShell(matchedRoute, content);

    fitCardTitles(appRoot);

    if (matchedRoute.pattern === '/admin/card-lab') {
      initCardFrameTuner(appRoot);
    }

    if (matchedRoute.pattern === '/admin/battle-check') {
      initAdminBattleTest(appRoot);
    }

    if (matchedRoute.pattern === '/submit') {
      initSubmitCardForm(appRoot);
    }

    if (matchedRoute.pattern === '/shop') {
      initTicketShop(appRoot);
    }

    if (matchedRoute.pattern === '/admin/submission/:submissionId') {
      initAdminSubmissionDetail(appRoot);
    }
  } catch (error) {
    appRoot.innerHTML = await renderShell(matchedRoute, renderError(error, matchedRoute.shell));
  }
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);
