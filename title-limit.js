const CARD_TITLE_LIMIT = 30;
function cleanCardTitle(value) {
  return String(value || '').slice(0, CARD_TITLE_LIMIT);
}
function cardTitleClass(value) {
  const n = cleanCardTitle(value).length;
  if (n >= 26) return 'title-long';
  if (n >= 19) return 'title-medium';
  return 'title-short';
}
function applyTitleClassToCard(card, value) {
  if (!card) return;
  card.classList.remove('title-short', 'title-medium', 'title-long');
  card.classList.add(cardTitleClass(value));
}
function injectTitleSizingStyles() {
  if (document.getElementById('ctcgTitleSizingStyles')) return;
  const style = document.createElement('style');
  style.id = 'ctcgTitleSizingStyles';
  style.textContent = `
.card{container-type:inline-size}.card .ctop{min-width:0!important}.card .ctop strong{display:block!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1!important}
.card.title-short .ctop strong{font-size:clamp(.74rem,7.2cqw,1.05rem)!important;letter-spacing:-.055em!important}.card.title-medium .ctop strong{font-size:clamp(.64rem,6.15cqw,.88rem)!important;letter-spacing:-.065em!important}.card.title-long .ctop strong{font-size:clamp(.54rem,5.2cqw,.72rem)!important;letter-spacing:-.075em!important}
.preview .card.bigcard .ctop strong,.cardDetailPreview .card.bigcard .ctop strong{max-width:calc(100% - 4.75rem)!important}.preview .card.bigcard.title-short .ctop strong,.cardDetailPreview .card.bigcard.title-short .ctop strong{font-size:clamp(1rem,5.25cqw,1.34rem)!important}.preview .card.bigcard.title-medium .ctop strong,.cardDetailPreview .card.bigcard.title-medium .ctop strong{font-size:clamp(.84rem,4.35cqw,1.08rem)!important}.preview .card.bigcard.title-long .ctop strong,.cardDetailPreview .card.bigcard.title-long .ctop strong{font-size:clamp(.68rem,3.55cqw,.88rem)!important;letter-spacing:-.085em!important}
.grid .card.title-short .ctop strong,.battle .card.title-short .ctop strong{font-size:clamp(.58rem,6.2cqw,.84rem)!important}.grid .card.title-medium .ctop strong,.battle .card.title-medium .ctop strong{font-size:clamp(.5rem,5.2cqw,.68rem)!important}.grid .card.title-long .ctop strong,.battle .card.title-long .ctop strong{font-size:clamp(.42rem,4.35cqw,.55rem)!important;letter-spacing:-.08em!important}
`;document.head.appendChild(style);
}
injectTitleSizingStyles();
const titleLimitCardHtml = cardHtml;
cardHtml = function(c, big = false) {
  let titleValue = c && typeof c === 'object' ? cleanCardTitle(c.title) : '';
  if (c && typeof c === 'object') c = { ...c, title: titleValue };
  let html = titleLimitCardHtml(c, big);
  if (titleValue) html = html.replace('class="card ', `class="card ${cardTitleClass(titleValue)} `).replace('class="card"', `class="card ${cardTitleClass(titleValue)}"`);
  return html;
};
function setupTitleLimit() {
  const input = document.getElementById('ct');
  if (!input || input.dataset.titleLimitReady) return;
  input.dataset.titleLimitReady = '1';
  input.maxLength = CARD_TITLE_LIMIT;
  let counter = document.createElement('small');
  counter.className = 'titleCounter';
  input.insertAdjacentElement('afterend', counter);
  function update() {
    const fallback = title(state.draft.cid || 'cydney');
    const next = cleanCardTitle(input.value);
    if (input.value !== next) input.value = next;
    state.draft.title = next;
    counter.textContent = `${next.length}/${CARD_TITLE_LIMIT}`;
    const previewTitle = document.querySelector('.preview .card .ctop strong');
    const previewCard = document.querySelector('.preview .card');
    const shown = next || fallback;
    if (previewTitle) previewTitle.textContent = cleanCardTitle(shown);
    applyTitleClassToCard(previewCard, shown);
  }
  input.addEventListener('input', update);
  update();
}
const titleLimitBind = bind;
bind = function() {
  titleLimitBind();
  injectTitleSizingStyles();
  setupTitleLimit();
};
