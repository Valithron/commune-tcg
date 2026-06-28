const BATTLE_FLOW_ENEMY_TYPES=[
  {id:'random_encounter',label:'Random Encounter',desc:'Mixed bot squads with normal balance.'},
  {id:'household_chaos',label:'Household Chaos',desc:'Higher DEF opponents and domestic chaos.'},
  {id:'yard_project',label:'Yard Project',desc:'Higher POW and DEF project-themed enemies.'},
  {id:'rival_commune',label:'Rival Commune',desc:'Balanced mirror-style opponent squads.'},
  {id:'boss_fight',label:'Boss Fight',desc:'Harder bot squads with bigger stats.'}
];
function battleFlowView(){return ['home','history','team','enemy','playback','results'].includes(state.battleView)?state.battleView:'home'}
function setBattleFlowView(v){state.battleView=v;render()}
function battleFlowEnemy(){return BATTLE_FLOW_ENEMY_TYPES.some(x=>x.id===state.aiEnemyType)?state.aiEnemyType:'random_encounter'}
function battleFlowEnemyInfo(id=battleFlowEnemy()){return BATTLE_FLOW_ENEMY_TYPES.find(x=>x.id===id)||BATTLE_FLOW_ENEMY_TYPES[0]}
function battleFlowCardScore(c){return Number(c.grade||0)||score(c)}
function battleFlowSortedCards(exclude=new Set()){return (state.cards||[]).slice().filter(c=>!exclude.has(c.id)).sort((a,b)=>battleFlowCardScore(b)-battleFlowCardScore(a)||String(a.title||'').localeCompare(String(b.title||'')))}
function battleFlowAutoSquad(){return battleFlowSortedCards().slice(0,3)}
function battleFlowSquadIds(){return Array.isArray(state.aiBattleSquad)?state.aiBattleSquad.map(String).filter(Boolean).slice(0,3):[]}
function battleFlowResolvedSquad(){
  const chosen=[],used=new Set();
  for(const id of battleFlowSquadIds()){let c=(state.cards||[]).find(x=>String(x.id)===id);if(c&&!used.has(c.id)&&chosen.length<3){chosen.push(c);used.add(c.id)}}
  for(const c of battleFlowSortedCards(used)){if(chosen.length<3){chosen.push(c);used.add(c.id)}}
  return chosen;
}
function battleFlowSelectedIds(){return battleFlowSquadIds().length?battleFlowSquadIds():battleFlowAutoSquad().map(c=>c.id)}
function battleFlowRecord(){const hist=typeof battleHistoryList==='function'?battleHistoryList():(Array.isArray(state.battleHistory)?state.battleHistory:[]);const total=hist.length,wins=hist.filter(x=>x.win).length,xp=hist.reduce((s,x)=>s+Number(x.xpAwarded||0),0),tokens=hist.reduce((s,x)=>s+Number(x.reward||0),0);return{hist,total,wins,losses:total-wins,winRate:total?Math.round(wins/total*100):0,xp,tokens}}
function battleFlowHome(){
  const r=battleFlowRecord(),last=state.lastBattle;
  return shell(`<div class="battleFlow battleFlowHome"><div class="head"><div><h1>Battle</h1><p>Enter the battle flow, review history, or read the rules.</p></div><div class="row"><button class="gold" data-battle-flow="team">Start Battle</button><button class="btn" data-battle-flow="history">History</button></div></div><div class="battleHomeGrid"><section class="battleHero box"><h2>Ready Room</h2><p>Battle setup now happens step by step instead of everything living on one crowded page.</p><button class="gold" data-battle-flow="team">Start Battle</button></section><section class="battleStats box"><h3>Battle Record</h3><div class="battleFlowStats"><div><small>Record</small><b>${num(r.wins)}-${num(r.losses)}</b></div><div><small>Win Rate</small><b>${num(r.winRate)}%</b></div><div><small>Tokens</small><b>${num(r.tokens)}</b></div><div><small>Card XP</small><b>${num(r.xp)}</b></div></div></section><section class="battleLast box"><h3>Last Battle</h3>${last?`<p><b>${last.win?'Victory':'Defeat'}</b> vs ${h(last.enemyTypeLabel||'AI Battle')}</p><p>MVP: ${h(last.mvpTitle||'None')}</p><p>+${num(last.reward||0)} ${h(last.tokenName||ch(last.tokenType||'cydney').name)} Tokens · ${num((last.xpGains||[]).reduce((s,g)=>s+Number(g.xp||0),0))} XP</p><div class="row"><button class="btn" data-battle-flow="results">View Results</button><button class="btn" data-battle-flow="history">View History</button></div>`:'<p>No battles yet. Start one to create your first report.</p>'}</section></div></div>`);
}
function battleFlowHistory(){
  const r=battleFlowRecord();
  const rows=r.hist.slice(0,24);
  return shell(`<div class="battleFlow"><div class="head"><div><h1>Battle History</h1><p>Review previous AI battles without cluttering the live battle screen.</p></div><div class="row"><button class="btn" data-battle-flow="home">Back</button><button class="gold" data-battle-flow="team">Start Battle</button></div></div><div class="battleFlowStats wide"><div><small>Record</small><b>${num(r.wins)}-${num(r.losses)}</b></div><div><small>Win Rate</small><b>${num(r.winRate)}%</b></div><div><small>Tokens Earned</small><b>${num(r.tokens)}</b></div><div><small>Card XP</small><b>${num(r.xp)}</b></div></div><div class="battleFlowHistoryList">${rows.length?rows.map(x=>`<article class="box battleFlowHistoryRow ${x.win?'win':'loss'}"><div><b>${x.win?'Victory':'Defeat'}</b><small>${h(x.enemyTypeLabel||'AI Battle')}</small></div><div><b>${h(x.mvpTitle||'None')}</b><small>MVP</small></div><div><b>+${num(x.reward||0)}</b><small>${h(x.tokenName||'Tokens')}</small></div><div><b>${num(x.xpAwarded||0)}</b><small>XP</small></div></article>`).join(''):'<div class="box">No battle history yet.</div>'}</div></div>`);
}
function battleFlowSlot(c,i){return`<div class="battleFlowSlot ${c?'filled':''}">${c?cardHtml(c):`<div class="battleFlowEmpty"><b>Slot ${i+1}</b><span>Choose a card</span></div>`}</div>`}
function battleFlowTeam(){
  const selectedIds=battleFlowSelectedIds();
  const selected=selectedIds.map(id=>(state.cards||[]).find(c=>String(c.id)===String(id))).filter(Boolean).slice(0,3);
  const selectedSet=new Set(selected.map(c=>c.id));
  const cards=battleFlowSortedCards();
  return shell(`<div class="battleFlow"><div class="head"><div><h1>Choose Your Squad</h1><p>Pick up to three cards. Empty slots auto-fill from your strongest remaining cards.</p></div><div class="row"><button class="btn" data-battle-flow="home">Back</button><button class="gold" data-battle-flow="enemy">Continue</button></div></div><section class="box battleFlowSelected"><div class="battleFlowTop"><h3>Selected Squad</h3><div class="row"><button class="btn" data-battle-auto-squad>Auto Pick Best</button><button class="btn" data-battle-clear-squad>Clear</button></div></div><div class="battleFlowSlots">${[0,1,2].map(i=>battleFlowSlot(selected[i],i)).join('')}</div></section><section class="box"><div class="battleFlowTop"><h3>Card Pool</h3><small>${selected.length}/3 selected</small></div><div class="battleFlowPickGrid">${cards.length?cards.map(c=>`<button class="battleFlowPick ${selectedSet.has(c.id)?'on':''}" data-battle-pick="${h(c.id)}">${cardHtml(c)}<span>Grade ${h(battleFlowCardScore(c))}</span></button>`).join(''):'<div>No cards available. Mint a card first.</div>'}</div></section></div>`);
}
function battleFlowEnemy(){
  const active=battleFlowEnemyInfo();
  const squad=battleFlowResolvedSquad();
  return shell(`<div class="battleFlow"><div class="head"><div><h1>Choose Encounter</h1><p>Select what kind of AI squad you want to fight.</p></div><div class="row"><button class="btn" data-battle-flow="team">Back</button><button class="gold" data-begin-battle-flow>Begin Battle</button></div></div><section class="box"><h3>Your Squad</h3><div class="battleFlowMiniSquad">${squad.map(c=>`<div><b>${h(c.title)}</b><small>${h(ch(c.cid).name)} · Grade ${h(battleFlowCardScore(c))}</small></div>`).join('')||'<p>No squad selected.</p>'}</div></section><section class="box"><h3>Enemy Type</h3><p>Current: <b>${h(active.label)}</b></p><div class="battleFlowEnemyGrid">${BATTLE_FLOW_ENEMY_TYPES.map(e=>`<button class="battleFlowEnemy ${active.id===e.id?'on':''}" data-battle-enemy="${e.id}"><b>${h(e.label)}</b><small>${h(e.desc)}</small></button>`).join('')}</div></section></div>`);
}
function battleFlowPlayback(){
  const b=state.battleFlowActiveBattle||state.lastBattle;
  return shell(`<div class="battleFlow"><div class="head"><div><h1>Battle Playback</h1><p>Phase 2 foundation. Full-screen synced playback comes in the next battle phases.</p></div><div class="row"><button class="btn" data-battle-flow="home">Exit</button></div></div>${b?battleStageHtml(b):'<div class="box">Battle loading...</div>'}</div>`);
}
function battleFlowResults(){
  const b=state.lastBattle;
  if(!b)return battleFlowHome();
  const token=ch(b.tokenType||'cydney');
  const xpGains=b.xpGains||[];
  return shell(`<div class="battleFlow"><div class="head"><div><h1>${b.win?'Victory':'Defeat'}</h1><p>${h(b.enemyTypeLabel||'AI Battle')} · ${h(b.reason||'Battle complete')}</p></div><div class="row"><button class="gold" data-battle-flow="team">Battle Again</button><button class="btn" data-battle-flow="history">History</button><button class="btn" data-battle-flow="home">Home</button></div></div><section class="box battleFlowResultHero" style="--a:${token.a}"><span class="coin" style="--a:${token.a}">${token.in}</span><div><small>Reward</small><b>+${num(b.reward||0)} ${h(token.name)} Tokens</b></div></section><div class="battleFlowStats wide"><div><small>MVP</small><b>${h(b.mvpTitle||'None')}</b></div><div><small>Card XP</small><b>${num(xpGains.reduce((s,g)=>s+Number(g.xp||0),0))}</b></div><div><small>Damage</small><b>${num((b.player||[]).reduce((s,f)=>s+Number(f.damageDone||0),0))}</b></div><div><small>Crits</small><b>${num((b.player||[]).reduce((s,f)=>s+Number(f.crits||0),0))}</b></div></div><section class="box"><h3>Card Progress</h3><div class="battleFlowXpList">${xpGains.length?xpGains.map(g=>`<div><b>${h(g.title)}</b><span>+${num(g.xp)} XP${g.leveledUp?' · Level Up':''}</span></div>`).join(''):'<p>No XP data returned.</p>'}</div></section></div>`);
}
function battleFlowPage(){
  const view=battleFlowView();
  if(view==='history')return battleFlowHistory();
  if(view==='team')return battleFlowTeam();
  if(view==='enemy')return battleFlowEnemy();
  if(view==='playback')return battleFlowPlayback();
  if(view==='results')return battleFlowResults();
  return battleFlowHome();
}
async function beginBattleFlow(){
  if(state.battleFlowRunning)return;
  try{
    state.battleFlowRunning=true;
    const ids=battleFlowSelectedIds().slice(0,3);
    state.aiBattleSquad=ids;
    state.aiBattleSquadMode=ids.length?'manual':'auto';
    state.battleView='playback';
    render();
    const data=await api('/api/battle/fight',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mode:'next',aiBattleSquadMode:state.aiBattleSquadMode,aiBattleSquad:ids,aiEnemyType:battleFlowEnemy()})});
    state.lastBattle=data.battle;
    state.battleFlowActiveBattle=data.battle;
    if(data.battleHistory)state.battleHistory=data.battleHistory;
    state.log=[{win:data.battle.win,txt:data.battle.summary},...(Array.isArray(state.log)?state.log:[])].slice(0,40);
    state.tokens[data.battle.tokenType]=Number(state.tokens[data.battle.tokenType]||0)+Number(data.battle.reward||0);
    render();
    if(typeof playBattleReplay==='function')await playBattleReplay(data.battle);
    await loadState();
    state.battleView='results';
    state.battleFlowActiveBattle=null;
    render();
  }catch(e){alert(e.message||'Battle failed');state.battleView='enemy';render()}
  finally{state.battleFlowRunning=false}
}
function bindBattleFlow(){
  document.getElementById('battleHistoryPanel')?.remove();
  document.querySelectorAll('[data-battle-flow]').forEach(b=>{if(b.dataset.battleFlowReady)return;b.dataset.battleFlowReady='1';b.onclick=()=>setBattleFlowView(b.dataset.battleFlow)});
  document.querySelectorAll('[data-battle-pick]').forEach(b=>{if(b.dataset.battlePickReady)return;b.dataset.battlePickReady='1';b.onclick=()=>{let id=b.dataset.battlePick,ids=battleFlowSelectedIds().filter(Boolean);ids=ids.includes(id)?ids.filter(x=>x!==id):(ids.length<3?[...ids,id]:ids);state.aiBattleSquad=ids;state.aiBattleSquadMode=ids.length?'manual':'auto';render()}});
  document.querySelector('[data-battle-auto-squad]')?.addEventListener('click',()=>{state.aiBattleSquad=battleFlowAutoSquad().map(c=>c.id);state.aiBattleSquadMode='auto';render()});
  document.querySelector('[data-battle-clear-squad]')?.addEventListener('click',()=>{state.aiBattleSquad=[];state.aiBattleSquadMode='auto';render()});
  document.querySelectorAll('[data-battle-enemy]').forEach(b=>{if(b.dataset.battleEnemyReady)return;b.dataset.battleEnemyReady='1';b.onclick=()=>{state.aiEnemyType=b.dataset.battleEnemy;render()}});
  document.querySelector('[data-begin-battle-flow]')?.addEventListener('click',beginBattleFlow);
}
function injectBattleFlowStyles(){
  if(document.getElementById('ctcgBattleFlowStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgBattleFlowStyles';
  style.textContent=`
.battleFlow{display:grid;gap:18px}.battleHomeGrid{display:grid;grid-template-columns:1.2fr 1fr;gap:14px}.battleHero{display:grid;gap:12px;align-content:start;background:radial-gradient(circle at 18% 0,rgba(243,201,63,.18),transparent 34%),linear-gradient(145deg,#11182a,#080d19)}.battleHero h2{margin:0;font:900 1.5rem Sora,Inter,sans-serif}.battleHero p,.battleLast p{color:#c8ccdf}.battleStats,.battleLast{display:grid;gap:10px}.battleFlowStats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.battleFlowStats.wide{grid-template-columns:repeat(auto-fit,minmax(135px,1fr))}.battleFlowStats div{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c1121;padding:11px}.battleFlowStats small,.battleFlowHistoryRow small,.battleFlowMiniSquad small{display:block;color:#9fa5bf;font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.06em}.battleFlowStats b{display:block;margin-top:3px;color:#edf1ff}.battleFlowTop{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}.battleFlowSlots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.battleFlowSlot{border:1px solid rgba(255,255,255,.1);border-radius:16px;background:#0b1020;padding:8px;min-height:170px;display:grid;place-items:center}.battleFlowSlot .card{width:100%!important;max-width:190px!important}.battleFlowEmpty{text-align:center;color:#9fa5bf}.battleFlowEmpty b{display:block;color:#edf1ff}.battleFlowPickGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:12px}.battleFlowPick{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#080d18;color:#dfe4ff;padding:8px;display:grid;gap:6px;text-align:left;cursor:pointer}.battleFlowPick .card{width:100%!important}.battleFlowPick span{font:900 .62rem 'JetBrains Mono',monospace;color:#aeb2cc}.battleFlowPick.on{border-color:#f3c93f;box-shadow:0 0 0 2px rgba(243,201,63,.22)}.battleFlowEnemyGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.battleFlowEnemy{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0b1020;color:#dfe4ff;padding:12px;text-align:left;display:grid;gap:6px}.battleFlowEnemy small{color:#aeb2cc;line-height:1.3}.battleFlowEnemy.on{border-color:#f3c93f;background:linear-gradient(145deg,rgba(243,201,63,.2),#0b1020)}.battleFlowMiniSquad{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}.battleFlowMiniSquad div{border:1px solid rgba(255,255,255,.1);border-radius:12px;background:#0c1121;padding:10px}.battleFlowHistoryList{display:grid;gap:8px}.battleFlowHistoryRow{display:grid;grid-template-columns:1fr 1.4fr .8fr .6fr;gap:10px;align-items:center}.battleFlowHistoryRow.win{border-left:4px solid #35d6c5}.battleFlowHistoryRow.loss{border-left:4px solid #ff7b91}.battleFlowResultHero{display:flex;align-items:center;gap:14px}.battleFlowResultHero .coin{width:52px;height:52px}.battleFlowResultHero small{display:block;color:#9fa5bf;font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase}.battleFlowResultHero b{font:900 1.2rem Sora,Inter,sans-serif}.battleFlowXpList{display:grid;gap:8px}.battleFlowXpList div{display:flex;justify-content:space-between;gap:10px;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:#0c1121;padding:10px}.battleFlowXpList span{color:#35d6c5;font:900 .72rem 'JetBrains Mono',monospace}@media(max-width:720px){.battleHomeGrid{grid-template-columns:1fr}.battleFlowSlots{grid-template-columns:1fr}.battleFlowHistoryRow{grid-template-columns:1fr}.battleFlow .head{display:grid}.battleFlow .head .row{display:grid}.battleFlow .head .row .btn,.battleFlow .head .row .gold{width:100%}.battleFlowPickGrid{grid-template-columns:repeat(auto-fill,minmax(112px,1fr))}}
`;
  document.head.appendChild(style);
}
function installBattleFlow(){
  if(window.__ctcgBattleFlowInstalled)return;
  window.__ctcgBattleFlowInstalled=true;
  injectBattleFlowStyles();
  battle=battleFlowPage;
  const oldBind=bind;
  bind=function(){oldBind();injectBattleFlowStyles();if(state.page==='battle')bindBattleFlow()};
  if(user&&state.page==='battle')render();
}
setTimeout(installBattleFlow,250);
