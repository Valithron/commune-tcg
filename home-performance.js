(function(){
  if(window.__ctcgHomePerformance)return;
  window.__ctcgHomePerformance=true;
  function installStyles(){
    var old=document.getElementById('ctcgHomePerformanceStyles');
    if(old)old.remove();
    var style=document.createElement('style');
    style.id='ctcgHomePerformanceStyles';
    style.textContent='\
.homeCardRain{contain:layout paint!important;pointer-events:none!important}\
.homeRainCol{will-change:transform!important;contain:layout paint!important;transform:translateZ(0)}\
.homeMiniCard{contain:layout paint!important;backface-visibility:hidden!important;transform:translateZ(0);box-shadow:0 0 18px color-mix(in srgb,var(--r),transparent 48%),0 8px 24px rgba(0,0,0,.42)!important}\
.homeMiniCard img,.homeFeatureArt img{backface-visibility:hidden!important;transform:translateZ(0)}\
';
    document.head.appendChild(style);
  }
  function attrs(img,background){
    if(!img)return;
    img.decoding='async';
    img.setAttribute('fetchpriority','low');
    if(!background)img.loading='lazy';
  }
  function pruneColumn(col){
    if(!col||col.dataset.homePerfPruned==='1')return;
    var kids=Array.prototype.slice.call(col.children).filter(function(x){return x.classList&&x.classList.contains('homeMiniCard')});
    if(kids.length>12){
      var keep=kids.slice(0,6);
      col.innerHTML='';
      keep.forEach(function(k){col.appendChild(k)});
      keep.forEach(function(k){col.appendChild(k.cloneNode(true))});
    }
    Array.prototype.slice.call(col.querySelectorAll('img')).forEach(function(img){attrs(img,true)});
    col.dataset.homePerfPruned='1';
  }
  function optimize(root){
    root=root&&root.querySelectorAll?root:document;
    Array.prototype.slice.call(root.querySelectorAll('.homeRainCol')).forEach(pruneColumn);
    Array.prototype.slice.call(root.querySelectorAll('.homeFeatureArt img')).forEach(function(img){attrs(img,false)});
  }
  function refresh(){installStyles();optimize(document)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
  setTimeout(refresh,120);
  setTimeout(refresh,500);
  setTimeout(refresh,1400);
  new MutationObserver(function(){setTimeout(refresh,40)}).observe(document.documentElement,{childList:true,subtree:true});
})();
