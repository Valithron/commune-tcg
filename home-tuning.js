(function(){
  if(window.__ctcgHomeTuning)return;
  window.__ctcgHomeTuning=true;
  function installStyles(){
    var old=document.getElementById('ctcgHomeTuningStyles');
    if(old)old.remove();
    var style=document.createElement('style');
    style.id='ctcgHomeTuningStyles';
    style.textContent='\
.homeCardRain{opacity:.55!important}\
@media(max-width:920px){.homeCardRain{opacity:.36!important}}\
';
    document.head.appendChild(style);
  }
  function slowColumns(root){
    root=root&&root.querySelectorAll?root:document;
    root.querySelectorAll('.homeRainCol').forEach(function(col){
      if(col.dataset.homeSpeedTuned==='1')return;
      var raw=(col.style.getPropertyValue('--speed')||'').trim();
      var seconds=parseFloat(raw)||40;
      col.style.setProperty('--speed',(seconds*1.3).toFixed(1)+'s');
      col.dataset.homeSpeedTuned='1';
    });
  }
  function refresh(){installStyles();slowColumns(document)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
  setTimeout(refresh,120);
  setTimeout(refresh,500);
  new MutationObserver(function(){setTimeout(refresh,30)}).observe(document.documentElement,{childList:true,subtree:true});
})();
