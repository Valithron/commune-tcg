import { renderTopBar } from './TopBar.js';
import { renderBottomNav } from './BottomNav.js';

export async function renderAppShell({ activeRoute, content }) {
  const topBar = await renderTopBar();
  const isHome = activeRoute === '/home';

  return `
    <div class="app-shell${isHome ? ' app-shell--home' : ''}">
      ${topBar}
      <main class="screen-stack${isHome ? ' screen-stack--home' : ''}" id="main-content">
        ${content}
      </main>
    </div>
    ${renderBottomNav(activeRoute)}
  `;
}

export function renderImmersiveAppShell({ content }) {
  return `
    <div class="app-shell app-shell--immersive">
      <main class="screen-stack screen-stack--immersive" id="main-content">
        ${content}
      </main>
    </div>
  `;
}
