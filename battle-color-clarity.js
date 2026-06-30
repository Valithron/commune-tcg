(function(){
  if(window.__ctcgBattleColorClarity)return;
  window.__ctcgBattleColorClarity=true;
  function install(){
    var old=document.getElementById('ctcgBattleColorClarityStyles');
    if(old)old.remove();
    var style=document.createElement('style');
    style.id='ctcgBattleColorClarityStyles';
    style.textContent='\
.battleFsFighter.active{border-color:#f3c93f!important;box-shadow:0 0 0 2px rgba(243,201,63,.28) inset,0 0 24px rgba(243,201,63,.32)!important}\
.battleFsFighter.target{border-color:#ff4f5f!important;box-shadow:0 0 0 2px rgba(255,79,95,.26) inset,0 0 20px rgba(255,79,95,.2)!important}\
.battleFsFighter.target.strong{border-color:#ff4f5f!important;box-shadow:0 0 0 2px rgba(255,79,95,.24) inset,0 0 0 4px rgba(53,214,197,.28),0 0 24px rgba(53,214,197,.26)!important}\
.battleFsFighter.target.weak{border-color:#ff4f5f!important;box-shadow:0 0 0 2px rgba(255,79,95,.22) inset,0 0 0 4px rgba(169,140,255,.28),0 0 20px rgba(169,140,255,.2)!important}\
.battleFsFighter.active.crit{border-color:#ffe066!important;animation:battleCritFlash .42s ease-out both!important}\
@keyframes battleCritFlash{0%{box-shadow:0 0 0 2px rgba(255,224,102,.3) inset,0 0 10px rgba(255,224,102,.25)}38%{box-shadow:0 0 0 3px rgba(255,224,102,.7) inset,0 0 34px rgba(255,224,102,.62)}100%{box-shadow:0 0 0 2px rgba(243,201,63,.28) inset,0 0 24px rgba(243,201,63,.32)}}\
.battleFsCaption.strong,.battleFsLogLine.strong,.battleFsDamage.strong{color:#35d6c5!important}\
.battleFsCaption.weak,.battleFsLogLine.weak,.battleFsDamage.weak{color:#a98cff!important}\
.battleFsCaption.glance{color:#aeb2cc!important}\
.battleFsCaption.crit,.battleFsLogLine.crit,.battleFsDamage.crit{color:#ffe066!important}\
.battleFsDamage{color:#ff4f5f!important}\
.battleFsStage.victory .battleFsCenter{border-color:rgba(53,214,197,.58)!important}\
.battleFsStage.defeat .battleFsCenter{border-color:rgba(255,79,95,.58)!important}\
';
    document.head.appendChild(style);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
