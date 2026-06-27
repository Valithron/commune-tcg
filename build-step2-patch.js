const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(file, 'utf8');

const replacements = [
  [
    "document.querySelectorAll('[data-eq]').forEach(b=>b.onclick=e=>{e.stopPropagation();let c=state.cards.find(x=>x.id==b.dataset.eq);if(c.equipped)c.equipped=false;else{if(state.cards.filter(x=>x.cid==c.cid&&x.equipped).length>=3)return alert(ch(c.cid).name+' already has 3 passive cards equipped.');c.equipped=true}save();render()});",
    "document.querySelectorAll('[data-eq]').forEach(b=>b.onclick=async e=>{e.stopPropagation();let c=state.cards.find(x=>x.id==b.dataset.eq);try{await getJson(c&&c.equipped?'/api/cards/unequip':'/api/cards/equip',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:b.dataset.eq})});await loadCloudState()}catch(err){alert(err.message||'Card update failed')}});"
  ],
  [
    "let mb=document.getElementById('mintbtn');if(mb)mb.onclick=()=>{let d=state.draft;if(state.tokens[d.cid]<500)return alert('Not enough '+ch(d.cid).name+' Tokens.');let c=d.roll||make({cid:d.cid,title:d.title,tag:d.tag,img});c.crop=cropOf(d);state.tokens[d.cid]-=500;state.cards.unshift(c);d.roll=null;img=null;state.page='collection';state.sel=d.cid;save();render()};",
    "let mb=document.getElementById('mintbtn');if(mb)mb.onclick=async()=>{let d=state.draft;try{let art=null,key=null;if(img){let up=await getJson('/api/upload',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({dataUrl:img,cid:d.cid,id:crypto.randomUUID()})});art=up.url;key=up.key}await getJson('/api/cards/mint',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({cid:d.cid,title:d.title,tag:d.tag,img:art,imageKey:key,crop:cropOf(d)})});img=null;d.roll=null;state.page='collection';state.sel=d.cid;await loadCloudState()}catch(err){alert(err.message||'Mint failed')}};"
  ],
  [
    "document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{let id=b.dataset.buy,cost=state.prices[id]*10;if(state.cash<cost)return alert('Not enough Commune Cash.');state.cash-=cost;state.tokens[id]+=10;save();render()});",
    "document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=async()=>{try{await getJson('/api/market/buy',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:b.dataset.buy,qty:10})});await loadCloudState()}catch(err){alert(err.message||'Buy failed')}});"
  ],
  [
    "document.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>{let id=b.dataset.sell;if(state.tokens[id]<10)return alert('Not enough tokens.');state.cash+=state.prices[id]*10;state.tokens[id]-=10;save();render()})}",
    "document.querySelectorAll('[data-sell]').forEach(b=>b.onclick=async()=>{try{await getJson('/api/market/sell',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:b.dataset.sell,qty:10})});await loadCloudState()}catch(err){alert(err.message||'Sell failed')}})}"
  ],
  [
    "function fight(){let me=pick(state.cards),enemy=make({cid:pick(C.filter(c=>c.id!=me.cid)).id,rar:rarity()}),ms=Math.round((score(me)+rnd(1,30))*mod(me.cid,enemy.cid)),es=Math.round((score(enemy)+rnd(1,30))*mod(enemy.cid,me.cid)),win=ms>=es,reward=win?Math.round(me.passive*20+me.p/2+rnd(10,60)):Math.round(me.passive*3);state.tokens[me.cid]+=reward;state.log.unshift({win,txt:`${me.title} ${win?'defeated':'lost to'} ${enemy.title}. Score ${ms} to ${es}. ${win?'+':'Consolation +'}${reward} ${ch(me.cid).name} Tokens.`});save();render()}",
    "async function fight(){try{await getJson('/api/battle/fight',{method:'POST'});await loadCloudState()}catch(err){alert(err.message||'Battle failed')}}"
  ],
  [
    "function tick(){let now=Date.now(),min=(now-last)/60000;if(now-last<5000)return;C.forEach(c=>state.tokens[c.id]=+(state.tokens[c.id]+income(c.id)*min).toFixed(2));last=now;save();render()}function drift(){C.forEach(c=>{let v=c.id=='cooper'?.14:c.id=='ryan'?.11:c.id=='cydney'?.06:.08;state.prices[c.id]=Math.max(.5,+(state.prices[c.id]*(1+(Math.random()-.46)*v)).toFixed(2))});save();render()}setInterval(tick,5000);setInterval(drift,12000);loadAuth();",
    "function tick(){if(currentUser)loadCloudState()}function drift(){if(currentUser)loadCloudState()}setInterval(tick,30000);setInterval(drift,30000);loadAuth();"
  ]
];

for (const [from, to] of replacements) {
  if (!html.includes(from)) {
    console.warn('Step 2 patch target not found:', from.slice(0, 80));
  }
  html = html.replace(from, to);
}

fs.writeFileSync(file, html);
console.log('Step 2 server-action patch applied.');
