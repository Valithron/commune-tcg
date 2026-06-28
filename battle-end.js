function injectBattleEndStyles() {
  if (document.getElementById('ctcgBattleEndStyles')) return;
  const style = document.createElement('style');
  style.id = 'ctcgBattleEndStyles';
  style.textContent = `
.battleEndPanel{display:none;border:1px solid rgba(255,255,255,.14);border-radius:18px;background:radial-gradient(circle at 18% 0,rgba(243,201,63,.18),transparent 32%),linear-gradient(145deg,#131a2d,#080c18);padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.34);position:relative;overflow:hidden}.battleEndPanel.show{display:grid;gap:14px}.battleStage.playing .battleEndPanel{display:none!important}.battleEndPanel.victory{border-color:rgba(243,201,63,.42)}.battleEndPanel.defeat{border-color:rgba(255,95,118,.34)}.battleEndHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}.battleEndKicker{font:900 .68rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.12em;color:#aeb2cc}.battleEndTitle{font:900 clamp(1.55rem,4vw,3rem) Sora,Inter,sans-serif;margin:2px 0;color:#f3c93f}.battleEndPanel.defeat .battleEndTitle{color:#ff7b91}.battleEndReason{color:#c8ccdf;font-weight:700}.battleRewardCard{display:flex;align-items:center;gap:12px;border:1px solid rgba(255,255,255,.13);border-radius:16px;background:#0a0f1d;padding:12px 14px;min-width:min(100%,310px)}.battleRewardCard .coin{width:42px;height:42px;font-size:.85rem;flex:none}.battleRewardCard small,.battleReportStat small{display:block;color:#9fa5bf;font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.08em}.battleRewardCard b{display:block;color:#fff;font:900 1.15rem Sora,Inter,sans-serif}.battleReportGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}.battleReportStat{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c1121;padding:11px}.battleReportStat b{display:block;color:#edf1ff;font:900 1rem Sora,Inter,sans-serif;margin-top:3px}.battleEndActions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.battleEndActions .gold{font-size:.95rem;padding:12px 18px}.battleEndNote{color:#9fa5bf;font-size:.82rem}.battleEndMvp{color:#edf1ff;font-weight:900}.battleEndPanel:after{content:"";position:absolute;right:-80px;top:-80px;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.1),transparent 62%);pointer-events:none}@media(max-width:720px){.battleEndHeader{display:grid}.battleRewardCard{min-width:0}.battleEndActions{display:grid}.battleEndActions .gold,.battleEndActions .btn{width:100%}}
`;
  document.head.appendChild(style);
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
function battleEndPanelHtml(b) {
  if (!b) return '';
  const token = ch(b.tokenType || b.mvpCid || 'cydney');
  const stats = battleEndReportStats(b);
  const resultClass = b.win ? 'victory' : 'defeat';
  const resultTitle = b.win ? 'Victory' : 'Defeat';
  const buttonText = b.win ? 'Next Battle' : 'Rematch';
  const rewardLabel = `${b.win ? '+' : 'Consolation +'}${num(b.reward || 0)} ${token.name} Tokens`;
  return `<div class="battleEndPanel ${resultClass} show" id="battleEndPanel"><div class="battleEndHeader"><div><div class="battleEndKicker">Battle Report</div><div class="battleEndTitle">${resultTitle}</div><div class="battleEndReason">${h(b.reason || '')}</div></div><div class="battleRewardCard" style="--a:${token.a}"><span class="coin" style="--a:${token.a}">${token.in}</span><div><small>Reward earned</small><b>${h(rewardLabel)}</b></div></div></div><div class="battleReportGrid"><div class="battleReportStat"><small>MVP</small><b class="battleEndMvp">${h(b.mvpTitle || 'None')}</b></div><div class="battleReportStat"><small>Your cards standing</small><b>${stats.playerStanding} / ${playerCount(b)}</b></div><div class="battleReportStat"><small>Enemy cards standing</small><b>${stats.enemyStanding} / ${enemyCount(b)}</b></div><div class="battleReportStat"><small>Total damage</small><b>${num(stats.totalDamage)}</b></div><div class="battleReportStat"><small>Critical hits</small><b>${num(stats.crits)}</b></div><div class="battleReportStat"><small>Rounds</small><b>${num(stats.rounds)}</b></div></div><div class="battleEndActions"><button class="gold" type="button" data-run-battle>${buttonText}</button><button class="btn" type="button" data-page="collection">Back to Collection</button><span class="battleEndNote">Future update: cached enemy pools by enemy type.</span></div></div>`;
}
function playerCount(b) { return (b?.player || []).length || 0; }
function enemyCount(b) { return (b?.enemy || []).length || 0; }
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
  return shell(`<div class="battleAuto"><div class="head"><div><h1>Battle Arena</h1><p>Fast auto-battles using your best equipped cards, card stats, crits, glancing blows, and matchup bonuses.</p></div><div class="row"><button class="gold" id="fight">Start Auto-Battle</button></div></div>${battleRulesHtml()}${battleStageHtml(b)}</div>`);
};
const battleEndOldPlayReplay = playBattleReplay;
playBattleReplay = async function(b) {
  hideBattleEndPanel();
  await battleEndOldPlayReplay(b);
  revealBattleEndPanel(b);
};
function setupBattleEndButtons() {
  document.querySelectorAll('[data-run-battle]').forEach(button => {
    if (button.dataset.battleEndReady) return;
    button.dataset.battleEndReady = '1';
    button.onclick = () => document.getElementById('fight')?.click();
  });
}
const battleEndOldBind = bind;
bind = function() {
  battleEndOldBind();
  injectBattleEndStyles();
  setupBattleEndButtons();
};
