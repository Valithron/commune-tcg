(function(){
  if(window.__ctcgCardBadgeCompact)return;
  window.__ctcgCardBadgeCompact=true;
  function install(){
    var old=document.getElementById('ctcgCardBadgeCompactStyles');
    if(old)old.remove();
    var style=document.createElement('style');
    style.id='ctcgCardBadgeCompactStyles';
    style.textContent='\
.card.ctcgFaceRedesign{--badgeW:clamp(48px,31cqw,68px)!important;--metaTop:4.55%;--titleGap:1.45em}\
.card.bigcard.ctcgFaceRedesign{--badgeW:clamp(70px,20cqw,96px)!important;--metaTop:4.65%;--titleGap:1.48em}\
.card.ctcgFaceRedesign .cardFaceCharacter{top:var(--metaTop)!important;left:8.2%!important;right:auto!important;width:32%!important;line-height:1!important}\
.card.ctcgFaceRedesign .ctop{left:8.2%!important;right:8.2%!important;top:var(--metaTop)!important;width:auto!important;max-width:none!important;height:9.1%!important;display:block!important;overflow:visible!important;position:absolute!important}\
.card.ctcgFaceRedesign .ctop strong{position:absolute!important;left:0!important;right:0!important;top:var(--titleGap)!important;display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.03!important}\
.card.ctcgFaceRedesign .badge{position:absolute!important;right:0!important;top:0!important;width:auto!important;min-width:0!important;max-width:var(--badgeW)!important;box-sizing:border-box!important;display:inline-block!important;margin:0!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important;text-align:center!important;font:900 clamp(.46rem,3.05cqw,.54rem) JetBrains Mono,monospace!important;line-height:1!important;padding:.16em .26em!important;letter-spacing:-.035em!important;text-transform:uppercase!important;border-radius:.18rem!important}\
.card.bigcard.ctcgFaceRedesign .badge{font-size:clamp(.54rem,2.05cqw,.68rem)!important;padding:.18em .3em!important;border-radius:.22rem!important}\
.card.ctcgFaceRedesign .art{top:16.1%!important;height:64.9%!important}\
.card.bigcard.ctcgFaceRedesign .art{top:16.1%!important;height:64.9%!important}\
@media(max-width:720px){.card.ctcgFaceRedesign{--badgeW:clamp(46px,32cqw,62px)!important;--metaTop:4.7%;--titleGap:1.42em}.card.ctcgFaceRedesign .cardFaceCharacter{width:30%!important}.card.ctcgFaceRedesign .ctop{height:9.6%!important}.card.ctcgFaceRedesign .badge{font-size:clamp(.42rem,2.95cqw,.54rem)!important;padding:.14em .22em!important;border-radius:.16rem!important}.card.ctcgFaceRedesign .art{top:16.4%!important;height:64.6%!important}}\
';
    document.head.appendChild(style);
  }
  function refresh(){install();if(typeof scheduleTitleFit==='function')setTimeout(function(){scheduleTitleFit(document)},30)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
  setTimeout(refresh,120);
  setTimeout(refresh,500);
  new MutationObserver(function(){setTimeout(refresh,40)}).observe(document.documentElement,{childList:true,subtree:true});
})();
