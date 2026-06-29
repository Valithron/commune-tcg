function installMarketSmoothRefresh(){
  if(window.__ctcgMarketSmoothRefreshInstalled)return;
  window.__ctcgMarketSmoothRefreshInstalled=true;
  function chartHtml(c){
    const trend=marketTrend(c.id),trendClass=trend.pct>=0?'up':'down';
    return`${marketSparkline(c.id,c.a)}<small class="trend ${trendClass}">${h(trend.label)}</small>`;
  }
  function updateFundamentals(card,c){
    const block=card.querySelector('.marketPriceBlock');
    if(!block)return;
    const price=block.querySelector('h3');
    const tokens=block.querySelector('p');
    const fundamentals=block.querySelector('.marketFundamentals');
    if(price)price.textContent=`$${Number(state.prices[c.id]||0).toFixed(2)}`;
    if(tokens)tokens.textContent=`${fmt(state.tokens[c.id])} tokens`;
    if(fundamentals)fundamentals.outerHTML=marketFundamentals(c);
  }
  function refreshMarketInPlace(){
    const cards=Array.from(document.querySelectorAll('.marketCardChart'));
    if(state.page!=='market'||!cards.length)return false;
    cards.forEach((card,i)=>{
      const c=C[i];
      if(!c)return;
      const chart=card.querySelector('.marketChartBox');
      if(chart)chart.innerHTML=chartHtml(c);
      updateFundamentals(card,c);
    });
    return true;
  }
  const rawLoadMarketChart=loadMarketChart;
  loadMarketChart=async function(){
    if(marketChartState.loading)return;
    marketChartState.loading=true;
    try{
      const d=await api('/api/market/chart');
      marketChartState.data=d.history||{};
      marketChartState.loadedAt=Date.now();
      if(state.page==='market'&&!refreshMarketInPlace())render();
    }catch(e){console.warn(e)}
    finally{marketChartState.loading=false}
  };
  window.refreshMarketInPlace=refreshMarketInPlace;
}
function waitForMarketSmoothRefresh(){
  if(typeof loadMarketChart==='function'&&typeof marketSparkline==='function')installMarketSmoothRefresh();
  else setTimeout(waitForMarketSmoothRefresh,40);
}
waitForMarketSmoothRefresh();
