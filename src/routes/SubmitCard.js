/* ============================================================================
   Submit Card Route
   Phase 9.2 responsibility: collect card-submission fields and upload one image
   through the write-enabled /api/submissions endpoint.
   ============================================================================ */

import { getApiRoutes } from '../services/apiClient.js';

export function renderSubmitCard() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Submit Card</span>
      <h2 class="hero-title">Add to the pool.</h2>
      <p class="hero-copy">Submissions now create a pending-review record and store card art in CARD_IMAGES. Approval into Library and pulls is still deferred.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/library">Back to Library</a>
        <a class="button button-secondary" href="#/admin">Admin Review</a>
      </div>
    </section>

    <section class="submit-layout">
      <form class="glass-panel submit-form" aria-label="Card submission form" data-submit-card-form>
        <label>
          <span>Card Name</span>
          <input name="card_name" maxlength="25" placeholder="Lantern Orchard Keeper" required />
        </label>
        <label>
          <span>Character</span>
          <select name="character_id" required>
            <option value="sterling">Sterling</option>
            <option value="cydney">Cydney</option>
            <option value="ryan">Ryan</option>
            <option value="gabi">Gabi</option>
            <option value="cooper">Cooper</option>
            <option value="kenly">Kenly</option>
            <option value="ashley">Ashley</option>
          </select>
        </label>
        <label>
          <span>Card Type</span>
          <select name="card_type" required>
            <option value="support">Support</option>
            <option value="battle">Battle</option>
            <option value="craft">Craft</option>
            <option value="magic">Magic</option>
            <option value="alchemy">Alchemy</option>
            <option value="training">Training</option>
            <option value="defense">Defense</option>
            <option value="utility">Utility</option>
          </select>
        </label>
        <label>
          <span>Rarity Suggestion</span>
          <select name="rarity_suggestion" required>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="legendary">Legendary</option>
            <option value="mythic">Mythic</option>
          </select>
        </label>
        <label>
          <span>Flavor Text</span>
          <textarea name="flavor_text" maxlength="220" required placeholder="A patient guardian who keeps watch until the harvest is safely gathered."></textarea>
        </label>
        <label>
          <span>Ability Text</span>
          <textarea name="ability_text" maxlength="220" placeholder="Optional ability or effect text."></textarea>
        </label>
        <div class="submit-stat-grid">
          <label><span>POW</span><input name="pow" type="number" min="1" max="10" value="4" required /></label>
          <label><span>DEF</span><input name="def" type="number" min="1" max="10" value="7" required /></label>
          <label><span>SPD</span><input name="spd" type="number" min="1" max="10" value="5" required /></label>
        </div>
        <label class="upload-placeholder">
          <strong>Card Art Upload</strong>
          <span>PNG, JPG, or WEBP. Max 8 MB.</span>
          <input name="image" type="file" accept="image/png,image/jpeg,image/webp" required />
        </label>
        <input name="crop_json" type="hidden" value="{}" />
        <button class="button button-primary" type="submit">Submit for Review</button>
        <div class="empty-note" data-submit-card-status>Ready to create a pending-review submission.</div>
      </form>

      <aside class="glass-panel submit-notes">
        <span class="section-kicker">Phase 9.2</span>
        <h3>Submission contract</h3>
        <p>This flow writes a pending-review submission and stores original art in R2. It does not approve the card, add it to Library, or make it pullable yet.</p>
        <div class="detail-list">
          <div class="detail-row"><span>Database</span><strong>card_submissions</strong></div>
          <div class="detail-row"><span>Images</span><strong>env.CARD_IMAGES</strong></div>
          <div class="detail-row"><span>Status</span><strong>pending_review</strong></div>
        </div>
      </aside>
    </section>
  `;
}

export function initSubmitCardForm(root) {
  const form = root.querySelector('[data-submit-card-form]');
  const status = root.querySelector('[data-submit-card-status]');

  if (!form || !status) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = 'Submitting card for review...';

    try {
      const routes = getApiRoutes();
      const response = await fetch(routes.submissions, {
        method: 'POST',
        body: new FormData(form),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        const errors = Array.isArray(payload?.errors) ? payload.errors.join(' ') : payload?.error;
        throw new Error(errors || `Submission failed with ${response.status}`);
      }

      status.textContent = 'Submitted for review: ' + payload.submission.cardName;
      form.reset();
      form.querySelector('[name="crop_json"]').value = '{}';
    } catch (error) {
      status.textContent = error.message;
    }
  });
}
