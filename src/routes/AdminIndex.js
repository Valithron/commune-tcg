/* ============================================================================
   Admin Index Route
   Phase 5.5 responsibility: entry point for isolated admin and diagnostics.
   Contains no links to player routes.
   ============================================================================ */

const adminSections = [
  {
    href: '#/admin/battle-check',
    title: 'Battle Check',
    copy: 'Run the real Phase 5 battle reward path from an admin button and view applied gold and XP.',
  },
  {
    href: '#/admin/cards',
    title: 'Card Editor',
    copy: 'Edit Library card text, stats, images, crop values, and delete card rows from the pool.',
  },
  {
    href: '#/admin/card-mechanics',
    title: 'Card Mechanics Repair',
    copy: 'Audit placeholder 1/1/1 stats, reroll template mechanics, and clear pulled test copies.',
  },
  {
    href: '#/admin/submit-crop-lab',
    title: 'Submit Crop Lab',
    copy: 'Compare the two proposed Submit Card preview/crop approaches before changing the live form.',
  },
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
      <p class="hero-copy">This area isolates builder, review, and diagnostic tools from the player game. Phase 5.5 adds a button-based battle check so reward writes can be reviewed without manual API work.</p>
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
