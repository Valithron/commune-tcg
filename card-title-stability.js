/*
 * Commune TCG Runtime Patch Inventory
 * Purpose: Keeps full card titles available and repeatedly fits them after render/font/layout changes.
 * Original problem solved: Earlier cardHtml/title-limit behavior truncated titles, causing title data loss and unstable display when badges/card redesign changed available width.
 * Key assumptions: Base card markup has `.card`, `.ctop strong`, and optional `data-card-id`; owned cards are available in `state.cards` for restoring full titles by id.
 * Known interactions: Wraps `cardHtml`, `scheduleTitleFit`, and `render`; runs after `card-face-redesign.js` in direct load order and before `card-badge-compact.js` final compact sizing.
 * Mobile/Desktop differences: Uses the same fitting logic everywhere, but mobile widths increase the likelihood of repeated scale passes.
 */
(function(){
  if(window.__ctcgCardTitleStability)return;
  window.__ctcgCardTitleStability=true;
  function esc(v){return typeof h==='function'?h(v):String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  function installStyles(){
    if(document.getElementById('ctcgCardTitleStabilityStyles'))return;
    var style=document.createElement('style');
    style.id='ctcgCardTitleStabilityStyles';
    style.textContent='.card .ctop{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:clamp(3px,1.4cqw,8px)!important;min-width:0!important;overflow:visible!important}.card .ctop strong{flex:1 1 0!important;min-width:0!important;width:auto!important;max-width:none!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:clip!important}.grid .card .ctop strong,.battle .card .ctop strong,.battleAuto .card .ctop strong,.preview .card.bigcard .ctop strong,.cardDetailPreview .card.bigcard .ctop strong,.card.ctcgFaceRedesign .ctop strong,.card.bigcard.ctcgFaceRedesign .ctop strong{max-width:none!important}.card .badge,.card.ctcgFaceRedesign .badge{flex:0 0 auto!important;margin-left:auto!important;white-space:nowrap!important;max-width:42%!important;overflow:visible!important;text-overflow:clip!important}.card.ctcgFaceRedesign .ctop{left:8.2%!important;right:8.2%!important;width:auto!important;max-width:none!important}.card.bigcard.ctcgFaceRedesign .badge{max-width:38%!important}.card.bigcard.ctcgFaceRedesign .ctop strong{max-width:none!important}';
    document.head.appendChild(style);
  }
  function fullTitleFromCardElement(card){
    var id=card&&card.getAttribute&&card.getAttribute('data-card-id');
    if(id&&typeof state==='object'&&Array.isArray(state.cards)){
      var c=state.cards.find(function(x){return String(x.id)===String(id)});
      if(c&&c.title)return String(c.title);
    }
    return card&&card.getAttribute?card.getAttribute('data-card-title')||'':'';
  }
  function fitOneTitle(title){
    if(!title||!title.closest)return;
    var card=title.closest('.card');
    if(!card)return;
    var full=fullTitleFromCardElement(card);
    if(full&&title.textContent!==full)title.textContent=full;
    if(full)title.setAttribute('title',full);
    title.style.setProperty('--titleScale','1');
    var min=card.classList.contains('bigcard')?0.48:0.36;
    var scale=1;
    for(var i=0;i<18;i++){
      if(title.scrollWidth<=title.clientWidth+1)break;
      scale=Math.max(min,scale-0.04);
      title.style.setProperty('--titleScale',String(scale));
      if(scale<=min)break;
    }
  }
  function fitCardTitlesStable(root){
    installStyles();
    root=root&&root.querySelectorAll?root:document;
    requestAnimationFrame(function(){
      var titles=root.querySelectorAll('.card .ctop strong');
      for(var i=0;i<titles.length;i++)fitOneTitle(titles[i]);
    });
  }
  function scheduleStable(root){
    fitCardTitlesStable(root);
    setTimeout(function(){fitCardTitlesStable(root)},60);
    setTimeout(function(){fitCardTitlesStable(root)},180);
    setTimeout(function(){fitCardTitlesStable(root)},420);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){fitCardTitlesStable(root)}).catch(function(){});
  }

  // Global override: preserves full title text in `data-card-title` and restores full text into `.ctop strong` after earlier title-limit truncation.
  if(typeof cardHtml==='function'&&!cardHtml.__ctcgTitleStability){
    var oldCardHtml=cardHtml;
    cardHtml=function(c,big){
      var full=c&&typeof c==='object'?String(c.title||'Untitled'):'';
      var html=oldCardHtml.apply(this,arguments);
      if(full){
        html=html.replace(/(<article[^>]*class="[^"]*card[^"]*"[^>]*)(>)/,function(m,a,b){return a+(a.indexOf('data-card-title=')>-1?'':' data-card-title="'+esc(full)+'"')+b});
        html=html.replace(/(<div class="ctop"[^>]*>\s*<strong[^>]*>)([\s\S]*?)(<\/strong>)/,function(m,a,b,d){return a+esc(full)+d});
      }
      return html;
    };
    cardHtml.__ctcgTitleStability=true;
  }
  var oldSchedule=typeof scheduleTitleFit==='function'?scheduleTitleFit:null;

  // Global override: preserves the original title-fit hook while adding the stable full-title pass.
  if(oldSchedule&&!oldSchedule.__ctcgTitleStability){
    scheduleTitleFit=function(root){try{oldSchedule(root)}catch(e){}scheduleStable(root||document)};
    scheduleTitleFit.__ctcgTitleStability=true;
  }
  var oldRender=typeof render==='function'?render:null;

  // Global override: schedules title stabilization after each full render.
  if(oldRender&&!oldRender.__ctcgTitleStability){
    render=function(){var out=oldRender.apply(this,arguments);scheduleStable(document);return out};
    render.__ctcgTitleStability=true;
  }
  installStyles();
  scheduleStable(document);
  setTimeout(function(){scheduleStable(document)},800);

  // Observer: watches broad DOM insertions because cards/modals can be inserted outside the central render hook.
  // Current cost: every body subtree insertion schedules multiple delayed title-fit passes over all card titles.
  new MutationObserver(function(){setTimeout(function(){scheduleStable(document)},35)}).observe(document.body,{childList:true,subtree:true});
})();