const CARD_TITLE_LIMIT = 25;
const FLAVOR_TAGS = ['Champion','Guardian','Trickster','Wildcard','Support','Brawler','Oracle','Commander','Menace','Artisan','Mystic'];
const CARD_RARITIES = ['common','uncommon','rare','legendary'];
function cleanCardTitle(value) {
  return String(value || '').slice(0, CARD_TITLE_LIMIT);
}
function rarityClass(value) {
  const rarity = CARD_RARITIES.includes(String(value || '').toLowerCase()) ? String(value).toLowerCase() : 'rare';
  return `rarity-${rarity}`;
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
.card.rarity-common{--frame:#cfd3dc;--frame2:#7f8794;--cardText:#e9edf8;background:radial-gradient(circle at 18% 8%,rgba(255,255,255,.08),transparent 28%),linear-gradient(145deg,#07101f,#11182b 45%,#050914)!important;box-shadow:0 10px 34px rgba(0,0,0,.42),0 0 0 1px color-mix(in srgb,var(--frame),transparent 35%),0 0 26px color-mix(in srgb,var(--frame),transparent 76%)!important}
.card.rarity-uncommon{--frame:#30ff99;--frame2:#0bcf82;--cardText:#9fffc8;background:radial-gradient(circle at 22% 0,rgba(80,255,170,.24),transparent 30%),linear-gradient(145deg,#06191d,#071426 42%,#041012)!important;box-shadow:0 10px 36px rgba(0,0,0,.46),0 0 0 1px rgba(48,255,153,.7),0 0 32px rgba(48,255,153,.42)!important}
.card.rarity-rare{--frame:#ffc13b;--frame2:#9c6810;--cardText:#ffe59a;background:radial-gradient(circle at 25% 0,rgba(255,193,59,.24),transparent 30%),linear-gradient(145deg,#0e111f,#111827 46%,#070a14)!important;box-shadow:0 10px 38px rgba(0,0,0,.48),0 0 0 1px rgba(255,193,59,.8),0 0 34px rgba(255,193,59,.45)!important}
.card.rarity-legendary{--frame:#ee83ff;--frame2:#69e8ff;--cardText:#eecbff;background:radial-gradient(circle at 18% 0,rgba(238,131,255,.34),transparent 30%),radial-gradient(circle at 90% 20%,rgba(105,232,255,.26),transparent 32%),linear-gradient(145deg,#091330,#131235 45%,#09091f)!important;box-shadow:0 10px 42px rgba(0,0,0,.5),0 0 0 1px rgba(238,131,255,.7),0 0 38px rgba(105,232,255,.38),0 0 54px rgba(238,131,255,.22)!important}
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
  let className = 'rarity-rare';
  if (c && typeof c === 'object') {
    titleValue = cleanCardTitle(c.title || 'Untitled');
    className = rarityClass(c.rar);
    c = { ...c, title: titleValue };
  }
  let html = titleLimitCardHtml(c, big);
  html = html.replace(/(<article[^>]*class=")card\s*/, `$1card ${className} `);
  if (titleValue) html = html.replace(/(<div class="ctop"><strong>)([\s\S]*?)(<\/strong>)/, `$1${h(titleValue)}$3`);
  return html;
};
const originalCollectionView = collection;
function visibleAllCards(q) {
  return state.cards.filter(x => !q || (String(x.title) + String(x.tag) + String(x.effect) + ch(x.cid).name).toLowerCase().includes(q));
}
function sortAllCards(a, b) {
  return ch(a.cid).name.localeCompare(ch(b.cid).name) || score(b) - score(a) || String(a.title || '').localeCompare(String(b.title || ''));
}
function allRarityGroup(r, cards) {
  const bunch = cards.filter(x => x.rar === r).sort(sortAllCards);
  return `<div class="rgrp" style="--r:${R[r][2]}"><div class="rlabel">${R[r][0].toUpperCase()} · ${bunch.length}</div><div class="grid">${bunch.length ? bunch.map(x => cardHtml(x)).join('') : `<div class="emptymsg">No ${R[r][0]} Cards Yet</div>`}</div></div>`;
}
function allCharactersCollection() {
  const q = (state.q || '').toLowerCase();
  const cards = visibleAllCards(q);
  const passive = C.reduce((s, c) => s + income(c.id), 0);
  return shell(strip() + `<div class="head"><div><h1>Card Collection</h1><p>${cards.length} visible · ${state.cards.length} total · $${num(total())} Vault Value</p></div><div class="row"><button class="gold" data-page="mint">Mint Card</button></div></div><div class="sections"><section class="section allBunch"><div class="sectiontop"><div class="title"><div class="big" style="--a:#e9c349">ALL</div><div><h2>All Characters</h2><p>Grouped by rarity · sorted by character inside each rarity · +${passive}/min Passive</p></div></div><div class="slots"><div class="strong">Total Cards<b>${cards.length}</b></div><div class="strong">Passive<b>+${passive}/min</b></div></div></div>${['legendary','rare','uncommon','common'].map(r => allRarityGroup(r, cards)).join('')}</section></div>`);
}
collection = function() {
  return state.sel === 'all' ? allCharactersCollection() : originalCollectionView();
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
