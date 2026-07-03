/* ============================================================================
   Submit Card Route
   Phase 4 responsibility: static card-submission form shape and field inventory.
   Real uploads, validation, draft saves, and D1/R2 writes are deferred.
   ============================================================================ */

export function renderSubmitCard() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Submit Card</span>
      <h2 class="hero-title">Add to the pool.</h2>
      <p class="hero-copy">This is the Phase 4 static submission screen. It defines the future fields without writing to D1 or R2 yet.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/library">Back to Library</a>
        <a class="button button-secondary" href="#/admin">Admin Review</a>
      </div>
    </section>

    <section class="submit-layout">
      <form class="glass-panel submit-form" aria-label="Static card submission form">
        <label>
          <span>Card Name</span>
          <input value="Lantern Orchard Keeper" readonly />
        </label>
        <label>
          <span>Category</span>
          <select disabled>
            <option>Support</option>
          </select>
        </label>
        <label>
          <span>Rarity Suggestion</span>
          <select disabled>
            <option>Uncommon</option>
          </select>
        </label>
        <label>
          <span>Flavor Text</span>
          <textarea readonly>A patient guardian who keeps watch until the harvest is safely gathered.</textarea>
        </label>
        <div class="submit-stat-grid">
          <label><span>POW</span><input value="4" readonly /></label>
          <label><span>DEF</span><input value="7" readonly /></label>
          <label><span>SPD</span><input value="5" readonly /></label>
        </div>
        <div class="upload-placeholder">
          <strong>Card Art Upload Placeholder</strong>
          <span>Future flow will write art to CARD_IMAGES and metadata to DB.</span>
        </div>
        <a class="button button-primary" href="#/submit">Preview Only</a>
      </form>

      <aside class="glass-panel submit-notes">
        <span class="section-kicker">Backend Later</span>
        <h3>Submission contract</h3>
        <p>Phase 4 only maps the fields. The real implementation needs validation, moderation status, R2 upload, D1 insert, and admin approval before cards enter the pull pool.</p>
        <div class="detail-list">
          <div class="detail-row"><span>Database</span><strong>env.DB</strong></div>
          <div class="detail-row"><span>Images</span><strong>env.CARD_IMAGES</strong></div>
          <div class="detail-row"><span>Status</span><strong>Static Mock</strong></div>
        </div>
      </aside>
    </section>
  `;
}
