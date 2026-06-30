(function(){
  if(window.__ctcgCardBadgeCompact)return;
  window.__ctcgCardBadgeCompact=true;
  function install(){
    var old=document.getElementById('ctcgCardBadgeCompactStyles');
    if(old)old.remove();
    var style=document.createElement('style');
    style.id='ctcgCardBadgeCompactStyles';
    style.textContent='\
.card.ctcgFaceRedesign{--badgeW:clamp(42px,27cqw,58px)!important}\
.card.bigcard.ctcgFaceRedesign{--badgeW:clamp(62px,18cqw,82px)!important}\
.card.ctcgFaceRedesign .ctop{left:8.2%!important;right:8.2%!important;width:auto!important;max-width:none!important;display:block!important;overflow:visible!important;position:absolute!important}\
.card.ctcgFaceRedesign .ctop strong{display:block!important;width:calc(100% - var(--badgeW) - 5px)!important;max-width:calc(100% - var(--badgeW) - 5px)!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}\
.card.ctcgFaceRedesign .badge{position:absolute!important;right:0!important;top:0!important;width:auto!important;min-width:0!important;max-width:var(--badgeW)!important;box-sizing:border-box!important;display:inline-block!important;margin:0!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important;text-align:center!important;font-size:clamp(.27rem,2.7cqw,.48rem)!important;line-height:1!important;padding:.11em .15em!important;letter-spacing:-.045em!important;text-transform:uppercase!important;border-radius:.16rem!important}\
.card.bigcard.ctcgFaceRedesign .ctop strong{width:calc(100% - var(--badgeW) - 8px)!important;max-width:calc(100% - var(--badgeW) - 8px)!important}\
.card.bigcard.ctcgFaceRedesign .badge{font-size:clamp(.42rem,1.85cqw,.66rem)!important;padding:.13em .18em!important;border-radius:.2rem!important}\
@media(max-width:720px){.card.ctcgFaceRedesign{--badgeW:clamp(40px,29cqw,54px)!important}.card.ctcgFaceRedesign .ctop strong{width:calc(100% - var(--badgeW) - 4px)!important;max-width:calc(100% - var(--badgeW) - 4px)!important}.card.ctcgFaceRedesign .badge{font-size:clamp(.25rem,2.55cqw,.43rem)!important;padding:.09em .12em!important;border-radius:.14rem!important}}\
';
    document.head.appendChild(style);
  }
  function refresh(){install();if(typeof scheduleTitleFit==='function')setTimeout(function(){scheduleTitleFit(document)},30)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
  setTimeout(refresh,120);
  setTimeout(refresh,500);
  new MutationObserver(function(){setTimeout(refresh,40)}).observe(document.documentElement,{childList:true,subtree:true});
})();
