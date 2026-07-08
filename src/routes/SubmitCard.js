/* ============================================================================
   Submit Card Route
   Phase 10F.4 responsibility: player-facing submission form.
   ============================================================================ */

import { getApiRoutes } from '../services/apiClient.js';
import { initSubmitImageCropper, validateSubmitImage } from './submitCardCrop.js';

const cardTypes = [
  ['flame', 'Flame'],
  ['tide', 'Tide'],
  ['bloom', 'Bloom'],
  ['volt', 'Volt'],
  ['shadow', 'Shadow'],
  ['radiant', 'Radiant'],
  ['neutral', 'Neutral'],
];

function showSubmitStatus(status, message) {
  status.hidden = false;
  status.textContent = message;
}

function renderTypeCheckboxes(selected = ['neutral']) {
  const selectedSet = new Set(selected);
  return cardTypes.map(([value, label]) => `
    <label class="filter-pill">
      <input name="type_suggestions" type="checkbox" value="${value}"${selectedSet.has(value) ? ' checked' : ''} />
      <span>${label}</span>
    </label>
  `).join('');
}

export function renderSubmitCard() {
  return `
    <section class="submit-page">
      <div class="submit-info-banner"><span>i</span><p>Submitting a card creates a pending template candidate. You may suggest up to 3 types and a target rarity, but final rarity, type pool, and stats are controlled during admin approval.</p></div>
      <form class="glass-panel submit-form submit-card-form" aria-label="Card submission form" data-submit-card-form>
        <label class="submit-art-field">
          <span>Card Illustration</span>
          <div class="submit-art-cropper" data-submit-cropper role="button" tabindex="0" aria-label="Upload and crop card illustration">
            <input data-submit-image-input name="image" type="file" accept="image/png,image/jpeg,image/webp" required />
            <img data-submit-preview alt="" hidden />
            <div class="submit-upload-prompt">
              <strong aria-hidden="true">☁</strong>
              <b>Tap to Upload Art</b>
              <small>PNG, JPG, or WEBP (Max 5MB)</small>
            </div>
          </div>
          <p class="submit-crop-help" data-submit-crop-help hidden>Drag to reposition. Pinch or scroll to zoom. Double tap/click to reset.</p>
          <button class="button button-secondary submit-change-art" type="button" data-submit-change-art hidden>Change Art</button>
        </label>
        <label><span>Card Title</span><input name="card_name" maxlength="25" placeholder="e.g., Celestial Arbiter" required /></label>
        <label><span>Suggested Character</span><select name="character_id" required><option value="sterling">Sterling</option><option value="cydney">Cydney</option><option value="ryan">Ryan</option><option value="gabi">Gabi</option><option value="cooper">Cooper</option><option value="kenly">Kenly</option><option value="ashley">Ashley</option></select></label>
        <fieldset class="review-notes-label" data-type-suggestions>
          <legend>Suggested Types <small>(choose up to 3)</small></legend>
          <div class="filter-row">${renderTypeCheckboxes(['neutral'])}</div>
        </fieldset>
        <label><span>Target Rarity</span><select name="rarity_suggestion" required><option value="common">Common</option><option value="uncommon">Uncommon</option><option value="rare" selected>Rare</option><option value="legendary">Legendary</option><option value="mythic">Mythic</option></select></label>
        <label><span>Lore / Flavor Text</span><textarea name="flavor_text" maxlength="220" required placeholder="In the silence between stars, the Arbiter watches..."></textarea></label>
        <input name="ability_text" type="hidden" value="" />
        <input name="crop_json" type="hidden" value='{"x":50,"y":50,"zoom":1}' />
        <button class="button button-primary submit-card-button" type="submit">Submit to Commune <span aria-hidden="true">&gt;</span></button>
        <div class="empty-note submit-status" data-submit-card-status hidden></div>
      </form>
    </section>
  `;
}

export function initSubmitCardForm(root) {
  const form = root.querySelector('[data-submit-card-form]');
  const status = root.querySelector('[data-submit-card-status]');
  if (!form || !status) return;

  initSubmitImageCropper(form, status);

  form.querySelectorAll('[name="type_suggestions"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const checked = [...form.querySelectorAll('[name="type_suggestions"]:checked')];
      if (checked.length > 3) {
        checkbox.checked = false;
        showSubmitStatus(status, 'Choose up to 3 suggested types.');
      }
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showSubmitStatus(status, 'Submitting card for review...');
    try {
      const checkedTypes = [...form.querySelectorAll('[name="type_suggestions"]:checked')];
      if (!checkedTypes.length) throw new Error('Choose at least one suggested type.');
      if (checkedTypes.length > 3) throw new Error('Choose up to 3 suggested types.');

      const imageValidationError = validateSubmitImage(form);
      if (imageValidationError) throw new Error(imageValidationError);

      const response = await fetch(getApiRoutes().submissions, { method: 'POST', body: new FormData(form) });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) throw new Error((Array.isArray(payload?.errors) ? payload.errors.join(' ') : payload?.error) || `Submission failed with ${response.status}`);
      showSubmitStatus(status, 'Submitted to Commune: ' + payload.submission.cardName);
      form.reset();
      form.querySelector('[name="rarity_suggestion"]').value = 'rare';
      form.querySelectorAll('[name="type_suggestions"]').forEach((checkbox) => { checkbox.checked = checkbox.value === 'neutral'; });
      form.querySelector('[name="crop_json"]').value = JSON.stringify({ x: 50, y: 50, zoom: 1 });
    } catch (error) {
      showSubmitStatus(status, error.message);
    }
  });
}
