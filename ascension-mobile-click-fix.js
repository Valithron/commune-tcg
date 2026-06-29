function installAscensionMobileClickFix(){
  if(window.__ctcgAscMobileClickFix)return;
  window.__ctcgAscMobileClickFix=true;
  let lastTap=0;
  function pointFromEvent(e){
    const t=e.changedTouches&&e.changedTouches[0]||e.touches&&e.touches[0]||e;
    if(typeof t.clientX!=='number'||typeof t.clientY!=='number')return null;
    return{x:t.clientX,y:t.clientY};
  }
  function buttonAtPoint(x,y){
    const direct=(document.elementsFromPoint?document.elementsFromPoint(x,y):[]).map(el=>el?.closest?.('[data-ascend-card]')).find(Boolean);
    if(direct)return direct;
    return Array.from(document.querySelectorAll('[data-ascend-card]')).find(btn=>{
      const r=btn.getBoundingClientRect();
      return x>=r.left-28&&x<=r.right+28&&y>=r.top-28&&y<=r.bottom+28;
    })||null;
  }
  function resolveButton(e){
    const direct=e.target?.closest?.('[data-ascend-card]');
    if(direct)return direct;
    const p=pointFromEvent(e);
    return p?buttonAtPoint(p.x,p.y):null;
  }
  function activateAscension(e){
    const btn=resolveButton(e);
    if(!btn||btn.disabled)return;
    if(btn.closest('#ascCeremony'))return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    const now=Date.now();
    if(now-lastTap<850)return;
    lastTap=now;
    btn.classList.add('ascMobilePressed');
    setTimeout(()=>btn.classList.remove('ascMobilePressed'),180);
    if(typeof ascendCard==='function')ascendCard(btn.dataset.ascendCard,btn);
  }
  ['touchend','pointerup','click'].forEach(type=>document.addEventListener(type,activateAscension,{capture:true,passive:false}));
  const style=document.createElement('style');
  style.id='ctcgAscMobileClickFixStyles';
  style.textContent=`
[data-ascend-card]{touch-action:manipulation!important;-webkit-tap-highlight-color:rgba(243,201,63,.35)!important;user-select:none!important}.ascMobilePressed{transform:scale(.96)!important;filter:brightness(1.25)!important}@media(max-width:820px){.cardAscendBtn.ready,.battleResultAscend{min-height:34px!important;min-width:86px!important;padding:8px 10px!important}.battleResultAscend{justify-self:start!important}.cardAscendBtn.ready:before,.battleResultAscend:before{content:'';position:absolute;inset:-18px;border-radius:999px;z-index:-1}}
`;
  document.getElementById('ctcgAscMobileClickFixStyles')?.remove();
  document.head.appendChild(style);
}
installAscensionMobileClickFix();
