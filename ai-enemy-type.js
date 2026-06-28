const AI_ENEMY_TYPE_OPTIONS=[
  {id:'random_encounter',label:'Random Encounter',desc:'Mixed bot squads with normal balance.'},
  {id:'household_chaos',label:'Household Chaos',desc:'Higher DEF opponents.'},
  {id:'yard_project',label:'Yard Project',desc:'Higher POW and DEF opponents.'},
  {id:'rival_commune',label:'Rival Commune',desc:'Balanced mirror-style opponents.'},
  {id:'boss_fight',label:'Boss Fight',desc:'Harder bot squads with bigger stats.'}
];
function aiEnemyType(){return AI_ENEMY_TYPE_OPTIONS.some(x=>x.id===state.aiEnemyType)?state.aiEnemyType:'random_encounter'}
function aiEnemyTypeInfo(id=aiEnemyType()){return AI_ENEMY_TYPE_OPTIONS.find(x=>x.id===id)||AI_ENEMY_TYPE_OPTIONS[0]}
function aiEnemyTypePanelHtml(){const active=aiEnemyType();return`<div class="aiEnemyPanel"><div class="aiEnemyTop"><div><h3>Enemy Type</h3><p>${h(aiEnemyTypeInfo(active).desc)} Rematch uses the cached enemy squad.</p></div><span class="aiEnemyPill">${h(aiEnemyTypeInfo(active).label)}</span></div><div class="aiEnemyOptions">${AI_ENEMY_TYPE_OPTIONS.map(opt=>`<button class="aiEnemyOption ${active===opt.id?'on':''}" data-ai-enemy-type="${opt.id}"><b>${h(opt.label)}</b><small>${h(opt.desc)}</small></button>`).join('')}</div></div>`}
function injectAiEnemyTypeStyles(){if(document.getElementById('ctcgAiEnemyTypeStyles'))return;const style=document.createElement('style');style.id='ctcgAiEnemyTypeStyles';style.textContent=`
.aiEnemyPanel{border:1px solid rgba(255,255,255,.12);border-radius:18px;background:radial-gradient(circle at 82% 0,rgba(177,120,255,.15),transparent 34%),linear-gradient(145deg,#11182a,#080d19);padding:16px;display:grid;gap:14px}.aiEnemyTop{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}.aiEnemyTop h3{margin:0 0 4px;font:900 1rem Sora,Inter,sans-serif}.aiEnemyTop p{margin:0;color:#b9bed3;font-size:.86rem}.aiEnemyPill{border:1px solid rgba(243,201,63,.32);border-radius:999px;background:rgba(243,201,63,.12);color:#f3c93f;padding:7px 10px;font:900 .66rem 'JetBrains Mono',monospace;text-transform:uppercase;white-space:nowrap}.aiEnemyOptions{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.aiEnemyOption{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0b1020;color:#dfe4ff;padding:11px;text-align:left;cursor:pointer;display:grid;gap:5px}.aiEnemyOption b{font:900 .78rem Sora,Inter,sans-serif}.aiEnemyOption small{color:#9fa5bf;line-height:1.25}.aiEnemyOption.on{border-color:#f3c93f;background:linear-gradient(145deg,rgba(243,201,63,.22),#0b1020);box-shadow:0 0 0 2px rgba(243,201,63,.13),0 0 24px rgba(243,201,63,.12)}@media(max-width:720px){.aiEnemyOptions{grid-template-columns:1fr}.aiEnemyOption{padding:12px}}
`;document.head.appendChild(style)}
injectAiEnemyTypeStyles();
const aiEnemyOldBattle=battle;
battle=function(){const html=aiEnemyOldBattle();return html.replace('<div class="battleStage"',aiEnemyTypePanelHtml()+'<div class="battleStage"')}
async function runAiBotBattleWithEnemyType(mode='next'){
  if(battleAnimating)return;
  const buttons=Array.from(document.querySelectorAll('#fight,[data-run-battle]'));
  try{
    buttons.forEach(b=>b.disabled=true);
    const fight=document.getElementById('fight');
    if(fight)fight.textContent=mode==='rematch'?'Rematching...':'Battling...';
    const data=await api('/api/battle/fight',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mode,aiBattleSquadMode:aiSquadMode(),aiBattleSquad:aiSquadIds(),aiEnemyType:aiEnemyType()})});
    state.lastBattle=data.battle;
    state.aiBattleSquadMode=data.battle.squadMode||state.aiBattleSquadMode;
    state.log=[{win:data.battle.win,txt:data.battle.summary},...(Array.isArray(state.log)?state.log:[])].slice(0,40);
    state.tokens[data.battle.tokenType]=Number(state.tokens[data.battle.tokenType]||0)+Number(data.battle.reward||0);
    render();
    await playBattleReplay(data.battle);
    await loadState();
  }catch(e){
    alert(e.message||'Battle failed');
    buttons.forEach(b=>b.disabled=false);
    const fight=document.getElementById('fight');
    if(fight)fight.textContent='Start Auto-Battle';
  }
}
runAiBotBattle=runAiBotBattleWithEnemyType;
function setupAiEnemyType(){injectAiEnemyTypeStyles();if(state.page!=='battle')return;document.querySelectorAll('[data-ai-enemy-type]').forEach(b=>{if(b.dataset.enemyTypeReady)return;b.dataset.enemyTypeReady='1';b.onclick=()=>{state.aiEnemyType=b.dataset.aiEnemyType;queueMeta();render()}})}
const aiEnemyOldBind=bind;
bind=function(){aiEnemyOldBind();setupAiEnemyType()};
