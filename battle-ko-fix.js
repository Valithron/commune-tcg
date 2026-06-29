function installBattleKoFix(){
  if(window.__ctcgBattleKoFixInstalled)return;
  window.__ctcgBattleKoFixInstalled=true;
  window.__ctcgBattleDead=new Set();
  window.__ctcgBattleVisual={active:false,lastCaption:'',eventIndex:0,battle:null,guard:null};
  function koKey(team,id){return `${team||''}:${String(id||'')}`}
  function koKeyFromEl(el){return koKey(el?.dataset?.team,el?.dataset?.fighterId)}
  function allFighters(){return Array.from(document.querySelectorAll('.battleFsFighter'))}
  function safeFind(team,id){return allFighters().find(el=>el.dataset.team===String(team)&&el.dataset.fighterId===String(id))||null}
  battleFsFind=function(team,id){return safeFind(team,id)};
  function setCaptionText(text,cls){
    const visual=window.__ctcgBattleVisual;
    if(text)visual.lastCaption=text;
    document.querySelectorAll('#battleFullscreen #battleEventText,.battleFsMode #battleEventText').forEach(caption=>{
      caption.className=cls||caption.className||'battleFsCaption';
      if(visual.lastCaption)caption.textContent=visual.lastCaption;
      caption.dataset.visualLocked='1';
    });
  }
  function markDead(team,id){
    const key=koKey(team,id);
    if(key!==':')window.__ctcgBattleDead.add(key);
  }
  function markDeadFromBattleEvents(b){
    (b?.rounds||[]).forEach(r=>(r.events||[]).forEach(e=>{
      if(e.defeated||Number(e.defenderHp||0)<=0)markDead(e.defenderTeam,e.defenderId);
    }));
  }
  function enforceKoVisuals(){
    allFighters().forEach(el=>{
      const key=koKeyFromEl(el);
      const now=Number(el.querySelector('.hpNow')?.textContent||0);
      if(now<=0||el.classList.contains('ko'))window.__ctcgBattleDead.add(key);
      if(!window.__ctcgBattleDead.has(key))return;
      const hpNow=el.querySelector('.hpNow'),hpMax=el.querySelector('.hpMax'),fill=el.querySelector('.hpFill');
      if(hpNow)hpNow.textContent='0';
      if(fill)fill.style.width='0%';
      el.classList.add('ko');
      el.classList.remove('active','target','windup','strike','impact','hit','crit','strong','weak');
      el.setAttribute('aria-disabled','true');
      el.dataset.lockedKo='1';
      if(hpMax&&!hpMax.textContent)hpMax.textContent='1';
    });
  }
  function captionLooksReset(text){return !text||/^starting battle/i.test(text)||/^the fight begins/i.test(text)||/^battle in progress/i.test(text)}
  function guardVisuals(){
    const visual=window.__ctcgBattleVisual;
    if(visual.active&&visual.lastCaption){
      document.querySelectorAll('#battleFullscreen #battleEventText,.battleFsMode #battleEventText').forEach(caption=>{
        if(captionLooksReset(caption.textContent)||caption.dataset.visualLocked!=='1'){
          caption.textContent=visual.lastCaption;
          caption.dataset.visualLocked='1';
        }
      });
    }
    enforceKoVisuals();
  }
  function startGuard(){
    const visual=window.__ctcgBattleVisual;
    if(visual.guard)return;
    visual.guard=setInterval(guardVisuals,90);
  }
  function stopGuardSoon(){
    const visual=window.__ctcgBattleVisual;
    setTimeout(()=>{if(!visual.active&&visual.guard){clearInterval(visual.guard);visual.guard=null}},1200);
  }
  const rawSetCaption=battleFsSetCaption;
  battleFsSetCaption=function(caption,e){
    const text=e?.text||window.__ctcgBattleVisual.lastCaption||'';
    if(text)window.__ctcgBattleVisual.lastCaption=text;
    rawSetCaption(caption,e);
    if(caption){caption.dataset.visualLocked='1';if(text&&!caption.textContent)caption.textContent=text}
    guardVisuals();
  };
  const rawSetHp=battleFsSetHp;
  battleFsSetHp=function(el,hp,max){
    if(!el)return;
    const key=koKeyFromEl(el);
    let nextHp=Math.max(0,Number(hp||0));
    if(window.__ctcgBattleDead.has(key))nextHp=0;
    if(nextHp<=0)window.__ctcgBattleDead.add(key);
    rawSetHp(el,nextHp,max);
    enforceKoVisuals();
  };
  const rawPlayEvent=typeof battleFsPlayEvent==='function'?battleFsPlayEvent:null;
  if(rawPlayEvent){
    battleFsPlayEvent=async function(e,caption,log){
      const visual=window.__ctcgBattleVisual;
      visual.eventIndex++;
      if(e?.text)visual.lastCaption=e.text;
      startGuard();
      if(window.__ctcgBattleDead.has(koKey(e.attackerTeam,e.attackerId))){
        const skipText=`${e.attackerTitle||'A knocked-out fighter'} could not act.`;
        visual.lastCaption=skipText;
        setCaptionText(skipText,'battleFsCaption weak');
        if(log){
          const row=document.createElement('div');
          row.className='battleFsLogLine skipped';
          row.textContent=skipText;
          log.prepend(row);
        }
        guardVisuals();
        return true;
      }
      guardVisuals();
      const ok=await rawPlayEvent(e,caption,log);
      if(e.defeated||Number(e.defenderHp||0)<=0){
        markDead(e.defenderTeam,e.defenderId);
        const defender=battleFsFind(e.defenderTeam,e.defenderId);
        battleFsSetHp(defender,0,e.defenderMaxHp||defender?.querySelector('.hpMax')?.textContent);
      }
      if(e?.text)visual.lastCaption=e.text;
      guardVisuals();
      return ok;
    };
  }
  const rawFinalHp=battleFsFinalHp;
  battleFsFinalHp=function(b){
    markDeadFromBattleEvents(b);
    (b?.player||[]).forEach(f=>{if(Number(f.finalHp||0)<=0)markDead('player',f.id)});
    (b?.enemy||[]).forEach(f=>{if(Number(f.finalHp||0)<=0)markDead('enemy',f.id)});
    rawFinalHp(b);
    enforceKoVisuals();
  };
  const rawPlayReplay=playBattleReplay;
  playBattleReplay=async function(b){
    const visual=window.__ctcgBattleVisual;
    window.__ctcgBattleDead=new Set();
    visual.active=true;
    visual.battle=b;
    visual.lastCaption='The fight begins.';
    visual.eventIndex=0;
    startGuard();
    allFighters().forEach(el=>{el.classList.remove('ko');el.removeAttribute('aria-disabled');delete el.dataset.lockedKo});
    setCaptionText('The fight begins.','battleFsCaption');
    try{await rawPlayReplay(b)}
    finally{
      markDeadFromBattleEvents(b);
      battleFsFinalHp(b);
      visual.lastCaption=(state.battlePlaybackSkip?'Battle skipped. Showing final result.':(b?.summary||'Battle complete.'));
      setCaptionText(visual.lastCaption,'battleFsCaption final');
      enforceKoVisuals();
      visual.active=false;
      stopGuardSoon();
    }
  };
  const style=document.createElement('style');
  style.id='ctcgBattleKoFixStyles';
  style.textContent=`.battleFsFighter.ko{opacity:.42!important;filter:grayscale(.88)!important}.battleFsFighter.ko.active,.battleFsFighter.ko.target,.battleFsFighter.ko.windup,.battleFsFighter.ko.strike,.battleFsFighter.ko.impact,.battleFsFighter.ko.hit,.battleFsFighter.ko.crit,.battleFsFighter.ko.strong,.battleFsFighter.ko.weak{box-shadow:none!important;border-color:rgba(255,255,255,.1)!important;transform:none!important;animation:none!important}.battleFsFighter.ko .hpFill{width:0%!important}.battleFsFighter.ko:after{content:'KO';position:absolute;left:6px;top:6px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(5,9,20,.88);color:#ff8f70;padding:2px 5px;font:900 .5rem 'JetBrains Mono',monospace;letter-spacing:.08em;z-index:3}.battleFsLogLine.skipped{color:#ff8f70}.battleFsCaption[data-visual-locked='1']{min-height:1.2em}`;
  document.getElementById('ctcgBattleKoFixStyles')?.remove();
  document.head.appendChild(style);
  startGuard();
}
if(typeof battleFsSetHp==='function'&&typeof playBattleReplay==='function')installBattleKoFix();
