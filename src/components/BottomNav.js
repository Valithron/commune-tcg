/* ============================================================================
   Bottom Navigation Component
   Phase 3 responsibility: canonical mobile nav for primary prototype loops.
   Keep this list aligned with docs/route-map.md.
   ============================================================================ */

const navItems = [
  { href: '#/home', route: '/home', icon: '⌂', label: 'Home' },
  { href: '#/pull', route: '/pull', icon: '✦', label: 'Pull' },
  { href: '#/battle', route: '/battle', icon: '⚔', label: 'Battle' },
  { href: '#/vault', route: '/vault', icon: '▣', label: 'Vault' },
  { href: '#/library', route: '/library', icon: '◇', label: 'Library' },
];

export function renderBottomNav(activeRoute) {
  return `
    <nav class="bottom-nav" style="grid-template-columns: repeat(${navItems.length}, minmax(0, 1fr));" aria-label="Primary navigation">
      ${navItems.map((item) => `
        <a class="bottom-nav-link" href="${item.href}" ${activeRoute === item.route ? 'aria-current="page"' : ''}>
          <span class="nav-icon" aria-hidden="true">${item.icon}</span>
          <span>${item.label}</span>
        </a>
      `).join('')}
    </nav>
  `;
}
