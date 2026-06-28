function mobileCollectionCharacters(){
  const owner=user&&user.id;
  const primary=C.find(c=>c.id===owner);
  const rest=C.filter(c=>c.id!==owner).slice().sort((a,b)=>a.name.localeCompare(b.name));
  return primary?[primary,...rest]:rest;
}
function mobileCollectionFilterHtml(){
  const allOn=state.sel==='all';
  const chars=mobileCollectionCharacters();
  return `<div class="mobileCollectionFilter" aria-label="Collection character filter"><button class="mobileChar ${allOn?'on':''}" data-char="all"><span class="av" style="--a:#e9c349">ALL</span><b>All</b></button>${chars.map(c=>`<button class="mobileChar ${state.sel===c.id?'on':''}" data-char="${c.id}"><span class="av" style="--a:${c.a}">${c.in}</span><b>${c.name}</b></button>`).join('')}</div>`;
}
function injectMobileCollectionStyles(){
  if(document.getElementById('ctcgMobileCollectionFixStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgMobileCollectionFixStyles';
  style.textContent=`
.mobileCollectionFilter{display:none}@media(max-width:1080px){.mobileCollectionFilter{display:flex;gap:8px;overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;margin:0 0 18px;padding:4px 2px 10px;scrollbar-width:none}.mobileCollectionFilter::-webkit-scrollbar{display:none}.mobileChar{flex:0 0 auto;display:flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:#171a2d;color:#dfe1fa;padding:7px 10px;font:900 .7rem 'JetBrains Mono',monospace}.mobileChar .av{width:27px;height:27px;font-size:.58rem}.mobileChar.on{background:#b9910f;color:#2e2500;border-color:#e9c349;box-shadow:0 0 0 2px rgba(233,195,73,.18)}.mobileChar.on .av{box-shadow:0 0 0 1px rgba(0,0,0,.2)}.mobileChar b{font:900 .68rem 'JetBrains Mono',monospace;white-space:nowrap}.content>.mobileCollectionFilter+*{margin-top:0}}
@media(min-width:1081px){.content>.sections>.section>.sectiontop{display:grid!important;grid-template-columns:auto minmax(0,520px)!important;justify-content:start!important;align-items:center!important;column-gap:clamp(24px,4vw,72px)!important;row-gap:14px!important}.content>.sections>.section>.sectiontop .title{min-width:0!important}.content>.sections>.section>.sectiontop .slots{justify-self:start!important;justify-content:flex-start!important;align-items:center!important;flex-wrap:wrap!important;max-width:520px!important;min-width:0!important}.content>.sections>.section>.sectiontop .strong{text-align:left!important;min-width:max-content!important}}
@media(min-width:1081px) and (max-width:1320px){.content>.sections>.section>.sectiontop{grid-template-columns:1fr!important}.content>.sections>.section>.sectiontop .slots{max-width:100%!important}}
`;
  document.head.appendChild(style);
}
function loadEncounterPatch(){
  if(document.getElementById('ctcgEncounterPatch'))return;
  const script=document.createElement('script');
  script.id='ctcgEncounterPatch';
  script.src='/ai-'+'enemy-type.js?v=28';
  document.body.appendChild(script);
}
injectMobileCollectionStyles();
loadEncounterPatch();
const mobileCollectionOldCollection=collection;
collection=function(){
  const html=mobileCollectionOldCollection();
  if(state.page&&state.page!=='collection')return html;
  if(html.includes('mobileCollectionFilter'))return html;
  return html.replace('<main class="content">','<main class="content">'+mobileCollectionFilterHtml());
};
const mobileCollectionOldBind=bind;
bind=function(){
  mobileCollectionOldBind();
  injectMobileCollectionStyles();
};
