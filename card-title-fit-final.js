(function(){
  if(window.__ctcgCardTitleFitFinal)return;
  window.__ctcgCardTitleFitFinal=true;
  function titleText(el){return (el&&el.textContent||'').trim()}
  function isRedesigned(card){return card&&card.classList&&card.classList.contains('ctcgFaceRedesign')}
  function fitOne(card){
    if(!isRedesigned(card))return;
    var title=card.querySelector('.ctop strong');
    var row=card.querySelector('.ctop');
    if(!title||!row)return;
    var cardW=card.getBoundingClientRect().width;
    var rowW=row.getBoundingClientRect().width;
    if(!cardW||!rowW)return;
    var txt=titleText(title);
    var big=card.classList.contains('bigcard')||card.closest('.cardDetailPreview');
    var startScale=big?0.072:0.082;
    var minScale=txt.length<=25?(big?0.052:0.056):(big?0.048:0.05);
    var hardMin=big?13:8;
    var maxSize=big?36:24;
    var size=Math.min(maxSize,Math.max(hardMin,cardW*startScale));
    var min=Math.max(hardMin,cardW*minScale);
    title.style.setProperty('font-size',size+'px','important');
    title.style.setProperty('letter-spacing','-.078em','important');
    title.style.setProperty('white-space','nowrap','important');
    title.style.setProperty('overflow','hidden','important');
    title.style.setProperty('text-overflow','clip','important');
    title.style.setProperty('line-height','.98','important');
    var loops=0;
    while(title.scrollWidth>title.clientWidth+1&&size>min&&loops<28){
      size=Math.max(min,size*.94);
      title.style.setProperty('font-size',size+'px','important');
      loops++;
    }
    if(title.scrollWidth>title.clientWidth+1&&txt.length<=25){
      loops=0;
      while(title.scrollWidth>title.clientWidth+1&&size>hardMin&&loops<22){
        size=Math.max(hardMin,size*.96);
        title.style.setProperty('font-size',size+'px','important');
        loops++;
      }
    }
    card.setAttribute('data-title-fit-px',String(Math.round(size*10)/10));
  }
  function fitAll(root){
    root=root&&root.querySelectorAll?root:document;
    var cards=root.querySelectorAll('.card.ctcgFaceRedesign');
    for(var i=0;i<cards.length;i++)fitOne(cards[i]);
  }
  function queue(root){
    requestAnimationFrame(function(){fitAll(root)});
    setTimeout(function(){fitAll(root)},80);
    setTimeout(function(){fitAll(root)},260);
  }
  window.fitCommuneCardTitles=fitAll;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){queue(document)});else queue(document);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){queue(document)}).catch(function(){});
  var mo=new MutationObserver(function(){queue(document)});
  mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  window.addEventListener('resize',function(){queue(document)});
})();
