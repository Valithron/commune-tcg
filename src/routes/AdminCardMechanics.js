/* ============================================================================
   Admin Card Mechanics Route
   Repairs stale template stats without touching player-facing routes.
   ============================================================================ */

import { fetchJson, getApiRoutes } from '../services/apiClient.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function statLine(stats = {}) {
  return `POW ${escapeHtml(stats.pow ?? 1)} / DEF ${escapeHtml(stats.def ?? 1)} / SPD ${escapeHtml(stats.spd ?? 1)}`;
}

function renderMetric(label, value, tone = '') {
  return `
    <div class="quick-card${tone ? ` ${tone}` : ''}">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function renderTemplateRow(card) {
  return `
    <tr>
      <td>
        <strong>${escapeHtml(card.name || 'Unnamed Card')}</strong>
        <span>${escapeHtml(card.id || '')}</span>
      </td>
      <td><span class="status-pill admin-rarity-pill">${escapeHtml(card.rarity || 'common')}</span></td>
      <td>${escapeHtml(card.statArchetype || 'balanced')}</td>
      <td class="admin-number-cell">${escapeHtml(card.statBudget ?? 0)}</td>
      <td>${escapeHtml(statLine(card.stats))}</td>
      <td>${card.placeholder ? '<span class="status-pill">Needs repair</span>' : '<span class="empty-note">Healthy</span>'}</td>
    </tr>
  `;
}

function renderTemplateTable(payload) {
  const rows = payload.placeholderTemplates?.length ? payload.placeholderTemplates : payload.templates || [];

  return `
    <div class="glass-panel admin-card-table-panel">
      <div class="admin-card-table-toolbar">
        <div>
          <span class="section-kicker">Template Audit</span>
          <h2 class="section-title">${escapeHtml(rows.length)} shown</h2>
        </div>
        <span class="empty-note">Showing placeholder rows first. If none need repair, all template rows are shown.</span>
      </div>
      <div class="admin-card-table-scroll">
        <table class="admin-card-table">
          <thead>
            <tr>
              <th>Card</th>
              <th>Rarity</th>
              <th>Archetype</th>
              <th>Budget</th>
              <th>Stats</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody data-card-mechanics-table-body>
            ${rows.length ? rows.map(renderTemplateRow).join('') : '<tr><td colspan="6" class="empty-note">No template cards were found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderResultPanel(payload = null) {
  if (!payload) {
    return '<div class="empty-note" data-card-mechanics-result>Ready.</div>';
  }

  if (payload.action === 'clear_owned_copies') {
    return `<div class="empty-note" data-card-mechanics-result>Cleared ${escapeHtml(payload.deletedCount || 0)} owned pull copies.</div>`;
  }

  if (payload.repairedCount !== undefined) {
    return `<div class="empty-note" data-card-mechanics-result>Repaired ${escapeHtml(payload.repairedCount)} template card${payload.repairedCount === 1 ? '' : 's'}.</div>`;
  }

  return '<div class="empty-note" data-card-mechanics-result>Action finished.</div>';
}

async function loadMechanicsAudit() {
  const routes = getApiRoutes();
  return fetchJson(routes.adminCardMechanics);
}

export async function renderAdminCardMechanics() {
  let payload;

  try {
    payload = await loadMechanicsAudit();
  } catch (error) {
    return `
      <section class="hero-panel">
        <span class="section-kicker">Card Mechanics</span>
        <h2 class="hero-title">Repair tool unavailable.</h2>
        <p class="hero-copy">${escapeHtml(error.message)}</p>
        <div class="action-row"><a class="button button-secondary" href="#/admin">Admin Home</a></div>
      </section>
    `;
  }

  return `
    <section class="hero-panel">
      <span class="section-kicker">Admin Mechanics</span>
      <h2 class="hero-title">Repair template stats.</h2>
      <p class="hero-copy">Audit and reroll stale Library template stats. This targets unowned template rows only. Owned Vault copies can be cleared separately so future pulls inherit repaired stats.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/admin">Admin Home</a>
        <a class="button button-secondary" href="#/admin/cards">Card Editor</a>
      </div>
    </section>

    <section class="admin-card-mechanics" data-card-mechanics-tool>
      <div class="quick-grid admin-hub-grid" data-card-mechanics-metrics>
        ${renderMetric('Template cards', payload.templateCount ?? 0)}
        ${renderMetric('Placeholder stat rows', payload.placeholderCount ?? 0)}
        ${renderMetric('Healthy stat rows', payload.healthyCount ?? 0)}
        ${renderMetric('Owned copies', payload.ownedCopyCount ?? 0)}
      </div>

      <section class="glass-panel admin-panel">
        <span class="section-kicker">Actions</span>
        <h2 class="section-title">Controlled repair</h2>
        <div class="admin-checklist">
          <div>Repair placeholder stats: rerolls only missing or 1/1/1 template cards while preserving rarity.</div>
          <div>Reroll all template stats: rerolls every unowned Library template while preserving rarity.</div>
          <div>Clear owned copies: deletes current pulled Vault copies so fresh pulls inherit repaired template stats.</div>
        </div>
        <div class="action-row">
          <button class="button button-primary" type="button" data-card-mechanics-action="repair_placeholder_stats">Repair Placeholder Stats</button>
          <button class="button button-secondary" type="button" data-card-mechanics-action="reroll_all_template_stats">Reroll All Template Stats</button>
          <button class="button button-secondary admin-danger-button" type="button" data-card-mechanics-action="clear_owned_copies">Clear Owned Copies</button>
          <button class="button button-secondary" type="button" data-card-mechanics-action="audit">Refresh Audit</button>
        </div>
        ${renderResultPanel()}
      </section>

      <div data-card-mechanics-table>
        ${renderTemplateTable(payload)}
      </div>
    </section>
  `;
}

function renderAuditInto(root, payload, resultPayload = null) {
  const metrics = root.querySelector('[data-card-mechanics-metrics]');
  const table = root.querySelector('[data-card-mechanics-table]');
  const result = root.querySelector('[data-card-mechanics-result]');

  if (metrics) {
    metrics.innerHTML = [
      renderMetric('Template cards', payload.templateCount ?? 0),
      renderMetric('Placeholder stat rows', payload.placeholderCount ?? 0),
      renderMetric('Healthy stat rows', payload.healthyCount ?? 0),
      renderMetric('Owned copies', payload.ownedCopyCount ?? 0),
    ].join('');
  }

  if (table) {
    table.innerHTML = renderTemplateTable(payload);
  }

  if (result) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderResultPanel(resultPayload || payload);
    result.replaceWith(wrapper.firstElementChild);
  }
}

async function runMechanicsAction(root, action) {
  const routes = getApiRoutes();
  const destructive = action === 'clear_owned_copies' || action === 'reroll_all_template_stats';

  if (destructive) {
    const confirmation = action === 'clear_owned_copies'
      ? 'Clear owned Vault copies? This deletes pulled test copies, not templates.'
      : 'Reroll all template stats? This changes every Library template stat line.';

    if (!window.confirm(confirmation)) {
      return;
    }
  }

  const result = root.querySelector('[data-card-mechanics-result]');
  if (result) result.textContent = 'Running...';

  try {
    const actionPayload = await fetchJson(routes.adminCardMechanics, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const auditPayload = await fetchJson(routes.adminCardMechanics);
    renderAuditInto(root, auditPayload, actionPayload);
  } catch (error) {
    const current = root.querySelector('[data-card-mechanics-result]');
    if (current) current.textContent = error.message;
  }
}

export function initAdminCardMechanics(root) {
  const tool = root.querySelector('[data-card-mechanics-tool]');
  if (!tool) return;

  tool.addEventListener('click', (event) => {
    const button = event.target.closest('[data-card-mechanics-action]');
    if (!button) return;

    runMechanicsAction(root, button.dataset.cardMechanicsAction || 'audit');
  });
}
