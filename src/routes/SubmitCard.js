/* ============================================================================
   Submit Card Route
   Phase 10F.4 responsibility: player-facing submission form.
   ============================================================================ */

import { renderCardFrame } from '../components/CardFrame.js';
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

const typeMeta = {
  flame: { label: 'Flame', color: '#E85D4F', textColor: '#101014' },
  tide: { label: 'Tide', color: '#2F80ED', textColor: '#f7f9ff' },
  bloom: { label: 'Bloom', color: '#45B36B', textColor: '#101014' },
  volt: { label: 'Volt', color: '#F2C94C', textColor: '#101014' },
  shadow: { label: 'Shadow', color: '#5B3A8E', textColor: '#f7f9ff' },
  radiant: { label: 'Radiant', color: '#F6D77A', textColor: '#101014' },
  neutral: { label: 'Neutral', color: '#A99A86', textColor: '#101014' },
};

const characterMeta = {
  cydney: { name: 'Cydney', abbr: 'CY', color: '#789461' },
  sterling: { name: 'Sterling', abbr: 'ST', color: '#c4c5db' },
  ryan: { name: 'Ryan', abbr: 'RY', color: '#a98cff' },
  gabi: { name: 'Gabi', abbr: 'GA', color: '#8ccdff' },
  cooper: { name: 'Cooper', abbr: 'CO', color: '#ff8f70' },
  kenly: { name: 'Kenly', abbr: 'KE', color: '#73e1c2' },
  ashley: { name: 'Ashley', abbr: 'AS', color: '#ff9ccf' },
};

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

function renderPreviewCard() {
  return renderCardFrame({
    id: 'submit-preview-card',
    name: 'Card Preview',
    cid: 'sterling',
    character: 'sterling',
    characterId: 'sterling',
    type: 'neutral',
    cardType: 'neutral',
    category: 'Neutral',
    rarity: 'rare',
    symbol: '◆',
    ability: '',
    abilityIcon: '✦',
    stats: { pow: '?', def: '?', spd: '?' },
    owned: false,
    level: 1,
    copies: 0,
    flavor: 'Your submitted card preview will appear here.',
    crop: { x: 50, y: 50, zoom: 1 },
  }, { density: 'showcase', context: 'library', showOwnership: false, showStats: false });
}

export function renderSubmitCard() {
  return `
    <section class="submit-page">
      <div class="submit-info-banner"><span>i</span><p>Submitted cards are reviewed before entering the Library or pull pool. Target rarity and type are suggestions. Final rarity, type, stats, and pull-pool eligibility are set during admin review.</p></div>
      <form class="submit-form submit-card-form submit-card-builder" aria-label="Card submission form" data-submit-card-form>
        <section class="glass-panel submit-preview-panel">
          <div class="section-heading submit-preview-heading">
            <div>
              <span class="section-kicker">Live Preview</span>
              <h2 class="section-title">Crop on the card</h2>
            </div>
            <span class="status-pill">Creator Beta</span>
          </div>
          <div class="submit-card-preview-stage" data-submit-cropper role="button" tabindex="0" aria-label="Upload and crop card illustration on the live preview">
            ${renderPreviewCard()}
          </div>
          <div class="submit-art-compact-controls">
            <label class="button button-primary submit-art-upload-button">
              <span data-submit-upload-label-text>Upload Art</span>
              <input data-submit-image-input name="image" type="file" accept="image/png,image/jpeg,image/webp" required />
            </label>
            <button class="button button-secondary submit-change-art" type="button" data-submit-change-art hidden>Change Art</button>
          </div>
          <p class="submit-crop-help" data-submit-crop-help hidden>Drag art on the card to reposition. Pinch or scroll to zoom. Double tap/click to reset.</p>
        </section>

        <section class="glass-panel submit-fields-panel">
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
          <div class="empty-note submit-review-note">Final ATK, DEF, SPD, final rarity, and pull-pool eligibility are controlled by admin approval.</div>
          <button class="button button-primary submit-card-button" type="submit">Submit to Commune <span aria-hidden="true">&gt;</span></button>
          <div class="empty-note submit-status" data-submit-card-status hidden></div>
        </section>
      </form>
    </section>
  `;
}

function selectedType(form) {
  return form.querySelector('[name="type_suggestions"]:checked')?.value || 'neutral';
}

function updatePreviewChip(chip, text, title, properties = {}) {
  if (!chip) return;
  chip.textContent = text;
  if (title) chip.setAttribute('title', title);
  Object.entries(properties).forEach(([property, value]) => {
    chip.style.setProperty(property, value);
  });
}

function updateLivePreview(form) {
  const card = form.querySelector('[data-submit-cropper] .tcg-card');
  if (!card) return;

  const title = form.querySelector('[name="card_name"]')?.value?.trim() || 'Card Preview';
  const rarity = form.querySelector('[name="rarity_suggestion"]')?.value || 'rare';
  const characterKey = form.querySelector('[name="character_id"]')?.value || 'sterling';
  const typeKey = selectedType(form);
  const character = characterMeta[characterKey] || characterMeta.sterling;
  const type = typeMeta[typeKey] || typeMeta.neutral;
  const cardTitle = card.querySelector('.card-title');

  card.setAttribute('data-rarity', rarity);
  card.setAttribute('aria-label', `${title} card preview`);
  if (cardTitle) cardTitle.textContent = title;

  updatePreviewChip(card.querySelector('.card-rarity-chip'), rarity.charAt(0).toUpperCase(), rarity.charAt(0).toUpperCase() + rarity.slice(1));
  updatePreviewChip(card.querySelector('.card-character-chip'), character.abbr, character.name, { '--character-color': character.color });
  updatePreviewChip(card.querySelector('.card-type-chip'), type.label, type.label, { '--card-type-color': type.color, '--card-type-text-color': type.textColor });
  card.querySelector('.card-type-chip')?.setAttribute('data-card-type', typeKey);
}

export function initSubmitCardForm(root) {
  const form = root.querySelector('[data-submit-card-form]');
  const status = root.querySelector('[data-submit-card-status]');
  if (!form || !status) return;

  initSubmitImageCropper(form, status);
  updateLivePreview(form);

  form.addEventListener('input', () => updateLivePreview(form));
  form.addEventListener('change', () => updateLivePreview(form));

  form.querySelectorAll('[name="type_suggestions"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const checked = [...form.querySelectorAll('[name="type_suggestions"]:checked')];
      if (checked.length > 3) {
        checkbox.checked = false;
        showSubmitStatus(status, 'Choose up to 3 suggested types.');
      }
      updateLivePreview(form);
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
      window.setTimeout(() => updateLivePreview(form), 0);
    } catch (error) {
      showSubmitStatus(status, error.message);
    }
  });
}
