/* ============================================================================
   Commune TCG Gacha - App Bootstrap
   Phase 10F.3 responsibility: keep player/admin routes separate, load battle
   presentation overrides, and reset scroll on route changes.
   ============================================================================ */

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/account.css';
import './styles/type-pool.css';
import './styles/pull-sheet.css';
import './styles/pull-reveal.css';
import './styles/pull-reveal-multi.css';
import './styles/library.css';
import './styles/admin.css';
import './styles/auth.css';

// Card system styles: foundation, density overrides, detail layout, then dev tools.
import './styles/cards.css';
import './styles/card-showcase.css';
import './styles/card-standard.css';
import './styles/card-thumbnail.css';
import './styles/card-detail.css';
import './styles/card-rarity-frames.css';
import './styles/card-lab.css';
import './styles/card-standard-tuner.css';

import './styles/battle.css';
import './styles/battle-encounter-compact.css';
import './styles/battle-squad-thumbnails.css';
import './styles/phase4.css';
import './styles/submit-crop-lab.css';
import './styles/submit-card-preview.css';

import { renderAppShell } from './components/AppShell.js';
import { renderAdminShell } from './components/AdminShell.js';
import { fitCardTitles } from './components/cardTitleFit.js';
import { loadAuthUser } from './services/authClient.js';
import { initSignIn, renderSignIn } from './routes/SignIn.js';
import { renderHome } from './routes/Home.js';
import { initPull, renderPull } from './routes/Pull.js';
import { renderPullConfirm } from './routes/PullConfirm.js';
import { initPullReveal, renderPullReveal } from './routes/PullReveal.js';
import { renderPullResults } from './routes/PullResults.js';
import { renderPullHistory } from './routes/PullHistory.js';
import { renderVault } from './routes/Vault.js';
import { renderVaultCardDetail } from './routes/VaultCardDetail.js';
import { initLibraryControls, renderLibrary } from './routes/Library.js';
import { renderLibraryCardDetail } from './routes/LibraryCardDetail.js';
import { initTicketShop, renderTicketShop } from './routes/TicketShop.js';
import { renderBattleHub } from './routes/BattleHub.js';
import { renderEncounterSelect } from './routes/EncounterSelect.js';
import { initSquadBuilder, renderSquadBuilder } from './routes/SquadBuilder.js';
import { initBattleResults, renderBattleResults } from './routes/BattleResults.js';
import { initSubmitCardForm, renderSubmitCard } from './routes/SubmitCard.js';
import { renderAdminIndex } from './routes/AdminIndex.js';
import { initAdminBattleTest, renderAdminBattleTest } from './routes/AdminBattleTest.js';
import { initAdminCardEditor, renderAdminCardEditor } from './routes/AdminCardEditor.js';
import { initAdminCardMechanics, renderAdminCardMechanics } from './routes/AdminCardMechanics.js';
import { initAdminSubmitCropLab, renderAdminSubmitCropLab } from './routes/AdminSubmitCropLab.js';
import { renderAdminDashboard } from './routes/AdminDashboard.js';
import { initAdminSubmissionDetail, renderAdminSubmissionDetail } from './routes/AdminSubmissionDetail.js';
import { renderBackendStatus } from './routes/BackendStatus.js';
import { renderResourceInventory } from './routes/ResourceInventory.js';
import { renderCardLab } from './routes/CardLab.js';
import { initCardFrameTuner } from './routes/cardFrameTuner.js';

const appRoot = document.querySelector('#app');
let renderToken = 0;
let authRenderState = {};

const routeDefinitions = [
  { pattern: '/home', navRoute: '/home', shell: 'player', render: renderHome },
  { pattern: '/pull', navRoute: '/pull', shell: 'player', render: renderPull },
  { pattern: '/pull/confirm', navRoute: '/pull', shell: 'player', render: renderPullConfirm },
  { pattern: '/pull/reveal', navRoute: '/pull', shell: 'player', render: renderPullReveal },
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
  { pattern: '/admin/cards', navRoute: '/admin/cards', shell: 'admin', render: renderAdminCardEditor },
  { pattern: '/admin/card-mechanics', navRoute: '/admin/card-mechanics', shell: 'admin', render: renderAdminCardMechanics },
  { pattern: '/admin/submit-crop-lab', navRoute: '/admin/submit-crop-lab', shell: 'admin', render: renderAdminSubmitCropLab },
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
  return { path: path || '/home', query };
}

function setHashRoute(path) { window.history.replaceState(null, '', '#' + path); }

function matchPattern(path, pattern) {
  const pathParts = path.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);
  if (pathParts.length !== patternParts.length) return null;
  return patternParts.reduce((params, patternPart, index) => {
    if (params === null) return null;
    const pathPart = pathParts[index];
    if (patternPart.startsWith(':')) return { ...params, [patternPart.slice(1)]: decodeURIComponent(pathPart) };
    return patternPart === pathPart ? params : null;
  }, {});
}

function resolveRoute(path) {
  for (const route of routeDefinitions) {
    const params = matchPattern(path, route.pattern);
    if (params) return { ...route, params };
  }
  return null;
}

function getFallbackPath(path) { return path.startsWith('/admin') ? '/admin' : '/home'; }

function scrollRouteToTop() {
  const mainContent = document.querySelector('#main-content');
  const scrollingElement = document.scrollingElement || document.documentElement;
  if (scrollingElement) scrollingElement.scrollTop = 0;
  document.body.scrollTop = 0;
  appRoot.scrollTop = 0;
  if (mainContent) mainContent.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  window.requestAnimationFrame(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); });
}

function renderError(error, shell) {
  const fallbackHref = shell === 'admin' ? '#/admin' : '#/home';
  const fallbackLabel = shell === 'admin' ? 'Back to Admin' : 'Back Home';
  return `<section class="hero-panel"><span class="section-kicker">Route Error</span><h2 class="hero-title">Something failed.</h2><p class="hero-copy">${error.message}</p><div class="action-row"><a class="button button-secondary" href="${fallbackHref}">${fallbackLabel}</a></div></section>`;
}

async function renderShell(route, content) {
  if (route.shell === 'admin') {
    return renderAdminShell({ activeRoute: route.navRoute, content });
  }
  return renderAppShell({ activeRoute: route.navRoute, content });
}

async function renderAuthGate(nextState = {}) {
  authRenderState = { ...authRenderState, ...nextState };
  appRoot.innerHTML = await renderSignIn(authRenderState);
  initSignIn(appRoot, renderAuthGate);
}

async function renderRoute() {
  const currentToken = ++renderToken;
  const { path, query } = parseHashRoute();
  const route = resolveRoute(path);
  if (!route) {
    const fallbackPath = legacyAdminRedirects[path] || getFallbackPath(path);
    setHashRoute(fallbackPath);
    return renderRoute();
  }

  try {
    const authUser = await loadAuthUser();
    if (!authUser) return renderAuthGate({ redirectTo: path });
    if (currentToken !== renderToken) return;

    const content = await route.render({ params: route.params || {}, query });
    if (currentToken !== renderToken) return;

    appRoot.innerHTML = await renderShell(route, content);
    fitCardTitles(appRoot);

    if (route.render === renderPull || route.render === renderPullConfirm) initPull(appRoot);
    else if (route.render === renderPullReveal) initPullReveal(appRoot);
    else if (route.render === renderLibrary) initLibraryControls(appRoot);
    else if (route.render === renderTicketShop) initTicketShop(appRoot);
    else if (route.render === renderSubmitCard) initSubmitCardForm(appRoot);
    else if (route.render === renderAdminBattleTest) initAdminBattleTest(appRoot);
    else if (route.render === renderAdminCardEditor) initAdminCardEditor(appRoot);
    else if (route.render === renderAdminCardMechanics) initAdminCardMechanics(appRoot);
    else if (route.render === renderAdminSubmitCropLab) initAdminSubmitCropLab(appRoot);
    else if (route.render === renderAdminSubmissionDetail) initAdminSubmissionDetail(appRoot);
    else if (route.render === renderSquadBuilder) initSquadBuilder(appRoot);
    else if (route.render === renderBattleResults) initBattleResults(appRoot);
    else if (route.render === renderCardLab) initCardFrameTuner(appRoot);

    scrollRouteToTop();
  } catch (error) {
    appRoot.innerHTML = await renderShell(route, renderError(error, route.shell));
  }
}

window.addEventListener('hashchange', renderRoute);
renderRoute();