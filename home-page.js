(function(){
  if(window.__ctcgHomePage)return;
  window.__ctcgHomePage=true;
  var BUILD_VERSION='Alpha Build v0.1.0';
  var homeVaults=null;
  var homeLoading=false;
  var homeErr='';
  function esc(v){return typeof h==='function'?h(v):String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  function fmtHome(n){return Number(n||0).toLocaleString(undefined,{maximumFractionDigits:0})}
  function chHome(id){return typeof ch==='function'?ch(id):((typeof C!=='undefined'&&C.find(function(x){return x.id===id}))||{id:id,name:id||'Card',in:String(id||'??').slice(0,2).toUpperCase(),a:'#f3c93f'})}
  function rarityColor(r){return (typeof R!=='undefined'&&R[r]&&R[r][2])||'#9da2b7'}
  function isMobileHome(){return !!((window.matchMedia&&window.matchMedia('(max-width:920px)').matches)||window.innerWidth<=920)}
  function allVaultCards(){
    var out=[];
    if(Array.isArray(homeVaults))homeVaults.forEach(function(v){(v.cards||[]).forEach(function(c){out.push(Object.assign({},c,{owner:c.owner||v.id,_ownerName:v.displayName,_ownerInitials:v.initials,_ownerColor:v.color}))})});
    if(!out.length&&typeof state!=='undefined'&&Array.isArray(state.cards))out=state.cards.map(function(c){return Object.assign({},c,{owner:(typeof user!=='undefined'&&user&&user.id)||c.owner,_ownerName:(typeof user!=='undefined'&&user&&user.displayName)||'Your Vault'})});
    return out;
  }
  function shuffle(list){var a=list.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
  async function loadHomeVaults(force){
    if(homeLoading)return;
    if(homeVaults&&!force)return;
    homeLoading=true;homeErr='';
    try{var d=await api('/api/vaults');homeVaults=d.vaults||[]}
    catch(e){homeErr=e.message||'Failed to load vault cards.'}
    finally{homeLoading=false;if(typeof user!=='undefined'&&user&&typeof state!=='undefined'&&(state.page==='home'||state.page==='settings'))render()}
  }
  function homeNavHtml(){var pages=['collection','mint','battle','market','tokens','vaults'];return pages.map(function(p){return '<button class="'+(state.page===p?'on':'')+'" data-page="'+p+'">'+(p==='mint'?'Mint Card':p[0].toUpperCase()+p.slice(1))+'</button>'}).join('')}
  function homeShell(content){
    var name=(typeof user!=='undefined'&&user&&user.displayName)||'';
    return '<header class="top homeTop"><button class="brand" data-page="home">Commune TCG<small>'+esc(name)+' Vault</small></button><nav class="tabs">'+homeNavHtml()+'</nav><button class="btn" id="sync">Sync</button><button class="btn homeGear '+(state.page==='settings'?'on':'')+'" data-page="settings" title="Settings" aria-label="Settings">⚙</button><button class="btn" id="logout">Switch Vault</button></header><main class="homeContent">'+content+'</main>';
  }
  function simpleCard(c,i){
    var cc=chHome(c.cid),img=c.img?'<img decoding="async" fetchpriority="low" src="'+esc(c.img)+'" style="'+(typeof cropStyle==='function'?cropStyle(c):'')+'">':'<div class="homeMiniPh">'+esc(cc.in)+'</div>';
    return '<article class="homeMiniCard" style="--r:'+rarityColor(c.rar)+';--a:'+esc(cc.a)+';animation-delay:-'+((i||0)%9*1.7).toFixed(1)+'s">'+img+'</article>';
  }
  function mobileCardPool(cards){
    var data=window.__ctcgHomeData||{};
    var pool=Array.isArray(data.mobileBackgroundCards)?data.mobileBackgroundCards.filter(function(c){return c&&c.img}):[];
    if(!pool.length)pool=cards.filter(function(c){return c.img}).slice(0,10);
    if(!pool.length)pool=cards.slice(0,10);
    return pool.slice(0,10);
  }
  function mobileBackgroundColumns(cards){
    var pool=mobileCardPool(cards);
    if(!pool.length)return '<div class="homeCardRain empty"></div>';
    var html='';
    for(var c=0;c<2;c++){
      var slice=[];
      for(var i=0;i<5;i++)slice.push(pool[(i*2+c)%pool.length]);
      var stack=[];
      for(var round=0;round<4;round++)stack=stack.concat(slice);
      var cardsHtml=stack.map(function(card,i){return simpleCard(card,i)}).join('');
      html+='<div class="homeRainCol '+(c%2?'down':'up')+'" style="--speed:'+(36+c*7)+'s">'+cardsHtml+'</div>';
    }
    return '<div class="homeCardRain homeMobileFixedRain" aria-hidden="true">'+html+'</div>';
  }
  function backgroundColumns(cards){
    if(isMobileHome())return mobileBackgroundColumns(cards);
    var pool=shuffle(cards.filter(function(c){return c.img}));
    if(pool.length<8)pool=shuffle(cards);
    if(!pool.length)return '<div class="homeCardRain empty"></div>';
    var cols=4;
    var html='';
    for(var c=0;c<cols;c++){
      var slice=[];
      for(var i=0;i<10;i++)slice.push(pool[(i*cols+c)%pool.length]);
      var cardsHtml=slice.concat(slice).map(function(card,i){return simpleCard(card,i)}).join('');
      html+='<div class="homeRainCol '+(c%2?'down':'up')+'" style="--speed:'+(36+c*7)+'s">'+cardsHtml+'</div>';
    }
    return '<div class="homeCardRain" aria-hidden="true">'+html+'</div>';
  }
  function topPrestige(){
    var anchors=(typeof state!=='undefined'&&state.marketAnchors)||{};
    var best=null;
    if(typeof C!=='undefined')C.forEach(function(c){var a=anchors[c.id]||{},score=Number(a.prestigeScore||0),mult=Number(a.multiplier||0);var rank=score||mult;if(!best||rank>best.rank)best={id:c.id,name:c.name,rank:rank,score:score,mult:mult,color:c.a}});
    if(best&&best.rank>0)return best;
    if(typeof C!=='undefined')C.forEach(function(c){var price=Number((state.prices||{})[c.id]||0);if(!best||price>best.rank)best={id:c.id,name:c.name,rank:price,score:0,mult:0,color:c.a}});
    return best||{name:'Commune',score:0,mult:0,color:'#f3c93f'};
  }
  function snapshot(cards){
    var totalCards=cards.length;
    var cardBattleAppearances=cards.reduce(function(s,c){return s+Number(c.battles||0)},0);
    var battleEstimate=Math.max((state.log||[]).length,Math.round(cardBattleAppearances/3));
    var top=topPrestige();
    return '<section class="homeStats"><article><small>Total Cards Minted</small><b>'+fmtHome(totalCards)+'</b></article><article><small>Total Battles Fought</small><b>'+fmtHome(battleEstimate)+'</b></article><article style="--a:'+esc(top.color||'#f3c93f')+'"><small>Top Prestige Character</small><b>'+esc(top.name)+'</b><span>'+(top.score?fmtHome(top.score)+' prestige':(top.mult?top.mult.toFixed(2)+'x multiplier':'market leader'))+'</span></article></section>';
  }
  function featureCard(c){
    var cc=chHome(c.cid),owner=c._ownerName||c.owner||'Vault',img=c.img?'<img src="'+esc(c.img)+'" style="'+(typeof cropStyle==='function'?cropStyle(c):'')+'">':'<div class="homeFeaturePh">'+esc(cc.in)+'</div>';
    return '<article class="homeFeatureCard" style="--r:'+rarityColor(c.rar)+';--a:'+esc(cc.a)+'"><div class="homeFeatureArt">'+img+'</div><div><small>'+esc((c.rar||'common').toUpperCase())+' · '+esc(cc.name)+'</small><b>'+esc(c.title||'Untitled')+'</b><span>'+esc(owner)+' Vault</span></div></article>';
  }
  function featured(cards){
    var picks=shuffle(cards).slice(0,8);
    if(!picks.length)return '<section class="homePanel"><div class="homeSectionHead"><h2>Featured From the Vaults</h2><p>Mint cards to populate the Commune showcase.</p></div></section>';
    return '<section class="homePanel"><div class="homeSectionHead"><div><h2>Featured From the Vaults</h2><p>Random cards from everyone’s vaults.</p></div><button class="btn" data-page="vaults">Browse Vaults</button></div><div class="homeFeatureGrid">'+picks.map(featureCard).join('')+'</div></section>';
  }
  function quickActions(){
    var items=[['collection','Collection','Review your owned cards and equipped team.'],['mint','Mint Card','Create the next Commune card.'],['battle','Battle','Fight enemy decks and earn XP.'],['market','Market','Watch tokens and prestige move.'],['vaults','Vaults','Browse everyone’s collection.']];
    return '<section class="homeActions">'+items.map(function(x){return '<button data-page="'+x[0]+'"><b>'+x[1]+'</b><span>'+x[2]+'</span></button>'}).join('')+'</section>';
  }
  function homePage(){
    if(!homeVaults&&!homeLoading)loadHomeVaults(false);
    var cards=allVaultCards();
    return homeShell('<div class="homePage"><section class="homeHero">'+backgroundColumns(cards)+'<div class="homeHeroShade"></div><div class="homeHeroCopy"><span class="homeKicker">Private Alpha · Commune TCG</span><h1>Collect the Commune. Battle the Chaos.</h1><p>Mint character cards, build your vault, battle enemy decks, level up your favorites, and watch the Commune market shift around every card earned.</p><div class="homeHeroBtns"><button class="gold" data-page="collection">Open Collection</button><button class="btn" data-page="battle">Battle</button></div></div></section>'+quickActions()+snapshot(cards)+featured(cards)+'<footer class="homeFooter"><b>Commune TCG</b><span>'+BUILD_VERSION+'</span>'+(homeErr?'<em>'+esc(homeErr)+'</em>':'')+'</footer></div>');
  }
  function settingsPage(){
    return homeShell('<div class="settingsPage"><section class="homePanel settingsPanel"><span class="homeKicker">Settings</span><h1>Settings</h1><p>Account, display, notification, and game preferences will live here later.</p><div class="settingsGrid"><article><b>Account</b><span>Vault identity and session options.</span></article><article><b>Display</b><span>Theme, motion, and card density controls.</span></article><article><b>Gameplay</b><span>Battle, market, and collection preferences.</span></article></div><button class="btn" data-page="home">Back Home</button></section><footer class="homeFooter"><b>Commune TCG</b><span>'+BUILD_VERSION+'</span></footer></div>');
  }
  function installStyles(){
    if(document.getElementById('ctcgHomeStyles'))return;
    var style=document.createElement('style');
    style.id='ctcgHomeStyles';
    style.textContent='\
.homeTop{position:sticky;top:0;z-index:80}.homeTop .homeGear{font-size:1rem;line-height:1;min-width:42px}.homeTop .homeGear.on{background:#f3c93f;color:#07101f}.homeContent{min-height:calc(100vh - 76px);background:#070b16;color:#e7ebff}.homePage{display:grid;gap:22px;padding:22px clamp(14px,3vw,34px) 28px;overflow:hidden}.homeHero{position:relative;min-height:520px;border:1px solid rgba(255,255,255,.12);border-radius:28px;background:radial-gradient(circle at 30% 20%,rgba(243,201,63,.16),transparent 34%),linear-gradient(135deg,#11182d,#070b16 68%);overflow:hidden;display:grid;align-items:center}.homeCardRain{position:absolute;inset:-22% -4%;display:grid;grid-template-columns:repeat(4,1fr);gap:18px;opacity:.42;filter:saturate(1.08)}.homeRainCol{display:grid;gap:16px;animation:homeRainUp var(--speed,40s) linear infinite}.homeRainCol.down{animation-name:homeRainDown}.homeMiniCard{aspect-ratio:5/7;border:1px solid var(--r);border-radius:16px;background:#080d18;overflow:hidden;box-shadow:0 0 24px color-mix(in srgb,var(--r),transparent 50%),0 12px 36px rgba(0,0,0,.42)}.homeMiniCard img{width:100%;height:100%;object-fit:cover}.homeMiniPh{height:100%;display:grid;place-items:center;font:900 1.6rem Sora,Inter,sans-serif;color:var(--a)}@keyframes homeRainUp{from{transform:translateY(0)}to{transform:translateY(-50%)}}@keyframes homeRainDown{from{transform:translateY(-50%)}to{transform:translateY(0)}}.homeCardRain.homeMobileFixedRain .homeRainCol{animation-name:homeMobileFixedUp}.homeCardRain.homeMobileFixedRain .homeRainCol.down{animation-name:homeMobileFixedDown}@keyframes homeMobileFixedUp{from{transform:translateY(0)}to{transform:translateY(-25%)}}@keyframes homeMobileFixedDown{from{transform:translateY(-25%)}to{transform:translateY(0)}}.homeHeroShade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,11,22,.96),rgba(7,11,22,.74) 42%,rgba(7,11,22,.2)),linear-gradient(0deg,rgba(7,11,22,.82),transparent 35%,rgba(7,11,22,.55))}.homeHeroCopy{position:relative;z-index:2;max-width:760px;padding:clamp(24px,5vw,64px)}.homeKicker{display:inline-flex;align-items:center;gap:8px;color:#f3c93f;font:900 .74rem JetBrains Mono,monospace;letter-spacing:.08em;text-transform:uppercase}.homeHero h1,.settingsPanel h1{margin:.18em 0;font:900 clamp(3.1rem,8vw,7.6rem)/.86 Sora,Inter,sans-serif;letter-spacing:-.08em;color:#e7e9ff}.homeHero p,.settingsPanel p{max-width:650px;color:#c4cadc;font-size:clamp(1rem,2vw,1.25rem);line-height:1.5}.homeHeroBtns{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.homeActions{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.homeActions button,.homeStats article,.homePanel{border:1px solid rgba(255,255,255,.12);border-radius:20px;background:linear-gradient(145deg,#11182a,#080d18);color:#e7ebff;box-shadow:0 14px 40px rgba(0,0,0,.22)}.homeActions button{text-align:left;padding:16px;cursor:pointer}.homeActions b{display:block;font:900 1rem Sora,Inter,sans-serif}.homeActions span,.homeStats small,.homeFeatureCard span,.homeSectionHead p,.settingsGrid span{color:#aeb5cc}.homeStats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.homeStats article{padding:18px}.homeStats small{display:block;font:900 .66rem JetBrains Mono,monospace;text-transform:uppercase;letter-spacing:.08em}.homeStats b{display:block;margin-top:8px;font:900 clamp(1.7rem,4vw,3rem) Sora,Inter,sans-serif;color:#fff}.homeStats span{color:#f3c93f;font:900 .78rem JetBrains Mono,monospace}.homePanel{padding:18px}.homeSectionHead{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:14px}.homeSectionHead h2{margin:0;font:900 clamp(1.4rem,3vw,2.2rem) Sora,Inter,sans-serif}.homeSectionHead p{margin:4px 0 0}.homeFeatureGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}.homeFeatureCard{display:grid;grid-template-columns:72px 1fr;gap:12px;align-items:center;border:1px solid color-mix(in srgb,var(--r),transparent 40%);border-radius:18px;background:rgba(255,255,255,.035);padding:10px;box-shadow:0 0 20px color-mix(in srgb,var(--r),transparent 82%)}.homeFeatureArt{aspect-ratio:5/7;border-radius:12px;overflow:hidden;border:1px solid var(--r);background:#080d18}.homeFeatureArt img{width:100%;height:100%;object-fit:cover}.homeFeaturePh{height:100%;display:grid;place-items:center;color:var(--a);font:900 1.1rem Sora,Inter,sans-serif}.homeFeatureCard small{display:block;color:#f3c93f;font:900 .58rem JetBrains Mono,monospace;text-transform:uppercase;letter-spacing:.06em}.homeFeatureCard b{display:block;font:900 1rem Sora,Inter,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.homeFooter{display:flex;align-items:center;justify-content:space-between;gap:12px;color:#aeb5cc;border-top:1px solid rgba(255,255,255,.1);padding:18px 2px;font:900 .72rem JetBrains Mono,monospace;text-transform:uppercase;letter-spacing:.08em}.homeFooter em{font-style:normal;color:#ff8f70}.settingsPage{padding:22px clamp(14px,3vw,34px) 28px;display:grid;gap:18px}.settingsPanel{max-width:980px;margin:0 auto;width:100%;padding:clamp(22px,4vw,42px)}.settingsGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:22px 0}.settingsGrid article{border:1px solid rgba(255,255,255,.1);border-radius:16px;background:#080d18;padding:16px}.settingsGrid b{display:block;margin-bottom:8px}@media(max-width:920px){.homeHero{min-height:560px}.homeCardRain{grid-template-columns:repeat(2,1fr);inset:-18% -8%;opacity:.28}.homeRainCol:nth-child(n+3){display:none}.homeHeroShade{background:linear-gradient(0deg,rgba(7,11,22,.94),rgba(7,11,22,.64))}.homeActions{grid-template-columns:repeat(2,minmax(0,1fr))}.homeStats{grid-template-columns:1fr}.settingsGrid{grid-template-columns:1fr}.homeTop .tabs{overflow-x:auto}}@media(max-width:560px){.homePage,.settingsPage{padding:14px 10px 22px}.homeHero{border-radius:22px;min-height:540px}.homeHeroCopy{padding:24px}.homeHero h1,.settingsPanel h1{font-size:3.1rem}.homeActions{grid-template-columns:1fr}.homeFeatureGrid{grid-template-columns:1fr}.homeFooter{display:grid}.homeTop .homeGear{min-width:38px;padding-inline:10px}}\
';
    document.head.appendChild(style);
  }
  function setupHeader(){
    var brand=document.querySelector('.top .brand');
    if(brand){brand.dataset.page='home';brand.onclick=function(){state.page='home';queueMeta();render()}}
    var top=document.querySelector('.top');
    if(top&&!top.querySelector('.homeGear')){
      var logout=document.getElementById('logout');
      var gear=document.createElement('button');
      gear.className='btn homeGear';gear.type='button';gear.title='Settings';gear.setAttribute('aria-label','Settings');gear.textContent='⚙';
      gear.onclick=function(){state.page='settings';queueMeta();render()};
      if(logout&&logout.parentNode)logout.parentNode.insertBefore(gear,logout);else top.appendChild(gear);
    }
  }
  var oldRender=typeof render==='function'?render:null;
  if(oldRender&&!oldRender.__ctcgHomePage){
    render=function(){
      if(typeof user!=='undefined'&&user&&(state.page==='home'||state.page==='settings')){$('#app').innerHTML=state.page==='settings'?settingsPage():homePage();bind();return}
      return oldRender.apply(this,arguments);
    };
    render.__ctcgHomePage=true;
  }
  var oldBind=typeof bind==='function'?bind:null;
  if(oldBind&&!oldBind.__ctcgHomePage){
    bind=function(){oldBind.apply(this,arguments);setupHeader()};
    bind.__ctcgHomePage=true;
  }
  installStyles();
})();
