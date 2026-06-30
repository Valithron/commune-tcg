(function(){
  if(window.__ctcgHomeDataBridge)return;
  window.__ctcgHomeDataBridge=true;
  var originalApi=typeof api==='function'?api:null;
  var cachedHome=null;
  var cachedVaultShape=null;
  function isHomeRequest(url){return url==='/api/vaults'&&typeof state!=='undefined'&&state&&(state.page==='home'||state.page==='settings')}
  function asVaults(data){
    if(cachedVaultShape&&cachedHome===data)return cachedVaultShape;
    cachedHome=data;
    window.__ctcgHomeData=data;
    var cards=[],seen={};
    (data.backgroundCards||[]).concat(data.featuredCards||[]).forEach(function(c){
      if(!c||seen[c.id])return;
      seen[c.id]=true;
      cards.push(c);
    });
    var byOwner={};
    cards.forEach(function(c){
      var owner=c.owner||'commune';
      if(!byOwner[owner])byOwner[owner]={id:owner,displayName:c._ownerName||owner,initials:c._ownerInitials||'',color:c._ownerColor||'#f3c93f',isCurrent:false,cards:[]};
      byOwner[owner].cards.push(c);
    });
    cachedVaultShape={user:data.user,vaults:Object.keys(byOwner).map(function(k){return byOwner[k]})};
    return cachedVaultShape;
  }
  function patchStats(){
    if(!cachedHome||!cachedHome.stats||typeof state==='undefined'||state.page!=='home')return;
    var stats=cachedHome.stats,top=stats.topPrestigeCharacter||{};
    var articles=document.querySelectorAll('.homeStats article');
    if(articles[0]){var b=articles[0].querySelector('b');if(b)b.textContent=Number(stats.totalCardsMinted||0).toLocaleString(undefined,{maximumFractionDigits:0})}
    if(articles[1]){var b2=articles[1].querySelector('b');if(b2)b2.textContent=Number(stats.totalBattlesFought||0).toLocaleString(undefined,{maximumFractionDigits:0})}
    if(articles[2]){
      articles[2].style.setProperty('--a',top.color||'#f3c93f');
      var b3=articles[2].querySelector('b'),span=articles[2].querySelector('span');
      if(b3)b3.textContent=top.name||'Commune';
      if(span)span.textContent=top.score?Number(top.score||0).toLocaleString(undefined,{maximumFractionDigits:0})+' prestige':'market leader';
    }
  }
  window.__ctcgPatchHomeStats=patchStats;
  if(originalApi){
    api=async function(url,opt){
      if(isHomeRequest(url)){
        if(cachedHome)return asVaults(cachedHome);
        var data=await originalApi('/api/home',opt||{});
        cachedHome=data;
        window.__ctcgHomeData=data;
        setTimeout(patchStats,30);
        return asVaults(data);
      }
      return originalApi.apply(this,arguments);
    };
  }
})();
