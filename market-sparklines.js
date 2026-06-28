const marketChartState={loading:false,data:null,loadedAt:0};
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
function marketCardWithChart(c){
  const trend=marketTrend(c.id),trendClass=trend.pct>=0?'up':'down';
  return`<article class="box marketCardChart" style="--a:${c.a}"><div class="row marketCardTop"><span class="coin" style="--a:${c.a}">${c.in}</span><b>${c.name}</b></div><div class="marketPriceChartRow"><div><h3>$${Number(state.prices[c.id]||0).toFixed(2)}</h3><p>${fmt(state.tokens[c.id])} tokens</p></div><div class="marketChartBox">${marketSparkline(c.id,c.a)}<small class="trend ${trendClass}">${h(trend.label)}</small></div></div><div class="row"><button class="btn" data-buy="${c.id}">Buy 10</button><button class="btn" data-sell="${c.id}">Sell 10</button></div></article>`;
}
const marketChartOldMarket=market;
market=function(){return shell(`<div class="head"><div><h1>Token Market</h1><p>Shared prices. Sparklines show recorded movement over the last 24 hours.</p></div><button class="btn">Cash: $${num(state.cash)}</button></div><div class="market">${C.map(c=>marketCardWithChart(c)).join('')}</div>`)};
async function loadMarketChart(){
  if(marketChartState.loading)return;
  marketChartState.loading=true;
  try{const d=await api('/api/market/chart');marketChartState.data=d.history||{};marketChartState.loadedAt=Date.now();if(state.page==='market')render()}catch(e){console.warn(e)}
  finally{marketChartState.loading=false}
}
function injectMarketChartStyles(){
  if(document.getElementById('ctcgMarketChartStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgMarketChartStyles';
  style.textContent=`
.marketCardChart{display:grid;gap:14px}.marketCardTop{align-items:center}.marketPriceChartRow{display:grid;grid-template-columns:minmax(0,1fr)minmax(150px,220px);gap:14px;align-items:center}.marketCardChart h3{margin:0 0 8px}.marketChartBox{border:1px solid rgba(255,255,255,.1);border-radius:12px;background:#0b1020;padding:8px;display:grid;gap:4px}.marketSpark{width:100%;height:54px;display:block;overflow:visible}.sparkFill{fill:color-mix(in srgb,var(--a),transparent 84%)}.marketSparkEmpty{height:54px;display:grid;place-items:center;color:#8f96b2;font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase}.trend{display:block;text-align:right;color:#aeb2cc;font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase}.trend.up{color:#35d6c5}.trend.down{color:#ff8f70}@media(max-width:720px){.marketPriceChartRow{grid-template-columns:1fr}.marketChartBox{margin-top:2px}.marketSpark{height:48px}.trend{text-align:left}}
`;
  document.head.appendChild(style);
}
const marketChartOldBind=bind;
bind=function(){marketChartOldBind();injectMarketChartStyles();if(state.page==='market'&&(!marketChartState.data||Date.now()-marketChartState.loadedAt>60000))loadMarketChart()};
injectMarketChartStyles();
