/* ============================================================================
   Commune TCG Gacha - App Bootstrap
   Phase 3 responsibility: wire static routes, route params, and query values.
   Do not put route-specific UI or backend behavior in this file.
   ============================================================================ */

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/cards.css';
import './styles/battle.css';

import { renderAppShell } from './components/AppShell.js';
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

const appRoot = document.querySelector('#app');

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

function render() {
  const { path, query } = parseHashRoute();
  const matchedRoute = resolveRoute(path) || resolveRoute('/home');

  if (!resolveRoute(path)) {
    window.history.replaceState(null, '', '#/home');
  }

  appRoot.innerHTML = renderAppShell({
    activeRoute: matchedRoute.navRoute,
    content: matchedRoute.render({ params: matchedRoute.params, query }),
  });
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);
