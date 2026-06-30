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
.homeMiniCard{border:4px solid var(--r)!important;box-shadow:0 0 0 1px rgba(255,255,255,.12) inset,0 0 32px color-mix(in srgb,var(--r),transparent 30%),0 14px 42px rgba(0,0,0,.5)!important}\
.homeHero{justify-items:center!important;text-align:center!important}\
.homeHeroCopy{margin:0 auto!important;text-align:center!important;display:grid!important;justify-items:center!important}\
.homeHero h1{font-size:clamp(2.7rem,6.6vw,6.3rem)!important;max-width:980px!important}\
.homeHero p{margin-left:auto!important;margin-right:auto!important}\
.homeHeroBtns{justify-content:center!important}\
@media(max-width:920px){.homeCardRain{opacity:.36!important}.homeHero h1{font-size:clamp(3rem,11vw,5.4rem)!important}}\
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
