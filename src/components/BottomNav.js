/* ============================================================================
   Bottom Navigation Component
   Phase 1 responsibility: canonical mobile nav for the four starter routes.
   Add future primary routes here only after route ownership is documented.
   ============================================================================ */

const navItems = [
  { href: '#/home', route: '/home', icon: '⌂', label: 'Home' },
  { href: '#/pull', route: '/pull', icon: '✦', label: 'Pull' },
  { href: '#/vault', route: '/vault', icon: '▣', label: 'Vault' },
  { href: '#/library', route: '/library', icon: '◇', label: 'Library' },
];

export function renderBottomNav(activeRoute) {
  return `
    <nav class="bottom-nav" aria-label="Primary navigation">
      ${navItems.map((item) => `
        <a class="bottom-nav-link" href="${item.href}" ${activeRoute === item.route ? 'aria-current="page"' : ''}>
          <span class="nav-icon" aria-hidden="true">${item.icon}</span>
          <span>${item.label}</span>
        </a>
      `).join('')}
    </nav>
  `;
}
