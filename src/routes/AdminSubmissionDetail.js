/* ============================================================================
   Admin Submission Detail Route
   Phase 9.3 responsibility: show read-only submission review detail and card
   preview. Review actions and Library insertion remain deferred.
   ============================================================================ */

import { renderCardFrame } from '../components/CardFrame.js';
import { escapeHtml, titleCase } from '../components/format.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';

function formatStatus(value) {
  return titleCase(String(value || 'pending_review').replaceAll('_', ' '));
}

function formatBytes(value) {
  const bytes = Number(value || 0);

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return 'Unknown';
  }

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function submissionToPreviewCard(submission) {
  return {
    id: submission.id,
    name: submission.cardName,
    character: submission.characterId,
    characterId: submission.characterId,
    type: submission.cardType,
    category: submission.cardType,
    rarity: submission.raritySuggestion,
    symbol: '◆',
    ability: submission.abilityText || '',
    abilityIcon: '✦',
    stats: submission.stats || { pow: 1, def: 1, spd: 1 },
    owned: false,
    level: 1,
    copies: 0,
    flavor: submission.flavorText,
    imageKey: submission.imageKey,
    imageUrl: submission.imageUrl,
  };
}

function renderDetailRow(label, value) {
  return `<div class="detail-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || 'Not set')}</strong></div>`;
}

async function loadSubmission(submissionId) {
  const routes = getApiRoutes();
  const payload = await fetchJson(routes.adminSubmission + '?id=' + encodeURIComponent(submissionId));

  if (!payload?.ok || !payload.submission) {
    throw new Error(payload?.error || 'Submission detail was not returned.');
  }

  return payload.submission;
}

export async function renderAdminSubmissionDetail({ params }) {
  const submissionId = params.submissionId;

  try {
    const submission = await loadSubmission(submissionId);
    const previewCard = submissionToPreviewCard(submission);

    return `
      <section class="hero-panel">
        <span class="section-kicker">Admin Review</span>
        <h2 class="hero-title">Submission Detail</h2>
        <p class="hero-copy">This is a read-only review screen. Approval, rejection, and Library insertion are still deferred.</p>
        <div class="action-row">
          <a class="button button-secondary" href="#/admin">Back to Admin</a>
          <a class="button button-secondary" href="${escapeHtml(submission.imageUrl)}" target="_blank" rel="noreferrer">Open Image</a>
        </div>
      </section>

      <section class="detail-layout">
        <div class="detail-card-stage">
          ${renderCardFrame(previewCard, { density: 'showcase', context: 'library', showOwnership: false })}
        </div>

        <article class="detail-panel">
          <span class="section-kicker">Pending Review</span>
          <h2 class="detail-title">${escapeHtml(submission.cardName)}</h2>
          <div class="detail-list">
            ${renderDetailRow('Status', formatStatus(submission.moderationStatus))}
            ${renderDetailRow('Submitter', submission.submitterDisplayName)}
            ${renderDetailRow('Character', titleCase(submission.characterId))}
            ${renderDetailRow('Type', titleCase(submission.cardType))}
            ${renderDetailRow('Rarity Suggestion', titleCase(submission.raritySuggestion))}
            ${renderDetailRow('POW', String(submission.stats?.pow ?? 1))}
            ${renderDetailRow('DEF', String(submission.stats?.def ?? 1))}
            ${renderDetailRow('SPD', String(submission.stats?.spd ?? 1))}
            ${renderDetailRow('Flavor', submission.flavorText)}
            ${renderDetailRow('Ability', submission.abilityText || 'None')}
            ${renderDetailRow('Image Key', submission.imageKey)}
            ${renderDetailRow('Original Filename', submission.imageOriginalName)}
            ${renderDetailRow('Image Type', submission.imageMimeType)}
            ${renderDetailRow('Image Size', formatBytes(submission.imageSizeBytes))}
            ${renderDetailRow('Created', submission.createdAt)}
            ${renderDetailRow('Updated', submission.updatedAt)}
          </div>
        </article>
      </section>
    `;
  } catch (error) {
    return `
      <section class="hero-panel">
        <span class="section-kicker">Admin Review</span>
        <h2 class="hero-title">Submission not found.</h2>
        <p class="hero-copy">${escapeHtml(error.message)}</p>
        <div class="action-row"><a class="button button-secondary" href="#/admin">Back to Admin</a></div>
      </section>
    `;
  }
}
