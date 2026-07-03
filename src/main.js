/* ============================================================================
   Commune TCG Gacha - App Bootstrap
   Phase 1 responsibility: wire the static shell, hash router, and starter routes.
   Do not put route-specific UI or backend behavior in this file.
   ============================================================================ */

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/cards.css';

import { renderAppShell } from './components/AppShell.js';
import { renderHome } from './routes/Home.js';
import { renderPull } from './routes/Pull.js';
import { renderVault } from './routes/Vault.js';
import { renderLibrary } from './routes/Library.js';

const appRoot = document.querySelector('#app');

const routes = {
  '/home': renderHome,
  '/pull': renderPull,
  '/vault': renderVault,
  '/library': renderLibrary,
};

function normalizeRoute() {
  const route = window.location.hash.replace('#', '') || '/home';
  return routes[route] ? route : '/home';
}

function render() {
  const activeRoute = normalizeRoute();
  const routeRenderer = routes[activeRoute];

  if (window.location.hash.replace('#', '') !== activeRoute) {
    window.history.replaceState(null, '', `#${activeRoute}`);
  }

  appRoot.innerHTML = renderAppShell({
    activeRoute,
    content: routeRenderer(),
  });
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);
