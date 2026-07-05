/* ============================================================================
   Admin Index Route
   Phase 4.5 responsibility: entry point for isolated admin and diagnostics.
   Contains no links to player routes.
   ============================================================================ */

const adminSections = [
  {
    href: '#/admin/submissions',
    title: 'Submissions Review',
    copy: 'Review submitted cards and approve them into the Library pipeline.',
  },
  {
    href: '#/admin/backend',
    title: 'Backend Status',
    copy: 'Inspect API health, schema, R2 image checks, pull diagnostics, and battle endpoints.',
  },
  {
    href: '#/admin/inventory',
    title: 'Resource Inventory',
    copy: 'Use the capture checklist for pull, Vault, battle, and contract diagnostics.',
  },
  {
    href: '#/admin/card-lab',
    title: 'Card Lab',
    copy: 'Stress test title length, rarity frames, card density, and detail sheet layout.',
  },
];

export function renderAdminIndex() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Admin Containment</span>
      <h2 class="hero-title">Tools stay here.</h2>
      <p class="hero-copy">This area isolates builder, review, and diagnostic tools from the player game. The player shell, top bar, bottom nav, and player routes are intentionally not rendered here.</p>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Admin Map</span>
          <h2 class="section-title">Diagnostic sections</h2>
        </div>
        <span class="status-pill">No player links</span>
      </div>
      <div class="quick-grid admin-hub-grid">
        ${adminSections.map((section) => `
          <a class="quick-card" href="${section.href}">
            <strong>${section.title}</strong>
            <span>${section.copy}</span>
          </a>
        `).join('')}
      </div>
    </section>

    <section class="glass-panel admin-panel">
      <span class="section-kicker">Boundary Rule</span>
      <h2 class="section-title">Player game stays clean</h2>
      <div class="admin-checklist">
        <div>Admin pages use AdminShell, not the player AppShell.</div>
        <div>Admin navigation links only to admin routes.</div>
        <div>Player pages should not link into admin diagnostics.</div>
        <div>Diagnostics remain available for verification, but they are contained.</div>
      </div>
    </section>
  `;
}
