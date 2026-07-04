import { renderTopBar } from './TopBar.js';
import { renderBottomNav } from './BottomNav.js';

export async function renderAppShell({ activeRoute, content }) {
  const topBar = await renderTopBar();

  return `
    <div class="app-shell">
      ${topBar}
      <main class="screen-stack" id="main-content">
        ${content}
      </main>
    </div>
    ${renderBottomNav(activeRoute)}
  `;
}
