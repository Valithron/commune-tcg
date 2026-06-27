const CARD_TITLE_LIMIT = 25;
const FLAVOR_TAGS = ['Champion','Guardian','Trickster','Wildcard','Support','Brawler','Oracle','Commander','Menace','Artisan','Mystic'];
const CARD_RARITIES = ['common','uncommon','rare','legendary'];
const vaultCache = {};
const vaultLoading = {};
let vaultError = '';
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
async function loadPublicVault(id) {
  if (!id || vaultLoading[id]) return;
  vaultLoading[id] = true;
  vaultError = '';
  try {
    vaultCache[id] = await api(`/api/vaults/${encodeURIComponent(id)}`);
  } catch (e) {
    vaultError = e.message || 'Failed to load vault';
  } finally {
    vaultLoading[id] = false;
    if (state.page === 'vaults') render();
  }
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
.vaultTabs{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 18px}.vaultTab{border:1px solid rgba(255,255,255,.12);border-radius:12px;background:#171b2d;color:#edf1ff;padding:10px 13px;font:900 .78rem 'JetBrains Mono',monospace;display:flex;align-items:center;gap:8px}.vaultTab.on{background:linear-gradient(135deg,var(--a),color-mix(in srgb,var(--a),#111 28%));color:#080b15;box-shadow:0 0 22px color-mix(in srgb,var(--a),transparent 65%)}.vaultTab .av{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--a);color:#060812;font-size:.62rem}.vaultNotice{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#11162a;padding:18px;color:#aeb2cc}.vaults .card .cbot button{display:none!important}.vaults .card{cursor:pointer}.vaults .card:hover{transform:translateY(-2px);filter:brightness(1.08)}
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
const originalShellForVaults = shell;
shell = function(content) {
  const html = originalShellForVaults(content);
  if (html.includes('data-page="vaults"')) return html;
  const tab = `<button class="${state.page === 'vaults' ? 'on' : ''}" data-page="vaults">Vaults</button>`;
  return html.replace('</nav>', `${tab}</nav>`);
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
function vaultCardSort(a, b) {
  const rarityOrder = {legendary:0, rare:1, uncommon:2, common:3};
  return (rarityOrder[a.rar] ?? 9) - (rarityOrder[b.rar] ?? 9) || ch(a.cid).name.localeCompare(ch(b.cid).name) || score(b) - score(a);
}
function vaultRarityGroup(r, cards) {
  const bunch = cards.filter(x => x.rar === r).sort(vaultCardSort);
  return `<div class="rgrp" style="--r:${R[r][2]}"><div class="rlabel">${R[r][0].toUpperCase()} · ${bunch.length}</div><div class="grid">${bunch.length ? bunch.map(x => cardHtml(x)).join('') : `<div class="emptymsg">No ${R[r][0]} Cards In This Vault</div>`}</div></div>`;
}
function vaultsPage() {
  const ownerId = state.vaultOwner || user?.id || 'cydney';
  state.vaultOwner = ownerId;
  if (!vaultCache[ownerId] && !vaultLoading[ownerId]) loadPublicVault(ownerId);
  const selectedOwner = C.find(c => c.id === ownerId) || C[0];
  const data = vaultCache[ownerId];
  const cards = (data?.cards || []).slice();
  const counts = data?.counts || {total:0,equipped:0,passive:0,byRarity:{}};
  const tabs = C.map(c => `<button class="vaultTab ${ownerId === c.id ? 'on' : ''}" data-vault-owner="${c.id}" style="--a:${c.a}"><span class="av">${c.in}</span>${c.name}</button>`).join('');
  const body = vaultError ? `<div class="vaultNotice">${h(vaultError)}</div>` : (!data ? `<div class="vaultNotice">Loading ${h(selectedOwner.name)} Vault...</div>` : `<div class="sections"><section class="section"><div class="sectiontop"><div class="title"><div class="big" style="--a:${selectedOwner.a}">${selectedOwner.in}</div><div><h2>${selectedOwner.name} Vault</h2><p>${counts.total} cards · ${counts.equipped} equipped · +${counts.passive}/min passive · read-only</p></div></div><div class="slots"><div class="strong">Cards<b>${counts.total}</b></div><div class="strong">Equipped<b>${counts.equipped}</b></div><div class="strong">Passive<b>+${counts.passive}/min</b></div></div></div>${['legendary','rare','uncommon','common'].map(r => vaultRarityGroup(r, cards)).join('')}</section></div>`);
  return shell(`<div class="vaults"><div class="head"><div><h1>Vaults</h1><p>Browse another player’s card collection. Viewing only. Trading later.</p></div><button class="btn" id="refreshVault">Refresh Vault</button></div><div class="vaultTabs">${tabs}</div>${body}</div>`);
}
collection = function() {
  if (state.page === 'vaults') return vaultsPage();
  return state.sel === 'all' ? allCharactersCollection() : originalCollectionView();
};
function showVaultCardDetail(id) {
  const data = vaultCache[state.vaultOwner];
  const c = data?.cards?.find(x => x.id === id);
  if (!c) return;
  const cc = ch(c.cid), rar = (R[c.rar] && R[c.rar][0]) || c.rar || 'Unknown', grade = Number(c.grade || score(c));
  const ownerName = data?.owner?.displayName || cc.name;
  const modal = document.createElement('div');
  modal.className = 'cardDetailBackdrop';
  modal.innerHTML = `<div class="cardDetailModal"><div class="cardDetailPreview">${cardHtml(c,true)}</div><aside class="cardDetailPanel"><div class="cardDetailTop"><div><span class="detailPill">${h(rar)} · ${h(cc.name)}</span><h2>${h(c.title || 'Untitled')}</h2><p>${h(c.tag || 'Battle')} · Owned by ${h(ownerName)}</p></div><button class="cardDetailClose" type="button" data-detail-close>Close</button></div><div class="detailGrid"><div class="detailStat"><small>POW</small><b>${h(c.p)}</b></div><div class="detailStat"><small>DEF</small><b>${h(c.d)}</b></div><div class="detailStat"><small>SPD</small><b>${h(c.s)}</b></div></div><div class="detailGrid"><div class="detailBox"><small>Passive</small><b>+${h(c.passive)}/min</b></div><div class="detailBox"><small>Grade</small><b>${h(grade)}</b></div><div class="detailBox"><small>Status</small><b>${c.equipped ? 'Equipped' : 'Unequipped'}</b></div></div><div class="detailBox detailEffect"><small>Effect / Flavor</small><p>${h(c.effect || E[c.cid] || 'No effect text.')}</p></div><div class="detailBox"><small>Card ID</small><p>${h(c.id)}</p></div><div class="detailActions"><button class="btn" type="button" data-detail-close>Back to Vault</button></div></aside></div>`;
  document.body.appendChild(modal);
  modal.querySelectorAll('[data-detail-close]').forEach(b => b.onclick = () => modal.remove());
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
  scheduleTitleFit(modal);
}
function setupVaultsPage() {
  document.querySelectorAll('[data-vault-owner]').forEach(b => {
    if (b.dataset.vaultReady) return;
    b.dataset.vaultReady = '1';
    b.onclick = () => {
      state.vaultOwner = b.dataset.vaultOwner;
      vaultError = '';
      queueMeta();
      render();
    };
  });
  const refresh = document.getElementById('refreshVault');
  if (refresh && !refresh.dataset.vaultReady) {
    refresh.dataset.vaultReady = '1';
    refresh.onclick = () => {
      delete vaultCache[state.vaultOwner];
      loadPublicVault(state.vaultOwner);
      render();
    };
  }
  document.querySelectorAll('.vaults .grid .card[data-card-id]').forEach(card => {
    if (card.dataset.vaultDetailReady) return;
    card.dataset.vaultDetailReady = '1';
    card.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      showVaultCardDetail(card.dataset.cardId);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showVaultCardDetail(card.dataset.cardId);
      }
    });
  });
}
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
  setupVaultsPage();
  scheduleTitleFit();
};
window.addEventListener('resize', () => scheduleTitleFit());
const titleFitObserver = new MutationObserver(mutations => {
  if (mutations.some(m => Array.from(m.addedNodes || []).some(n => n.nodeType === 1 && (n.matches?.('.card,.cardDetailBackdrop') || n.querySelector?.('.card'))))) {
    scheduleTitleFit();
  }
});
titleFitObserver.observe(document.body, { childList: true, subtree: true });
