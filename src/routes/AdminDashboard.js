/* ============================================================================
   Admin Dashboard Route
   Phase 4 responsibility: static admin overview and moderation queue shape.
   Real permissions, D1 mutations, and image moderation are deferred.
   ============================================================================ */

import { mockAdminStats, mockSubmissions, adminChecklist } from '../data/mockAdmin.js';

export function renderAdminDashboard() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Admin</span>
      <h2 class="hero-title">Control the pool.</h2>
      <p class="hero-copy">This Phase 4 admin screen is static. It documents the future moderation workflow without touching live data.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/submit">Open Submit Flow</a>
        <a class="button button-secondary" href="#/library">Back to Library</a>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Overview</span>
          <h2 class="section-title">Admin Snapshot</h2>
        </div>
      </div>
      <div class="admin-stat-grid">
        <div class="stat-panel"><span class="stat-label">Cards</span><span class="stat-value">${mockAdminStats.totalCards}</span></div>
        <div class="stat-panel"><span class="stat-label">Pending</span><span class="stat-value">${mockAdminStats.pendingSubmissions}</span></div>
        <div class="stat-panel"><span class="stat-label">Fights</span><span class="stat-value">${mockAdminStats.encounters}</span></div>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Moderation</span>
          <h2 class="section-title">Submission Queue</h2>
        </div>
        <span class="status-pill">Static</span>
      </div>
      <div class="admin-table">
        ${mockSubmissions.map((submission) => `
          <article class="admin-row">
            <div>
              <strong>${submission.name}</strong>
              <span>${submission.submitter} · ${submission.category} · ${submission.rarity}</span>
            </div>
            <em>${submission.status}</em>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="glass-panel admin-panel">
      <span class="section-kicker">Approval Checklist</span>
      <h2 class="section-title">Before a card enters pulls</h2>
      <div class="admin-checklist">
        ${adminChecklist.map((item) => `<div>${item}</div>`).join('')}
      </div>
    </section>

    <section class="glass-panel admin-panel">
      <span class="section-kicker">Bindings</span>
      <h2 class="section-title">Future backend targets</h2>
      <div class="detail-list">
        <div class="detail-row"><span>D1</span><strong>${mockAdminStats.databaseBinding}</strong></div>
        <div class="detail-row"><span>R2</span><strong>${mockAdminStats.imageBucket}</strong></div>
      </div>
    </section>
  `;
}
