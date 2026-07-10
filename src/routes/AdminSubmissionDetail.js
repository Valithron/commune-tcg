/* ============================================================================
   Admin Submission Detail Route
   Review submitted cards, including weighted pull-time type pools.
   ============================================================================ */

import { renderCardFrame } from '../components/CardFrame.js';
import { escapeHtml, titleCase } from '../components/format.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';

const rarityOptions = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];
const typeOptions = ['flame', 'tide', 'bloom', 'volt', 'shadow', 'radiant', 'neutral'];

function formatStatus(value) { return titleCase(String(value || 'pending_review').replaceAll('_', ' ')); }
function formatBytes(value) { const bytes = Number(value || 0); if (!Number.isFinite(bytes) || bytes <= 0) return 'Unknown'; if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`; return `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
function normalizeRarity(value, fallback = 'rare') { const rarity = String(value || fallback).trim().toLowerCase(); return rarityOptions.includes(rarity) ? rarity : fallback; }
function normalizeType(value, fallback = 'neutral') { const type = String(value || fallback).trim().toLowerCase(); return typeOptions.includes(type) ? type : fallback; }
function normalizeTypePool(value, fallback = ['neutral']) { const raw = Array.isArray(value) && value.length ? value : fallback; const normalized = []; raw.forEach((item) => { const type = normalizeType(item, ''); if (type && !normalized.includes(type)) normalized.push(type); }); return normalized.length ? normalized : ['neutral']; }
function formatTypePool(pool) { return normalizeTypePool(pool).map(titleCase).join(', '); }
function formatRarityReview(value) { return String(value || 'random') === 'random' ? 'Random on approval' : titleCase(value); }
function isReviewable(submission) { return ['pending_review', 'needs_changes'].includes(submission.moderationStatus); }
function getPayloadError(payload, response) { const parts = [payload?.error, payload?.detail].filter(Boolean); return parts.join(': ') || `Review action failed with ${response.status}`; }
function getCreatorDisplayName(submission) { return String(submission.creatorDisplayName || submission.creatorDisplayNameOverride || submission.submitterDisplayName || submission.submitterUserId || 'Unknown').trim(); }

function normalizeOdds(submission) {
  const existing = Array.isArray(submission.approvedTypeOdds) ? submission.approvedTypeOdds : [];
  if (existing.length) {
    const map = new Map(existing.map((entry) => [normalizeType(entry.type, ''), Number(entry.weight ?? entry.percent ?? entry.probability ?? 0)]));
    return typeOptions.map((type) => ({ type, weight: Math.max(0, Number(map.get(type) || 0)) }));
  }
  const pool = normalizeTypePool(submission.approvedTypePool?.length ? submission.approvedTypePool : submission.typeSuggestions || [submission.cardType]);
  const equal = Number((100 / pool.length).toFixed(2));
  return typeOptions.map((type) => ({ type, weight: pool.includes(type) ? equal : 0 }));
}

function submissionToPreviewCard(submission) {
  const type = normalizeTypePool(submission.typeSuggestions || [submission.cardType])[0];
  return {
    id: submission.id, name: submission.cardName, cid: submission.characterId,
    character: submission.characterId, characterId: submission.characterId,
    type, cardType: type, category: titleCase(type),
    rarity: submission.raritySuggestion === 'random' ? 'rare' : submission.raritySuggestion,
    symbol: '◆', ability: submission.abilityText || '', abilityIcon: '✦',
    stats: { pow: '?', def: '?', spd: '?' }, owned: false, level: 1, copies: 0,
    flavor: submission.flavorText, imageKey: submission.imageKey, imageUrl: submission.imageUrl, crop: submission.cropJson,
  };
}

function renderDetailRow(label, value) { return `<div class="detail-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || 'Not set')}</strong></div>`; }
function renderRarityOptions(selected, includeRoll = false) { const options = includeRoll ? ['roll', ...rarityOptions] : rarityOptions; return options.map((rarity) => `<option value="${escapeHtml(rarity)}"${rarity === selected ? ' selected' : ''}>${escapeHtml(rarity === 'roll' ? 'Roll from target' : titleCase(rarity))}</option>`).join(''); }
function renderTypeOddsEditor(submission) {
  return normalizeOdds(submission).map(({ type, weight }) => `
    <label class="admin-type-odds-row">
      <span>${escapeHtml(titleCase(type))}</span>
      <input data-review-type-weight data-type="${escapeHtml(type)}" type="number" min="0" max="100" step="0.01" value="${escapeHtml(weight)}" />
      <small>% weight</small>
    </label>
  `).join('');
}
function formatOdds(odds) { return Array.isArray(odds) && odds.length ? odds.map((entry) => `${titleCase(entry.type)} ${Number(entry.weight).toFixed(1)}%`).join(', ') : 'Not approved'; }

function renderReviewControls(submission) {
  if (!isReviewable(submission)) {
    return `<section class="glass-panel admin-panel"><span class="section-kicker">Review Closed</span><h2 class="section-title">${escapeHtml(formatStatus(submission.moderationStatus))}</h2><p class="hero-copy">This submission is no longer in a reviewable state. Creator and type editing are pre-approval only for now.</p></section>`;
  }
  const creatorDisplayName = getCreatorDisplayName(submission);
  const suggestedTarget = normalizeRarity(submission.raritySuggestion, 'rare');
  return `
    <section class="glass-panel admin-panel admin-card-editor-form" data-submission-review-panel data-submission-id="${escapeHtml(submission.id)}">
      <span class="section-kicker">Review Actions</span>
      <h2 class="section-title">Server-owned review</h2>
      <p class="hero-copy">Set a weight above zero to include a type. Zero removes it. Weights are normalized automatically and govern pull-time type rolls.</p>
      <label class="review-notes-label"><span>Creator</span><input data-review-creator maxlength="120" value="${escapeHtml(creatorDisplayName)}" /></label>
      <fieldset class="review-notes-label">
        <legend>Approved Type Odds</legend>
        <div class="admin-type-odds-grid">${renderTypeOddsEditor(submission)}</div>
        <div class="empty-note" data-type-odds-total></div>
      </fieldset>
      <label class="review-notes-label"><span>Approval Roll Target</span><select data-review-target-rarity>${renderRarityOptions(suggestedTarget)}</select></label>
      <label class="review-notes-label"><span>Final Rarity Override</span><select data-review-final-rarity>${renderRarityOptions('roll', true)}</select></label>
      <label class="review-notes-label"><span>Review Notes</span><textarea data-review-notes maxlength="500"></textarea></label>
      <div class="action-row">
        <button class="button button-primary" type="button" data-review-action="approve">Approve to Library</button>
        <button class="button button-secondary" type="button" data-review-action="needs_changes">Needs Changes</button>
        <button class="button button-secondary" type="button" data-review-action="reject">Reject</button>
      </div>
      <div class="empty-note" data-review-status>Ready for review action.</div>
    </section>
  `;
}

async function loadSubmission(submissionId) {
  const routes = getApiRoutes();
  const payload = await fetchJson(routes.adminSubmission + '?id=' + encodeURIComponent(submissionId));
  if (!payload?.ok || !payload.submission) throw new Error(payload?.error || 'Submission detail was not returned.');
  return payload.submission;
}

export async function renderAdminSubmissionDetail({ params }) {
  try {
    const submission = await loadSubmission(params.submissionId);
    const previewCard = submissionToPreviewCard(submission);
    const suggestedPool = normalizeTypePool(submission.typeSuggestions || [submission.cardType]);
    return `
      <section class="hero-panel"><span class="section-kicker">Admin Review</span><h2 class="hero-title">Submission Detail</h2><p class="hero-copy">Approve a weighted type pool for pull-time owned-card type and stat allocation.</p><div class="action-row"><a class="button button-secondary" href="#/admin">Back to Admin</a><a class="button button-secondary" href="${escapeHtml(submission.imageUrl)}" target="_blank" rel="noreferrer">Open Image</a></div></section>
      <section class="detail-layout">
        <div class="detail-card-stage">${renderCardFrame(previewCard, { density: 'showcase', context: 'library', showOwnership: false, showStats: false })}</div>
        <article class="detail-panel"><span class="section-kicker">${escapeHtml(formatStatus(submission.moderationStatus))}</span><h2 class="detail-title">${escapeHtml(submission.cardName)}</h2><div class="detail-list">
          ${renderDetailRow('Status', formatStatus(submission.moderationStatus))}
          ${renderDetailRow('Approved Card ID', submission.approvedCardId || 'Not approved')}
          ${renderDetailRow('Submitter', submission.submitterDisplayName)}
          ${renderDetailRow('Creator', getCreatorDisplayName(submission))}
          ${renderDetailRow('Character', titleCase(submission.characterId))}
          ${renderDetailRow('Suggested Type Pool', formatTypePool(suggestedPool))}
          ${renderDetailRow('Approved Type Odds', formatOdds(submission.approvedTypeOdds))}
          ${renderDetailRow('Target Rarity', formatRarityReview(submission.raritySuggestion))}
          ${renderDetailRow('Flavor', submission.flavorText)}
          ${renderDetailRow('Review Notes', submission.reviewNotes || 'None')}
          ${renderDetailRow('Image Key', submission.imageKey)}
          ${renderDetailRow('Created', submission.createdAt)}
        </div></article>
      </section>
      ${renderReviewControls(submission)}
    `;
  } catch (error) {
    return `<section class="hero-panel"><h2 class="hero-title">Submission not found.</h2><p class="hero-copy">${escapeHtml(error.message)}</p></section>`;
  }
}

export function initAdminSubmissionDetail(root) {
  const panel = root.querySelector('[data-submission-review-panel]');
  if (!panel) return;
  const status = panel.querySelector('[data-review-status]');
  const notes = panel.querySelector('[data-review-notes]');
  const creator = panel.querySelector('[data-review-creator]');
  const targetRarity = panel.querySelector('[data-review-target-rarity]');
  const finalRarity = panel.querySelector('[data-review-final-rarity]');
  const weightInputs = [...panel.querySelectorAll('[data-review-type-weight]')];
  const totalLabel = panel.querySelector('[data-type-odds-total]');

  const readOdds = () => weightInputs.map((input) => ({ type: input.dataset.type, weight: Math.max(0, Number(input.value) || 0) })).filter((entry) => entry.weight > 0);
  const updateTotal = () => { const total = readOdds().reduce((sum, entry) => sum + entry.weight, 0); if (totalLabel) totalLabel.textContent = `Entered weight total: ${total.toFixed(2)}. Saved odds will normalize to 100%.`; };
  weightInputs.forEach((input) => input.addEventListener('input', updateTotal));
  updateTotal();

  panel.querySelectorAll('[data-review-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const action = button.dataset.reviewAction;
      const approvedTypeOdds = readOdds();
      if (action === 'approve' && !approvedTypeOdds.length) { status.textContent = 'Give at least one type a weight above zero.'; return; }
      status.textContent = 'Applying review action and saving weighted type odds...';
      try {
        const response = await fetch(getApiRoutes().adminSubmissionAction, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            id: panel.dataset.submissionId, action, reviewNotes: notes.value,
            creatorDisplayName: creator?.value?.trim() || '', approvedTypeOdds,
            approvedCardTypes: approvedTypeOdds.map((entry) => entry.type),
            approvedCardType: approvedTypeOdds[0]?.type || 'neutral',
            targetRarity: targetRarity?.value || '',
            finalRarityOverride: finalRarity?.value === 'roll' ? '' : finalRarity?.value || '',
          }),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.ok) throw new Error(getPayloadError(payload, response));
        status.textContent = payload.approvedTypeOdds?.length
          ? `Saved type odds: ${formatOdds(payload.approvedTypeOdds)}.`
          : `Review action applied: ${action.replaceAll('_', ' ')}.`;
        window.setTimeout(() => window.location.reload(), 900);
      } catch (error) { status.textContent = error.message; }
    });
  });
}
