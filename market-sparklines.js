const marketChartState={loading:false,data:null,loadedAt:0};
const marketTradeState={};
function marketAnchor(id){return(state.marketAnchors&&state.marketAnchors[id])||null}
function marketPoints(id){
  const rows=(marketChartState.data&&marketChartState.data[id])||[];
  const current={price:Number(state.prices[id]||0),createdAt:new Date().toISOString(),source:'current'};
  if(!rows.length)return[current];
  const last=rows[rows.length-1];
  if(Math.abs(Number(last.price||0)-current.price)>.001) return rows.concat([current]);
  return rows;
}
function marketTrend(id){
  const pts=marketPoints(id).filter(p=>Number(p.price)>0);
  if(pts.length<2)return{pct:0,label:'building 24h chart'};
  const first=Number(pts[0].price||0),last=Number(pts[pts.length-1].price||0);
  if(!first)return{pct:0,label:'building 24h chart'};
  const pct=((last-first)/first)*100;
  return{pct,label:`${pct>=0?'+':''}${pct.toFixed(1)}% 24h`};
}
function marketSparkline(id,color){
  const pts=marketPoints(id).filter(p=>Number(p.price)>0);
  if(!pts.length)return'<div class="marketSparkEmpty">24h chart starting</div>';
  const values=pts.map(p=>Number(p.price||0));
  const min=Math.min(...values),max=Math.max(...values),span=Math.max(.01,max-min);
  const w=180,hgt=54,pad=5;
  const coords=values.map((v,i)=>{let x=pts.length===1?w/2:pad+(i/(pts.length-1))*(w-pad*2);let y=hgt-pad-((v-min)/span)*(hgt-pad*2);return`${x.toFixed(1)},${y.toFixed(1)}`}).join(' ');
  const flat=pts.length===1?`M ${pad} ${hgt/2} L ${w-pad} ${hgt/2}`:`M ${coords.replace(/ /g,' L ')}`;
  return`<svg class="marketSpark" viewBox="0 0 ${w} ${hgt}" preserveAspectRatio="none" aria-label="24 hour price chart"><path class="sparkFill" d="${flat} L ${w-pad} ${hgt-pad} L ${pad} ${hgt-pad} Z" style="--a:${color}"></path><polyline points="${coords}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>`;
}
function marketTradeDefaults(id){
  return marketTradeState[id]||{action:'buy',qty:10};
}
function marketTradeControls(c){
  const cur=marketTradeDefaults(c.id),isSell=cur.action==='sell';
  return`<div class="marketTradeControls ${isSell?'sell':'buy'}" data-market-id="${c.id}"><select class="marketAction" data-market-action="${c.id}" aria-label="Trade action"><option value="buy" ${!isSell?'selected':''}>Buy</option><option value="sell" ${isSell?'selected':''}>Sell</option></select><select class="marketQty" data-market-qty="${c.id}" aria-label="Trade amount"><option value="10" ${Number(cur.qty)===10?'selected':''}>10</option><option value="100" ${Number(cur.qty)===100?'selected':''}>100</option><option value="1000" ${Number(cur.qty)===1000?'selected':''}>1000</option></select><button class="marketTradeSubmit ${isSell?'sell':'buy'}" data-market-submit="${c.id}">${isSell?'Sell':'Buy'}</button></div>`;
}
function marketFundamentals(c){
  const a=marketAnchor(c.id);
  if(!a)return'<div class="marketFundamentals"><span>Anchor loading</span></div>';
  return`<div class="marketFundamentals"><span>Anchor $${Number(a.anchor||0).toFixed(2)}</span><span>Prestige ${num(a.prestigeScore||0)}</span><span>${Number(a.multiplier||1).toFixed(2)}x</span></div>`;
}
function marketCardWithChart(c){
  const trend=marketTrend(c.id),trendClass=trend.pct>=0?'up':'down';
  return`<article class="box marketCardChart" style="--a:${c.a}"><div class="row marketCardTop"><span class="coin" style="--a:${c.a}">${c.in}</span><b>${c.name}</b></div><div class="marketPriceChartRow"><div class="marketPriceBlock"><h3>$${Number(state.prices[c.id]||0).toFixed(2)}</h3><p>${fmt(state.tokens[c.id])} tokens</p>${marketFundamentals(c)}</div><div class="marketChartBox">${marketSparkline(c.id,c.a)}<small class="trend ${trendClass}">${h(trend.label)}</small></div></div>${marketTradeControls(c)}</article>`;
}
function marketInfoModal(){
  return`<div class="marketInfoOverlay" id="marketInfoOverlay" aria-hidden="true"><section class="marketInfoPanel" role="dialog" aria-modal="true" aria-labelledby="marketInfoTitle"><button class="marketInfoClose" type="button" data-market-info-close aria-label="Close Market Info">×</button><div class="marketInfoKicker">Commune TCG Economy</div><h2 id="marketInfoTitle">Market Info</h2><p class="marketInfoLead">The market is a living token market for each character. Prices move on their own, but they are also pulled by the strength and activity of that character’s cards.</p><div class="marketInfoGrid"><article><h3>Buying and selling</h3><p>Choose Buy or Sell, pick an amount, then press the action button. Buying spends cash for tokens. Selling converts your tokens back into cash at the current price.</p></article><article><h3>The sparkline</h3><p>The small graph shows recent price movement. The 24h number tells you whether the token is up or down over the latest chart window.</p></article><article><h3>What prestige means</h3><p>Prestige is a rough score for how impressive that character’s card ecosystem is. Stronger cards, higher rarity cards, leveled cards, wins, MVPs, XP activity, and broader ownership can all make a character feel more valuable.</p></article><article><h3>How prestige affects price</h3><p>Prestige does not instantly set the price. Think of it like gravity. A character with stronger prestige gets a stronger price anchor, and the market tends to drift toward that anchor over time.</p></article><article><h3>Why prices still move around</h3><p>The market still wiggles. Short-term movement can push prices above or below the anchor, so the chart can rise or fall even when prestige is strong.</p></article><article><h3>Reading the badges</h3><p><b>Anchor</b> is the price prestige is pulling toward. <b>Prestige</b> is the character’s current strength score. <b>Multiplier</b> shows how much prestige is lifting that token above its base value.</p></article></div></section></div>`;
}
const marketChartOldMarket=market;
market=function(){return shell(`<div class="head marketHead"><div><h1>Token Market</h1><p>Shared prices. Gravity now follows card prestige anchors.</p></div><div class="marketHeadActions"><button class="btn marketInfoBtn" id="marketInfoBtn" type="button">Market Info</button><button class="btn marketCashBtn" type="button">Cash: $${num(state.cash)}</button></div></div>${marketInfoModal()}<div class="market">${C.map(c=>marketCardWithChart(c)).join('')}</div>`)};
async function loadMarketChart(){
  if(marketChartState.loading)return;
  marketChartState.loading=true;
  try{const d=await api('/api/market/chart');marketChartState.data=d.history||{};marketChartState.loadedAt=Date.now();if(state.page==='market')render()}catch(e){console.warn(e)}
  finally{marketChartState.loading=false}
}
function updateMarketTradeBox(box){
  if(!box)return;
  const id=box.dataset.marketId,action=box.querySelector('.marketAction')?.value||'buy',qty=Number(box.querySelector('.marketQty')?.value||10),btn=box.querySelector('[data-market-submit]');
  marketTradeState[id]={action,qty};
  box.classList.toggle('sell',action==='sell');
  box.classList.toggle('buy',action!=='sell');
  if(btn){btn.textContent=action==='sell'?'Sell':'Buy';btn.classList.toggle('sell',action==='sell');btn.classList.toggle('buy',action!=='sell')}
}
function bindMarketTradeControls(){
  document.querySelectorAll('.marketTradeControls').forEach(box=>updateMarketTradeBox(box));
  document.querySelectorAll('[data-market-action],[data-market-qty]').forEach(el=>el.onchange=()=>updateMarketTradeBox(el.closest('.marketTradeControls')));
  document.querySelectorAll('[data-market-submit]').forEach(btn=>btn.onclick=async()=>{
    const box=btn.closest('.marketTradeControls'),id=btn.dataset.marketSubmit;
    if(!box||!id)return;
    updateMarketTradeBox(box);
    const cur=marketTradeDefaults(id),action=cur.action==='sell'?'sell':'buy',qty=[10,100,1000].includes(Number(cur.qty))?Number(cur.qty):10;
    const oldText=btn.textContent;
    try{
      btn.disabled=true;
      btn.textContent=action==='sell'?'Selling...':'Buying...';
      await api(`/api/market/${action}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id,qty})});
      await loadState();
    }catch(e){alert(e.message);btn.disabled=false;btn.textContent=oldText}
  });
}
function bindMarketInfo(){
  const openBtn=document.getElementById('marketInfoBtn'),overlay=document.getElementById('marketInfoOverlay');
  if(!openBtn||!overlay)return;
  const open=()=>{overlay.classList.add('show');overlay.setAttribute('aria-hidden','false')};
  const close=()=>{overlay.classList.remove('show');overlay.setAttribute('aria-hidden','true')};
  openBtn.onclick=open;
  overlay.querySelectorAll('[data-market-info-close]').forEach(btn=>btn.onclick=close);
  overlay.onclick=e=>{if(e.target===overlay)close()};
  document.onkeydown=e=>{if(e.key==='Escape'&&overlay.classList.contains('show'))close()};
}
function injectMarketChartStyles(){
  document.getElementById('ctcgMarketChartStyles')?.remove();
  const style=document.createElement('style');
  style.id='ctcgMarketChartStyles';
  style.textContent=`
.market{align-items:stretch}.marketHead{align-items:flex-start}.marketHeadActions{display:flex;gap:10px;align-items:stretch;justify-content:flex-end;flex-wrap:wrap}.marketHeadActions .btn{min-height:52px}.marketInfoBtn{border-color:rgba(243,201,63,.42);background:rgba(243,201,63,.1);color:#f3c93f}.marketCashBtn{white-space:nowrap}.marketCardChart{display:grid;grid-template-rows:auto auto auto;gap:16px;min-width:0;overflow:hidden}.marketCardTop{align-items:center;min-width:0}.marketCardTop b{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.marketPriceChartRow{display:grid;grid-template-columns:minmax(145px,1fr) minmax(170px,220px);gap:16px;align-items:stretch;min-width:0}.marketPriceBlock{min-width:0}.marketCardChart h3{margin:0 0 8px}.marketCardChart p{margin:0;color:#eff1ff;font:900 .68rem 'JetBrains Mono',monospace}.marketChartBox{min-width:0;width:100%;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:#0b1020;padding:8px;display:grid;grid-template-rows:minmax(54px,auto) auto;gap:4px;align-self:stretch}.marketSpark{width:100%;min-width:0;height:54px;display:block;overflow:visible}.sparkFill{fill:color-mix(in srgb,var(--a),transparent 84%)}.marketSparkEmpty{height:54px;display:grid;place-items:center;color:#8f96b2;font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase}.trend{display:block;text-align:right;color:#aeb2cc;font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase;white-space:nowrap}.trend.up{color:#35d6c5}.trend.down{color:#ff8f70}.marketFundamentals{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;min-width:0}.marketFundamentals span{border:1px solid rgba(255,255,255,.11);border-radius:999px;background:#0b1020;color:#aeb2cc;padding:4px 7px;font:900 .56rem 'JetBrains Mono',monospace;text-transform:uppercase;white-space:nowrap}.marketTradeControls{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.85fr) minmax(104px,1fr);gap:10px;align-items:center;min-width:0;margin-top:0}.marketTradeControls select,.marketTradeSubmit{width:100%;min-width:0;height:48px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:#171b2f;color:#dfe4ff;padding:0 12px;font:900 .86rem 'JetBrains Mono',monospace}.marketTradeControls.buy .marketAction{color:#28e07b;border-color:rgba(40,224,123,.45)}.marketTradeControls.sell .marketAction{color:#ff6b6b;border-color:rgba(255,107,107,.48)}.marketTradeSubmit{cursor:pointer;text-transform:uppercase;letter-spacing:.04em}.marketTradeSubmit.buy{background:rgba(40,224,123,.14);border-color:rgba(40,224,123,.58);color:#6cffab}.marketTradeSubmit.sell{background:rgba(255,107,107,.14);border-color:rgba(255,107,107,.6);color:#ff9a9a}.marketTradeSubmit:disabled{opacity:.6;cursor:wait}.marketInfoOverlay{position:fixed;inset:0;z-index:10040;display:grid;place-items:center;padding:18px;background:rgba(3,6,14,.74);backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:opacity .18s ease}.marketInfoOverlay.show{opacity:1;pointer-events:auto}.marketInfoPanel{position:relative;width:min(840px,100%);max-height:min(88vh,820px);overflow:auto;border:1px solid rgba(243,201,63,.32);border-radius:22px;background:radial-gradient(circle at 90% 0,rgba(243,201,63,.16),transparent 34%),linear-gradient(145deg,#11172a,#070b16);box-shadow:0 28px 90px rgba(0,0,0,.55);padding:clamp(18px,2.4vw,28px)}.marketInfoClose{position:absolute;right:14px;top:14px;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:#171b2f;color:#edf1ff;font-size:1.6rem;line-height:1}.marketInfoKicker{color:#f3c93f;font:900 .68rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.14em}.marketInfoPanel h2{margin:4px 48px 8px 0;font:900 clamp(2rem,5vw,3.4rem) Sora,Inter,sans-serif;letter-spacing:-.06em;color:#edf1ff}.marketInfoLead{max-width:720px;color:#c8ccdf;font:800 .98rem/1.5 Inter,Arial,sans-serif}.marketInfoGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}.marketInfoGrid article{border:1px solid rgba(255,255,255,.09);border-radius:16px;background:#0b1020;padding:14px}.marketInfoGrid h3{margin:0 0 6px;color:#f3c93f;font:900 .82rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.06em}.marketInfoGrid p{margin:0;color:#d8dcf4;font:800 .9rem/1.45 Inter,Arial,sans-serif}.marketInfoGrid b{color:#edf1ff}@media(min-width:1081px){.content .market{grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:20px}}@media(min-width:1081px) and (max-width:1280px){.content .market{grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}.marketPriceChartRow{grid-template-columns:1fr}.marketChartBox{grid-template-rows:minmax(50px,auto) auto}.marketSpark{height:50px}.trend{text-align:left}.marketTradeControls{grid-template-columns:1fr 1fr 1fr}}@media(max-width:720px){.marketHead{display:grid}.marketHeadActions{justify-content:stretch}.marketHeadActions .btn{width:100%}.marketPriceChartRow{grid-template-columns:1fr}.marketChartBox{margin-top:2px}.marketSpark{height:48px}.trend{text-align:left}.marketTradeControls{grid-template-columns:1fr 1fr}.marketTradeSubmit{grid-column:1/-1}.marketInfoGrid{grid-template-columns:1fr}.marketInfoPanel{border-radius:18px}.marketInfoLead{font-size:.9rem}}
`;
  document.head.appendChild(style);
}
const marketChartOldBind=bind;
bind=function(){marketChartOldBind();injectMarketChartStyles();bindMarketTradeControls();bindMarketInfo();if(state.page==='market'&&(!marketChartState.data||Date.now()-marketChartState.loadedAt>60000))loadMarketChart()};
injectMarketChartStyles();
