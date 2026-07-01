/*
 * Commune TCG Runtime Patch Inventory
 * Purpose: Stabilizes battle setup selection styling and persists setup choices after user interactions.
 * Original problem solved: Battle setup state could be visually unclear or lost around team/enemy step changes.
 * Key assumptions: `battle-flow.js` functions exist or will appear shortly; `bindBattleFlow` is the correct narrow hook for setup controls.
 * Known interactions: Wraps `bindBattleFlow` after it appears and listens globally for battle setup clicks to call `queueMeta` soon after interaction.
 * Mobile/Desktop differences: Enemy selection badge positioning changes under 720px.
 */
function installBattleSetupFix(){
  if(window.__ctcgBattleSetupFixInstalled)return;
  window.__ctcgBattleSetupFixInstalled=true;
  function injectBattleSetupFixStyles(){
    document.getElementById('ctcgBattleSetupFixStyles')?.remove();
    const style=document.createElement('style');
    style.id='ctcgBattleSetupFixStyles';
    style.textContent=`
.battleFlowEnemy{position:relative;transition:border-color .16s ease,box-shadow .16s ease,background .16s ease,transform .16s ease}.battleFlowEnemy.on{border-color:#f3c93f!important;background:radial-gradient(circle at 20% 0,rgba(243,201,63,.2),transparent 34%),linear-gradient(145deg,rgba(243,201,63,.16),#0b1020)!important;box-shadow:0 0 0 2px rgba(243,201,63,.28),0 0 24px rgba(243,201,63,.28),inset 0 0 0 1px rgba(243,201,63,.22)!important;transform:translateY(-1px)}.battleFlowEnemy.on:after{content:'SELECTED';position:absolute;right:10px;top:10px;border:1px solid rgba(243,201,63,.65);border-radius:999px;background:#f3c93f;color:#080b15;padding:4px 7px;font:900 .52rem 'JetBrains Mono',monospace;letter-spacing:.08em}.battleFlowEnemy.on span{border-color:#f3c93f!important;background:rgba(243,201,63,.18)!important;color:#f3c93f!important}.battleFlowEnemy.on b{color:#fff7c8}.battleFlowEnemy.on small,.battleFlowEnemy.on em{color:#edf1ff}@media(max-width:720px){.battleFlowEnemy.on{transform:none}.battleFlowEnemy.on:after{position:static;width:max-content;margin-top:2px;order:-1}}
`;
    document.head.appendChild(style);
  }
  function persistBattleSetupSoon(){
    if(window.__ctcgBattleSetupPersistTimer)clearTimeout(window.__ctcgBattleSetupPersistTimer);
    window.__ctcgBattleSetupPersistTimer=setTimeout(()=>{
      try{if(typeof queueMeta==='function')queueMeta()}catch(e){console.warn(e)}
    },80);
  }

  // Capture listener: observes setup-related clicks so battle setup state is queued for persistence after the flow mutates state.
  document.addEventListener('click',e=>{
    const target=e.target&&e.target.closest&&e.target.closest('[data-battle-pick],[data-battle-remove],[data-battle-auto-squad],[data-battle-clear-squad],[data-battle-enemy],[data-battle-flow]');
    if(!target)return;
    setTimeout(persistBattleSetupSoon,0);
  },true);
  const rawBind=typeof bindBattleFlow==='function'?bindBattleFlow:null;

  // Global override: wraps the battle-flow-specific bind hook rather than the app-wide bind hook.
  if(rawBind){
    bindBattleFlow=function(){
      rawBind();
      injectBattleSetupFixStyles();
    };
  }
  injectBattleSetupFixStyles();
}
function waitForBattleSetupFix(){
  if(typeof battleFlowEnemyId==='function')installBattleSetupFix();
  else setTimeout(waitForBattleSetupFix,50);
}
waitForBattleSetupFix();