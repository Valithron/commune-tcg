/* ============================================================================
   Admin Card Mechanics Route
   Repairs stale template stats and provides a no-write mechanics simulator.
   ============================================================================ */

import { fetchJson, getApiRoutes } from '../services/apiClient.js';

const rarityConfig = {
  common: { label: 'Common', staticBudget: 30, ownedMin: 28, ownedMax: 32, maxLevel: 30, growthPerLevel: 2, originBonusPercent: 0 },
  uncommon: { label: 'Uncommon', staticBudget: 44, ownedMin: 41, ownedMax: 47, maxLevel: 40, growthPerLevel: 3, originBonusPercent: 3 },
  rare: { label: 'Rare', staticBudget: 63, ownedMin: 59, ownedMax: 67, maxLevel: 50, growthPerLevel: 4, originBonusPercent: 5 },
  legendary: { label: 'Legendary', staticBudget: 71, ownedMin: 66, ownedMax: 76, maxLevel: 60, growthPerLevel: 5, originBonusPercent: 7 },
  mythic: { label: 'Mythic', staticBudget: 80, ownedMin: 74, ownedMax: 86, maxLevel: 70, growthPerLevel: 6, originBonusPercent: 10 },
};

const typeConfig = {
  flame: { label: 'Flame', weights: { pow: 1.10, def: 0.95, spd: 1.00 } },
  tide: { label: 'Tide', weights: { pow: 1.00, def: 1.05, spd: 1.05 } },
  bloom: { label: 'Bloom', weights: { pow: 1.00, def: 1.10, spd: 0.95 } },
  volt: { label: 'Volt', weights: { pow: 1.05, def: 0.95, spd: 1.10 } },
  shadow: { label: 'Shadow', weights: { pow: 1.00, def: 1.10, spd: 0.95 } },
  radiant: { label: 'Radiant', weights: { pow: 1.05, def: 1.05, spd: 1.00 } },
  neutral: { label: 'Neutral', weights: { pow: 1.00, def: 1.00, spd: 1.00 } },
};

const rarityOrder = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];

const matchupChart = {
  flame: { flame: 'neutral', tide: 'disadvantage', bloom: 'advantage', volt: 'neutral', shadow: 'advantage', radiant: 'disadvantage', neutral: 'neutral' },
  tide: { flame: 'advantage', tide: 'neutral', bloom: 'disadvantage', volt: 'disadvantage', shadow: 'neutral', radiant: 'advantage', neutral: 'neutral' },
  bloom: { flame: 'disadvantage', tide: 'advantage', bloom: 'neutral', volt: 'advantage', shadow: 'disadvantage', radiant: 'neutral', neutral: 'neutral' },
  volt: { flame: 'neutral', tide: 'advantage', bloom: 'disadvantage', volt: 'neutral', shadow: 'disadvantage', radiant: 'advantage', neutral: 'neutral' },
  shadow: { flame: 'disadvantage', tide: 'neutral', bloom: 'advantage', volt: 'advantage', shadow: 'neutral', radiant: 'disadvantage', neutral: 'neutral' },
  radiant: { flame: 'advantage', tide: 'disadvantage', bloom: 'neutral', volt: 'disadvantage', shadow: 'advantage', radiant: 'neutral', neutral: 'neutral' },
  neutral: { flame: 'neutral', tide: 'neutral', bloom: 'neutral', volt: 'neutral', shadow: 'neutral', radiant: 'neutral', neutral: 'neutral' },
};

const matchupModifiers = { advantage: 0.15, disadvantage: -0.05, neutral: 0 };

function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function toNumber(value, fallback) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function clamp(value, min, max) { return Math.min(Math.max(Number(value) || 0, min), max); }
function titleCase(value) { return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function statLine(stats = {}) { return `POW ${escapeHtml(stats.pow ?? 1)} / DEF ${escapeHtml(stats.def ?? 1)} / SPD ${escapeHtml(stats.spd ?? 1)}`; }
function optionList(options, selectedValue) { return options.map(([value, label]) => `<option value="${escapeHtml(value)}"${String(value) === String(selectedValue) ? ' selected' : ''}>${escapeHtml(label)}</option>`).join(''); }
function typeOptions(selectedValue = 'neutral') { return optionList(Object.entries(typeConfig).map(([value, config]) => [value, config.label]), selectedValue); }
function rarityOptions(selectedValue = 'rare') { return optionList(Object.entries(rarityConfig).map(([value, config]) => [value, config.label]), selectedValue); }
function formatRaritySpread(spread = {}) { return rarityOrder.map((rarity) => `${rarityConfig[rarity].label} ${Number(spread[rarity] || 0)}`).join(' / '); }
function renderMetric(label, value, tone = '') { return `<div class="quick-card${tone ? ` ${tone}` : ''}"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`; }
function renderMetrics(payload = {}) { return [renderMetric('Template cards', payload.templateCount ?? 0), renderMetric('Current spread', formatRaritySpread(payload.byRarity)), renderMetric('Founder target', formatRaritySpread(payload.founderPoolTarget)), renderMetric('Owned copies', payload.ownedCopyCount ?? 0)].join(''); }

function allocateStats(totalBudget, type) {
  const budget = Math.max(3, Math.round(Number(totalBudget) || 3));
  const weights = typeConfig[type]?.weights || typeConfig.neutral.weights;
  const weightTotal = weights.pow + weights.def + weights.spd;
  const raw = {
    pow: budget * weights.pow / weightTotal,
    def: budget * weights.def / weightTotal,
    spd: budget * weights.spd / weightTotal,
  };
  const stats = { pow: Math.max(1, Math.floor(raw.pow)), def: Math.max(1, Math.floor(raw.def)), spd: Math.max(1, Math.floor(raw.spd)) };
  let remainder = budget - stats.pow - stats.def - stats.spd;
  const order = ['pow', 'def', 'spd'].sort((a, b) => (raw[b] - Math.floor(raw[b])) - (raw[a] - Math.floor(raw[a])));
  let index = 0;
  while (remainder > 0) { stats[order[index % order.length]] += 1; remainder -= 1; index += 1; }
  while (remainder < 0) { const key = order[index % order.length]; if (stats[key] > 1) { stats[key] -= 1; remainder += 1; } index += 1; if (index > 20) break; }
  return stats;
}

function levelBonus(level, growthPerLevel, maxLevel) {
  const safeLevel = Math.max(1, Math.min(Math.round(Number(level) || 1), Math.round(Number(maxLevel) || 1)));
  const totalGrowth = Math.max(0, safeLevel - 1) * Math.max(0, Math.round(Number(growthPerLevel) || 0));
  const each = Math.floor(totalGrowth / 3);
  const remainder = totalGrowth - each * 3;
  return { pow: each + (remainder > 0 ? 1 : 0), def: each + (remainder > 1 ? 1 : 0), spd: each };
}

function calculateSimulation(values) {
  const rarity = rarityConfig[values.rarity] ? values.rarity : 'rare';
  const type = typeConfig[values.type] ? values.type : 'neutral';
  const enemyType = typeConfig[values.enemyType] ? values.enemyType : 'neutral';
  const config = rarityConfig[rarity];
  const budget = Math.round(toNumber(values.budget, config.staticBudget));
  const maxLevel = Math.round(toNumber(values.maxLevel, config.maxLevel));
  const growthPerLevel = Math.round(toNumber(values.growthPerLevel, config.growthPerLevel));
  const level = clamp(values.level, 1, maxLevel);
  const originBonusPercent = Math.max(0, toNumber(values.originBonusPercent, config.originBonusPercent));
  const baseStats = allocateStats(budget, type);
  const growth = levelBonus(level, growthPerLevel, maxLevel);
  const originMultiplier = 1 + originBonusPercent / 100;
  const effectiveStats = {
    pow: Math.round((baseStats.pow + growth.pow) * originMultiplier),
    def: Math.round((baseStats.def + growth.def) * originMultiplier),
    spd: Math.round((baseStats.spd + growth.spd) * originMultiplier),
  };
  const baseBattlePower = effectiveStats.pow + effectiveStats.def + effectiveStats.spd;
  const matchupResult = matchupChart[type]?.[enemyType] || 'neutral';
  const matchupModifier = matchupModifiers[matchupResult] || 0;
  const adjustedBattlePower = Math.round(baseBattlePower * (1 + matchupModifier));
  return { rarity, type, enemyType, budget, maxLevel, growthPerLevel, level, originBonusPercent, baseStats, growth, effectiveStats, baseBattlePower, matchupResult, matchupModifier, adjustedBattlePower };
}

function renderSimulatorResults(sim) {
  return `
    <div class="quick-grid admin-hub-grid">
      ${renderMetric('Base stats', statLine(sim.baseStats))}
      ${renderMetric('Level growth', statLine(sim.growth))}
      ${renderMetric('Effective stats', statLine(sim.effectiveStats), 'is-live')}
      ${renderMetric('Battle power', `${sim.baseBattlePower} → ${sim.adjustedBattlePower}`)}
    </div>
    <div class="admin-checklist">
      <div><strong>${escapeHtml(typeConfig[sim.type].label)}</strong> into <strong>${escapeHtml(typeConfig[sim.enemyType].label)}</strong>: ${escapeHtml(titleCase(sim.matchupResult))} (${sim.matchupModifier > 0 ? '+' : ''}${Math.round(sim.matchupModifier * 100)}%).</div>
      <div>Rarity config: ${escapeHtml(rarityConfig[sim.rarity].label)} · budget ${escapeHtml(sim.budget)} · max level ${escapeHtml(sim.maxLevel)} · growth ${escapeHtml(sim.growthPerLevel)} · origin +${escapeHtml(sim.originBonusPercent)}%.</div>
      <div>Battle currently compares matchup-adjusted squad power against encounter enemy power. Ability effects are still not included.</div>
    </div>
  `;
}

function readSimulatorValues(root) {
  const sim = root.querySelector('[data-mechanics-simulator]');
  return {
    rarity: sim?.querySelector('[name="sim_rarity"]')?.value || 'rare',
    type: sim?.querySelector('[name="sim_type"]')?.value || 'neutral',
    enemyType: sim?.querySelector('[name="sim_enemy_type"]')?.value || 'neutral',
    budget: sim?.querySelector('[name="sim_budget"]')?.value,
    level: sim?.querySelector('[name="sim_level"]')?.value,
    maxLevel: sim?.querySelector('[name="sim_max_level"]')?.value,
    growthPerLevel: sim?.querySelector('[name="sim_growth"]')?.value,
    originBonusPercent: sim?.querySelector('[name="sim_origin_bonus"]')?.value,
  };
}

function renderTemplateRow(card) {
  return `
    <tr data-founder-rarity-row data-card-id="${escapeHtml(card.id || '')}">
      <td><strong>${escapeHtml(card.name || 'Unnamed Card')}</strong><span>${escapeHtml(card.id || '')}</span></td>
      <td><select name="founder_rarity" data-founder-rarity-select>${rarityOptions(card.rarity || 'common')}</select></td>
      <td>${escapeHtml(card.type || card.statArchetype || 'neutral')}</td>
      <td>${escapeHtml(card.creatorDisplayName || 'Unknown')}</td>
      <td class="admin-number-cell">${escapeHtml(card.statBudget ?? 0)}</td>
      <td>${escapeHtml(statLine(card.stats))}</td>
      <td>${card.placeholder ? '<span class="status-pill">Needs repair</span>' : '<span class="empty-note">Healthy</span>'}</td>
    </tr>
  `;
}

function renderTemplateTable(payload) {
  const rows = payload.templates || [];
  return `
    <div class="glass-panel admin-card-table-panel">
      <div class="admin-card-table-toolbar">
        <div><span class="section-kicker">Founder Pool Curation</span><h2 class="section-title">${escapeHtml(rows.length)} template cards</h2></div>
        <span class="empty-note">Select final rarity per template, then apply once. This touches unowned Library templates only.</span>
      </div>
      <div class="admin-card-table-scroll">
        <table class="admin-card-table">
          <thead><tr><th>Card</th><th>Founder Rarity</th><th>Type</th><th>Creator</th><th>Budget</th><th>Stats</th><th>Status</th></tr></thead>
          <tbody data-card-mechanics-table-body>${rows.length ? rows.map(renderTemplateRow).join('') : '<tr><td colspan="7" class="empty-note">No template cards were found.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderResultPanel(payload = null) {
  if (!payload) return '<div class="empty-note" data-card-mechanics-result>Ready.</div>';
  if (payload.action === 'clear_owned_copies') return `<div class="empty-note" data-card-mechanics-result>Cleared ${escapeHtml(payload.deletedCount || 0)} owned pull copies.</div>`;
  if (payload.action === 'apply_founder_pool_rarities') return `<div class="empty-note" data-card-mechanics-result>Applied Founder Pool rarities to ${escapeHtml(payload.updatedCount || 0)} templates. Spread: ${escapeHtml(formatRaritySpread(payload.byRarity))}.${payload.resetOwnedCopies ? ` Cleared ${escapeHtml(payload.deletedOwnedCopies || 0)} owned test copies.` : ''}</div>`;
  if (payload.repairedCount !== undefined) return `<div class="empty-note" data-card-mechanics-result>Repaired ${escapeHtml(payload.repairedCount)} template card${payload.repairedCount === 1 ? '' : 's'}.</div>`;
  return '<div class="empty-note" data-card-mechanics-result>Action finished.</div>';
}

function renderFounderRarityTool(payload) {
  return `
    <section class="glass-panel admin-panel" data-founder-rarity-tool>
      <span class="section-kicker">One-time Founder Pool cleanup</span>
      <h2 class="section-title">Manual rarity assignment</h2>
      <div class="admin-checklist">
        <div>Target spread for this pool: <strong>${escapeHtml(formatRaritySpread(payload.founderPoolTarget))}</strong>.</div>
        <div>Current selected spread: <strong data-founder-selected-spread>${escapeHtml(formatRaritySpread(payload.byRarity))}</strong>.</div>
        <div>Applying recomputes template rarity, static budget, pull-time budget range, level cap, growth, origin bonus, base stats, and legacy pow/def/spd fields.</div>
      </div>
      <label class="admin-inline-check"><input type="checkbox" data-founder-reset-owned /> Clear owned test copies after applying</label>
      <div class="action-row"><button class="button button-primary" type="button" data-founder-rarity-apply>Apply Selected Founder Rarities</button></div>
    </section>
  `;
}

async function loadMechanicsAudit() { const routes = getApiRoutes(); return fetchJson(routes.adminCardMechanics); }

function renderSimulator() {
  const defaults = calculateSimulation({ rarity: 'rare', type: 'radiant', enemyType: 'shadow', budget: 63, level: 1, maxLevel: 50, growthPerLevel: 4, originBonusPercent: 5 });
  return `
    <section class="glass-panel admin-panel" data-mechanics-simulator>
      <span class="section-kicker">Phase 7 Simulator</span>
      <h2 class="section-title">Mechanics math preview</h2>
      <p class="hero-copy">No-write simulator for rarity budget, type bias, level growth, origin bonus, effective stats, and battle matchup power.</p>
      <div class="admin-card-editor-grid">
        <label><span>Rarity</span><select name="sim_rarity">${rarityOptions('rare')}</select></label>
        <label><span>Type</span><select name="sim_type">${typeOptions('radiant')}</select></label>
        <label><span>Enemy Type</span><select name="sim_enemy_type">${typeOptions('shadow')}</select></label>
        <label><span>Stat Budget</span><input name="sim_budget" type="number" min="3" max="200" value="63" /></label>
        <label><span>Level</span><input name="sim_level" type="number" min="1" max="70" value="1" /></label>
        <label><span>Max Level</span><input name="sim_max_level" type="number" min="1" max="100" value="50" /></label>
        <label><span>Growth / Level</span><input name="sim_growth" type="number" min="0" max="20" value="4" /></label>
        <label><span>Origin Bonus %</span><input name="sim_origin_bonus" type="number" min="0" max="100" value="5" /></label>
      </div>
      <div class="action-row"><button class="button button-secondary" type="button" data-sim-apply-rarity>Use Rarity Defaults</button></div>
      <div data-mechanics-simulator-result>${renderSimulatorResults(defaults)}</div>
    </section>
  `;
}

export async function renderAdminCardMechanics() {
  let payload;
  try { payload = await loadMechanicsAudit(); } catch (error) { return `<section class="hero-panel"><span class="section-kicker">Card Mechanics</span><h2 class="hero-title">Repair tool unavailable.</h2><p class="hero-copy">${escapeHtml(error.message)}</p><div class="action-row"><a class="button button-secondary" href="#/admin">Admin Home</a></div></section>`; }
  return `
    <section class="hero-panel"><span class="section-kicker">Admin Mechanics</span><h2 class="hero-title">Simulate, repair, and seed card mechanics.</h2><p class="hero-copy">Use this during pre-launch inventory to curate Founder Pool rarity, repair stale template stats, and clear distorted test pulls.</p><div class="action-row"><a class="button button-secondary" href="#/admin">Admin Home</a><a class="button button-secondary" href="#/admin/cards">Card Editor</a></div></section>
    <section class="admin-card-mechanics" data-card-mechanics-tool>
      <div class="quick-grid admin-hub-grid" data-card-mechanics-metrics>${renderMetrics(payload)}</div>
      ${renderFounderRarityTool(payload)}
      ${renderSimulator()}
      <section class="glass-panel admin-panel"><span class="section-kicker">Actions</span><h2 class="section-title">Controlled repair</h2><div class="admin-checklist"><div>Repair placeholder stats: rerolls only missing or 1/1/1 template cards while preserving rarity.</div><div>Reroll all template stats: rerolls every unowned Library template while preserving rarity.</div><div>Clear owned copies: deletes current pulled Vault copies so fresh pulls inherit repaired template stats.</div></div><div class="action-row"><button class="button button-primary" type="button" data-card-mechanics-action="repair_placeholder_stats">Repair Placeholder Stats</button><button class="button button-secondary" type="button" data-card-mechanics-action="reroll_all_template_stats">Reroll All Template Stats</button><button class="button button-secondary admin-danger-button" type="button" data-card-mechanics-action="clear_owned_copies">Clear Owned Copies</button><button class="button button-secondary" type="button" data-card-mechanics-action="audit">Refresh Audit</button></div>${renderResultPanel()}</section>
      <div data-card-mechanics-table>${renderTemplateTable(payload)}</div>
    </section>
  `;
}

function renderAuditInto(root, payload, resultPayload = null) {
  const metrics = root.querySelector('[data-card-mechanics-metrics]');
  const table = root.querySelector('[data-card-mechanics-table]');
  const result = root.querySelector('[data-card-mechanics-result]');
  const spread = root.querySelector('[data-founder-selected-spread]');
  if (metrics) metrics.innerHTML = renderMetrics(payload);
  if (table) table.innerHTML = renderTemplateTable(payload);
  if (spread) spread.textContent = formatRaritySpread(payload.byRarity);
  if (result) { const wrapper = document.createElement('div'); wrapper.innerHTML = renderResultPanel(resultPayload || payload); result.replaceWith(wrapper.firstElementChild); }
}

function updateSimulator(root) { const target = root.querySelector('[data-mechanics-simulator-result]'); if (!target) return; target.innerHTML = renderSimulatorResults(calculateSimulation(readSimulatorValues(root))); }
function applyRarityDefaults(root) {
  const sim = root.querySelector('[data-mechanics-simulator]');
  if (!sim) return;
  const rarity = sim.querySelector('[name="sim_rarity"]')?.value || 'rare';
  const config = rarityConfig[rarity] || rarityConfig.rare;
  sim.querySelector('[name="sim_budget"]').value = String(config.staticBudget);
  sim.querySelector('[name="sim_level"]').value = '1';
  sim.querySelector('[name="sim_max_level"]').value = String(config.maxLevel);
  sim.querySelector('[name="sim_growth"]').value = String(config.growthPerLevel);
  sim.querySelector('[name="sim_origin_bonus"]').value = String(config.originBonusPercent);
  updateSimulator(root);
}

function readFounderAssignments(root) {
  return Array.from(root.querySelectorAll('[data-founder-rarity-row]')).map((row) => ({
    id: row.dataset.cardId || '',
    rarity: row.querySelector('[data-founder-rarity-select]')?.value || 'common',
  })).filter((entry) => entry.id);
}

function selectedFounderSpread(root) {
  return readFounderAssignments(root).reduce((spread, entry) => {
    spread[entry.rarity] = (spread[entry.rarity] || 0) + 1;
    return spread;
  }, {});
}

function updateFounderSpread(root) {
  const target = root.querySelector('[data-founder-selected-spread]');
  if (target) target.textContent = formatRaritySpread(selectedFounderSpread(root));
}

async function runFounderApply(root) {
  const assignments = readFounderAssignments(root);
  const resetOwnedCopies = root.querySelector('[data-founder-reset-owned]')?.checked === true;
  if (!assignments.length) return;
  const confirmation = `Apply selected Founder Pool rarities to ${assignments.length} templates?${resetOwnedCopies ? ' This will also clear owned test copies.' : ''}`;
  if (!window.confirm(confirmation)) return;
  const routes = getApiRoutes();
  const result = root.querySelector('[data-card-mechanics-result]');
  if (result) result.textContent = 'Applying Founder Pool rarities...';
  try {
    const actionPayload = await fetchJson(routes.adminCardMechanics, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'apply_founder_pool_rarities', assignments, resetOwnedCopies }) });
    const auditPayload = await fetchJson(routes.adminCardMechanics);
    renderAuditInto(root, auditPayload, actionPayload);
  } catch (error) {
    const current = root.querySelector('[data-card-mechanics-result]');
    if (current) current.textContent = error.message;
  }
}

async function runMechanicsAction(root, action) {
  const routes = getApiRoutes();
  const destructive = action === 'clear_owned_copies' || action === 'reroll_all_template_stats';
  if (destructive) { const confirmation = action === 'clear_owned_copies' ? 'Clear owned Vault copies? This deletes pulled test copies, not templates.' : 'Reroll all template stats? This changes every Library template stat line.'; if (!window.confirm(confirmation)) return; }
  const result = root.querySelector('[data-card-mechanics-result]');
  if (result) result.textContent = 'Running...';
  try { const actionPayload = await fetchJson(routes.adminCardMechanics, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action }) }); const auditPayload = await fetchJson(routes.adminCardMechanics); renderAuditInto(root, auditPayload, actionPayload); } catch (error) { const current = root.querySelector('[data-card-mechanics-result]'); if (current) current.textContent = error.message; }
}

export function initAdminCardMechanics(root) {
  const tool = root.querySelector('[data-card-mechanics-tool]');
  if (!tool) return;
  updateSimulator(root);
  updateFounderSpread(root);
  tool.addEventListener('click', (event) => { const resetButton = event.target.closest('[data-sim-apply-rarity]'); if (resetButton) { applyRarityDefaults(root); return; } const founderButton = event.target.closest('[data-founder-rarity-apply]'); if (founderButton) { runFounderApply(root); return; } const button = event.target.closest('[data-card-mechanics-action]'); if (!button) return; runMechanicsAction(root, button.dataset.cardMechanicsAction || 'audit'); });
  tool.addEventListener('input', (event) => { if (event.target.closest('[data-mechanics-simulator]')) updateSimulator(root); if (event.target.closest('[data-founder-rarity-select]')) updateFounderSpread(root); });
  tool.addEventListener('change', (event) => { if (event.target.closest('[data-mechanics-simulator]')) updateSimulator(root); if (event.target.closest('[data-founder-rarity-select]')) updateFounderSpread(root); });
}
