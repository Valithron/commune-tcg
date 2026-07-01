/*
 * Commune TCG Runtime Patch Inventory
 * Purpose: Applies the current collectible card-face redesign, including compact top metadata, character initials, level box, vertical XP rail, and detail modal layout.
 * Original problem solved: The original card face became visually cluttered after XP, level, equipped state, and ascension controls were added.
 * Key assumptions: Card DOM has `.card[data-card-id]`, `.ctop .badge`, `.stats`, and card ids that match `state.cards`; vault/enemy/preview cards should not receive owned-card redesign decorations.
 * Known interactions: Depends on `cardXpProgress` when available; calls `scheduleTitleFit` and `applyCardPolish`; later `card-title-stability.js` and `card-badge-compact.js` further adjust title/badge sizing.
 * Mobile/Desktop differences: Has explicit 720px mobile rules for badge width, title sizing, XP rail width, and stats positioning; vault contexts explicitly hide redesign-only additions.
 */
(function(){
  if(window.__ctcgCardFaceRedesign)return;
  window.__ctcgCardFaceRedesign=true;
  var STAGES={
    common:{floor:1,cap:5,thresholds:[0,80,180,320,500],next:'uncommon',cost:250},
    uncommon:{floor:6,cap:10,thresholds:[0,300,650,1050,1500],next:'rare',cost:1000},
    rare:{floor:11,cap:20,thresholds:[0,500,1100,1800,2600,3600,4800,6200,7800,9500],next:'legendary',cost:3000},
    legendary:{floor:21,cap:30,thresholds:[0,1000,2200,3600,5200,7000,9000,11200,13600,16200],next:null,cost:0}
  };
  function esc(v){return typeof h==='function'?h(v):String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  function numLocal(v){return Number(v||0).toLocaleString(undefined,{maximumFractionDigits:0})}
  function ownedCards(){try{return Array.isArray(state.cards)?state.cards:[]}catch(e){return[]}}
  function cardById(id){return ownedCards().find(function(c){return String(c.id)===String(id)})}
  function isVaultCard(el){return !!(el.closest&&el.closest('.vaults,.vaultsPage,.vaultCardModal,.vaultReadOnlyCard'))}
  function progressFor(c){
    if(typeof cardXpProgress==='function'){
      try{return cardXpProgress(c)}catch(e){}
    }
    var rar=String(c&&c.rar||'common').toLowerCase(),stage=STAGES[rar]||STAGES.common,xp=Math.max(0,Number(c&&c.xp||0)),plus=0;
    for(var i=1;i<stage.thresholds.length;i++){if(xp>=stage.thresholds[i])plus=i;else break}
    var level=Math.min(stage.cap,stage.floor+plus),current=stage.thresholds[plus]||0,next=level>=stage.cap?null:(stage.thresholds[plus+1]||null),need=stage.next?stage.thresholds[stage.thresholds.length-1]:null;
    var pct=next?Math.max(0,Math.min(100,((xp-current)/(next-current))*100)):(stage.next?100:100);
    return{level:level,xp:xp,current:current,next:next,pct:pct,need:need,stage:stage,rar:rar,ready:!!stage.next&&level>=stage.cap&&xp>=need};
  }
  function hasEarnedXp(c){return Number(c&&c.xp||0)>0||Number(c&&c.lifetimeXp||0)>0||Number(c&&c.battles||0)>0||Number(c&&c.wins||0)>0||Number(c&&c.mvpCount||0)>0}
  function installStyles(){
    if(document.getElementById('ctcgCardFaceRedesignStyles'))return;
    var style=document.createElement('style');
    style.id='ctcgCardFaceRedesignStyles';
    style.textContent='\
.card.ctcgFaceRedesign{--badgeW:clamp(48px,35cqw,76px)}\
.card.ctcgFaceRedesign>.cardXpBadge{display:none!important}\
.card.ctcgFaceRedesign .cbot button,.card.ctcgFaceRedesign .vaultReadOnlyMark{display:none!important}\
.card.ctcgFaceRedesign .cbot{justify-content:flex-start!important}\
.card.ctcgFaceRedesign .ctop{left:8.2%!important;right:8.2%!important;width:auto!important;max-width:none!important;display:block!important;overflow:visible!important;position:absolute!important}\
.card.ctcgFaceRedesign .ctop strong{display:block!important;width:calc(100% - var(--badgeW) - 7px)!important;max-width:calc(100% - var(--badgeW) - 7px)!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}\
.card.ctcgFaceRedesign .badge{position:absolute!important;right:0!important;top:0!important;width:var(--badgeW)!important;box-sizing:border-box!important;display:block!important;max-width:var(--badgeW)!important;margin:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:clip!important;text-align:center!important;font-size:clamp(.32rem,3.1cqw,.58rem)!important;line-height:1.04!important;padding:.25em .22em!important;letter-spacing:-.025em!important;text-transform:uppercase!important}\
.card.bigcard.ctcgFaceRedesign{--badgeW:clamp(78px,28cqw,108px)}\
.card.bigcard.ctcgFaceRedesign .ctop strong{width:calc(100% - var(--badgeW) - 10px)!important;max-width:calc(100% - var(--badgeW) - 10px)!important}\
.card.bigcard.ctcgFaceRedesign .badge{font-size:clamp(.48rem,2.4cqw,.86rem)!important;padding:.34em .34em!important}\
.card.ctcgFaceRedesign .stats{left:31.2%!important;right:7.7%!important;bottom:14.2%!important}\
.cardFaceLevel{position:absolute;z-index:7;left:7.7%;bottom:14.45%;width:19.4%;height:6.2%;border:1.3px solid color-mix(in srgb,var(--frame),transparent 16%);border-radius:6px;background:linear-gradient(180deg,rgba(16,22,37,.96),rgba(5,9,20,.96));box-shadow:0 0 10px color-mix(in srgb,var(--frame),transparent 78%);display:grid;place-items:center;color:var(--cardText);font:900 clamp(.46rem,4.2cqw,.76rem) Sora,Inter,sans-serif;text-shadow:0 1px 2px #000;line-height:1;text-transform:uppercase;letter-spacing:-.02em}\
.cardFaceCharacter{position:absolute;z-index:6;left:8.2%;right:34%;top:4.55%;color:color-mix(in srgb,var(--cardText),white 10%);font:900 clamp(.38rem,3.5cqw,.62rem) JetBrains Mono,monospace;line-height:1;text-transform:uppercase;letter-spacing:.12em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px #000;opacity:.92}\
.cardXpRailV{position:absolute;z-index:7;left:5.05%;top:14.4%;bottom:7.3%;width:4px;border-radius:999px;background:rgba(8,15,28,.64);box-shadow:inset 0 0 0 1px rgba(255,255,255,.13),0 0 8px rgba(53,214,197,.2);overflow:hidden;pointer-events:none}\
.cardXpRailV i{position:absolute;left:0;right:0;bottom:0;height:var(--xpPct,0%);border-radius:inherit;background:linear-gradient(180deg,#7ffff1,#35d6c5 55%,#189f9a);box-shadow:0 0 10px rgba(53,214,197,.54)}\
.card.bigcard .cardFaceLevel{font-size:clamp(.7rem,3.4cqw,1.05rem);border-radius:8px}\
.card.bigcard .cardXpRailV{width:5px}\
.card.bigcard .cardFaceCharacter{font-size:clamp(.56rem,2.9cqw,.88rem)}\
.battleFighter .card.ctcgFaceRedesign .stats{left:31.2%!important;right:7.7%!important}\
.vaults .card .cardFaceLevel,.vaults .card .cardXpRailV,.vaults .card .cardFaceCharacter,.vaultsPage .card .cardFaceLevel,.vaultsPage .card .cardXpRailV,.vaultsPage .card .cardFaceCharacter,.vaultCardModal .card .cardFaceLevel,.vaultCardModal .card .cardXpRailV,.vaultCardModal .card .cardFaceCharacter{display:none!important}\
@media(max-width:720px){.card.ctcgFaceRedesign{--badgeW:clamp(44px,37cqw,62px)}.cardFaceLevel{font-size:clamp(.4rem,4cqw,.62rem)}.cardXpRailV{width:3px}.grid .card.ctcgFaceRedesign .stats{left:31.5%!important;right:7.5%!important}.cardFaceCharacter{top:4.7%;font-size:clamp(.34rem,3.2cqw,.52rem)}.card.ctcgFaceRedesign .ctop strong{width:calc(100% - var(--badgeW) - 5px)!important;max-width:calc(100% - var(--badgeW) - 5px)!important}.card.ctcgFaceRedesign .badge{font-size:clamp(.28rem,3cqw,.48rem)!important;padding:.18em .14em!important}}\
';
    document.head.appendChild(style);
  }
  function shouldDecorateCard(el,c){
    if(!el||!c||!c.id||c.id==='preview')return false;
    if(isVaultCard(el))return false;
    if(c.enemyType||c.isEnemy)return false;
    return true;
  }
  function decorateCard(el){
    if(!el||!el.querySelector)return;
    var id=el.getAttribute('data-card-id');
    if(!id)return;
    var c=cardById(id);
    if(!shouldDecorateCard(el,c))return;
    var cc=typeof ch==='function'?ch(c.cid):{name:c.cid||'Card',in:String(c.cid||'').slice(0,2).toUpperCase()};
    var p=progressFor(c),level=Number(c.level||0)||p.level||1;
    el.classList.add('ctcgFaceRedesign');
    var badge=el.querySelector(':scope > .ctop .badge');
    if(badge){badge.title=badge.textContent||''}
    var oldChar=el.querySelector(':scope > .cardFaceCharacter');
    if(!oldChar){oldChar=document.createElement('div');oldChar.className='cardFaceCharacter';el.appendChild(oldChar)}
    oldChar.textContent=String(cc.in||String(c.cid||'').slice(0,2)||'').toUpperCase();
    var oldLevel=el.querySelector(':scope > .cardFaceLevel');
    if(!oldLevel){oldLevel=document.createElement('div');oldLevel.className='cardFaceLevel';el.appendChild(oldLevel)}
    oldLevel.textContent='LVL '+level;
    var rail=el.querySelector(':scope > .cardXpRailV');
    if(hasEarnedXp(c)){
      if(!rail){rail=document.createElement('div');rail.className='cardXpRailV';rail.innerHTML='<i></i>';el.appendChild(rail)}
      rail.style.setProperty('--xpPct',Math.max(0,Math.min(100,Number(p.pct||0))).toFixed(1)+'%');
      rail.setAttribute('title','XP '+Math.floor(Number(p.xp||0))+(p.next?'/'+p.next:''));
    }else if(rail){rail.remove()}
  }
  function apply(root){
    installStyles();
    root=root&&root.querySelectorAll?root:document;
    var cards=root.querySelectorAll('.card[data-card-id]');
    for(var i=0;i<cards.length;i++)decorateCard(cards[i]);
    if(typeof scheduleTitleFit==='function')setTimeout(function(){scheduleTitleFit(root)},30);
    if(typeof applyCardPolish==='function')setTimeout(function(){applyCardPolish(root)},60);
  }
  function detailRows(c,p,grade){
    return '<div class="detailGrid detailProgressGrid"><div class="detailBox"><small>Level</small><b>'+esc(p.level||c.level||1)+'</b></div><div class="detailBox"><small>XP</small><b>'+esc(Math.floor(Number(p.xp||0)))+(p.next?' / '+esc(p.next):'')+'</b></div><div class="detailBox"><small>Lifetime XP</small><b>'+esc(numLocal(c.lifetimeXp||0))+'</b></div></div>'+ 
      '<div class="detailGrid detailProgressGrid"><div class="detailBox"><small>Battles</small><b>'+esc(c.battles||0)+'</b></div><div class="detailBox"><small>Wins</small><b>'+esc(c.wins||0)+'</b></div><div class="detailBox"><small>MVPs</small><b>'+esc(c.mvpCount||0)+'</b></div></div>';
  }
  function installDetailOverride(){
    if(typeof showCardDetail!=='function'||showCardDetail.__ctcgFaceRedesign)return;
    // Global override: replaces showCardDetail so the detail modal mirrors the redesigned card progression information.
    showCardDetail=function(id){
      var c=cardById(id);if(!c)return;
      var cc=typeof ch==='function'?ch(c.cid):{name:c.cid||'Card'},rar=(typeof rarityName==='function'?rarityName(c.rar):String(c.rar||'Unknown')),grade=Number(c.grade||0)||(typeof score==='function'?score(c):Number(c.p||0)+Number(c.d||0)+Number(c.s||0)),p=progressFor(c);
      var modal=document.createElement('div');modal.className='cardDetailBackdrop';
      modal.innerHTML='<div class="cardDetailModal"><div class="cardDetailPreview">'+cardHtml(c,true)+'</div><aside class="cardDetailPanel"><div class="cardDetailTop"><div><span class="detailPill">'+esc(rar)+' · '+esc(cc.name)+'</span><h2>'+esc(c.title||'Untitled')+'</h2><p>'+esc(c.tag||'Battle')+' · Owned by '+esc((user&&user.displayName)||'Current Vault')+'</p></div><button class="cardDetailClose" type="button" data-detail-close>Close</button></div><div class="detailGrid"><div class="detailStat"><small>POW</small><b>'+esc(c.p)+'</b></div><div class="detailStat"><small>DEF</small><b>'+esc(c.d)+'</b></div><div class="detailStat"><small>SPD</small><b>'+esc(c.s)+'</b></div></div><div class="detailGrid"><div class="detailBox"><small>Passive</small><b>+'+esc(c.passive)+'/min</b></div><div class="detailBox"><small>Grade</small><b>'+esc(grade)+'</b></div><div class="detailBox"><small>Status</small><b>'+(c.equipped?'Equipped':'Unequipped')+'</b></div></div>'+detailRows(c,p,grade)+'<div class="detailBox detailEffect"><small>Effect / Flavor</small><p>'+esc(c.effect||c.flavorText||(typeof E!=='undefined'?E[c.cid]:'')||'No effect text.')+'</p></div><div class="detailBox"><small>Card ID</small><p>'+esc(c.id)+'</p></div><div class="detailActions"><button class="gold" type="button" data-detail-eq="'+esc(c.id)+'">'+(c.equipped?'Unequip':'Equip')+'</button><button class="btn" type="button" data-detail-close>Back to Collection</button></div></aside></div>';
      document.body.appendChild(modal);apply(modal);
      modal.querySelectorAll('[data-detail-close]').forEach(function(b){b.onclick=function(){modal.remove()}});
      modal.onclick=function(e){if(e.target===modal)modal.remove()};
      var eq=modal.querySelector('[data-detail-eq]');
      if(eq)eq.onclick=async function(){try{await api(c.equipped?'/api/cards/unequip':'/api/cards/equip',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:c.id})});modal.remove();await loadState()}catch(err){alert(err.message)}};
    };
    showCardDetail.__ctcgFaceRedesign=true;
  }
  var oldRender=typeof render==='function'?render:null;

  // Global override: after every full app render, decorate eligible owned cards and ensure the detail modal override is installed.
  if(oldRender&&!oldRender.__ctcgFaceRedesign){
    render=function(){var out=oldRender.apply(this,arguments);installDetailOverride();apply(document);return out};
    render.__ctcgFaceRedesign=true;
  }
  installStyles();installDetailOverride();apply(document);
  setTimeout(function(){installDetailOverride();apply(document)},120);
  setTimeout(function(){installDetailOverride();apply(document)},500);

  // Observer: catches cards inserted outside the wrapped render path, such as detail/modal content or dynamically loaded patch output.
  // Current cost: any body subtree insertion schedules a full-document owned-card decoration pass plus downstream title/polish passes.
  new MutationObserver(function(){setTimeout(function(){installDetailOverride();apply(document)},35)}).observe(document.body,{childList:true,subtree:true});
})();