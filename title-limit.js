const CARD_TITLE_LIMIT = 25;
const FLAVOR_TAGS = ['Champion','Guardian','Trickster','Wildcard','Support','Brawler','Oracle','Commander','Menace','Artisan','Mystic'];
function cleanCardTitle(value) {
  return String(value || '').slice(0, CARD_TITLE_LIMIT);
}
function clearTitleFit(card) {
  if (!card) return;
  card.classList.remove('title-fit-1', 'title-fit-2', 'title-fit-3', 'title-fit-4');
}
function fitOneTitle(title) {
  const card = title.closest('.card');
  if (!card) return;
  clearTitleFit(card);
  const steps = ['', 'title-fit-1', 'title-fit-2', 'title-fit-3', 'title-fit-4'];
  for (const step of steps) {
    clearTitleFit(card);
    if (step) card.classList.add(step);
    if (title.scrollWidth <= title.clientWidth + 1) break;
  }
}
function fitCardTitles(root = document) {
  requestAnimationFrame(() => {
    root.querySelectorAll('.card .ctop strong').forEach(fitOneTitle);
  });
}
function scheduleTitleFit(root = document) {
  fitCardTitles(root);
  setTimeout(() => fitCardTitles(root), 80);
  setTimeout(() => fitCardTitles(root), 260);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitCardTitles(root)).catch(() => {});
}
function setupFlavorTags() {
  const select = document.getElementById('tag');
  if (!select) return;
  const current = FLAVOR_TAGS.includes(state.draft.tag) ? state.draft.tag : FLAVOR_TAGS[0];
  if (state.draft.tag !== current) {
    state.draft.tag = current;
    queueMeta();
  }
  const html = FLAVOR_TAGS.map(t => `<option ${t === current ? 'selected' : ''}>${h(t)}</option>`).join('');
  if (select.innerHTML !== html) select.innerHTML = html;
  select.value = current;
}
function injectTitleSizingStyles() {
  if (document.getElementById('ctcgTitleSizingStyles')) return;
  const style = document.createElement('style');
  style.id = 'ctcgTitleSizingStyles';
  style.textContent = `
.card{container-type:inline-size;--titleScale:1}.card.title-fit-1{--titleScale:.92}.card.title-fit-2{--titleScale:.84}.card.title-fit-3{--titleScale:.76}.card.title-fit-4{--titleScale:.68}.card .ctop{min-width:0!important}.card .ctop strong{display:block!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1!important}
.card .ctop strong{font-size:clamp(calc(.68rem * var(--titleScale)),calc(8.8cqw * var(--titleScale)),calc(1.28rem * var(--titleScale)))!important;letter-spacing:calc(-.045em - ((1 - var(--titleScale)) * .08em))!important;max-width:calc(100% - 4.6rem)!important}
.grid .card .ctop strong{font-size:clamp(calc(.58rem * var(--titleScale)),calc(7cqw * var(--titleScale)),calc(.92rem * var(--titleScale)))!important;max-width:58%!important}
.battle .card .ctop strong{font-size:clamp(calc(.86rem * var(--titleScale)),calc(5.7cqw * var(--titleScale)),calc(1.42rem * var(--titleScale)))!important;max-width:calc(100% - 5.2rem)!important}
.preview .card.bigcard .ctop strong,.cardDetailPreview .card.bigcard .ctop strong{font-size:clamp(calc(.86rem * var(--titleScale)),calc(5.7cqw * var(--titleScale)),calc(1.34rem * var(--titleScale)))!important;max-width:calc(100% - 4.75rem)!important}
`;
  document.head.appendChild(style);
}
injectTitleSizingStyles();
const titleLimitCardHtml = cardHtml;
cardHtml = function(c, big = false) {
  let titleValue = '';
  if (c && typeof c === 'object') {
    titleValue = cleanCardTitle(c.title || 'Untitled');
    c = { ...c, title: titleValue };
  }
  let html = titleLimitCardHtml(c, big);
  if (titleValue) html = html.replace(/(<div class="ctop"><strong>)([\s\S]*?)(<\/strong>)/, `$1${h(titleValue)}$3`);
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
    const fallback = cleanCardTitle(title(state.draft.cid || 'cydney'));
    const next = cleanCardTitle(input.value);
    if (input.value !== next) input.value = next;
    state.draft.title = next;
    counter.textContent = `${next.length}/${CARD_TITLE_LIMIT}`;
    const previewTitle = document.querySelector('.preview .card .ctop strong');
    const shown = next || fallback;
    if (previewTitle) previewTitle.textContent = shown;
    scheduleTitleFit(document.querySelector('.preview') || document);
  }
  input.addEventListener('input', update);
  update();
}
const titleLimitBind = bind;
bind = function() {
  titleLimitBind();
  injectTitleSizingStyles();
  setupFlavorTags();
  setupTitleLimit();
  scheduleTitleFit();
};
window.addEventListener('resize', () => scheduleTitleFit());
const titleFitObserver = new MutationObserver(mutations => {
  if (mutations.some(m => Array.from(m.addedNodes || []).some(n => n.nodeType === 1 && (n.matches?.('.card,.cardDetailBackdrop') || n.querySelector?.('.card'))))) {
    scheduleTitleFit();
  }
});
titleFitObserver.observe(document.body, { childList: true, subtree: true });
