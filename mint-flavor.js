const MINT_FLAVOR_LIMIT=120;
function defaultFlavorForCharacter(id){return E[id]||'Flavor text'}
function cleanFlavorText(value){return String(value||'').slice(0,MINT_FLAVOR_LIMIT)}
function draftFlavor(){let d=state.draft||{};return cleanFlavorText(d.effect||d.flavorText||defaultFlavorForCharacter(d.cid||'cydney'))}
function ensureDraftFlavor(){state.draft=state.draft||{};if(!state.draft.effect&&!state.draft.flavorText)state.draft.effect=defaultFlavorForCharacter(state.draft.cid||'cydney')}
function showMintToast(message='Success!'){
  let toast=document.getElementById('mintSuccessToast');
  if(!toast){toast=document.createElement('div');toast.id='mintSuccessToast';toast.className='mintSuccessToast';document.body.appendChild(toast)}
  toast.textContent=message;
  toast.classList.add('show');
  clearTimeout(mintToastTimer);
  mintToastTimer=setTimeout(()=>toast.classList.remove('show'),1900);
}
function highlightMintedCard(id){
  if(!id)return;
  requestAnimationFrame(()=>setTimeout(()=>{
    const safe=window.CSS&&CSS.escape?CSS.escape(String(id)):String(id).replace(/"/g,'\\"');
    const card=document.querySelector(`[data-card-id="${safe}"]`);
    if(!card)return;
    card.classList.add('mintedCardHighlight');
    card.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});
    setTimeout(()=>card.classList.remove('mintedCardHighlight'),2600);
  },120));
}
const mintFlavorOldPreviewCard=previewCard;
previewCard=function(){ensureDraftFlavor();let c=mintFlavorOldPreviewCard();c.effect=draftFlavor();return c}
function setupMintFlavorControls(){if(state.page!=='mint')return;ensureDraftFlavor();let flavor=document.getElementById('flavorText');if(flavor&&!flavor.dataset.ready){flavor.dataset.ready='1';flavor.oninput=()=>{state.draft.effect=cleanFlavorText(flavor.value);state.draft.flavorText=state.draft.effect;let count=document.getElementById('flavorCount');if(count)count.textContent=String(state.draft.effect.length);queueMeta();let preview=document.querySelector('.preview');if(preview)preview.innerHTML='<div class="label">Preview</div>'+cardHtml(previewCard(),true);scheduleTitleFit?.(preview)}}}
function relabelFlavorDetails(root=document){root.querySelectorAll('.detailEffect small').forEach(s=>{if(/effect\s*\/\s*flavor/i.test(s.textContent)||/effect/i.test(s.textContent))s.textContent='Flavor'});root.querySelectorAll('.detailEffect p').forEach(p=>{if(p.textContent==='No effect text.')p.textContent='No flavor text.'})}
const mintFlavorOldBind=bind;
bind=function(){mintFlavorOldBind();setupMintFlavorControls();relabelFlavorDetails();if(pendingMintHighlightId&&state.page==='collection'){let id=pendingMintHighlightId;pendingMintHighlightId=null;highlightMintedCard(id)}}
function injectMintFlavorStyles(){if(document.getElementById('ctcgMintFlavorStyles'))return;let style=document.createElement('style');style.id='ctcgMintFlavorStyles';style.textContent=`
.mintFlavorForm textarea{width:100%;min-height:92px;border:1px solid var(--line);border-radius:7px;padding:11px 12px;color:var(--text);background:#101326;resize:vertical;font:inherit}.mintFlavorForm .flavorField{grid-column:1/-1}.mintFlavorForm .flavorField small{display:block;margin-top:6px;text-align:right;color:#aeb2cc;font:900 .64rem 'JetBrains Mono',monospace}.cardDetailPanel .detailEffect small{text-transform:uppercase}.mintSuccessToast{position:fixed;left:50%;top:18px;transform:translate(-50%,-18px);z-index:2000;opacity:0;pointer-events:none;border:1px solid rgba(53,214,197,.45);border-radius:999px;background:linear-gradient(135deg,#35d6c5,#f3c93f);color:#070a18;padding:12px 18px;font:900 .85rem 'JetBrains Mono',monospace;box-shadow:0 18px 44px rgba(0,0,0,.38);transition:opacity .18s ease,transform .18s ease}.mintSuccessToast.show{opacity:1;transform:translate(-50%,0)}.mintedCardHighlight{animation:mintedCardPulse 2.6s ease both!important;position:relative;z-index:3}@keyframes mintedCardPulse{0%{transform:scale(.96);box-shadow:0 0 0 0 rgba(243,201,63,.9),0 0 0 1px rgba(243,201,63,.9)}18%{transform:scale(1.06);box-shadow:0 0 0 8px rgba(243,201,63,.34),0 0 38px rgba(243,201,63,.85)}60%{transform:scale(1.02);box-shadow:0 0 0 12px rgba(53,214,197,.18),0 0 34px rgba(53,214,197,.55)}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(243,201,63,0)}}@media(max-width:1080px){.mintFlavorForm{display:grid!important;grid-template-columns:1fr!important}.mintFlavorForm .titleField,.mintFlavorForm .tagField,.mintFlavorForm .flavorField{grid-column:1/-1!important;width:100%!important}.mintFlavorForm input#ct{width:100%!important;min-width:0!important;font-size:1rem}.mintFlavorForm select#tag,.mintFlavorForm textarea#flavorText{width:100%!important;min-width:0!important}.mintSuccessToast{top:12px;width:max-content;max-width:calc(100vw - 28px);text-align:center}}
`;document.head.appendChild(style)}
injectMintFlavorStyles();
new MutationObserver(mutations=>{for(const m of mutations){for(const n of m.addedNodes||[]){if(n.nodeType===1)relabelFlavorDetails(n)}}}).observe(document.body,{childList:true,subtree:true});