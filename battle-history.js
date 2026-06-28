function battleHistoryList(){
  let hist=Array.isArray(state.battleHistory)?state.battleHistory.slice():[];
  if(!hist.length&&state.lastBattle){
    const b=state.lastBattle,player=b.player||[],enemy=b.enemy||[];
    hist=[{id:b.id,createdAt:b.createdAt,win:!!b.win,enemyType:b.enemyType||'random_encounter',enemyTypeLabel:b.enemyTypeLabel||'AI Battle',squadMode:b.squadMode||'auto',mode:b.mode||'next',mvpTitle:b.mvpTitle||'None',reward:Number(b.reward||0),tokenType:b.tokenType||'cydney',tokenName:b.tokenName||ch(b.tokenType||'cydney').name,rounds:(b.rounds||[]).length,playerStanding:player.filter(f=>Number(f.finalHp||0)>0).length,playerCount:player.length,enemyStanding:enemy.filter(f=>Number(f.finalHp||0)>0).length,enemyCount:enemy.length,totalDamage:player.reduce((s,f)=>s+Number(f.damageDone||0),0),crits:player.reduce((s,f)=>s+Number(f.crits||0),0),summary:b.summary||''}];
  }
  return hist;
}
function battleHistoryStats(hist){
  const total=hist.length,wins=hist.filter(x=>x.win).length,losses=total-wins,tokens=hist.reduce((s,x)=>s+Number(x.reward||0),0),damage=hist.reduce((s,x)=>s+Number(x.totalDamage||0),0),crits=hist.reduce((s,x)=>s+Number(x.crits||0),0);
  const mvpCounts={};
  const typeCounts={};
  for(const hst of hist){if(hst.mvpTitle)mvpCounts[hst.mvpTitle]=(mvpCounts[hst.mvpTitle]||0)+1;if(hst.enemyTypeLabel)typeCounts[hst.enemyTypeLabel]=(typeCounts[hst.enemyTypeLabel]||0)+1}
  const top=(obj,empty)=>Object.entries(obj).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0]||empty;
  return{total,wins,losses,winRate:total?Math.round((wins/total)*100):0,tokens,damage,crits,topMvp:top(mvpCounts,'None yet'),topType:top(typeCounts,'None yet')};
}
function battleHistoryTime(ts){
  if(!ts)return'';
  try{return new Date(ts).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}catch(e){return''}
}
function battleHistoryRow(hst){
  const token=ch(hst.tokenType||'cydney');
  const result=hst.win?'Victory':'Defeat';
  return`<div class="battleHistoryRow ${hst.win?'win':'loss'}"><div class="battleHistoryResult"><b>${result}</b><small>${h(battleHistoryTime(hst.createdAt))}</small></div><div class="battleHistoryMain"><b>${h(hst.enemyTypeLabel||'AI Battle')}</b><small>MVP: ${h(hst.mvpTitle||'None')} · ${num(hst.rounds||0)} rounds · ${h(hst.squadMode||'auto')} squad</small></div><div class="battleHistoryMeta"><span style="--a:${token.a}">+${num(hst.reward||0)} ${token.in}</span><small>${num(hst.totalDamage||0)} dmg · ${num(hst.crits||0)} crit</small></div><div class="battleHistoryStanding"><small>Standing</small><b>${num(hst.playerStanding||0)}/${num(hst.playerCount||0)} vs ${num(hst.enemyStanding||0)}/${num(hst.enemyCount||0)}</b></div></div>`;
}
function battleHistoryPanelHtml(){
  const hist=battleHistoryList();
  const s=battleHistoryStats(hist);
  return`<section class="battleHistoryPanel" id="battleHistoryPanel"><div class="battleHistoryHead"><div><h2>Battle Record</h2><p>Compact history of your last ${hist.length?Math.min(hist.length,50):0} AI bot battles.</p></div><button class="btn" id="refreshBattleHistory" type="button">Refresh</button></div><div class="battleHistoryStats"><div><small>Record</small><b>${num(s.wins)}-${num(s.losses)}</b></div><div><small>Win Rate</small><b>${num(s.winRate)}%</b></div><div><small>Tokens Earned</small><b>${num(s.tokens)}</b></div><div><small>Total Damage</small><b>${num(s.damage)}</b></div><div><small>Critical Hits</small><b>${num(s.crits)}</b></div><div><small>Top MVP</small><b>${h(s.topMvp)}</b></div><div><small>Most Fought</small><b>${h(s.topType)}</b></div></div><div class="battleHistoryList">${hist.length?hist.slice(0,12).map(battleHistoryRow).join(''):'<div class="battleHistoryEmpty">No battle history yet. Run a battle and this record will start filling in.</div>'}</div></section>`;
}
function injectBattleHistoryStyles(){
  if(document.getElementById('ctcgBattleHistoryStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgBattleHistoryStyles';
  style.textContent=`
.battleHistoryPanel{margin-top:18px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:radial-gradient(circle at 18% 0,rgba(53,214,197,.12),transparent 34%),linear-gradient(145deg,#11182a,#080d19);padding:16px;display:grid;gap:14px}.battleHistoryHead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}.battleHistoryHead h2{margin:0;font:900 1.3rem Sora,Inter,sans-serif}.battleHistoryHead p{margin:4px 0 0;color:#aeb2cc;font-size:.86rem}.battleHistoryStats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}.battleHistoryStats div{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c1121;padding:10px}.battleHistoryStats small,.battleHistoryRow small{display:block;color:#9fa5bf;font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.06em}.battleHistoryStats b{display:block;margin-top:3px;color:#edf1ff;font:900 .95rem Sora,Inter,sans-serif}.battleHistoryList{display:grid;gap:8px}.battleHistoryRow{display:grid;grid-template-columns:minmax(78px,.7fr)minmax(180px,2fr)minmax(130px,1fr)minmax(95px,.8fr);gap:10px;align-items:center;border:1px solid rgba(255,255,255,.1);border-left:4px solid #35d6c5;border-radius:14px;background:#0a0f1d;padding:10px}.battleHistoryRow.loss{border-left-color:#ff7b91}.battleHistoryResult b{font:900 .9rem Sora,Inter,sans-serif;color:#35d6c5}.battleHistoryRow.loss .battleHistoryResult b{color:#ff7b91}.battleHistoryMain b{display:block;color:#edf1ff}.battleHistoryMeta span{display:block;color:var(--a);font:900 .86rem 'JetBrains Mono',monospace}.battleHistoryStanding b{font:900 .78rem 'JetBrains Mono',monospace;color:#dfe4ff}.battleHistoryEmpty{border:1px dashed rgba(255,255,255,.14);border-radius:14px;padding:16px;color:#aeb2cc}@media(max-width:720px){.battleHistoryRow{grid-template-columns:1fr}.battleHistoryStats{grid-template-columns:repeat(2,minmax(0,1fr))}.battleHistoryStats div:last-child{grid-column:1/-1}}
`;
  document.head.appendChild(style);
}
function setupBattleHistoryPanel(){
  injectBattleHistoryStyles();
  if(state.page!=='battle')return;
  const content=document.querySelector('main.content');
  if(!content)return;
  const existing=document.getElementById('battleHistoryPanel');
  if(existing)existing.remove();
  content.insertAdjacentHTML('beforeend',battleHistoryPanelHtml());
  const refresh=document.getElementById('refreshBattleHistory');
  if(refresh)refresh.onclick=()=>loadState();
}
const battleHistoryOldBind=bind;
bind=function(){battleHistoryOldBind();setupBattleHistoryPanel()};
injectBattleHistoryStyles();
setTimeout(()=>{if(user&&state.page==='battle')setupBattleHistoryPanel()},0);
