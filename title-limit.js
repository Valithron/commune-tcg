const CARD_TITLE_LIMIT = 25;
const FLAVOR_TAGS = ['Champion','Guardian','Trickster','Wildcard','Support','Brawler','Oracle','Commander','Menace','Artisan','Mystic','Spicy'];
const CARD_RARITIES = ['common','uncommon','rare','legendary'];
const vaultCache = {};
const vaultLoading = {};
let vaultError = '';
let battleAnimating = false;
let battleSkipRequested = false;
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
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
.battle .card .ctop strong,.battleAuto .card .ctop strong{font-size:clamp(calc(.86rem * var(--titleScale)),calc(5.7cqw * var(--titleScale)),calc(1.42rem * var(--titleScale)))!important;max-width:calc(100% - 5.2rem)!important}
.preview .card.bigcard .ctop strong,.cardDetailPreview .card.bigcard .ctop strong{font-size:clamp(calc(.86rem * var(--titleScale)),calc(5.7cqw * var(--titleScale)),calc(1.34rem * var(--titleScale)))!important;max-width:calc(100% - 4.75rem)!important}
.vaultTabs{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 18px}.vaultTab{border:1px solid rgba(255,255,255,.12);border-radius:12px;background:#171b2d;color:#edf1ff;padding:10px 13px;font:900 .78rem 'JetBrains Mono',monospace;display:flex;align-items:center;gap:8px}.vaultTab.on{background:linear-gradient(135deg,var(--a),color-mix(in srgb,var(--a),#111 28%));color:#080b15;box-shadow:0 0 22px color-mix(in srgb,var(--a),transparent 65%)}.vaultTab .av{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--a);color:#060812;font-size:.62rem}.vaultNotice{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#11162a;padding:18px;color:#aeb2cc}.vaults .card .cbot button{display:none!important}.vaults .card{cursor:pointer}.vaults .card:hover{transform:translateY(-2px);filter:brightness(1.08)}
.battleAuto{display:grid;gap:18px}.battleRules{border:1px solid rgba(255,255,255,.1);border-radius:16px;background:linear-gradient(145deg,#11182a,#0b1020);padding:16px}.battleRules h3{margin:0 0 10px;font:900 1rem Sora,Inter,sans-serif}.battleRulesGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.battleRule{border:1px solid rgba(255,255,255,.09);border-radius:12px;background:#0c1121;padding:10px;color:#c8ccdf;font-size:.82rem}.battleRule b{display:block;color:#f3c93f;margin-bottom:4px}.battleStage{border:1px solid rgba(255,255,255,.1);border-radius:18px;background:radial-gradient(circle at 50% 0,rgba(177,120,255,.14),transparent 34%),linear-gradient(180deg,#11182c,#080b16);padding:16px;display:grid;gap:14px;position:relative;overflow:hidden}.battleStage:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);transform:translateX(-120%);pointer-events:none}.battleStage.playing:before{animation:battleSweep 1.4s linear infinite}.battleTeamTitle{display:flex;align-items:center;justify-content:space-between;gap:12px;font:900 .78rem 'JetBrains Mono',monospace;text-transform:uppercase;color:#aeb2cc}.battleTeamGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,220px));gap:14px;align-items:start}.battleFighter{position:relative;display:grid;gap:8px;transition:transform .18s ease,filter .18s ease,opacity .18s ease}.battleFighter .card{width:100%!important;max-width:220px!important;aspect-ratio:2.5/3.5!important}.battleFighter.attacking{transform:translateY(-6px) scale(1.035);filter:brightness(1.22)}.battleFighter.defending{animation:hitShake .22s linear 1}.battleFighter.ko{opacity:.42;filter:grayscale(.8)}.battleFighter.ko:after{content:"KO";position:absolute;top:42%;left:50%;transform:translate(-50%,-50%) rotate(-10deg);font:900 2.2rem Sora,Inter,sans-serif;color:#ff5f76;text-shadow:0 3px 0 #000}.hpBox{border:1px solid rgba(255,255,255,.11);background:#090d18;border-radius:999px;padding:4px 8px;display:grid;gap:4px}.hpLine{display:flex;justify-content:space-between;color:#dfe4ff;font:900 .62rem 'JetBrains Mono',monospace}.hpTrack{height:8px;background:#20263a;border-radius:999px;overflow:hidden}.hpFill{height:100%;width:100%;background:linear-gradient(90deg,#37e58f,#f3c93f);border-radius:999px;transition:width .32s ease}.damagePop{position:absolute;left:50%;top:24%;transform:translate(-50%,-50%);z-index:5;padding:6px 10px;border-radius:999px;background:#111827;border:1px solid rgba(255,255,255,.18);font:900 .8rem 'JetBrains Mono',monospace;color:#fff;animation:damageRise .7s ease forwards;box-shadow:0 10px 24px rgba(0,0,0,.35)}.damagePop.crit{background:#3a1520;color:#ffd1d9;border-color:#ff6b8a}.battleFeed{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c1121;padding:12px;display:grid;gap:8px}.battleFeedTop{display:flex;align-items:center;justify-content:space-between;gap:10px}.battleEventText{min-height:22px;color:#edf1ff;font-weight:800}.battleResult{font:900 1.35rem Sora,Inter,sans-serif;color:#f3c93f}.battleLogList{max-height:260px;overflow:auto;display:grid;gap:7px;color:#bfc4da;font-size:.82rem}.battleLogRound{color:#f3c93f;font:900 .68rem 'JetBrains Mono',monospace;text-transform:uppercase;margin-top:6px}.battleLogEvent{border-left:2px solid rgba(255,255,255,.12);padding-left:8px}.battleEmpty{border:1px solid rgba(255,255,255,.1);border-radius:16px;background:#11162a;padding:18px;color:#aeb2cc}.battleAuto .card .cbot button{display:none!important}@keyframes hitShake{0%,100%{transform:translateX(0)}30%{transform:translateX(-7px)}65%{transform:translateX(7px)}}@keyframes damageRise{0%{opacity:0;transform:translate(-50%,0) scale(.7)}18%{opacity:1}100%{opacity:0;transform:translate(-50%,-55px) scale(1.05)}}@keyframes battleSweep{100%{transform:translateX(120%)}}@media(max-width:720px){.battleTeamGrid{grid-template-columns:repeat(auto-fit,minmax(138px,1fr))}.battleFighter .card{max-width:170px!important}.battleRulesGrid{grid-template-columns:1fr}.battleFeedTop{align-items:start;flex-direction:column}}
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
const originalBattleView = battle;
function visibleAllCards(q) {
  return state.cards.filter(x => !q || (String(x.title) + String(x.tag) + String(x.effect) + ch(x.cid).name).toLowerCase().includes(q));
}
function sortAllCards(a, b) {
  return ch(a.cid).name.localeCompare(ch(b.cid).name) || score(b) - score(a);
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
function battleCardScore(c) {
  return Number(c.grade || 0) || score(c);
}
function candidateSquad() {
  const all = (state.cards || []).slice().sort((a, b) => battleCardScore(b) - battleCardScore(a));
  const chosen = [];
  const used = new Set();
  all.filter(c => c.equipped).forEach(c => { if (chosen.length < 3 && !used.has(c.id)) { chosen.push(c); used.add(c.id); } });
  all.forEach(c => { if (chosen.length < 3 && !used.has(c.id)) { chosen.push(c); used.add(c.id); } });
  return chosen;
}
function fighterHtml(c, team, index) {
  const max = Math.max(20, Math.round(80 + Number(c.d || 0) * 2));
  return `<div class="battleFighter" data-team="${team}" data-fighter-id="${h(c.id)}"><div class="hpBox"><div class="hpLine"><span>${team === 'player' ? 'You' : 'Enemy'} ${index + 1}</span><b><span class="hpNow">${max}</span>/<span class="hpMax">${max}</span></b></div><div class="hpTrack"><div class="hpFill" style="width:100%"></div></div></div>${cardHtml(c)}</div>`;
}
function battleRulesHtml() {
  return `<div class="battleRules"><h3>Auto-Battle Rules</h3><div class="battleRulesGrid"><div class="battleRule"><b>Squad</b>Uses up to 3 equipped cards first. Empty slots fill from your strongest owned cards.</div><div class="battleRule"><b>Stats</b>POW drives damage. DEF creates HP and reduces damage. SPD controls turn order, crits, and glancing blows.</div><div class="battleRule"><b>Matchups</b>Strong matchups hit harder. Weak matchups hit softer. Neutral stays steady.</div><div class="battleRule"><b>Reward</b>The MVP card decides the reward token. Wins pay more. Losses still give a small consolation reward.</div></div></div>`;
}
function battleStageHtml(b) {
  const player = b?.player || candidateSquad();
  const enemy = b?.enemy || [];
  if (!player.length) return `<div class="battleEmpty">No cards yet. Mint a card before battling.</div>`;
  return `<div class="battleStage" id="battleStage"><div class="battleTeamTitle"><span>Your Squad</span><span>${b ? (b.win ? 'Victory' : 'Defeat') : 'Ready'}</span></div><div class="battleTeamGrid" id="playerTeam">${player.map((c, i) => fighterHtml(c, 'player', i)).join('')}</div><div class="battleTeamTitle"><span>Enemy Squad</span><span>${enemy.length ? 'AI Opponent' : 'Generated on battle start'}</span></div><div class="battleTeamGrid" id="enemyTeam">${enemy.length ? enemy.map((c, i) => fighterHtml(c, 'enemy', i)).join('') : `<div class="battleEmpty">Start an auto-battle to reveal the enemy squad.</div>`}</div><div class="battleFeed"><div class="battleFeedTop"><div><div class="battleResult" id="battleResult">${b ? h(b.summary) : 'Ready to battle.'}</div><div class="battleEventText" id="battleEventText">${b ? 'Replay the latest battle or start a new one.' : 'Click Start Auto-Battle.'}</div></div><div class="row">${b ? '<button class="btn" id="replayBattle">Replay</button>' : ''}<button class="btn" id="skipBattle" style="display:none">Skip Replay</button></div></div><div class="battleLogList" id="battleLogList">${b ? renderBattleLog(b) : ''}</div></div></div>`;
}
function renderBattleLog(b) {
  return (b.rounds || []).map(r => `<div class="battleLogRound">Round ${r.round}</div>${(r.events || []).map(e => `<div class="battleLogEvent">${h(e.text)}</div>`).join('')}`).join('');
}
battle = function() {
  const b = state.lastBattle || null;
  return shell(`<div class="battleAuto"><div class="head"><div><h1>Battle Arena</h1><p>Server-run auto-battles using your selected squad, stats, crits, glancing blows, and matchup bonuses.</p></div><div class="row"><button class="gold" id="fight">Start Auto-Battle</button></div></div>${battleRulesHtml()}${battleStageHtml(b)}</div>`);
};
function fighterSlot(team, id) {
  return document.querySelector(`.battleFighter[data-team="${team}"][data-fighter-id="${CSS.escape(String(id))}"]`);
}
function setFighterHp(team, id, hp, maxHp) {
  const el = fighterSlot(team, id);
  if (!el) return;
  const now = el.querySelector('.hpNow');
  const max = el.querySelector('.hpMax');
  const fill = el.querySelector('.hpFill');
  if (now) now.textContent = Math.max(0, Math.round(hp));
  if (max) max.textContent = Math.round(maxHp);
  if (fill) fill.style.width = `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%`;
  if (hp <= 0) el.classList.add('ko');
}
function flashAttack(attackerTeam, attackerId, defenderTeam, defenderId, ev) {
  const attacker = fighterSlot(attackerTeam, attackerId);
  const defender = fighterSlot(defenderTeam, defenderId);
  if (attacker) attacker.classList.add('attacking');
  if (defender) defender.classList.add('defending');
  if (defender) {
    const pop = document.createElement('div');
    pop.className = `damagePop ${ev.crit ? 'crit' : ''}`;
    pop.textContent = `${ev.crit ? 'CRIT ' : ''}-${ev.damage}`;
    defender.appendChild(pop);
    setTimeout(() => pop.remove(), 760);
  }
  setTimeout(() => {
    if (attacker) attacker.classList.remove('attacking');
    if (defender) defender.classList.remove('defending');
  }, 260);
}
async function playBattleReplay(b) {
  if (!b) return;
  battleAnimating = true;
  battleSkipRequested = false;
  const stage = document.getElementById('battleStage');
  const txt = document.getElementById('battleEventText');
  const result = document.getElementById('battleResult');
  const skip = document.getElementById('skipBattle');
  if (stage) stage.classList.add('playing');
  if (skip) {
    skip.style.display = '';
    skip.onclick = () => battleSkipRequested = true;
  }
  [...(b.player || []), ...(b.enemy || [])].forEach(f => setFighterHp(f.team, f.id, f.maxHp, f.maxHp));
  for (const round of b.rounds || []) {
    if (battleSkipRequested) break;
    if (txt) txt.textContent = `Round ${round.round}`;
    await wait(450);
    for (const ev of round.events || []) {
      if (battleSkipRequested) break;
      flashAttack(ev.attackerTeam, ev.attackerId, ev.defenderTeam, ev.defenderId, ev);
      setFighterHp(ev.defenderTeam, ev.defenderId, ev.defenderHp, ev.defenderMaxHp);
      if (txt) txt.textContent = ev.text;
      await wait(760);
    }
  }
  (b.player || []).forEach(f => setFighterHp('player', f.id, f.finalHp, f.maxHp));
  (b.enemy || []).forEach(f => setFighterHp('enemy', f.id, f.finalHp, f.maxHp));
  if (result) result.textContent = b.summary;
  if (txt) txt.textContent = b.win ? 'Battle complete. Victory.' : 'Battle complete. Defeat.';
  if (stage) stage.classList.remove('playing');
  if (skip) skip.style.display = 'none';
  battleAnimating = false;
}
async function runAutoBattle() {
  if (battleAnimating) return;
  const fight = document.getElementById('fight');
  try {
    if (fight) { fight.disabled = true; fight.textContent = 'Battling...'; }
    const data = await api('/api/battle/fight', {method:'POST'});
    state.lastBattle = data.battle;
    state.log = [{win:data.battle.win,txt:data.battle.summary}, ...(Array.isArray(state.log) ? state.log : [])].slice(0,40);
    state.tokens[data.battle.tokenType] = Number(state.tokens[data.battle.tokenType] || 0) + Number(data.battle.reward || 0);
    render();
    await playBattleReplay(data.battle);
    await loadState();
  } catch(e) {
    alert(e.message || 'Battle failed');
    if (fight) { fight.disabled = false; fight.textContent = 'Start Auto-Battle'; }
  }
}
const titleLimitOldBind = bind;
bind = function() {
  titleLimitOldBind();
  setupFlavorTags();
  scheduleTitleFit();
  document.querySelectorAll('[data-vault-owner]').forEach(btn => {
    btn.onclick = () => {
      state.vaultOwner = btn.dataset.vaultOwner;
      queueMeta();
      render();
    };
  });
  const refreshVault = document.getElementById('refreshVault');
  if (refreshVault) refreshVault.onclick = () => {
    const ownerId = state.vaultOwner || user?.id || 'cydney';
    delete vaultCache[ownerId];
    loadPublicVault(ownerId);
  };
  const replay = document.getElementById('replayBattle');
  if (replay) replay.onclick = () => playBattleReplay(state.lastBattle);
  const fight = document.getElementById('fight');
  if (fight) fight.onclick = runAutoBattle;
};