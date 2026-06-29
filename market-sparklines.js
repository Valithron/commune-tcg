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
const marketChartOldMarket=market;
market=function(){return shell(`<div class="head"><div><h1>Token Market</h1><p>Shared prices. Gravity now follows card prestige anchors.</p></div><button class="btn">Cash: $${num(state.cash)}</button></div><div class="market">${C.map(c=>marketCardWithChart(c)).join('')}</div>`)};
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
function injectMarketChartStyles(){
  document.getElementById('ctcgMarketChartStyles')?.remove();
  const style=document.createElement('style');
  style.id='ctcgMarketChartStyles';
  style.textContent=`
.market{align-items:stretch}.marketCardChart{display:grid;grid-template-rows:auto auto auto;gap:16px;min-width:0;overflow:hidden}.marketCardTop{align-items:center;min-width:0}.marketCardTop b{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.marketPriceChartRow{display:grid;grid-template-columns:minmax(145px,1fr) minmax(170px,220px);gap:16px;align-items:stretch;min-width:0}.marketPriceBlock{min-width:0}.marketCardChart h3{margin:0 0 8px}.marketCardChart p{margin:0;color:#eff1ff;font:900 .68rem 'JetBrains Mono',monospace}.marketChartBox{min-width:0;width:100%;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:#0b1020;padding:8px;display:grid;grid-template-rows:minmax(54px,auto) auto;gap:4px;align-self:stretch}.marketSpark{width:100%;min-width:0;height:54px;display:block;overflow:visible}.sparkFill{fill:color-mix(in srgb,var(--a),transparent 84%)}.marketSparkEmpty{height:54px;display:grid;place-items:center;color:#8f96b2;font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase}.trend{display:block;text-align:right;color:#aeb2cc;font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase;white-space:nowrap}.trend.up{color:#35d6c5}.trend.down{color:#ff8f70}.marketFundamentals{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;min-width:0}.marketFundamentals span{border:1px solid rgba(255,255,255,.11);border-radius:999px;background:#0b1020;color:#aeb2cc;padding:4px 7px;font:900 .56rem 'JetBrains Mono',monospace;text-transform:uppercase;white-space:nowrap}.marketTradeControls{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.85fr) minmax(104px,1fr);gap:10px;align-items:center;min-width:0;margin-top:0}.marketTradeControls select,.marketTradeSubmit{width:100%;min-width:0;height:48px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:#171b2f;color:#dfe4ff;padding:0 12px;font:900 .86rem 'JetBrains Mono',monospace}.marketTradeControls.buy .marketAction{color:#28e07b;border-color:rgba(40,224,123,.45)}.marketTradeControls.sell .marketAction{color:#ff6b6b;border-color:rgba(255,107,107,.48)}.marketTradeSubmit{cursor:pointer;text-transform:uppercase;letter-spacing:.04em}.marketTradeSubmit.buy{background:rgba(40,224,123,.14);border-color:rgba(40,224,123,.58);color:#6cffab}.marketTradeSubmit.sell{background:rgba(255,107,107,.14);border-color:rgba(255,107,107,.6);color:#ff9a9a}.marketTradeSubmit:disabled{opacity:.6;cursor:wait}@media(min-width:1081px){.content .market{grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:20px}}@media(min-width:1081px) and (max-width:1280px){.content .market{grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}.marketPriceChartRow{grid-template-columns:1fr}.marketChartBox{grid-template-rows:minmax(50px,auto) auto}.marketSpark{height:50px}.trend{text-align:left}.marketTradeControls{grid-template-columns:1fr 1fr 1fr}}@media(max-width:720px){.marketPriceChartRow{grid-template-columns:1fr}.marketChartBox{margin-top:2px}.marketSpark{height:48px}.trend{text-align:left}.marketTradeControls{grid-template-columns:1fr 1fr}.marketTradeSubmit{grid-column:1/-1}}
`;
  document.head.appendChild(style);
}
const marketChartOldBind=bind;
bind=function(){marketChartOldBind();injectMarketChartStyles();bindMarketTradeControls();if(state.page==='market'&&(!marketChartState.data||Date.now()-marketChartState.loadedAt>60000))loadMarketChart()};
injectMarketChartStyles();
