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
async function battleFsPause(ms){
  const step=40;
  let elapsed=0;
  while(elapsed<ms){
    if(state.battlePlaybackSkip||state.battlePlaybackExit)return false;
    await battleFsWait(Math.min(step,ms-elapsed));
    elapsed+=step;
  }
  return !(state.battlePlaybackSkip||state.battlePlaybackExit);
}
function battleFsFind(team,id){return document.querySelector(`[data-team="${team}"][data-fighter-id="${CSS.escape(String(id))}"]`)}
function battleFsClearEventClasses(){document.querySelectorAll('.battleFsFighter').forEach(el=>el.classList.remove('active','target','windup','strike','impact','hit','crit','strong','weak'))}
function battleFsSetCaption(caption,e){
  if(!caption)return;
  caption.classList.remove('crit','strong','weak','glance');
  if(e?.crit)caption.classList.add('crit');
  if(e?.matchup==='strong')caption.classList.add('strong');
  if(e?.matchup==='weak')caption.classList.add('weak');
  if(e?.glance)caption.classList.add('glance');
  caption.textContent=e?.text||'';
}
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
  (b.player||[]).forEach(f=>battleFsSetHp(battleFsFind('player',f.id),Number(f.finalHp||0),battleFsMaxHp(f)));
  (b.enemy||[]).forEach(f=>battleFsSetHp(battleFsFind('enemy',f.id),Number(f.finalHp||0),battleFsMaxHp(f)));
}
function battleFsDamagePop(defender,e){
  if(!defender)return;
  const dmg=defender.querySelector('.battleFsDamage');
  if(!dmg)return;
  const flags=[e.crit?'CRIT':null,e.glance?'GLANCE':null,e.matchup==='strong'?'STRONG':null,e.matchup==='weak'?'WEAK':null].filter(Boolean);
  dmg.textContent=`-${num(e.damage||0)}${flags.length?` ${flags[0]}`:''}`;
  dmg.className='battleFsDamage';
  if(e.crit)dmg.classList.add('crit');
  if(e.matchup==='strong')dmg.classList.add('strong');
  if(e.matchup==='weak')dmg.classList.add('weak');
  void dmg.offsetWidth;
  dmg.classList.add('pop');
}
function battleFsLogEvent(log,e){
  if(!log)return;
  const row=document.createElement('div');
  row.className='battleFsLogLine';
  if(e.crit)row.classList.add('crit');
  if(e.matchup==='strong')row.classList.add('strong');
  if(e.matchup==='weak')row.classList.add('weak');
  row.textContent=e.text||'';
  log.prepend(row);
}
async function battleFsPlayEvent(e,caption,log){
  if(state.battlePlaybackSkip||state.battlePlaybackExit)return false;
  const attacker=battleFsFind(e.attackerTeam,e.attackerId),defender=battleFsFind(e.defenderTeam,e.defenderId);
  battleFsClearEventClasses();
  battleFsSetCaption(caption,e);
  if(attacker){attacker.classList.add('active','windup');if(e.crit)attacker.classList.add('crit')}
  if(defender){defender.classList.add('target');if(e.matchup==='strong')defender.classList.add('strong');if(e.matchup==='weak')defender.classList.add('weak')}
  if(!await battleFsPause(260))return false;
  if(attacker){attacker.classList.remove('windup');attacker.classList.add('strike')}
  if(!await battleFsPause(220))return false;
  if(defender){defender.classList.add('impact','hit');battleFsDamagePop(defender,e)}
  if(!await battleFsPause(210))return false;
  if(defender)battleFsSetHp(defender,e.defenderHp,e.defenderMaxHp||defender.querySelector('.hpMax')?.textContent);
  battleFsLogEvent(log,e);
  if(e.defeated&&defender){defender.classList.add('ko');if(caption)caption.textContent=e.text||`${e.defenderTitle||'Target'} was knocked out.`;if(!await battleFsPause(260))return false}
  if(!await battleFsPause(e.crit?420:300))return false;
  return true;
}
async function playBattleReplay(b){
  const result=document.getElementById('battleResult'),caption=document.getElementById('battleEventText'),log=document.getElementById('battleLogList'),stage=document.getElementById('battleStage');
  if(!stage||!b)return;
  battleAnimating=true;
  state.battlePlaybackSkip=false;
  if(result)result.textContent='Battle in progress';
  if(caption){caption.className='battleFsCaption';caption.textContent='The fight begins.'}
  if(log)log.innerHTML='';
  document.querySelectorAll('.battleFsFighter').forEach(el=>{el.classList.remove('active','target','windup','strike','impact','hit','crit','strong','weak','ko');const max=Number(el.querySelector('.hpMax')?.textContent||20);battleFsSetHp(el,max,max)});
  await battleFsPause(420);
  const events=(b.rounds||[]).flatMap(r=>(r.events||[]).map(e=>({...e,round:r.round})));
  for(const e of events){
    const ok=await battleFsPlayEvent(e,caption,log);
    if(!ok)break;
  }
  battleFsFinalHp(b);
  battleFsClearEventClasses();
  if(caption){caption.className='battleFsCaption final';caption.textContent=state.battlePlaybackSkip?'Battle skipped. Showing final result.':(b.summary||'Battle complete.')}
  if(result)result.textContent=b.win?'Victory':'Defeat';
  stage.classList.remove('playing');
  stage.classList.add(b.win?'victory':'defeat');
  battleAnimating=false;
  await battleFsPause(state.battlePlaybackSkip?120:700);
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
  document.querySelectorAll('[data-battle-skip]').forEach(btn=>{if(btn.dataset.ready)return;btn.dataset.ready='1';btn.onclick=()=>{state.battlePlaybackSkip=true;btn.textContent='Skipping...';btn.disabled=true;battleFsFinalHp(state.battleFlowActiveBattle||state.lastBattle||{})}});
}
function injectBattleFullscreenStyles(){
  document.getElementById('ctcgBattleFullscreenStyles')?.remove();
  const style=document.createElement('style');
  style.id='ctcgBattleFullscreenStyles';
  style.textContent=`
.battleFullscreen{position:fixed;inset:0;z-index:9998;background:radial-gradient(circle at 50% 0,rgba(243,201,63,.13),transparent 38%),#050914;color:#dfe4ff;display:grid;grid-template-rows:auto minmax(0,1fr);padding:clamp(10px,2vw,18px);gap:12px;overflow:hidden}.battleFsTop{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:rgba(13,18,33,.9);padding:10px}.battleFsTop h1{margin:0;font:900 clamp(1.1rem,3vw,1.9rem) Sora,Inter,sans-serif}.battleFsTop p{margin:2px 0 0;color:#aeb2cc;font:900 .7rem 'JetBrains Mono',monospace;text-transform:uppercase}.battleFsClose{width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:#171b2f;color:#edf1ff;font-size:1.7rem;line-height:1;display:grid;place-items:center}.battleFsSkip{white-space:nowrap}.battleFsLoading{display:grid;place-items:center;border:1px solid rgba(255,255,255,.1);border-radius:20px;background:#0b1020;font:900 1rem 'JetBrains Mono',monospace;text-transform:uppercase;color:#f3c93f}.battleFsStage{min-height:0;display:grid;grid-template-rows:minmax(0,1fr) auto minmax(0,1fr);gap:12px}.battleFsTeam{min-height:0;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(11,16,32,.78);padding:10px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:stretch}.battleFsTeamLabel{grid-column:1/-1;font:900 .66rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.12em;color:#f3c93f}.battleFsFighter{position:relative;min-width:0;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:#080d1a;padding:9px;display:grid;grid-template-columns:68px minmax(0,1fr);gap:9px;align-items:center;transition:transform .16s,border-color .16s,box-shadow .16s,opacity .2s,filter .2s}.battleFsFighter.active{border-color:#f3c93f;box-shadow:0 0 22px rgba(243,201,63,.25)}.battleFsFighter.target{border-color:#ff8f70}.battleFsFighter.windup{transform:translateY(-2px) scale(1.015)}.battleFsFighter.strike{transform:translateY(-5px) scale(1.035)}.battleFsFighter.impact{animation:battleFsHit .28s ease-out}.battleFsFighter.crit{box-shadow:0 0 28px rgba(243,201,63,.34)}.battleFsFighter.strong{border-color:#35d6c5}.battleFsFighter.weak{border-color:#ff8f70}.battleFsFighter.ko{opacity:.45;filter:grayscale(.7)}@keyframes battleFsHit{0%{transform:translateX(0)}30%{transform:translateX(-5px)}60%{transform:translateX(5px)}100%{transform:translateX(0)}}.battleFsPortrait{width:68px;height:86px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:#0b1020;display:grid;place-items:center}.battleFsPortrait img{width:100%;height:100%;object-fit:cover}.battleFsPh{width:100%;height:100%;display:grid;place-items:center;background:radial-gradient(circle at 30% 0,var(--a),#111827);font:900 1rem 'JetBrains Mono',monospace;color:#050812}.battleFsInfo{min-width:0;display:grid;gap:5px}.battleFsName{font:900 .78rem Sora,Inter,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.battleFsMeta{font:900 .52rem 'JetBrains Mono',monospace;color:#9fa5bf;text-transform:uppercase;letter-spacing:.04em}.battleFsHp .hpLine{font-size:.56rem}.battleFsDamage{position:absolute;right:10px;top:8px;color:#ff8f70;font:900 1.05rem 'JetBrains Mono',monospace;opacity:0;transform:translateY(0);text-shadow:0 2px 10px #050914}.battleFsDamage.crit{color:#f3c93f}.battleFsDamage.strong{color:#35d6c5}.battleFsDamage.weak{color:#ff8f70}.battleFsDamage.pop{animation:battleFsDmg .6s ease-out}@keyframes battleFsDmg{0%{opacity:0;transform:translateY(8px) scale(.9)}18%{opacity:1}100%{opacity:0;transform:translateY(-24px) scale(1.18)}}.battleFsCenter{border:1px solid rgba(255,255,255,.12);border-radius:18px;background:linear-gradient(145deg,#101629,#070b16);padding:12px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:center;min-height:98px}.battleFsVs{width:58px;height:58px;border-radius:50%;background:#f3c93f;color:#080b15;display:grid;place-items:center;font:900 .9rem 'JetBrains Mono',monospace}.battleFsCaption{font:900 clamp(.92rem,2.4vw,1.35rem) Sora,Inter,sans-serif;color:#edf1ff;line-height:1.25;transition:color .18s,transform .18s}.battleFsCaption.crit{color:#f3c93f;transform:scale(1.015)}.battleFsCaption.strong{color:#35d6c5}.battleFsCaption.weak{color:#ff8f70}.battleFsCaption.glance{color:#aeb2cc}.battleFsCaption.final{color:#f3c93f}.battleFsLog{grid-column:1/-1;max-height:72px;overflow:hidden;display:grid;gap:4px}.battleFsLogLine{color:#9fa5bf;font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.battleFsLogLine.crit{color:#f3c93f}.battleFsLogLine.strong{color:#35d6c5}.battleFsLogLine.weak{color:#ff8f70}.battleFsStage.victory .battleFsCenter{border-color:rgba(53,214,197,.45)}.battleFsStage.defeat .battleFsCenter{border-color:rgba(255,143,112,.45)}
@media(max-width:720px){.battleFullscreen{padding:6px;padding-bottom:calc(6px + env(safe-area-inset-bottom));gap:6px;grid-template-rows:auto minmax(0,1fr)}.battleFsTop{grid-template-columns:38px minmax(0,1fr) auto;gap:8px;border-radius:14px;padding:7px}.battleFsTop h1{font-size:1.05rem;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.battleFsTop p{font-size:.53rem;line-height:1}.battleFsClose{width:36px;height:36px;font-size:1.45rem}.battleFsSkip{height:36px;padding:0 9px;font-size:.62rem;max-width:118px;overflow:hidden;text-overflow:ellipsis}.battleFsLoading{border-radius:14px}.battleFsStage{grid-template-rows:auto minmax(74px,auto) auto;gap:6px}.battleFsTeam{grid-template-columns:repeat(3,minmax(0,1fr));border-radius:14px;padding:7px;gap:6px;align-items:stretch}.battleFsTeamLabel{font-size:.52rem;letter-spacing:.1em;margin-bottom:-1px}.battleFsFighter{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr);gap:4px;border-radius:12px;padding:6px;text-align:center;min-height:112px;align-content:start}.battleFsFighter.strike{transform:translateY(-2px) scale(1.03)}.battleFsPortrait{width:100%;height:44px;border-radius:9px}.battleFsPh{font-size:.78rem}.battleFsInfo{gap:3px}.battleFsName{font-size:.6rem;line-height:1.05;min-height:1.05em}.battleFsMeta{display:none}.battleFsHp .hpLine{font-size:.48rem;line-height:1}.battleFsHp .hpLine span{display:none}.battleFsHp .hpTrack{height:8px}.battleFsDamage{right:4px;top:26px;font-size:.72rem;max-width:80%;overflow:hidden;text-overflow:ellipsis}.battleFsCenter{min-height:74px;grid-template-columns:1fr;border-radius:14px;padding:9px}.battleFsVs{display:none}.battleFsCaption{text-align:center;font-size:.82rem;line-height:1.2}.battleFsLog{display:none}.battleFsTeam.enemy{order:1}.battleFsCenter{order:2}.battleFsTeam.player{order:3}}
@media(max-width:380px){.battleFsFighter{min-height:104px;padding:5px}.battleFsPortrait{height:38px}.battleFsName{font-size:.56rem}.battleFsCenter{min-height:66px;padding:7px}.battleFsCaption{font-size:.76rem}.battleFsSkip{max-width:94px;font-size:.56rem}.battleFsTop h1{font-size:.95rem}}
`;
  document.head.appendChild(style);
}
const battleFullscreenOldBind=bind;
bind=function(){battleFullscreenOldBind();injectBattleFullscreenStyles();if(state.page==='battle'&&state.battleView==='playback')bindBattleFullscreen()};
injectBattleFullscreenStyles();
if(user&&state.page==='battle'&&state.battleView==='playback')render();
