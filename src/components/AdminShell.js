/* ============================================================================
   Admin Shell Component
   Phase 5.5 responsibility: isolate admin and diagnostic routes from player routes.
   ============================================================================ */

const adminNavItems = [
  { href: '#/admin', route: '/admin', label: 'Admin Home' },
  { href: '#/admin/battle-check', route: '/admin/battle-check', label: 'Battle Check' },
  { href: '#/admin/cards', route: '/admin/cards', label: 'Cards' },
  { href: '#/admin/card-mechanics', route: '/admin/card-mechanics', label: 'Mechanics' },
  { href: '#/admin/submit-crop-lab', route: '/admin/submit-crop-lab', label: 'Crop Lab' },
  { href: '#/admin/submissions', route: '/admin/submissions', label: 'Submissions' },
  { href: '#/admin/backend', route: '/admin/backend', label: 'Backend' },
  { href: '#/admin/inventory', route: '/admin/inventory', label: 'Inventory' },
  { href: '#/admin/card-lab', route: '/admin/card-lab', label: 'Card Lab' },
];

export function renderAdminShell({ activeRoute, content }) {
  return `
    <div class="admin-shell">
      <header class="admin-topbar">
        <a class="admin-brand" href="#/admin" aria-label="Imago Core Admin Home">
          <span class="brand-kicker">Imago Core Admin</span>
          <h1 class="brand-title">Diagnostics</h1>
        </a>
        <span class="status-pill">Isolated</span>
      </header>

      <nav class="admin-nav" aria-label="Admin navigation">
        ${adminNavItems.map((item) => `
          <a class="admin-nav-link" href="${item.href}" ${activeRoute === item.route ? 'aria-current="page"' : ''}>${item.label}</a>
        `).join('')}
      </nav>

      <main class="screen-stack admin-screen-stack" id="main-content">
        ${content}
      </main>
    </div>
  `;
}
