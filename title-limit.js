const CARD_TITLE_LIMIT = 30;
function cleanCardTitle(value) {
  return String(value || '').slice(0, CARD_TITLE_LIMIT);
}
const titleLimitCardHtml = cardHtml;
cardHtml = function(c, big = false) {
  if (c && typeof c === 'object') {
    c = { ...c, title: cleanCardTitle(c.title) };
  }
  return titleLimitCardHtml(c, big);
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
    const next = cleanCardTitle(input.value);
    if (input.value !== next) input.value = next;
    state.draft.title = next;
    counter.textContent = `${next.length}/${CARD_TITLE_LIMIT}`;
    const previewTitle = document.querySelector('.preview .card .ctop strong');
    if (previewTitle) previewTitle.textContent = next || title(state.draft.cid || 'cydney');
  }
  input.addEventListener('input', update);
  update();
}
const titleLimitBind = bind;
bind = function() {
  titleLimitBind();
  setupTitleLimit();
};
