function injectBattleEndStyles() {
  if (document.getElementById('ctcgBattleEndStyles')) return;
  const style = document.createElement('style');
  style.id = 'ctcgBattleEndStyles';
  style.textContent = `
.battleEndPanel{display:none;border:1px solid rgba(255,255,255,.14);border-radius:18px;background:radial-gradient(circle at 18% 0,rgba(243,201,63,.18),transparent 32%),linear-gradient(145deg,#131a2d,#080c18);padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.34);position:relative;overflow:hidden}.battleEndPanel.show{display:grid;gap:14px}.battleStage.playing .battleEndPanel{display:none!important}.battleEndPanel.victory{border-color:rgba(243,201,63,.42)}.battleEndPanel.defeat{border-color:rgba(255,95,118,.34)}.battleEndHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}.battleEndKicker{font:900 .68rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.12em;color:#aeb2cc}.battleEndTitle{font:900 clamp(1.55rem,4vw,3rem) Sora,Inter,sans-serif;margin:2px 0;color:#f3c93f}.battleEndPanel.defeat .battleEndTitle{color:#ff7b91}.battleEndReason{color:#c8ccdf;font-weight:700}.battleRewardCard{display:flex;align-items:center;gap:12px;border:1px solid rgba(255,255,255,.13);border-radius:16px;background:#0a0f1d;padding:12px 14px;min-width:min(100%,310px)}.battleRewardCard .coin{width:42px;height:42px;font-size:.85rem;flex:none}.battleRewardCard small,.battleReportStat small{display:block;color:#9fa5bf;font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.08em}.battleRewardCard b{display:block;color:#fff;font:900 1.15rem Sora,Inter,sans-serif}.battleReportGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}.battleReportStat{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c1121;padding:11px}.battleReportStat b{display:block;color:#edf1ff;font:900 1rem Sora,Inter,sans-serif;margin-top:3px}.battleEndActions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.battleEndActions .gold{font-size:.95rem;padding:12px 18px}.battleEndNote{color:#9fa5bf;font-size:.82rem}.battleEndMvp{color:#edf1ff;font-weight:900}.battleEndPanel:after{content:"";position:absolute;right:-80px;top:-80px;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.1),transparent 62%);pointer-events:none}
.battleAuto .card{--battleTitleScale:1}.battleAuto .card.battle-title-fit-1{--battleTitleScale:.92}.battleAuto .card.battle-title-fit-2{--battleTitleScale:.84}.battleAuto .card.battle-title-fit-3{--battleTitleScale:.76}.battleAuto .card.battle-title-fit-4{--battleTitleScale:.68}.battleAuto .card.battle-title-fit-5{--battleTitleScale:.60}.battleAuto .card.battle-title-fit-6{--battleTitleScale:.52}.battleAuto .card .ctop strong{font-size:clamp(calc(.70rem * var(--battleTitleScale)),calc(5cqw * var(--battleTitleScale)),calc(1.08rem * var(--battleTitleScale)))!important;letter-spacing:calc(-.055em - ((1 - var(--battleTitleScale)) * .08em))!important;max-width:calc(100% - 3.55rem)!important;line-height:.96!important}.battleAuto .battleTeamGrid .card .badge{font-size:clamp(.34rem,2.1cqw,.52rem)!important;padding:.34em .48em!important}.battleAuto .battleTeamGrid .card .ctop{gap:.25rem!important}
@media(max-width:720px){.battleEndHeader{display:grid}.battleRewardCard{min-width:0}.battleEndActions{display:grid}.battleEndActions .gold,.battleEndActions .btn{width:100%}.battleAuto .card .ctop strong{font-size:clamp(calc(.56rem * var(--battleTitleScale)),calc(5.8cqw * var(--battleTitleScale)),calc(.86rem * var(--battleTitleScale)))!important;max-width:calc(100% - 3rem)!important}}
`;
  document.head.appendChild(style);
}
function clearBattleTitleFit(card) {
  card?.classList.remove('battle-title-fit-1','battle-title-fit-2','battle-title-fit-3','battle-title-fit-4','battle-title-fit-5','battle-title-fit-6');
}
function fitOneBattleTitle(title) {
  const card = title.closest('.battleAuto .card');
  if (!card) return;
  const steps = ['', 'battle-title-fit-1', 'battle-title-fit-2', 'battle-title-fit-3', 'battle-title-fit-4', 'battle-title-fit-5', 'battle-title-fit-6'];
  for (const step of steps) {
    clearBattleTitleFit(card);
    if (step) card.classList.add(step);
    if (title.scrollWidth <= title.clientWidth + 1) break;
  }
}
function fitBattleTitles(root = document) {
  requestAnimationFrame(() => root.querySelectorAll('.battleAuto .card .ctop strong').forEach(fitOneBattleTitle));
}
function scheduleBattleTitleFit(root = document) {
  fitBattleTitles(root);
  setTimeout(() => fitBattleTitles(root), 80);
  setTimeout(() => fitBattleTitles(root), 260);
}
function battleFighter(f, team, done = false) {
  if (typeof fighterHtml === 'function') return fighterHtml(f, team, Number(f.index || 0));
  const id = h(f.id || `${team}-${Number(f.index || 0)}`);
  return `<div class="battleFighter" data-team="${team}" data-fighter-id="${id}">${cardHtml(f)}</div>`;
}
function battleEndReportStats(b) {
  const player = b?.player || [];
  const enemy = b?.enemy || [];
  return {
    playerStanding: player.filter(f => Number(f.finalHp || 0) > 0).length,
    enemyStanding: enemy.filter(f => Number(f.finalHp || 0) > 0).length,
    totalDamage: player.reduce((s, f) => s + Number(f.damageDone || 0), 0),
    crits: player.reduce((s, f) => s + Number(f.crits || 0), 0),
    rounds: (b?.rounds || []).length
  };
}
function playerCount(b) { return (b?.player || []).length || 0; }
function enemyCount(b) { return (b?.enemy || []).length || 0; }
function battleActionButtons(b) {
  if (b?.win) {
    return `<button class="gold" type="button" data-run-battle="next">Next Battle</button>`;
  }
  return `<button class="gold" type="button" data-run-battle="rematch">Rematch Same AI Team</button><button class="btn" type="button" data-run-battle="next">Next Battle</button>`;
}
function battleEndPanelHtml(b) {
  if (!b) return '';
  const token = ch(b.tokenType || b.mvpCid || 'cydney');
  const stats = battleEndReportStats(b);
  const resultClass = b.win ? 'victory' : 'defeat';
  const resultTitle = b.win ? 'Victory' : 'Defeat';
  const rewardLabel = `${b.win ? '+' : 'Consolation +'}${num(b.reward || 0)} ${token.name} Tokens`;
  const source = b.mode === 'rematch' ? 'Cached AI bot rematch' : 'System vs AI bot';
  return `<div class="battleEndPanel ${resultClass} show" id="battleEndPanel"><div class="battleEndHeader"><div><div class="battleEndKicker">${h(source)} · Battle Report</div><div class="battleEndTitle">${resultTitle}</div><div class="battleEndReason">${h(b.reason || '')}</div></div><div class="battleRewardCard" style="--a:${token.a}"><span class="coin" style="--a:${token.a}">${token.in}</span><div><small>Reward earned</small><b>${h(rewardLabel)}</b></div></div></div><div class="battleReportGrid"><div class="battleReportStat"><small>MVP</small><b class="battleEndMvp">${h(b.mvpTitle || 'None')}</b></div><div class="battleReportStat"><small>Your cards standing</small><b>${stats.playerStanding} / ${playerCount(b)}</b></div><div class="battleReportStat"><small>Enemy cards standing</small><b>${stats.enemyStanding} / ${enemyCount(b)}</b></div><div class="battleReportStat"><small>Total damage</small><b>${num(stats.totalDamage)}</b></div><div class="battleReportStat"><small>Critical hits</small><b>${num(stats.crits)}</b></div><div class="battleReportStat"><small>Rounds</small><b>${num(stats.rounds)}</b></div></div><div class="battleEndActions">${battleActionButtons(b)}<button class="btn" type="button" data-page="collection">Back to Collection</button><span class="battleEndNote">These are system vs AI bot opponents. Rematch reuses the same cached bot squad. Next Battle generates a new bot squad.</span></div></div>`;
}
function revealBattleEndPanel(b) {
  const panel = document.getElementById('battleEndPanel');
  if (!panel) return;
  panel.classList.add('show');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  const text = document.getElementById('battleEventText');
  if (text && b?.summary) text.textContent = b.summary;
}
function hideBattleEndPanel() {
  document.getElementById('battleEndPanel')?.classList.remove('show');
}
injectBattleEndStyles();
const battleEndOldStageHtml = battleStageHtml;
battleStageHtml = function(b) {
  if (!b) return battleEndOldStageHtml(b);
  return `<div class="battleStage" id="battleStage"><div class="battleTeamTitle"><span>Enemy Squad</span><span>${h(b.reason || '')}</span></div><div class="battleTeamGrid">${(b.enemy || []).map(f => battleFighter(f, 'enemy', true)).join('')}</div><div class="battleTeamTitle"><span>Your Squad</span><span>MVP: ${h(b.mvpTitle || 'None')}</span></div><div class="battleTeamGrid">${(b.player || []).map(f => battleFighter(f, 'player', true)).join('')}</div>${battleLogHtml(b)}${battleEndPanelHtml(b)}</div>`;
};
battle = function() {
  const b = state.lastBattle || null;
  return shell(`<div class="battleAuto"><div class="head"><div><h1>Battle Arena</h1><p>System vs AI bot auto-battles using your best equipped cards, stats, crits, glancing blows, and matchup bonuses.</p></div><div class="row"><button class="gold" id="fight" data-battle-mode="next">Start Auto-Battle</button></div></div>${battleRulesHtml()}${battleStageHtml(b)}</div>`);
};
const battleEndOldPlayReplay = playBattleReplay;
playBattleReplay = async function(b) {
  hideBattleEndPanel();
  await battleEndOldPlayReplay(b);
  revealBattleEndPanel(b);
};
async function runAiBotBattle(mode = 'next') {
  if (battleAnimating) return;
  const buttons = Array.from(document.querySelectorAll('#fight,[data-run-battle]'));
  try {
    buttons.forEach(b => b.disabled = true);
    const fight = document.getElementById('fight');
    if (fight) fight.textContent = mode === 'rematch' ? 'Rematching...' : 'Battling...';
    const data = await api('/api/battle/fight', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode }) });
    state.lastBattle = data.battle;
    state.log = [{ win: data.battle.win, txt: data.battle.summary }, ...(Array.isArray(state.log) ? state.log : [])].slice(0, 40);
    state.tokens[data.battle.tokenType] = Number(state.tokens[data.battle.tokenType] || 0) + Number(data.battle.reward || 0);
    render();
    await playBattleReplay(data.battle);
    await loadState();
  } catch (e) {
    alert(e.message || 'Battle failed');
    buttons.forEach(b => b.disabled = false);
    const fight = document.getElementById('fight');
    if (fight) fight.textContent = 'Start Auto-Battle';
  }
}
function setupBattleEndButtons() {
  const fight = document.getElementById('fight');
  if (fight) {
    fight.onclick = () => runAiBotBattle(fight.dataset.battleMode || 'next');
  }
  document.querySelectorAll('[data-run-battle]').forEach(button => {
    if (button.dataset.battleEndReady) return;
    button.dataset.battleEndReady = '1';
    button.onclick = () => runAiBotBattle(button.dataset.runBattle || 'next');
  });
}
const battleEndOldBind = bind;
bind = function() {
  battleEndOldBind();
  injectBattleEndStyles();
  setupBattleEndButtons();
  scheduleBattleTitleFit();
};
window.addEventListener('resize', () => scheduleBattleTitleFit());
const battleTitleObserver = new MutationObserver(mutations => {
  if (mutations.some(m => Array.from(m.addedNodes || []).some(n => n.nodeType === 1 && (n.matches?.('.battleAuto .card') || n.querySelector?.('.battleAuto .card'))))) {
    scheduleBattleTitleFit();
  }
});
battleTitleObserver.observe(document.body, { childList: true, subtree: true });