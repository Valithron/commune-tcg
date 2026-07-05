/* ============================================================================
   Admin Dashboard Route
   Phase 4.5 responsibility: submission review queue inside isolated admin shell.
   Review transitions happen server-side.
   ============================================================================ */

import { mockAdminStats, mockSubmissions, adminChecklist } from '../data/mockAdmin.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatStatus(value) {
  return String(value || 'pending_review')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isReviewableStatus(value) {
  return ['pending_review', 'needs_changes'].includes(String(value || '').toLowerCase());
}

function mapBackendSubmission(submission) {
  return {
    id: submission.id,
    name: submission.cardName,
    submitter: submission.submitterDisplayName,
    category: submission.cardType,
    rarity: submission.raritySuggestion,
    moderationStatus: submission.moderationStatus,
    status: formatStatus(submission.moderationStatus),
    source: 'backend',
  };
}

function mapMockSubmission(submission) {
  return {
    ...submission,
    source: 'mock',
  };
}

async function loadAdminSubmissions() {
  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(routes.adminSubmissions);

    if (!payload?.ok || !Array.isArray(payload.submissions)) {
      return {
        submissions: mockSubmissions.map(mapMockSubmission),
        source: 'mock',
        warnings: payload?.warnings || ['No backend submissions were returned.'],
      };
    }

    return {
      submissions: payload.submissions.map(mapBackendSubmission),
      source: 'backend',
      warnings: payload.warnings || [],
    };
  } catch (error) {
    return {
      submissions: mockSubmissions.map(mapMockSubmission),
      source: 'mock',
      warnings: [error.message],
    };
  }
}

function renderSubmissionRow(submission) {
  const content = `
    <div>
      <strong>${escapeHtml(submission.name)}</strong>
      <span>${escapeHtml(submission.submitter)} · ${escapeHtml(submission.category)} · ${escapeHtml(submission.rarity)}</span>
    </div>
    <em>${escapeHtml(submission.status)}</em>
  `;

  if (submission.source !== 'backend') {
    return `<article class="admin-row">${content}</article>`;
  }

  return `<a class="admin-row" href="#/admin/submission/${encodeURIComponent(submission.id)}">${content}</a>`;
}

export async function renderAdminDashboard() {
  const queue = await loadAdminSubmissions();
  const sourceLabel = queue.source === 'backend' ? 'Live Queue' : 'Mock Queue fallback';
  const pendingCount = queue.source === 'backend'
    ? queue.submissions.filter((submission) => isReviewableStatus(submission.moderationStatus)).length
    : mockAdminStats.pendingSubmissions;

  return `
    <section class="hero-panel">
      <span class="section-kicker">Admin Submissions</span>
      <h2 class="hero-title">Control the pool.</h2>
      <p class="hero-copy">The moderation queue reads submitted cards. Review tools live inside the isolated admin shell and do not link back into player routes.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/admin">Admin Home</a>
        <a class="button button-secondary" href="#/admin/backend">Backend Status</a>
        <a class="button button-secondary" href="#/admin/inventory">Inventory</a>
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
        <div class="stat-panel"><span class="stat-label">Pending</span><span class="stat-value">${pendingCount}</span></div>
        <div class="stat-panel"><span class="stat-label">Fights</span><span class="stat-value">${mockAdminStats.encounters}</span></div>
      </div>
    </section>

    <div class="empty-note">Source: ${sourceLabel}</div>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Moderation</span>
          <h2 class="section-title">Submission Queue</h2>
        </div>
        <span class="status-pill">${escapeHtml(sourceLabel)}</span>
      </div>
      <div class="admin-table">
        ${queue.submissions.length ? queue.submissions.map(renderSubmissionRow).join('') : '<div class="empty-note">No submitted cards yet.</div>'}
      </div>
    </section>

    <section class="glass-panel admin-panel">
      <span class="section-kicker">Approval Checklist</span>
      <h2 class="section-title">Before a card enters pulls</h2>
      <div class="admin-checklist">
        ${adminChecklist.map((item) => `<div>${escapeHtml(item)}</div>`).join('')}
      </div>
    </section>

    <section class="glass-panel admin-panel">
      <span class="section-kicker">Bindings</span>
      <h2 class="section-title">Backend targets</h2>
      <div class="detail-list">
        <div class="detail-row"><span>D1</span><strong>card_submissions</strong></div>
        <div class="detail-row"><span>R2</span><strong>${mockAdminStats.imageBucket}</strong></div>
      </div>
    </section>
  `;
}
