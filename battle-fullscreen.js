function battleFsMaxHp(f){return Math.max(20,Number(f.maxHp||Math.round(80+Number(f.d||0)*2)||20))}
function battleFsHpPct(now,max){return Math.max(0,Math.min(100,(Number(now||0)/Math.max(1,Number(max||1)))*100))}
function battleFsPortrait(f){
  const cc=ch(f.cid||'cydney');
  if(f.img)return`<img src="${h(f.img)}" style="${cropStyle(f)}" alt="">`;
  return`<div class="battleFsPh" style="--a:${cc.a}">${cc.in}</div>`;
}
function battleFsFighter(f,team,index){
  const cc=ch(f.cid||'cydney'),max=battleFsMaxHp(f),now=max;
  return`<div class="battleFsFighter" data-team="${team}" data-fighter-id="${h(f.id)}" style="--a:${cc.a}"><div class="battleFsPortrait">${battleFsPortrait(f)}</div><div class="battleFsInfo"><div class="battleFsName">${h(f.title||`${cc.name} ${index+1}`)}</div><div class="battleFsMeta">${team==='player'?'You':'Enemy'} ${index+1} · ${h(cc.name)} · ${h((f.rar||'common').toUpperCase())}</div><div class="hpBox battleFsHp"><div class="hpLine"><span>HP</span><b><span class="hpNow">${now}</span>/<span class="hpMax">${max}</span></b></div><div class="hpTrack"><div class="hpFill" style="width:${battleFsHpPct(now,max)}%"></div></div></div></div><div class="battleFsDamage"></div></div>`;
}
function battleFsStageHtml(b){
  if(!b)return`<div class="battleFullscreen"><div class="battleFsTop"><button class="battleFsClose" data-battle-exit type="button">×</button><div><h1>Preparing Battle</h1><p>Building AI squad...</p></div></div><div class="battleFsLoading">Loading fight...</div></div>`;
  return`<div class="battleFullscreen battleFsMode" id="battleFullscreen"><div class="battleFsTop"><button class="battleFsClose" data-battle-exit type="button" aria-label="Exit battle">×</button><div><h1>${h(b.enemyTypeLabel||'Battle')}</h1><p id="battleResult">Battle in progress</p></div><button class="btn battleFsSkip" id="skipBattle" data-battle-skip type="button">Skip to Results</button></div><div class="battleFsStage battleStage playing" id="battleStage"><section class="battleFsTeam enemy"><div class="battleFsTeamLabel">Enemy Squad</div>${(b.enemy||[]).map((f,i)=>battleFsFighter(f,'enemy',i)).join('')}</section><section class="battleFsCenter"><div class="battleFsVs">VS</div><div class="battleFsCaption" id="battleEventText">Starting battle...</div><div class="battleFsLog" id="battleLogList"></div></section><section class="battleFsTeam player"><div class="battleFsTeamLabel">Your Squad</div>${(b.player||[]).map((f,i)=>battleFsFighter(f,'player',i)).join('')}</section></div></div>`;
}
function battleFlowPlayback(){return battleFsStageHtml(state.battleFlowActiveBattle||null)}
function battleFsWait(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function battleFsFind(team,id){return document.querySelector(`[data-team="${team}"][data-fighter-id="${CSS.escape(String(id))}"]`)}
function battleFsSetHp(el,hp,max){
  if(!el)return;
  const safeMax=Math.max(1,Number(max||el.querySelector('.hpMax')?.textContent||1)),safeHp=Math.max(0,Number(hp||0));
  const now=el.querySelector('.hpNow'),mx=el.querySelector('.hpMax'),fill=el.querySelector('.hpFill');
  if(now)now.textContent=String(Math.round(safeHp));
  if(mx)mx.textContent=String(Math.round(safeMax));
  if(fill)fill.style.width=`${battleFsHpPct(safeHp,safeMax)}%`;
  el.classList.toggle('ko',safeHp<=0);
}
function battleFsFinalHp(b){
  [...(b.player||[]),...(b.enemy||[])].forEach(f=>battleFsSetHp(battleFsFind(f.team||((b.player||[]).includes(f)?'player':'enemy'),f.id),Number(f.finalHp||0),battleFsMaxHp(f)));
}
async function playBattleReplay(b){
  const result=document.getElementById('battleResult'),caption=document.getElementById('battleEventText'),log=document.getElementById('battleLogList'),stage=document.getElementById('battleStage');
  if(!stage||!b)return;
  battleAnimating=true;
  state.battlePlaybackSkip=false;
  if(result)result.textContent='Battle in progress';
  if(caption)caption.textContent='The fight begins.';
  if(log)log.innerHTML='';
  document.querySelectorAll('.battleFsFighter').forEach(el=>{el.classList.remove('active','target','ko');const max=Number(el.querySelector('.hpMax')?.textContent||20);battleFsSetHp(el,max,max)});
  await battleFsWait(420);
  const events=(b.rounds||[]).flatMap(r=>(r.events||[]).map(e=>({...e,round:r.round})));
  for(const e of events){
    if(state.battlePlaybackSkip)break;
    const attacker=battleFsFind(e.attackerTeam,e.attackerId),defender=battleFsFind(e.defenderTeam,e.defenderId);
    document.querySelectorAll('.battleFsFighter').forEach(el=>el.classList.remove('active','target','strike','hit'));
    if(caption)caption.textContent=e.text||'';
    if(attacker)attacker.classList.add('active','strike');
    if(defender){defender.classList.add('target');const dmg=defender.querySelector('.battleFsDamage');if(dmg){dmg.textContent=`-${num(e.damage||0)}`;dmg.classList.remove('pop');void dmg.offsetWidth;dmg.classList.add('pop')}}
    await battleFsWait(560);
    if(defender)battleFsSetHp(defender,e.defenderHp,e.defenderMaxHp||defender.querySelector('.hpMax')?.textContent);
    if(log){const row=document.createElement('div');row.className='battleFsLogLine';row.textContent=e.text||'';log.prepend(row)}
    await battleFsWait(300);
  }
  battleFsFinalHp(b);
  document.querySelectorAll('.battleFsFighter').forEach(el=>el.classList.remove('active','target','strike','hit'));
  if(caption)caption.textContent=b.summary||'Battle complete.';
  if(result)result.textContent=b.win?'Victory':'Defeat';
  stage.classList.remove('playing');
  battleAnimating=false;
}
async function beginBattleFlow(){
  if(state.battleFlowRunning)return;
  const runId=`${Date.now()}-${Math.random()}`;
  state.battleFlowRunId=runId;
  state.battlePlaybackExit=false;
  state.battlePlaybackSkip=false;
  try{
    state.battleFlowRunning=true;
    const ids=battleFlowResolvedSquad().map(c=>c.id).slice(0,3);
    if(!ids.length){alert('Choose or mint at least one card first.');state.battleView='team';render();return}
    state.aiBattleSquad=ids;
    state.aiBattleSquadMode='manual';
    state.battleFlowActiveBattle=null;
    state.battleView='playback';
    render();
    const data=await api('/api/battle/fight',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mode:'next',aiBattleSquadMode:state.aiBattleSquadMode,aiBattleSquad:ids,aiEnemyType:battleFlowEnemyId()})});
    if(state.battleFlowRunId!==runId)return;
    state.lastBattle=data.battle;
    state.battleFlowActiveBattle=data.battle;
    if(data.battleHistory)state.battleHistory=data.battleHistory;
    state.log=[{win:data.battle.win,txt:data.battle.summary},...(Array.isArray(state.log)?state.log:[])].slice(0,40);
    state.tokens[data.battle.tokenType]=Number(state.tokens[data.battle.tokenType]||0)+Number(data.battle.reward||0);
    if(state.battlePlaybackExit){await loadState();state.battleView='home';state.battleFlowActiveBattle=null;render();return}
    render();
    await playBattleReplay(data.battle);
    await loadState();
    state.battleView=state.battlePlaybackExit?'home':'results';
    state.battleFlowActiveBattle=null;
    render();
  }catch(e){alert(e.message||'Battle failed');state.battleView='enemy';render()}
  finally{state.battleFlowRunning=false}
}
function bindBattleFullscreen(){
  document.querySelectorAll('[data-battle-exit]').forEach(btn=>{if(btn.dataset.ready)return;btn.dataset.ready='1';btn.onclick=()=>{state.battlePlaybackExit=true;state.battlePlaybackSkip=true;btn.textContent='…'}});
  document.querySelectorAll('[data-battle-skip]').forEach(btn=>{if(btn.dataset.ready)return;btn.dataset.ready='1';btn.onclick=()=>{state.battlePlaybackSkip=true;btn.textContent='Skipping...';btn.disabled=true}});
}
function injectBattleFullscreenStyles(){
  if(document.getElementById('ctcgBattleFullscreenStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgBattleFullscreenStyles';
  style.textContent=`
.battleFullscreen{position:fixed;inset:0;z-index:9998;background:radial-gradient(circle at 50% 0,rgba(243,201,63,.13),transparent 38%),#050914;color:#dfe4ff;display:grid;grid-template-rows:auto minmax(0,1fr);padding:clamp(10px,2vw,18px);gap:12px;overflow:hidden}.battleFsTop{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:rgba(13,18,33,.9);padding:10px}.battleFsTop h1{margin:0;font:900 clamp(1.1rem,3vw,1.9rem) Sora,Inter,sans-serif}.battleFsTop p{margin:2px 0 0;color:#aeb2cc;font:900 .7rem 'JetBrains Mono',monospace;text-transform:uppercase}.battleFsClose{width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:#171b2f;color:#edf1ff;font-size:1.7rem;line-height:1;display:grid;place-items:center}.battleFsSkip{white-space:nowrap}.battleFsLoading{display:grid;place-items:center;border:1px solid rgba(255,255,255,.1);border-radius:20px;background:#0b1020;font:900 1rem 'JetBrains Mono',monospace;text-transform:uppercase;color:#f3c93f}.battleFsStage{min-height:0;display:grid;grid-template-rows:minmax(0,1fr) auto minmax(0,1fr);gap:12px}.battleFsTeam{min-height:0;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(11,16,32,.78);padding:10px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:stretch}.battleFsTeamLabel{grid-column:1/-1;font:900 .66rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.12em;color:#f3c93f}.battleFsFighter{position:relative;min-width:0;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:#080d1a;padding:9px;display:grid;grid-template-columns:68px minmax(0,1fr);gap:9px;align-items:center;transition:transform .18s,border-color .18s,box-shadow .18s,opacity .2s}.battleFsFighter.active{border-color:#f3c93f;box-shadow:0 0 22px rgba(243,201,63,.25)}.battleFsFighter.target{border-color:#ff8f70}.battleFsFighter.strike{transform:translateY(-4px) scale(1.02)}.battleFsFighter.ko{opacity:.45;filter:grayscale(.7)}.battleFsPortrait{width:68px;height:86px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:#0b1020;display:grid;place-items:center}.battleFsPortrait img{width:100%;height:100%;object-fit:cover}.battleFsPh{width:100%;height:100%;display:grid;place-items:center;background:radial-gradient(circle at 30% 0,var(--a),#111827);font:900 1rem 'JetBrains Mono',monospace;color:#050812}.battleFsInfo{min-width:0;display:grid;gap:5px}.battleFsName{font:900 .78rem Sora,Inter,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.battleFsMeta{font:900 .52rem 'JetBrains Mono',monospace;color:#9fa5bf;text-transform:uppercase;letter-spacing:.04em}.battleFsHp .hpLine{font-size:.56rem}.battleFsDamage{position:absolute;right:10px;top:8px;color:#ff8f70;font:900 1.1rem 'JetBrains Mono',monospace;opacity:0;transform:translateY(0)}.battleFsDamage.pop{animation:battleFsDmg .55s ease-out}@keyframes battleFsDmg{0%{opacity:0;transform:translateY(8px) scale(.9)}20%{opacity:1}100%{opacity:0;transform:translateY(-22px) scale(1.18)}}.battleFsCenter{border:1px solid rgba(255,255,255,.12);border-radius:18px;background:linear-gradient(145deg,#101629,#070b16);padding:12px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:center;min-height:98px}.battleFsVs{width:58px;height:58px;border-radius:50%;background:#f3c93f;color:#080b15;display:grid;place-items:center;font:900 .9rem 'JetBrains Mono',monospace}.battleFsCaption{font:900 clamp(.92rem,2.4vw,1.35rem) Sora,Inter,sans-serif;color:#edf1ff;line-height:1.25}.battleFsLog{grid-column:1/-1;max-height:72px;overflow:hidden;display:grid;gap:4px}.battleFsLogLine{color:#9fa5bf;font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media(max-width:720px){.battleFullscreen{padding:8px;padding-bottom:calc(8px + env(safe-area-inset-bottom));gap:8px}.battleFsTop{grid-template-columns:auto 1fr;gap:8px}.battleFsSkip{grid-column:1/-1;width:100%}.battleFsStage{gap:8px}.battleFsTeam{grid-template-columns:1fr;padding:8px;gap:7px}.battleFsFighter{grid-template-columns:54px minmax(0,1fr);padding:7px}.battleFsPortrait{width:54px;height:62px}.battleFsCenter{min-height:112px;grid-template-columns:1fr}.battleFsVs{display:none}.battleFsCaption{text-align:center}.battleFsLog{max-height:54px}.battleFsName{font-size:.74rem}.battleFsMeta{font-size:.48rem}}
`;
  document.head.appendChild(style);
}
const battleFullscreenOldBind=bind;
bind=function(){battleFullscreenOldBind();injectBattleFullscreenStyles();if(state.page==='battle'&&state.battleView==='playback')bindBattleFullscreen()};
injectBattleFullscreenStyles();
if(user&&state.page==='battle'&&state.battleView==='playback')render();
