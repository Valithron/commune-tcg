const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'dist');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

function replaceBetween(html, startMarker, endMarker, replacement) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  if (start === -1 || end === -1) return html;
  return html.slice(0, start) + replacement + html.slice(end);
}

const injectedCss = `
.strip{display:block;position:relative;overflow:hidden;padding:0;margin-bottom:30px;border:1px solid var(--line);border-radius:8px;background:rgba(23,26,45,.85)}
.strip:before,.strip:after{content:'';position:absolute;top:0;bottom:0;width:72px;z-index:2;pointer-events:none}
.strip:before{left:0;background:linear-gradient(90deg,var(--bg),transparent)}
.strip:after{right:0;background:linear-gradient(270deg,var(--bg),transparent)}
.tickerTrack{display:flex;width:max-content;animation:tokenTicker 42s linear infinite;will-change:transform}
.strip:hover .tickerTrack{animation-play-state:paused}
.tickerGroup{display:flex;gap:48px;flex:0 0 auto;padding:12px 48px 12px 14px}
.tickerGroup .tok{flex:0 0 190px}
@keyframes tokenTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.cropPanel{margin-top:16px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(15,18,36,.65);padding:16px}
.cropGrid{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:14px;align-items:end;margin-top:12px}
.cropGrid label{display:grid;gap:8px;color:#c6c9e2;font:900 .72rem 'JetBrains Mono';letter-spacing:.04em;text-transform:uppercase}
.cropGrid input[type=range]{width:100%;accent-color:var(--gold)}
.cropGrid button{height:38px;border:1px solid var(--line);border-radius:7px;background:#26293c;color:#eef0ff;font:900 .72rem 'JetBrains Mono';padding:0 12px}
.cropHint{margin:10px 0 0;color:#aeb2cc;font-size:.78rem;line-height:1.35}
.art img{transition:object-position .12s ease,transform .12s ease;will-change:transform,object-position}
@media (prefers-reduced-motion:reduce){.tickerTrack{animation:none}.strip{overflow:auto}.strip:before,.strip:after{display:none}.art img{transition:none}}
@media(max-width:1080px){html,body,.frame{width:100%;max-width:100%;overflow-x:hidden}.frame{min-height:100vh}.top{position:sticky;top:0;z-index:50;height:58px;padding:0 14px;background:rgba(17,20,38,.96);backdrop-filter:blur(10px)}.brand{font-size:1.42rem;white-space:nowrap}.top .search{display:none!important}.top .tabs{position:fixed;left:10px;right:10px;bottom:10px;z-index:80;display:grid!important;grid-template-columns:repeat(5,1fr);gap:6px;margin:0;padding:8px;border:1px solid rgba(255,255,255,.14);border-radius:18px;background:rgba(15,18,36,.94);box-shadow:0 18px 50px rgba(0,0,0,.45);backdrop-filter:blur(14px)}.top .tabs button{min-width:0;border:0;border-radius:12px;background:transparent;color:#dfe1fa;padding:10px 4px;font:900 .65rem 'JetBrains Mono';line-height:1;text-align:center}.top .tabs button.on{background:linear-gradient(135deg,#ffd84a,#d7ab16);color:#2f2600}.layout{display:block;min-height:calc(100vh - 58px)}aside{display:none!important}.layout>main{padding:14px 14px 104px;max-width:100%;overflow:hidden}.strip{margin:0 -14px 22px;border-left:0;border-right:0;border-radius:0}.strip:before,.strip:after{width:38px}.tickerGroup{gap:18px;padding:10px 22px 10px 14px}.tickerGroup .tok{flex:0 0 128px;grid-template-columns:28px 1fr;gap:2px 7px}.tok b{grid-column:2;font-size:1rem}.tok small{grid-column:2}.coin{width:28px;height:28px}.head{display:grid;gap:14px;margin-bottom:22px}.head h1{font-size:clamp(2.05rem,13vw,3.15rem);line-height:.94;letter-spacing:-.07em}.head p{font-size:.68rem;line-height:1.45}.head .row{display:grid;grid-template-columns:1fr;gap:8px}.head .row .btn,.head .row .gold{width:100%;padding:12px 10px;text-align:center}.sections{gap:42px}.sectiontop{display:grid;gap:14px;padding-bottom:14px}.title{gap:12px}.big{width:48px;height:48px;border-radius:12px}.section h2{font-size:1.8rem}.section p{font-size:.66rem;line-height:1.4}.slots{width:100%;justify-content:flex-start;overflow-x:auto;padding-bottom:4px}.strong{text-align:left;min-width:112px}.strong b{font-size:1rem}.slot,.empty{width:42px;height:58px;flex:0 0 auto}.rgrp{margin-top:18px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.card{width:100%;min-width:0}.emptymsg{grid-column:1/-1;font-size:.68rem}.mint{display:block;max-width:none}.stack{gap:14px}.panel,.preview{padding:14px;margin-bottom:14px;border-radius:10px}.preview{position:static}.upload{min-height:190px}.upload img{height:190px}.tiles{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.tile{padding:8px 4px}.tile i{width:42px;height:42px}.tile b{font-size:.58rem}.form{grid-template-columns:1fr}.cost{min-width:0;width:100%;grid-template-columns:32px 1fr;align-items:start}.cost>div:last-child{grid-column:2}.row{display:grid;grid-template-columns:1fr;gap:10px}.row .btn,.row .gold{width:100%}.cropGrid{grid-template-columns:1fr;gap:12px}.cropGrid button{width:100%}.bigcard{max-width:330px}.battle,.market,.tokens{grid-template-columns:1fr}.box{padding:16px}.box h3{font-size:1.55rem}.log{margin-bottom:24px}}
@media(max-width:420px){.layout>main{padding-left:10px;padding-right:10px}.strip{margin-left:-10px;margin-right:-10px}.grid{gap:10px}.card{border-radius:8px}.ctop{font-size:.64rem}.fx{font-size:.52rem}.tiles{grid-template-columns:repeat(2,minmax(0,1fr))}.top .tabs{left:6px;right:6px;bottom:6px;border-radius:16px}.top .tabs button{font-size:.58rem;padding:9px 2px}}
`;

const marqueeFunctions = `function tokHtml(c){return '<div class="tok"><span class="coin" style="--a:'+c.a+'">'+c.in+'</span><span>'+c.name+'</span><b>'+fmt(state.tokens[c.id])+'</b><small>+'+income(c.id)+'/m</small></div>'}
function strip(){let items=C.map(tokHtml).join('');return '<div class="strip"><div class="tickerTrack"><div class="tickerGroup">'+items+'</div><div class="tickerGroup" aria-hidden="true">'+items+'</div></div></div>'}
`;

const cardFunctions = `function cropOf(c){let cr=(c&&c.crop)||{};return {x:Number(cr.x==null?50:cr.x),y:Number(cr.y==null?50:cr.y),z:Number(cr.z==null?1:cr.z)}}
function cropImgStyle(c){let cr=cropOf(c);return 'object-position:'+cr.x+'% '+cr.y+'%;transform:scale('+cr.z+');transform-origin:'+cr.x+'% '+cr.y+'%;'}
function cardHtml(c,big=false){let cc=ch(c.cid),rr=R[c.rar]||R.rare,imgTag=c.img?'<img src="'+c.img+'" style="'+cropImgStyle(c)+'">':'<div class="ph"><b>'+cc.in+'</b></div>';return '<article class="card '+(big?'bigcard':'')+'" style="--a:'+cc.a+';--r:'+rr[7]+'"><div class="art">'+imgTag+'</div><div class="line"></div><div class="ctop"><strong>'+((c.title||'Untitled').slice(0,big?32:19))+'</strong><span class="badge">'+rr[0]+'</span></div>'+(c.equipped?'<span class="eq">Equipped</span>':'')+'<div class="stats"><div><small>POW</small><b>'+c.p+'</b></div><div><small>DEF</small><b>'+c.d+'</b></div><div><small>SPD</small><b>'+c.s+'</b></div></div><p class="fx">'+c.effect+'</p><div class="cbot"><span>+'+c.passive+'/min</span><button data-eq="'+c.id+'">'+(c.equipped?'Unequip':'Equip')+'</button></div></article>'}
`;

const mintFunctions = `function cropUi(){if(!img)return '';let cr=cropOf(state.draft);return '<div class="cropPanel"><div class="label">Crop Artwork</div><div class="cropGrid"><label>Horizontal<input id="cropX" type="range" min="0" max="100" value="'+cr.x+'"></label><label>Vertical<input id="cropY" type="range" min="0" max="100" value="'+cr.y+'"></label><label>Zoom<input id="cropZ" type="range" min="100" max="220" value="'+Math.round(cr.z*100)+'"></label><button id="resetCrop" type="button">Reset</button></div><p class="cropHint">Move and zoom the uploaded art until the face/composition sits cleanly inside the card window. This crop is saved with the minted card.</p></div>'}
function mint(){if(!state.draft.crop)state.draft.crop={x:50,y:50,z:1};let d=state.draft,cc=ch(d.cid),prev=d.roll||{cid:d.cid,title:d.title||title(d.cid),rar:d.prev,p:'??',d:'??',s:'??',passive:'?',effect:'Effect unrolled. Roll stats to grade this identity.',img:img,crop:cropOf(d),equipped:false};if(!prev.img)prev.img=img;if(!prev.crop)prev.crop=cropOf(d);return shell('<div class="mint"><section class="stack"><div class="head"><div><h1>Forge New Identity</h1><p>Channel your tokens into a unique character essence.</p></div></div><div class="panel"><div class="label">Upload Artwork</div><label class="upload">'+(img?'<img src="'+img+'">':'<div><div style="font-size:2rem">☁</div><b>Drop image here or click to browse</b><br><small>Recommended: 1024×1024 AI generation or high-res portrait</small></div>')+'<input id="up" type="file" accept="image/png,image/jpeg,image/webp"></label>'+cropUi()+'</div><div class="panel"><div class="label">Select Character</div><div class="tiles">'+C.map(c=>'<button class="tile '+(d.cid==c.id?'on':'')+'" data-draft="'+c.id+'" style="--a:'+c.a+'"><i>'+c.in+'</i><b>'+c.name+'</b></button>').join('')+'</div></div><div class="panel form"><label><span>Card Title</span><input id="ct" value="'+(d.title||'')+'"></label><label><span>Flavor Tag</span><select id="tag">'+tags.map(t=>'<option '+(d.tag==t?'selected':'')+'>'+t+'</option>').join('')+'</select></label></div><div class="row"><div class="cost"><span>○</span><div><small>Total Mint Cost</small><strong>500 '+cc.name+'<br>Tokens</strong></div><div><small>Balance</small><strong>'+fmt(state.tokens[cc.id])+'</strong></div></div><button class="btn" id="roll">↻ Roll Stats</button><button class="gold" id="mintbtn">✦ Mint Card</button></div></section><aside class="preview"><div class="label">Card Preview</div>'+cardHtml(prev,true)+'<div class="rareBtns">'+Object.keys(R).map(r=>'<button class="'+(prev.rar==r?'on':'')+'" data-prev="'+r+'">'+R[r][1]+'</button>').join('')+'</div><div class="grade"><div class="label">Card Grade</div>'+g('Rarity',R[prev.rar][0])+g('Final Grade',prev.grade||'Unrolled')+g('Passive','+'+prev.passive+'/min')+g('Strong Against',cc.strong.map(x=>ch(x).name).join(', '))+g('Weak Against',cc.weak.map(x=>ch(x).name).join(', '))+'</div></aside></div>')}
function g(a,b){return '<div class="gline"><span>'+a+'</span><b>'+b+'</b></div>'}
`;

const bindFunction = `function applyCropPreview(){let cr=cropOf(state.draft),im=document.querySelector('.bigcard .art img');if(im){im.style.objectPosition=cr.x+'% '+cr.y+'%';im.style.transform='scale('+cr.z+')';im.style.transformOrigin=cr.x+'% '+cr.y+'%'}}
function setCrop(part,val){let cr=cropOf(state.draft);if(part==='z')cr.z=Number(val)/100;else cr[part]=Number(val);state.draft.crop=cr;if(state.draft.roll)state.draft.roll.crop=cr;save();applyCropPreview()}
function bind(){document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{state.page=b.dataset.page;save();render()});document.querySelectorAll('[data-char]').forEach(b=>b.onclick=()=>{state.sel=b.dataset.char;state.draft.cid=b.dataset.char;save();render()});document.querySelectorAll('[data-draft]').forEach(b=>b.onclick=()=>{state.draft.cid=b.dataset.draft;state.draft.title=title(b.dataset.draft);state.draft.roll=null;save();render()});document.querySelectorAll('[data-eq]').forEach(b=>b.onclick=e=>{e.stopPropagation();let c=state.cards.find(x=>x.id==b.dataset.eq);if(c.equipped)c.equipped=false;else{if(state.cards.filter(x=>x.cid==c.cid&&x.equipped).length>=3)return alert(ch(c.cid).name+' already has 3 passive cards equipped.');c.equipped=true}save();render()});let s=document.getElementById('search');if(s)s.oninput=()=>{state.q=s.value;save();render()};let up=document.getElementById('up');if(up)up.onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader;r.onload=()=>{img=r.result;state.draft.crop={x:50,y:50,z:1};state.draft.roll=null;render()};r.readAsDataURL(f)};let ct=document.getElementById('ct');if(ct)ct.oninput=()=>{state.draft.title=ct.value;state.draft.roll=null;save()};let tg=document.getElementById('tag');if(tg)tg.onchange=()=>{state.draft.tag=tg.value;state.draft.roll=null;save();render()};let cx=document.getElementById('cropX'),cy=document.getElementById('cropY'),cz=document.getElementById('cropZ'),rs=document.getElementById('resetCrop');if(cx)cx.oninput=()=>setCrop('x',cx.value);if(cy)cy.oninput=()=>setCrop('y',cy.value);if(cz)cz.oninput=()=>setCrop('z',cz.value);if(rs)rs.onclick=()=>{state.draft.crop={x:50,y:50,z:1};if(state.draft.roll)state.draft.roll.crop=state.draft.crop;save();render()};document.querySelectorAll('[data-prev]').forEach(b=>b.onclick=()=>{state.draft.prev=b.dataset.prev;save();render()});let roll=document.getElementById('roll');if(roll)roll.onclick=()=>{state.draft.roll=make({cid:state.draft.cid,title:state.draft.title,tag:state.draft.tag,img});state.draft.roll.crop=cropOf(state.draft);save();render()};let mb=document.getElementById('mintbtn');if(mb)mb.onclick=()=>{let d=state.draft;if(state.tokens[d.cid]<500)return alert('Not enough '+ch(d.cid).name+' Tokens.');let c=d.roll||make({cid:d.cid,title:d.title,tag:d.tag,img});c.crop=cropOf(d);state.tokens[d.cid]-=500;state.cards.unshift(c);d.roll=null;img=null;state.page='collection';state.sel=d.cid;save();render()};let f=document.getElementById('fight');if(f)f.onclick=fight;document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{let id=b.dataset.buy,cost=state.prices[id]*10;if(state.cash<cost)return alert('Not enough Commune Cash.');state.cash-=cost;state.tokens[id]+=10;save();render()});document.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>{let id=b.dataset.sell;if(state.tokens[id]<10)return alert('Not enough tokens.');state.cash+=state.prices[id]*10;state.tokens[id]-=10;save();render()})}
`;

const cloudFunctions = `let cloudTimer=null,lastCloudPush=0;
function saveLocalOnly(){try{localStorage.ctcg=JSON.stringify(state)}catch(e){console.warn('Local save failed',e)}}
async function uploadCardImages(){if(!state||!Array.isArray(state.cards))return;for(const c of state.cards){if(c&&typeof c.img==='string'&&c.img.startsWith('data:')){let res=await fetch('/api/upload',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({dataUrl:c.img,cid:c.cid,id:c.id})});let data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||'Image upload failed');c.imageKey=data.key;c.img=data.url}}}
async function pushCloudState(){if(location.protocol==='file:'||window.__ctcgLoading)return;await uploadCardImages();saveLocalOnly();let res=await fetch('/api/state',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(state)});let data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||'Cloud save failed');lastCloudPush=Date.now()}
function queueCloudSave(){if(location.protocol==='file:'||window.__ctcgLoading)return;if(cloudTimer)return;let wait=Math.max(1200,15000-(Date.now()-lastCloudPush));cloudTimer=setTimeout(()=>{cloudTimer=null;pushCloudState().catch(e=>console.warn(e))},wait)}
function save(){saveLocalOnly();queueCloudSave()}
async function loadCloudState(){if(location.protocol==='file:')return;let hasRemote=false;try{window.__ctcgLoading=true;let res=await fetch('/api/state',{cache:'no-store'});let data=await res.json().catch(()=>({}));if(res.ok&&data.state){state={...state,...data.state};hasRemote=true;saveLocalOnly()}}catch(e){console.warn('Cloud load failed',e)}finally{window.__ctcgLoading=false;render();if(!hasRemote)pushCloudState().catch(e=>console.warn(e))}}
`;

for (const file of ['index.html', '_headers', '_redirects']) {
  const source = path.join(__dirname, file);
  if (!fs.existsSync(source)) continue;

  if (file === 'index.html') {
    let html = fs.readFileSync(source, 'utf8')
      .replace(
        '.frame{min-height:100vh;border:10px solid #aeb6c8;border-radius:34px;overflow:hidden;background:#0f1224}',
        '.frame{min-height:100vh;overflow:hidden;background:#0f1224}'
      )
      .replace('</style>', `${injectedCss}</style>`)
      .replace('function save(){localStorage.ctcg=JSON.stringify(state)}', cloudFunctions)
      .replace('setInterval(tick,5000);setInterval(drift,12000);render();', 'setInterval(tick,5000);setInterval(drift,12000);render();loadCloudState();');

    html = replaceBetween(html, 'function strip(){return', 'function cardHtml', marqueeFunctions);
    html = replaceBetween(html, 'function cardHtml', 'function collection', cardFunctions);
    html = replaceBetween(html, 'function mint', 'function battle', mintFunctions);
    html = replaceBetween(html, 'function bind', 'function mod', bindFunction);

    fs.writeFileSync(path.join(outDir, file), html);
  } else {
    fs.copyFileSync(source, path.join(outDir, file));
  }
}

console.log('Commune TCG static build complete. Files copied to dist/.');
