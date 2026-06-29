let vaultsCache=null;
let vaultsLoading=false;
let vaultsErr='';

function vaultsRarityName(r){return (R[r]&&R[r][0])||String(r||'Common')}
function vaultsOwnerName(id){let u=(vaultsCache||[]).find(v=>v.id===id);return u?u.displayName:(ch(id)?.name||id)}
function vaultsReadOnlyCardHtml(c,big=false){
  let cc=ch(c.cid),rr=R[c.rar]||R.common,imgTag=c.img?`<img src="${h(c.img)}" style="${cropStyle(c)}">`:`<div class="ph"><b>${cc.in}</b></div>`;
  return `<article class="card vaultReadOnlyCard ${big?'bigcard':''}" data-card-id="${h(c.id||'')}" style="--a:${cc.a};--r:${rr[2]}"><div class="art">${imgTag}</div><div class="line"></div><div class="ctop"><strong>${h((c.title||'Untitled').slice(0,big?34:25))}</strong><span class="badge">${rr[0]}</span></div><div class="vaultOwnerChip">${h(vaultsOwnerName(c.owner))} Vault</div><div class="stats"><div><small>POW</small><b>${h(c.p)}</b></div><div><small>DEF</small><b>${h(c.d)}</b></div><div><small>SPD</small><b>${h(c.s)}</b></div></div><p class="fx">${h(c.effect||c.flavorText||E[c.cid]||'Flavor')}</p><div class="cbot"><span>+${h(c.passive||0)}/min</span><span class="vaultReadOnlyMark">View Only</span></div></article>`;
}
function vaultsFlatCards(){return (vaultsCache||[]).flatMap(v=>(v.cards||[]).map(c=>({...c,owner:c.owner||v.id,_ownerName:v.displayName,_ownerColor:v.color})))}
async function loadVaults(force=false){
  if(vaultsLoading)return;
  if(vaultsCache&&!force)return;
  vaultsLoading=true;
  vaultsErr='';
  try{
    let data=await api('/api/vaults');
    vaultsCache=data.vaults||[];
  }catch(e){
    vaultsErr=e.message||'Failed to load vaults.';
  }finally{
    vaultsLoading=false;
    if(user&&state.page==='vaults')render();
  }
}
function vaultsShell(content){
  let html=shell(content);
  return html.replace('<div class="layout"><aside>','<div class="layout vaultsLayout"><aside class="vaultsHiddenAside">');
}
function vaultsPage(){
  if(!vaultsCache&&!vaultsLoading)loadVaults();
  let body='';
  if(vaultsErr){
    body=`<div class="box">${h(vaultsErr)}</div>`;
  }else if(!vaultsCache){
    body='<div class="box">Loading vaults...</div>';
  }else{
    body=vaultsCache.map(v=>vaultOwnerSection(v)).join('');
  }
  return vaultsShell(strip()+`<div class="vaultsPage"><div class="head"><div><h1>Vaults</h1><p>Browse everyone’s cards. Cards are view-only here.</p></div><div class="row"><button class="btn" data-vault-refresh>Refresh Vaults</button></div></div><div class="vaultsGrid">${body}</div></div>`);
}
function vaultOwnerSection(v){
  const cards=Array.isArray(v.cards)?v.cards:[];
  const ownerLabel=v.isCurrent?'Your Vault':`${v.displayName} Vault`;
  return `<section class="vaultOwnerPanel" style="--a:${h(v.color)}"><div class="vaultOwnerTop"><div class="big" style="--a:${h(v.color)}">${h(v.initials)}</div><div><h2>${h(ownerLabel)}</h2><p>${cards.length} cards</p></div></div>${cards.length?`<div class="vaultCardGrid">${cards.map(c=>`<button class="vaultCardButton" data-vault-card="${h(c.id)}" aria-label="View ${h(c.title||'card')}">${vaultsReadOnlyCardHtml({...c,owner:c.owner||v.id})}</button>`).join('')}</div>`:'<div class="emptymsg">No cards in this vault yet.</div>'}</section>`;
}
function vaultCardDetails(c){
  let cc=ch(c.cid),rr=R[c.rar]||R.common;
  const rows=[
    ['Owner',vaultsOwnerName(c.owner)],
    ['Character',cc.name],
    ['Rarity',rr[0]],
    ['Level',c.level||1],
    ['XP',`${Number(c.xp||0).toLocaleString()} current · ${Number(c.lifetimeXp||0).toLocaleString()} lifetime`],
    ['Grade',c.grade||Number(c.p||0)+Number(c.d||0)+Number(c.s||0)],
    ['Battles',c.battles||0],
    ['Wins',c.wins||0],
    ['MVPs',c.mvpCount||0],
    ['Passive',`+${c.passive||0}/min`],
    ['Flavor Tag',c.tag||''],
    ['Flavor Text',c.effect||c.flavorText||'']
  ];
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
.vaultsLayout{grid-template-columns:1fr!important}.vaultsHiddenAside{display:none!important}.vaultsPage{display:grid;gap:18px}.vaultsGrid{display:grid;gap:18px}.vaultOwnerPanel{border:1px solid rgba(255,255,255,.12);border-radius:22px;background:radial-gradient(circle at 0 0,color-mix(in srgb,var(--a) 18%,transparent),transparent 32%),linear-gradient(145deg,#11182a,#080d18);padding:16px;display:grid;gap:14px}.vaultOwnerTop{display:flex;align-items:center;gap:12px}.vaultOwnerTop h2{margin:0;font:900 1.15rem Sora,Inter,sans-serif}.vaultOwnerTop p{margin:3px 0 0;color:#aeb5cc}.vaultCardGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:13px}.vaultCardButton{appearance:none;border:0;background:transparent;padding:0;cursor:pointer;text-align:left;border-radius:18px}.vaultCardButton:focus-visible{outline:3px solid #f3c93f;outline-offset:4px}.vaultCardButton .card{width:100%!important}.vaultReadOnlyCard .cbot button{display:none!important}.vaultOwnerChip{margin:6px 10px 0;color:#aeb5cc;font:900 .58rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.06em}.vaultReadOnlyMark{color:#f3c93f;font:900 .58rem 'JetBrains Mono',monospace;text-transform:uppercase}.vaultCardModalBackdrop{position:fixed;inset:0;z-index:140;background:rgba(0,0,0,.74);display:grid;place-items:center;padding:18px}.vaultCardModal{width:min(980px,100%);max-height:92vh;overflow:auto;border:1px solid rgba(255,255,255,.16);border-radius:24px;background:#0b1020;padding:16px;box-shadow:0 24px 80px rgba(0,0,0,.58);display:grid;gap:16px}.vaultModalTop{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.vaultModalTop b{display:block;font:900 1.1rem Sora,Inter,sans-serif}.vaultModalTop small{display:block;color:#aeb5cc;margin-top:3px}.vaultCardDetailGrid{display:grid;grid-template-columns:minmax(250px,360px) 1fr;gap:18px;align-items:start}.vaultLargeCard{display:grid;justify-items:center}.vaultLargeCard .card{width:min(340px,100%)!important}.vaultStatsPanel{border:1px solid rgba(255,255,255,.1);border-radius:18px;background:#080d18;padding:16px;display:grid;gap:14px}.vaultStatsPanel h3{margin:0;font:900 1.25rem Sora,Inter,sans-serif}.vaultStatTiles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.vaultStatTiles div{background:#11182d;border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:12px;text-align:center}.vaultStatTiles small{display:block;color:#aeb5cc;font:900 .62rem 'JetBrains Mono',monospace}.vaultStatTiles b{font:900 1.35rem Sora,Inter,sans-serif}.vaultDetailRows{display:grid;gap:8px}.vaultDetailRows div{display:grid;grid-template-columns:120px 1fr;gap:12px;border-bottom:1px solid rgba(255,255,255,.07);padding-bottom:8px}.vaultDetailRows b{color:#dfe4ff}.vaultDetailRows span{color:#b9bed3}.vaultReadonlyNote{margin:0;color:#f3c93f;font:900 .76rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.04em}@media(max-width:760px){.vaultCardDetailGrid{grid-template-columns:1fr}.vaultDetailRows div{grid-template-columns:1fr;gap:3px}.vaultCardGrid{grid-template-columns:repeat(auto-fill,minmax(128px,1fr))}}
`;
  document.head.appendChild(style);
}
function setupVaults(){
  injectVaultsStyles();
  document.querySelectorAll('[data-vault-card]').forEach(b=>{if(b.dataset.vaultReady)return;b.dataset.vaultReady='1';b.onclick=()=>showVaultCard(b.dataset.vaultCard)});
  document.querySelectorAll('[data-vault-refresh]').forEach(b=>{if(b.dataset.vaultReady)return;b.dataset.vaultReady='1';b.onclick=()=>loadVaults(true)});
}
const vaultsOldShell=shell;
shell=function(content){
  let html=vaultsOldShell(content);
  if(html.includes('data-page="vaults"'))return html;
  const label=state.page==='vaults'?'Vaults':'Vaults';
  const btn=`<button class="${state.page==='vaults'?'on':''}" data-page="vaults">${label}</button>`;
  return html.replace('</nav>',btn+'</nav>');
};
const vaultsOldRender=render;
render=function(){
  if(user&&state.page==='vaults'){$('#app').innerHTML=vaultsPage();bind();return}
  vaultsOldRender();
};
const vaultsOldBind=bind;
bind=function(){
  vaultsOldBind();
  setupVaults();
  if(state.page==='vaults'&&typeof scheduleTitleFit==='function')scheduleTitleFit(document.getElementById('app'));
};
injectVaultsStyles();
