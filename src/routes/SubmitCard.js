/* ============================================================================
   Submit Card Route
   Phase 10F.4 responsibility: player-facing submission form.
   ============================================================================ */

import { getApiRoutes } from '../services/apiClient.js';

export function renderSubmitCard() {
  return `
    <section class="submit-page">
      <div class="submit-info-banner"><span>i</span><p>Submitting a card creates a template in the <a href="#/library">Library</a>. Ownership is only acquired via <a href="#/pull">Pulls</a>.</p></div>
      <form class="glass-panel submit-form submit-card-form" aria-label="Card submission form" data-submit-card-form>
        <label class="submit-art-field">
          <span>Card Illustration</span>
          <div class="submit-art-cropper">
            <strong>Tap to Upload Art</strong>
            <small>PNG, JPG, or WEBP (Max 5MB)</small>
            <input name="image" type="file" accept="image/png,image/jpeg,image/webp" required />
          </div>
        </label>
        <label><span>Card Title</span><input name="card_name" maxlength="25" placeholder="e.g., Celestial Arbiter" required /></label>
        <label><span>Suggested Character</span><select name="character_id" required><option value="sterling">Sterling</option><option value="cydney">Cydney</option><option value="ryan">Ryan</option><option value="gabi">Gabi</option><option value="cooper">Cooper</option><option value="kenly">Kenly</option><option value="ashley">Ashley</option></select></label>
        <label><span>Lore / Flavor Text</span><textarea name="flavor_text" maxlength="220" required placeholder="In the silence between stars, the Arbiter watches..."></textarea></label>
        <input name="card_type" type="hidden" value="support" />
        <input name="rarity_suggestion" type="hidden" value="random" />
        <input name="ability_text" type="hidden" value="" />
        <input name="crop_json" type="hidden" value="{}" />
        <button class="button button-primary submit-card-button" type="submit">Submit to Commune</button>
        <div class="submit-cost-note">Costs 5 Submission Tickets</div>
        <div class="empty-note submit-status" data-submit-card-status>Ready to create a pending-review submission.</div>
      </form>
    </section>
  `;
}

export function initSubmitCardForm(root) {
  const form = root.querySelector('[data-submit-card-form]');
  const status = root.querySelector('[data-submit-card-status]');
  if (!form || !status) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = 'Submitting card for review...';
    try {
      const response = await fetch(getApiRoutes().submissions, { method: 'POST', body: new FormData(form) });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) throw new Error((Array.isArray(payload?.errors) ? payload.errors.join(' ') : payload?.error) || `Submission failed with ${response.status}`);
      status.textContent = 'Submitted to Commune: ' + payload.submission.cardName;
      form.reset();
      form.querySelector('[name="crop_json"]').value = '{}';
    } catch (error) {
      status.textContent = error.message;
    }
  });
}
