/* ============================================================================
   App Shell Component
   Phase 1 responsibility: shared chrome around route content.
   Keep screen-specific composition inside files under src/routes.
   ============================================================================ */

import { renderTopBar } from './TopBar.js';
import { renderBottomNav } from './BottomNav.js';

export function renderAppShell({ activeRoute, content }) {
  return `
    <div class="app-shell">
      ${renderTopBar()}
      <main class="screen-stack" id="main-content">
        ${content}
      </main>
    </div>
    ${renderBottomNav(activeRoute)}
  `;
}
