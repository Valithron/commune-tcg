function prestigeBar(value,max=660){let pct=Math.max(2,Math.min(100,(Number(value||0)/max)*100));return`<div class="prestigeBar"><i style="width:${pct}%"></i></div>`}
function prestigeCardList(cards){return(cards||[]).length?`<ol class="prestigeTopCards">${cards.map(c=>`<li><b>${esc(c.title)}</b><span>${esc(N[c.owner]||c.owner||'Unknown')} · ${esc(c.rar)} · L${money(c.level)} · ${money(c.power)} power</span></li>`).join('')}</ol>`:'<div class="muted">No cards yet</div>'}
function prestige(){
  const rows=(state.data&&state.data.prestige)||[];
  const totalXp=rows.reduce((s,r)=>s+Number(r.recentXp24h||0),0),activeOwners=rows.reduce((s,r)=>s+Number(r.activeOwners||0),0),anchors=rows.filter(r=>r.anchorPreview);
  return`<div class="head"><h1>Prestige</h1><p>Informational fundamentals for future market anchor influence. These numbers do not affect live prices yet.</p></div><div class="cards"><div class="stat"><span>Top Prestige</span><b>${esc(rows[0]?.name||'None')}</b></div><div class="stat"><span>24h Card XP</span><b>${money(totalXp)}</b></div><div class="stat"><span>Active Owners</span><b>${money(activeOwners)}</b></div><div class="stat"><span>Anchor Preview</span><b>${anchors.length?'Ready':'No Data'}</b></div></div><section class="panel"><div class="panelTop"><h2>Character Prestige Scores</h2><p class="pill">Preview only</p></div><div class="prestigeGrid">${rows.map(r=>`<article class="prestigeCard"><div class="prestigeHead"><div><h3>${esc(r.name)}</h3><small>${esc(r.id)}</small></div><b>${money(r.prestigeScore)}</b></div>${prestigeBar(r.prestigeScore)}<div class="prestigeStats"><div><small>Multiplier</small><b>${Number(r.multiplier||0).toFixed(2)}x</b></div><div><small>Anchor Preview</small><b>$${Number(r.anchorPreview||0).toFixed(2)}</b></div><div><small>Current Price</small><b>$${Number(r.currentPrice||0).toFixed(2)}</b></div><div><small>24h XP</small><b>${money(r.recentXp24h)}</b></div><div><small>7d XP</small><b>${money(r.recentXp7d)}</b></div><div><small>Cards</small><b>${money(r.activeCards)}/${money(r.totalCards)}</b></div><div><small>Owners</small><b>${money(r.owners)}</b></div><div><small>Win Rate</small><b>${money(r.winRate)}%</b></div></div><h4>Top Cards</h4>${prestigeCardList(r.topCards)}</article>`).join('')}</div></section><section class="panel"><div class="panelTop"><h2>Formula Notes</h2></div><div style="padding:18px;display:grid;gap:10px"><p>Prestige currently combines top-card strength, recent XP, owner diversity, active card breadth, wins, and MVPs.</p><p>Anchor Preview shows what the token center of gravity could become later: base price multiplied by the prestige multiplier.</p><p>This is Phase 3 only. The market still uses the old base prices until Phase 4.</p></div></section>`;
}
function injectPrestigeAdminStyles(){
  if(document.getElementById('ctcgAdminPrestigeStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgAdminPrestigeStyles';
  style.textContent=`
.prestigeGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:14px;padding:16px}.prestigeCard{border:1px solid var(--line);border-radius:14px;background:#101426;padding:14px;display:grid;gap:12px}.prestigeHead{display:flex;justify-content:space-between;gap:14px;align-items:start}.prestigeHead h3{margin:0;font:900 1.2rem Sora,Inter,sans-serif}.prestigeHead small,.prestigeStats small,.prestigeTopCards span{color:var(--muted);font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.04em}.prestigeHead b{font:900 1.6rem Sora,Inter,sans-serif;color:#f3c93f}.prestigeBar{height:9px;border-radius:999px;background:#22283d;overflow:hidden}.prestigeBar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#35d6c5,#f3c93f,#b178ff)}.prestigeStats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.prestigeStats div{border:1px solid var(--line);border-radius:10px;background:#0b1020;padding:9px}.prestigeStats b{display:block;margin-top:4px}.prestigeCard h4{margin:2px 0 0;color:#f3c93f;font:900 .75rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.08em}.prestigeTopCards{margin:0;padding-left:22px;display:grid;gap:6px}.prestigeTopCards li b{display:block}.prestigeTopCards li span{display:block;margin-top:2px}.muted{color:var(--muted);font:900 .72rem 'JetBrains Mono',monospace}
`;
  document.head.appendChild(style);
}
const adminPrestigeOldShell=shell;
shell=function(content){
  let html=adminPrestigeOldShell(content);
  if(html.includes('data-tab="prestige"'))return html;
  const btn=`<button class="${state.tab==='prestige'?'on':''}" data-tab="prestige">Prestige</button>`;
  return html.replace('<button class="'+(state.tab==='market'?'on':'')+'" data-tab="market">Market</button>',`<button class="${state.tab==='market'?'on':''}" data-tab="market">Market</button>${btn}`).replace('</nav>',`${btn}</nav>`);
};
const adminPrestigeOldRender=render;
render=function(){
  injectPrestigeAdminStyles();
  if(state.tab==='prestige'){
    document.getElementById('adminApp').innerHTML=shell(prestige());
    bind();
    return;
  }
  adminPrestigeOldRender();
};
injectPrestigeAdminStyles();
if(state&&state.data)render();
