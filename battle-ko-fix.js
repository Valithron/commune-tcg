function installBattleKoFix(){
  if(window.__ctcgBattleKoFixInstalled)return;
  window.__ctcgBattleKoFixInstalled=true;
  window.__ctcgBattleDead=new Set();
  function koKeyFromEl(el){return `${el?.dataset?.team||''}:${el?.dataset?.fighterId||''}`}
  function koKey(team,id){return `${team||''}:${id||''}`}
  function isDeadEl(el){return window.__ctcgBattleDead.has(koKeyFromEl(el))}
  const rawSetHp=battleFsSetHp;
  battleFsSetHp=function(el,hp,max){
    if(!el)return;
    const key=koKeyFromEl(el);
    let nextHp=Math.max(0,Number(hp||0));
    if(window.__ctcgBattleDead.has(key))nextHp=0;
    if(nextHp<=0)window.__ctcgBattleDead.add(key);
    rawSetHp(el,nextHp,max);
    if(window.__ctcgBattleDead.has(key)){
      const now=el.querySelector('.hpNow'),fill=el.querySelector('.hpFill');
      if(now)now.textContent='0';
      if(fill)fill.style.width='0%';
      el.classList.add('ko');
      el.setAttribute('aria-disabled','true');
    }
  };
  const rawPlayEvent=typeof battleFsPlayEvent==='function'?battleFsPlayEvent:null;
  if(rawPlayEvent){
    battleFsPlayEvent=async function(e,caption,log){
      if(window.__ctcgBattleDead.has(koKey(e.attackerTeam,e.attackerId))){
        if(log){
          const row=document.createElement('div');
          row.className='battleFsLogLine skipped';
          row.textContent=`${e.attackerTitle||'A knocked-out fighter'} could not act.`;
          log.prepend(row);
        }
        return true;
      }
      const ok=await rawPlayEvent(e,caption,log);
      const defender=battleFsFind(e.defenderTeam,e.defenderId);
      if(e.defeated||Number(e.defenderHp||0)<=0){
        window.__ctcgBattleDead.add(koKey(e.defenderTeam,e.defenderId));
        battleFsSetHp(defender,0,e.defenderMaxHp||defender?.querySelector('.hpMax')?.textContent);
      }
      document.querySelectorAll('.battleFsFighter.ko').forEach(el=>{
        const now=el.querySelector('.hpNow'),fill=el.querySelector('.hpFill');
        if(now)now.textContent='0';
        if(fill)fill.style.width='0%';
      });
      return ok;
    };
  }
  const rawPlayReplay=playBattleReplay;
  playBattleReplay=async function(b){
    window.__ctcgBattleDead=new Set();
    document.querySelectorAll('.battleFsFighter').forEach(el=>{el.classList.remove('ko');el.removeAttribute('aria-disabled')});
    await rawPlayReplay(b);
    (b?.player||[]).forEach(f=>{if(Number(f.finalHp||0)<=0)window.__ctcgBattleDead.add(koKey('player',f.id))});
    (b?.enemy||[]).forEach(f=>{if(Number(f.finalHp||0)<=0)window.__ctcgBattleDead.add(koKey('enemy',f.id))});
    document.querySelectorAll('.battleFsFighter').forEach(el=>{
      if(window.__ctcgBattleDead.has(koKeyFromEl(el)))battleFsSetHp(el,0,el.querySelector('.hpMax')?.textContent);
    });
  };
  const rawFinalHp=battleFsFinalHp;
  battleFsFinalHp=function(b){
    (b?.player||[]).forEach(f=>{if(Number(f.finalHp||0)<=0)window.__ctcgBattleDead.add(koKey('player',f.id))});
    (b?.enemy||[]).forEach(f=>{if(Number(f.finalHp||0)<=0)window.__ctcgBattleDead.add(koKey('enemy',f.id))});
    rawFinalHp(b);
    document.querySelectorAll('.battleFsFighter').forEach(el=>{
      if(window.__ctcgBattleDead.has(koKeyFromEl(el)))battleFsSetHp(el,0,el.querySelector('.hpMax')?.textContent);
    });
  };
  const style=document.createElement('style');
  style.id='ctcgBattleKoFixStyles';
  style.textContent=`.battleFsFighter.ko{opacity:.42!important;filter:grayscale(.85)!important}.battleFsFighter.ko.active,.battleFsFighter.ko.target,.battleFsFighter.ko.strike,.battleFsFighter.ko.impact{box-shadow:none!important;border-color:rgba(255,255,255,.1)!important;transform:none!important}.battleFsFighter.ko:after{content:'KO';position:absolute;left:6px;top:6px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(5,9,20,.86);color:#ff8f70;padding:2px 5px;font:900 .5rem 'JetBrains Mono',monospace;letter-spacing:.08em}.battleFsLogLine.skipped{color:#ff8f70}`;
  document.getElementById('ctcgBattleKoFixStyles')?.remove();
  document.head.appendChild(style);
}
if(typeof battleFsSetHp==='function'&&typeof playBattleReplay==='function')installBattleKoFix();
