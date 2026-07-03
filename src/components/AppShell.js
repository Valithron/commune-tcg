/* ============================================================================
   App Shell Component
   Phase 7.5 responsibility: shared chrome around route content with explicit
   layout variants for mobile game screens and desktop lab screens.
   ============================================================================ */

import { renderTopBar } from './TopBar.js';
import { renderBottomNav } from './BottomNav.js';

export function renderAppShell({ activeRoute, content, layout = 'default' }) {
  const shellClass = layout === 'wide'
    ? 'app-shell app-shell--wide'
    : 'app-shell';

  return `
    <div class="${shellClass}">
      ${renderTopBar()}
      <main class="screen-stack" id="main-content">
        ${content}
      </main>
    </div>
    ${renderBottomNav(activeRoute)}
  `;
}
