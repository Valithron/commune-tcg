(function(){
  if(window.__ctcgCardBadgeCompact)return;
  window.__ctcgCardBadgeCompact=true;
  function install(){
    var old=document.getElementById('ctcgCardBadgeCompactStyles');
    if(old)old.remove();
    var style=document.createElement('style');
    style.id='ctcgCardBadgeCompactStyles';
    style.textContent='\
.card.ctcgFaceRedesign{--badgeW:clamp(50px,31cqw,70px)!important;--metaTop:4.7%;--titleGap:1.44em}\
.card.bigcard.ctcgFaceRedesign{--badgeW:clamp(72px,20cqw,98px)!important;--metaTop:4.85%;--titleGap:1.42em}\
.card.ctcgFaceRedesign .cardFaceCharacter{top:var(--metaTop)!important;left:8.2%!important;right:auto!important;width:32%!important;line-height:1!important;z-index:8!important}\
.card.ctcgFaceRedesign .ctop{left:8.2%!important;right:8.2%!important;top:var(--metaTop)!important;width:auto!important;max-width:none!important;height:10.9%!important;display:block!important;overflow:visible!important;position:absolute!important;z-index:8!important}\
.card.ctcgFaceRedesign .ctop strong{position:absolute!important;left:0!important;right:0!important;top:var(--titleGap)!important;display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:clip!important;font-size:clamp(.82rem,8.8cqw,1.24rem)!important;line-height:.98!important;letter-spacing:-.075em!important}\
.card.bigcard.ctcgFaceRedesign .ctop strong{font-size:clamp(1.16rem,6.9cqw,2.08rem)!important;letter-spacing:-.08em!important;line-height:.98!important}\
.card.ctcgFaceRedesign .badge{position:absolute!important;right:0!important;top:0!important;width:auto!important;min-width:0!important;max-width:var(--badgeW)!important;box-sizing:border-box!important;display:inline-block!important;margin:0!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important;text-align:center!important;font:900 clamp(.46rem,3.05cqw,.54rem) JetBrains Mono,monospace!important;line-height:1!important;padding:.16em .26em!important;letter-spacing:-.035em!important;text-transform:uppercase!important;border-radius:.18rem!important}\
.card.bigcard.ctcgFaceRedesign .badge{font-size:clamp(.54rem,2.05cqw,.68rem)!important;padding:.18em .3em!important;border-radius:.22rem!important}\
.card.ctcgFaceRedesign .eq{top:auto!important;right:7.4%!important;bottom:1.35%!important;z-index:8!important;padding:.28em .52em!important;border-radius:.22rem!important;background:rgba(8,13,25,.78)!important;border:1.2px solid var(--frame)!important;color:var(--cardText)!important;font:900 clamp(.42rem,3.2cqw,.58rem) JetBrains Mono,monospace!important;line-height:1!important;text-shadow:0 1px 2px #000!important;box-shadow:0 0 9px color-mix(in srgb,var(--frame),transparent 72%)!important}\
.card.bigcard.ctcgFaceRedesign .eq{font-size:clamp(.64rem,2.7cqw,.88rem)!important;padding:.28em .58em!important;bottom:1.25%!important}\
.card.ctcgFaceRedesign .art{top:17.2%!important;height:63.8%!important}\
.card.bigcard.ctcgFaceRedesign .art{top:17.1%!important;height:63.9%!important}\
@media(max-width:720px){.card.ctcgFaceRedesign{--badgeW:clamp(48px,32cqw,64px)!important;--metaTop:4.85%;--titleGap:1.38em}.card.ctcgFaceRedesign .cardFaceCharacter{width:30%!important}.card.ctcgFaceRedesign .ctop{height:11.2%!important}.card.ctcgFaceRedesign .ctop strong{font-size:clamp(.76rem,8.6cqw,1.1rem)!important;letter-spacing:-.08em!important}.card.ctcgFaceRedesign .badge{font-size:clamp(.42rem,2.95cqw,.54rem)!important;padding:.14em .22em!important;border-radius:.16rem!important}.card.ctcgFaceRedesign .art{top:17.4%!important;height:63.6%!important}.card.ctcgFaceRedesign .eq{font-size:clamp(.38rem,3.05cqw,.52rem)!important;padding:.24em .46em!important}}\
';
    document.head.appendChild(style);
  }
  function fitTitle(card){
    if(!card||!card.classList||!card.classList.contains('ctcgFaceRedesign'))return;
    var title=card.querySelector('.ctop strong'),row=card.querySelector('.ctop');
    if(!title||!row)return;
    var cardW=card.getBoundingClientRect().width,rowW=row.getBoundingClientRect().width;
    if(!cardW||!rowW)return;
    var text=(title.textContent||'').trim();
    var big=card.classList.contains('bigcard')||!!card.closest('.cardDetailPreview');
    var start=big?0.072:0.082;
    var min=text.length<=25?(big?0.052:0.056):(big?0.048:0.05);
    var hardMin=big?13:8;
    var max=big?36:24;
    var size=Math.min(max,Math.max(hardMin,cardW*start));
    var floor=Math.max(hardMin,cardW*min);
    title.style.setProperty('font-size',size+'px','important');
    title.style.setProperty('letter-spacing','-.078em','important');
    title.style.setProperty('white-space','nowrap','important');
    title.style.setProperty('overflow','hidden','important');
    title.style.setProperty('text-overflow','clip','important');
    title.style.setProperty('line-height','.98','important');
    var loops=0;
    while(title.scrollWidth>title.clientWidth+1&&size>floor&&loops<30){
      size=Math.max(floor,size*.94);
      title.style.setProperty('font-size',size+'px','important');
      loops++;
    }
    if(title.scrollWidth>title.clientWidth+1&&text.length<=25){
      loops=0;
      while(title.scrollWidth>title.clientWidth+1&&size>hardMin&&loops<24){
        size=Math.max(hardMin,size*.96);
        title.style.setProperty('font-size',size+'px','important');
        loops++;
      }
    }
    card.setAttribute('data-title-fit-px',String(Math.round(size*10)/10));
  }
  function fitAll(root){
    root=root&&root.querySelectorAll?root:document;
    root.querySelectorAll('.card.ctcgFaceRedesign').forEach(fitTitle);
  }
  function refresh(){
    install();
    requestAnimationFrame(function(){fitAll(document)});
    setTimeout(function(){fitAll(document)},40);
    setTimeout(function(){fitAll(document)},160);
    if(typeof scheduleTitleFit==='function')setTimeout(function(){scheduleTitleFit(document);fitAll(document)},30);
  }
  window.fitCommuneCardTitles=fitAll;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refresh).catch(function(){});
  setTimeout(refresh,120);
  setTimeout(refresh,500);
  new MutationObserver(function(){setTimeout(refresh,40)}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  window.addEventListener('resize',refresh);
})();
