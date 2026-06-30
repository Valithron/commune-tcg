(function(){
  if(window.__ctcgBattleSpeed)return;
  window.__ctcgBattleSpeed=true;
  function installStyles(){
    if(document.getElementById('ctcgBattleSpeedStyles'))return;
    var style=document.createElement('style');
    style.id='ctcgBattleSpeedStyles';
    style.textContent='\
.battleFsFighter{transition-duration:.08s!important}\
.battleFsDamage.pop{animation-duration:.28s!important}\
.battleFsCaption{transition-duration:.08s!important}\
';
    document.head.appendChild(style);
  }
  function patchPause(){
    if(typeof battleFsPause!=='function'||battleFsPause.__ctcgFast)return false;
    var base=battleFsPause;
    battleFsPause=async function(ms){
      var raw=Number(ms)||0;
      var scaled=raw<=120?raw:Math.max(45,Math.round(raw*.34));
      return base(scaled);
    };
    battleFsPause.__ctcgFast=true;
    return true;
  }
  function patchLog(){
    if(typeof battleFsLogEvent!=='function'||battleFsLogEvent.__ctcgCapped)return false;
    var baseLog=battleFsLogEvent;
    battleFsLogEvent=function(log,e){
      baseLog(log,e);
      if(log)while(log.children&&log.children.length>10)log.removeChild(log.lastChild);
    };
    battleFsLogEvent.__ctcgCapped=true;
    return true;
  }
  function install(){installStyles();return patchPause()&&patchLog()}
  if(install())return;
  var tries=0;
  var timer=setInterval(function(){
    tries++;
    if(install()||tries>80)clearInterval(timer);
  },50);
})();
