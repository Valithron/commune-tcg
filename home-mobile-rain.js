(function(){
  if(window.__ctcgHomeMobileRain)return;
  window.__ctcgHomeMobileRain=true;
  var mq=window.matchMedia?window.matchMedia('(max-width:920px)'):null;
  function isMobile(){return mq?mq.matches:window.innerWidth<=920}
  function installStyles(){
    var old=document.getElementById('ctcgHomeMobileRainStyles');
    if(old)old.remove();
    var style=document.createElement('style');
    style.id='ctcgHomeMobileRainStyles';
    style.textContent='\
@media(max-width:920px){.homeCardRain.ctcgMobileRain{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:16px!important;inset:-34% -8%!important;opacity:.36!important;overflow:hidden!important}.homeCardRain.ctcgMobileRain .homeRainCol{display:grid!important;gap:16px!important;animation:ctcgMobileRainUp var(--speed,64s) linear infinite!important;will-change:transform}.homeCardRain.ctcgMobileRain .homeRainCol.down{animation-name:ctcgMobileRainDown!important}.homeCardRain.ctcgMobileRain .homeMiniCard{min-height:0!important}.homeCardRain.ctcgMobileRain .homeMiniCard img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important}.homeCardRain.ctcgMobileRain .homeMiniCard.ctcgShell{background:radial-gradient(circle at 50% 36%,color-mix(in srgb,var(--r),transparent 60%),#080d18 64%)!important}}@keyframes ctcgMobileRainUp{from{transform:translateY(0)}to{transform:translateY(-25%)}}@keyframes ctcgMobileRainDown{from{transform:translateY(-25%)}to{transform:translateY(0)}}\
';
    document.head.appendChild(style);
  }
  function shell(i){
    var rar=['#9da2b7','#35d6c5','#f3c93f','#b178ff'][i%4];
    var label=['C','U','R','L'][i%4];
    var el=document.createElement('article');
    el.className='homeMiniCard ctcgShell';
    el.style.setProperty('--r',rar);
    el.style.setProperty('--a',rar);
    el.innerHTML='<div class="homeMiniPh">'+label+'</div>';
    return el;
  }
  function sourceCards(rain){
    var cards=[];
    if(rain&&!rain.classList.contains('ctcgMobileRain'))cards=Array.prototype.slice.call(rain.querySelectorAll('.homeMiniCard'));
    cards=cards.filter(function(card){return card&&card.cloneNode});
    if(cards.length)return cards;
    var out=[];
    for(var i=0;i<20;i++)out.push(shell(i));
    return out;
  }
  function cloneCard(card){
    var x=card.cloneNode(true);
    x.removeAttribute('data-home-speed-tuned');
    x.querySelectorAll('img').forEach(function(img){img.decoding='async'});
    return x;
  }
  function buildMobileRain(rain){
    if(!rain||rain.dataset.ctcgMobileRain==='1')return;
    var src=sourceCards(rain);
    rain.className='homeCardRain ctcgMobileRain';
    rain.dataset.ctcgMobileRain='1';
    rain.innerHTML='';
    for(var col=0;col<2;col++){
      var c=document.createElement('div');
      c.className='homeRainCol '+(col%2?'down':'up');
      c.dataset.homeSpeedTuned='1';
      c.style.setProperty('--speed',(col?73:61)+'s');
      var stack=[];
      for(var i=0;i<10;i++)stack.push(src[(i*2+col)%src.length]);
      for(var round=0;round<4;round++)stack.forEach(function(card){c.appendChild(cloneCard(card))});
      rain.appendChild(c);
    }
  }
  function restoreDesktop(rain){
    if(rain&&rain.classList.contains('ctcgMobileRain')&&typeof render==='function')setTimeout(function(){if(!isMobile())render()},0);
  }
  function refresh(){
    installStyles();
    var rain=document.querySelector('.homePage .homeHero .homeCardRain');
    if(!rain)return;
    if(!isMobile()){restoreDesktop(rain);return}
    buildMobileRain(rain);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
  setTimeout(refresh,120);
  setTimeout(refresh,500);
  setTimeout(refresh,1400);
  new MutationObserver(function(){setTimeout(refresh,40)}).observe(document.documentElement,{childList:true,subtree:true});
  if(mq&&mq.addEventListener)mq.addEventListener('change',refresh);else window.addEventListener('resize',refresh);
})();
