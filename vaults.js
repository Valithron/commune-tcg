let vaultsCache=null;
let vaultsLoading=false;
let vaultsErr='';
let vaultsSelectedOwner=null;

function vaultsOwnerName(id){let u=(vaultsCache||[]).find(v=>v.id===id);return u?u.displayName:(ch(id)?.name||id)}
function vaultsOrdered(){let list=(vaultsCache||[]).slice();let me=list.find(v=>v.isCurrent);return me?[me,...list.filter(v=>v.id!==me.id)]:list}
function vaultsReadOnlyCardHtml(c,big=false){
  let cc=ch(c.cid),rr=R[c.rar]||R.common,imgTag=c.img?`<img src="${h(c.img)}" style="${cropStyle(c)}">`:`<div class="ph"><b>${cc.in}</b></div>`;
  return `<article class="card vaultReadOnlyCard ${big?'bigcard':''}" data-card-id="${h(c.id||'')}" style="--a:${cc.a};--r:${rr[2]}"><div class="art">${imgTag}</div><div class="line"></div><div class="ctop"><strong>${h((c.title||'Untitled').slice(0,big?34:25))}</strong><span class="badge">${rr[0]}</span></div>${c.equipped?'<span class="eq">Equipped</span>':''}<div class="vaultCardMeta">${h(cc.name)} Card</div><div class="stats"><div><small>POW</small><b>${h(c.p)}</b></div><div><small>DEF</small><b>${h(c.d)}</b></div><div><small>SPD</small><b>${h(c.s)}</b></div></div><p class="fx">${h(c.effect||c.flavorText||E[c.cid]||'Flavor')}</p><div class="cbot"><span>+${h(c.passive||0)}/min</span><span class="vaultReadOnlyMark">View Only</span></div></article>`;
}
function vaultsFlatCards(){return (vaultsCache||[]).flatMap(v=>(v.cards||[]).map(c=>({...c,owner:c.owner||v.id,_ownerName:v.displayName,_ownerColor:v.color})))}
async function loadVaults(force=false){
  if(vaultsLoading)return;
  if(vaultsCache&&!force)return;
  vaultsLoading=true;
  vaultsErr='';
  try{let data=await api('/api/vaults');vaultsCache=data.vaults||[];ensureVaultsSelectedOwner()}
  catch(e){vaultsErr=e.message||'Failed to load vaults.'}
  finally{vaultsLoading=false;if(user&&state.page==='vaults')render()}
}
function ensureVaultsSelectedOwner(){
  if(!vaultsCache||!vaultsCache.length)return null;
  if(vaultsSelectedOwner&&vaultsCache.some(v=>v.id===vaultsSelectedOwner))return vaultsSelectedOwner;
  const current=vaultsCache.find(v=>v.isCurrent);
  vaultsSelectedOwner=(current||vaultsCache[0]).id;
  return vaultsSelectedOwner;
}
function selectedVault(){const id=ensureVaultsSelectedOwner();return (vaultsCache||[]).find(v=>v.id===id)||(vaultsCache||[])[0]||null}
function vaultsNavHtml(){const pages=['collection','mint','battle','market','tokens','vaults'];return pages.map(p=>`<button class="${state.page===p?'on':''}" data-page="${p}">${p==='mint'?'Mint Card':p==='vaults'?'Vaults':p[0].toUpperCase()+p.slice(1)}</button>`).join('')}
function vaultsShell(content){return `<header class="top"><button class="brand" data-page="collection">Commune TCG<small>${h(user?.displayName||'')} Vault</small></button><nav class="tabs">${vaultsNavHtml()}</nav><button class="btn" id="sync">Sync</button><button class="btn" id="logout">Switch Vault</button></header><div class="layout vaultsLayout"><aside class="vaultsHiddenAside"></aside><main class="content">${content}</main></div>`}
function vaultsPage(){
  if(!vaultsCache&&!vaultsLoading)loadVaults();
  const v=selectedVault();
  if(vaultsErr)return vaultsShell(strip()+`<div class="box">${h(vaultsErr)}</div>`);
  if(!vaultsCache)return vaultsShell(strip()+'<div class="box">Loading vaults...</div>');
  if(!v)return vaultsShell(strip()+'<div class="box">No vault selected.</div>');
  const cards=Array.isArray(v.cards)?v.cards:[];
  return vaultsShell(strip()+`<div class="vaultsPage"><div class="head"><div><h1>${h(v.displayName)} Vault</h1><p>${cards.length} cards · grouped by rarity · read-only browser</p></div><div class="row"><button class="btn" data-vault-refresh>Refresh Vaults</button></div></div>${vaultOwnerChooser(v)}<div class="sections vaultSections">${vaultsRaritySections(cards,v).join('')}</div></div>`);
}
function vaultOwnerChooser(current){return `<div class="vaultChooser" aria-label="Choose vault">${vaultsOrdered().map(v=>vaultChip(v,current)).join('')}</div>`}
function vaultChip(v,current){
  const on=current&&current.id===v.id,cards=Array.isArray(v.cards)?v.cards.length:0,label=`${v.displayName} Vault`,sub=v.isCurrent?`<span class="vaultYou">You</span> · ${cards} cards`:`${cards} cards`;
  return `<button class="vaultChip ${on?'on':''}" data-vault-owner="${h(v.id)}" style="--a:${h(v.color)}"><span class="av" style="--a:${h(v.color)}">${h(v.initials)}</span><b>${h(label)}</b><small>${sub}</small></button>`;
}
function vaultsRaritySections(cards,v){return ['legendary','rare','uncommon','common'].map(r=>vaultsRaritySection(r,cards.filter(x=>x.rar===r),v))}
function vaultsRaritySection(r,cards,v){
  const rr=R[r]||R.common;
  return `<section class="section vaultRaritySection" style="--r:${rr[2]}"><div class="vaultRarityTop"><div><h2>${rr[0]}</h2><p>${cards.length} ${rr[0]} cards in ${h(v.displayName)} Vault</p></div></div><div class="rgrp" style="--r:${rr[2]}"><div class="rlabel">${rr[0].toUpperCase()}</div><div class="grid vaultCardGrid">${cards.length?cards.map(x=>`<button class="vaultCardButton" data-vault-card="${h(x.id)}" aria-label="View ${h(x.title||'card')}">${vaultsReadOnlyCardHtml({...x,owner:x.owner||v.id})}</button>`).join(''):`<div class="emptymsg">No ${rr[0]} cards in this vault yet.</div>`}</div></div></section>`;
}
function vaultCardDetails(c){
  let cc=ch(c.cid),rr=R[c.rar]||R.common;
  const rows=[['Owner',vaultsOwnerName(c.owner)],['Character',cc.name],['Rarity',rr[0]],['Level',c.level||1],['XP',`${Number(c.xp||0).toLocaleString()} current · ${Number(c.lifetimeXp||0).toLocaleString()} lifetime`],['Grade',c.grade||Number(c.p||0)+Number(c.d||0)+Number(c.s||0)],['Battles',c.battles||0],['Wins',c.wins||0],['MVPs',c.mvpCount||0],['Passive',`+${c.passive||0}/min`],['Flavor Tag',c.tag||''],['Flavor Text',c.effect||c.flavorText||'']];
  return `<div class="vaultCardDetailGrid"><div class="vaultLargeCard">${vaultsReadOnlyCardHtml(c,true)}</div><div class="vaultStatsPanel"><h3>${h(c.title||'Untitled')}</h3><div class="vaultStatTiles"><div><small>POW</small><b>${h(c.p||0)}</b></div><div><small>DEF</small><b>${h(c.d||0)}</b></div><div><small>SPD</small><b>${h(c.s||0)}</b></div></div><div class="vaultDetailRows">${rows.map(([k,v])=>`<div><b>${h(k)}</b><span>${h(v)}</span></div>`).join('')}</div><p class="vaultReadonlyNote">Read-only vault view. No editing, equipping, or card actions are available here.</p></div></div>`;
}
function showVaultCard(cardId){
  const c=vaultsFlatCards().find(x=>String(x.id)===String(cardId));
  if(!c)return;
  const modal=document.createElement('div');
  modal.className='vaultCardModalBackdrop';
  modal.innerHTML=`<div class="vaultCardModal" role="dialog" aria-modal="true"><div class="vaultModalTop"><div><b>Card Details</b><small>${h(vaultsOwnerName(c.owner))} Vault</small></div><button class="btn" data-close-vault-card>Close</button></div>${vaultCardDetails(c)}</div>`;
  document.body.appendChild(modal);
  modal.querySelector('[data-close-vault-card]').onclick=()=>modal.remove();
  modal.onclick=e=>{if(e.target===modal)modal.remove()};
  const esc=e=>{if(e.key==='Escape'){modal.remove();document.removeEventListener('keydown',esc)}};
  document.addEventListener('keydown',esc);
  if(typeof scheduleTitleFit==='function')setTimeout(()=>scheduleTitleFit(modal),20);
}
function injectVaultsStyles(){
  if(document.getElementById('ctcgVaultsStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgVaultsStyles';
  style.textContent=`
.vaultsLayout{grid-template-columns:1fr!important}.vaultsHiddenAside{display:none!important}.vaultsPage{display:grid;gap:18px}.vaultChooser{display:flex;gap:10px;overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;padding:2px 2px 10px;scrollbar-width:none}.vaultChooser::-webkit-scrollbar{display:none}.vaultChip{flex:0 0 auto;min-width:160px;display:grid;grid-template-columns:auto 1fr;grid-template-areas:'av name' 'av count';gap:2px 9px;align-items:center;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:#11182a;color:#dfe4ff;padding:10px 12px;text-align:left;cursor:pointer}.vaultChip .av{grid-area:av}.vaultChip b{grid-area:name;font:900 .76rem Sora,Inter,sans-serif;white-space:nowrap}.vaultChip small{grid-area:count;color:#aeb5cc}.vaultChip.on{background:linear-gradient(135deg,var(--a),#f3c93f);border-color:var(--a);color:#090d18;box-shadow:0 0 0 2px rgba(243,201,63,.18)}.vaultChip.on small{color:#151515}.vaultYou{display:inline-block;border:1px solid currentColor;border-radius:999px;padding:1px 5px;font-size:.58rem;line-height:1;text-transform:uppercase;letter-spacing:.06em}.vaultRaritySection{border:1px solid rgba(255,255,255,.12);border-radius:22px;background:linear-gradient(145deg,#11182a,#080d18);padding:16px;display:grid;gap:12px}.vaultRarityTop{display:flex;align-items:center;justify-content:space-between;gap:12px}.vaultRarityTop h2{margin:0;font:900 1.18rem Sora,Inter,sans-serif}.vaultRarityTop p{margin:4px 0 0;color:#aeb5cc}.vaultCardGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:13px}.vaultReadOnlyCard .cbot button{display:none!important}.vaultReadOnlyMark{color:#f3c93f;font:900 .58rem 'JetBrains Mono',monospace;text-transform:uppercase}.vaultCardMeta{margin:6px 10px 0;color:#aeb5cc;font:900 .58rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.06em}.vaultCardButton{appearance:none;border:0;background:transparent;padding:0;cursor:pointer;text-align:left;border-radius:18px}.vaultCardButton:focus-visible{outline:3px solid #f3c93f;outline-offset:4px}.vaultCardButton .card{width:100%!important}.vaultCardModalBackdrop{position:fixed;inset:0;z-index:140;background:rgba(0,0,0,.74);display:grid;place-items:center;padding:18px}.vaultCardModal{width:min(980px,100%);max-height:92vh;overflow:auto;border:1px solid rgba(255,255,255,.16);border-radius:24px;background:#0b1020;padding:16px;box-shadow:0 24px 80px rgba(0,0,0,.58);display:grid;gap:16px}.vaultModalTop{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.vaultModalTop b{display:block;font:900 1.1rem Sora,Inter,sans-serif}.vaultModalTop small{display:block;color:#aeb5cc;margin-top:3px}.vaultCardDetailGrid{display:grid;grid-template-columns:minmax(250px,360px) 1fr;gap:18px;align-items:start}.vaultLargeCard{display:grid;justify-items:center}.vaultLargeCard .card{width:min(340px,100%)!important}.vaultStatsPanel{border:1px solid rgba(255,255,255,.1);border-radius:18px;background:#080d18;padding:16px;display:grid;gap:14px}.vaultStatsPanel h3{margin:0;font:900 1.25rem Sora,Inter,sans-serif}.vaultStatTiles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.vaultStatTiles div{background:#11182d;border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:12px;text-align:center}.vaultStatTiles small{display:block;color:#aeb5cc;font:900 .62rem 'JetBrains Mono',monospace}.vaultStatTiles b{font:900 1.35rem Sora,Inter,sans-serif}.vaultDetailRows{display:grid;gap:8px}.vaultDetailRows div{display:grid;grid-template-columns:120px 1fr;gap:12px;border-bottom:1px solid rgba(255,255,255,.07);padding-bottom:8px}.vaultDetailRows b{color:#dfe4ff}.vaultDetailRows span{color:#b9bed3}.vaultReadonlyNote{margin:0;color:#f3c93f;font:900 .76rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.04em}@media(max-width:760px){.vaultCardDetailGrid{grid-template-columns:1fr}.vaultDetailRows div{grid-template-columns:1fr;gap:3px}.vaultCardGrid{grid-template-columns:repeat(auto-fill,minmax(128px,1fr))}.vaultChip{min-width:138px}}
`;
  document.head.appendChild(style);
}
function setupVaults(){
  injectVaultsStyles();
  document.querySelectorAll('[data-vault-owner]').forEach(b=>{if(b.dataset.vaultReady)return;b.dataset.vaultReady='1';b.onclick=()=>{vaultsSelectedOwner=b.dataset.vaultOwner;render()}});
  document.querySelectorAll('[data-vault-card]').forEach(b=>{if(b.dataset.vaultReady)return;b.dataset.vaultReady='1';b.onclick=()=>showVaultCard(b.dataset.vaultCard)});
  document.querySelectorAll('[data-vault-refresh]').forEach(b=>{if(b.dataset.vaultReady)return;b.dataset.vaultReady='1';b.onclick=()=>loadVaults(true)});
}
const vaultsOldShell=shell;
shell=function(content){let html=vaultsOldShell(content);if(html.includes('data-page="vaults"'))return html;const btn=`<button class="${state.page==='vaults'?'on':''}" data-page="vaults">Vaults</button>`;return html.replace('</nav>',btn+'</nav>')};
const vaultsOldRender=render;
render=function(){if(user&&state.page==='vaults'){$('#app').innerHTML=vaultsPage();bind();return}vaultsOldRender()};
const vaultsOldBind=bind;
bind=function(){vaultsOldBind();setupVaults();if(state.page==='vaults'&&typeof scheduleTitleFit==='function')scheduleTitleFit(document.getElementById('app'))};
injectVaultsStyles();
