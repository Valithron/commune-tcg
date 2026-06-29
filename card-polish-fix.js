(function(){
  if(window.__ctcgCardPolishFix)return;
  window.__ctcgCardPolishFix=true;
  var RARITIES=['common','uncommon','rare','legendary'];
  var RARITY_COLORS={common:'#cfd3dc',uncommon:'#30ff99',rare:'#ffc13b',legendary:'#ee83ff'};
  function normalizeRarity(value){
    var raw=String(value||'').trim().toLowerCase().replace(/\s+/g,'_');
    if(raw==='c'||raw==='common')return'common';
    if(raw==='u'||raw==='uncommon')return'uncommon';
    if(raw==='r'||raw==='rare')return'rare';
    if(raw==='l'||raw==='legendary')return'legendary';
    return'';
  }
  function rarityFromCard(card){
    for(var i=0;i<RARITIES.length;i++)if(card.classList.contains('rarity-'+RARITIES[i]))return RARITIES[i];
    var badge=card.querySelector('.badge');
    if(badge){
      var found=normalizeRarity(badge.textContent||'');
      if(found)return found;
    }
    var data=normalizeRarity(card.getAttribute('data-rarity')||'');
    return data;
  }
  function installStyles(){
    if(document.getElementById('ctcgCardPolishFixStyles'))return;
    var style=document.createElement('style');
    style.id='ctcgCardPolishFixStyles';
    style.textContent='\
.card.rarity-common{--r:#cfd3dc!important;--frame:#cfd3dc!important;--frame2:#7f8794!important}\
.card.rarity-uncommon{--r:#30ff99!important;--frame:#30ff99!important;--frame2:#0bcf82!important}\
.card.rarity-rare{--r:#ffc13b!important;--frame:#ffc13b!important;--frame2:#9c6810!important}\
.card.rarity-legendary{--r:#ee83ff!important;--frame:#ee83ff!important;--frame2:#69e8ff!important}\
.card .ctop{display:flex!important;align-items:flex-start!important;gap:6px!important;min-width:0!important;width:100%!important}\
.card .ctop strong{flex:1 1 auto!important;max-width:none!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.02!important}\
.card .badge{flex:0 0 auto!important;white-space:nowrap!important}\
.card.bigcard .ctop strong{letter-spacing:-.055em!important}\
';
    document.head.appendChild(style);
  }
  function normalizeCardFrame(card){
    if(!card||!card.classList)return;
    var rarity=rarityFromCard(card);
    if(!rarity)return;
    for(var i=0;i<RARITIES.length;i++)card.classList.remove('rarity-'+RARITIES[i]);
    card.classList.add('rarity-'+rarity);
    card.setAttribute('data-rarity',rarity);
    if(RARITY_COLORS[rarity])card.style.setProperty('--r',RARITY_COLORS[rarity],'important');
  }
  function fitTitle(title){
    if(!title)return;
    var card=title.closest?title.closest('.card'):null;
    if(!card)return;
    title.style.removeProperty('font-size');
    title.style.removeProperty('letter-spacing');
    var computed=window.getComputedStyle(title);
    var size=parseFloat(computed.fontSize)||16;
    var min=card.classList.contains('bigcard')?10:7;
    var maxLoops=18;
    while(title.scrollWidth>title.clientWidth+1&&size>min&&maxLoops>0){
      size=Math.max(min,size*.92);
      title.style.fontSize=size+'px';
      title.style.letterSpacing='-.065em';
      maxLoops--;
    }
  }
  function applyCardPolish(root){
    installStyles();
    root=root&&root.querySelectorAll?root:document;
    var cards=root.querySelectorAll('.card');
    for(var i=0;i<cards.length;i++)normalizeCardFrame(cards[i]);
    window.requestAnimationFrame(function(){
      var titles=root.querySelectorAll('.card .ctop strong');
      for(var j=0;j<titles.length;j++)fitTitle(titles[j]);
    });
    setTimeout(function(){
      var titles=root.querySelectorAll('.card .ctop strong');
      for(var j=0;j<titles.length;j++)fitTitle(titles[j]);
    },120);
  }
  window.applyCardPolish=applyCardPolish;
  if(typeof cardHtml==='function'){
    var oldCardHtml=cardHtml;
    cardHtml=function(c,big){
      var rarity='';
      if(c&&typeof c==='object'){
        rarity=normalizeRarity(c.rar||c.rarity);
        if(rarity)c=Object.assign({},c,{rar:rarity});
      }
      var html=oldCardHtml(c,big);
      if(rarity){
        html=html.replace(/(<article[^>]*class=")([^"]*)"/,function(m,start,cls){
          if(cls.indexOf('rarity-'+rarity)!==-1)return m;
          return start+cls+' rarity-'+rarity+'"';
        });
      }
      return html;
    };
  }
  if(typeof render==='function'){
    var oldRender=render;
    render=function(){
      var out=oldRender.apply(this,arguments);
      applyCardPolish(document);
      return out;
    };
  }
  var mo=null;
  function startObserver(){
    if(mo||!document.body)return;
    mo=new MutationObserver(function(list){
      var should=false;
      for(var i=0;i<list.length;i++){
        if(list[i].addedNodes&&list[i].addedNodes.length){should=true;break;}
      }
      if(should)setTimeout(function(){applyCardPolish(document);},30);
    });
    mo.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){applyCardPolish(document);startObserver();});
  else{applyCardPolish(document);startObserver();}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){applyCardPolish(document);}).catch(function(){});
})();
