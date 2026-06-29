function ascRarityLabel(r){return (R[String(r||'common')]||R.common)[0]}
function ascRarityColor(r){return (R[String(r||'common')]||R.common)[2]}
function ascLevel(c){return typeof cardXpProgress==='function'?cardXpProgress(c).level:Number(c?.level||1)}
function ascPortrait(c){
  const cc=ch(c?.cid||'cydney');
  if(c?.img)return`<img src="${h(c.img)}" style="${cropStyle(c)}" alt="">`;
  return`<div class="ascPh" style="--a:${cc.a}">${cc.in}</div>`;
}
function ascStatRow(label,oldVal,newVal,suffix=''){
  const oldNum=Number(oldVal||0),newNum=Number(newVal||0),delta=newNum-oldNum;
  return`<div class="ascStatRow ${delta>0?'up':''}"><small>${h(label)}</small><b>${h(String(oldVal??0))}${suffix}</b><span>→</span><b>${h(String(newVal??0))}${suffix}</b>${delta?`<em>+${Number(delta.toFixed(2))}${suffix}</em>`:''}</div>`;
}
function ascCeremonyCard(card,label){
  const cc=ch(card?.cid||'cydney'),rar=String(card?.rar||'common');
  return`<article class="ascCard" style="--a:${cc.a};--r:${ascRarityColor(rar)}"><div class="ascCardLabel">${h(label)}</div><div class="ascArt">${ascPortrait(card)}</div><div class="ascCardBody"><div class="ascRarity">${h(ascRarityLabel(rar))}</div><h2>${h(card?.title||'Card')}</h2><div class="ascCardStats"><span>POW <b>${num(card?.p||0)}</b></span><span>DEF <b>${num(card?.d||0)}</b></span><span>SPD <b>${num(card?.s||0)}</b></span></div><div class="ascPassive">+${Number(card?.passive||0).toFixed(2)}/min · LVL ${ascLevel(card)}</div></div></article>`;
}
function ascShowCeremony(oldCard,newCard,result,returnState){
  document.getElementById('ascCeremony')?.remove();
  const cc=ch(newCard.cid),from=ascRarityLabel(result.from||oldCard.rar),to=ascRarityLabel(result.to||newCard.rar);
  const overlay=document.createElement('div');
  overlay.id='ascCeremony';
  overlay.className='ascCeremony';
  overlay.innerHTML=`<div class="ascStars"></div><section class="ascPanel" style="--a:${cc.a};--r:${ascRarityColor(newCard.rar)}"><div class="ascTop"><div><div class="ascKicker">Ascension Complete</div><h1>${h(from)} → ${h(to)}</h1><p>${h(newCard.title||'Card')} has reached a higher rarity.</p></div><button class="ascClose" type="button" aria-label="Close ascension ceremony">×</button></div><div class="ascStage"><div class="ascOld">${ascCeremonyCard(oldCard,'Before')}</div><div class="ascArrow">➜</div><div class="ascNew">${ascCeremonyCard(newCard,'After')}</div></div><div class="ascChanges"><div class="ascKicker">Stat Changes</div><div class="ascChangeGrid">${ascStatRow('POW',oldCard.p,newCard.p)}${ascStatRow('DEF',oldCard.d,newCard.d)}${ascStatRow('SPD',oldCard.s,newCard.s)}${ascStatRow('Passive',Number(oldCard.passive||0).toFixed(2),Number(newCard.passive||0).toFixed(2),'/m')}${ascStatRow('Level',ascLevel(oldCard),ascLevel(newCard))}<div class="ascStatRow up"><small>Cost</small><b>${num(result.cost||0)}</b><span></span><b>${cc.in}</b><em>Spent</em></div></div></div><div class="ascActions"><button class="gold" id="ascCeremonyDone" type="button">Return</button><button class="btn" data-page="collection" type="button">View Collection</button></div></section>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(()=>overlay.classList.add('show'));
  const close=async()=>{
    overlay.classList.add('leaving');
    setTimeout(()=>overlay.remove(),260);
    state.page=returnState.page||state.page;
    if(returnState.battleView)state.battleView=returnState.battleView;
    if(returnState.sel)state.sel=returnState.sel;
    await loadState();
    state.page=returnState.page||state.page;
    if(returnState.battleView)state.battleView=returnState.battleView;
    if(returnState.sel)state.sel=returnState.sel;
    render();
  };
  overlay.querySelector('.ascClose').onclick=close;
  overlay.querySelector('#ascCeremonyDone').onclick=close;
  overlay.querySelector('[data-page="collection"]').onclick=async()=>{overlay.remove();state.page='collection';state.sel=newCard.cid;await loadState();state.page='collection';state.sel=newCard.cid;render()};
}
async function ascendCard(id,btn){
  const oldCard=(state.cards||[]).find(c=>String(c.id)===String(id));
  if(!oldCard)return;
  const p=cardXpProgress(oldCard),token=ch(oldCard.cid),returnState={page:state.page,battleView:state.battleView,sel:state.sel};
  if(!p.ready){alert(`This card needs Level ${p.stage.cap} and ${p.need} XP first.`);return}
  if(Number(state.tokens[oldCard.cid]||0)<p.stage.cost){alert(`Ascension costs ${p.stage.cost} ${token.name} tokens.`);return}
  if(!confirm(`Ascend ${oldCard.title} to ${p.stage.next.toUpperCase()} for ${p.stage.cost} ${token.name} tokens?`))return;
  try{
    if(btn){btn.disabled=true;btn.textContent='Ascending...'}
    const oldSnapshot=JSON.parse(JSON.stringify(oldCard));
    const result=await api('/api/cards/ascend',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id})});
    const newCard=result.card;
    state.cards=(state.cards||[]).map(c=>String(c.id)===String(newCard.id)?newCard:c);
    state.tokens={...(state.tokens||{}),[newCard.cid]:Math.max(0,Number(state.tokens?.[newCard.cid]||0)-Number(result.cost||0))};
    render();
    ascShowCeremony(oldSnapshot,newCard,result,returnState);
  }catch(e){
    alert(e.message||'Ascension failed');
    if(btn){btn.disabled=false;btn.textContent='Ascend'}
  }
}
function injectAscensionCeremonyStyles(){
  if(document.getElementById('ctcgAscensionCeremonyStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgAscensionCeremonyStyles';
  style.textContent=`
.ascCeremony{position:fixed;inset:0;z-index:10020;display:grid;place-items:center;padding:clamp(10px,2vw,22px);background:radial-gradient(circle at 50% 10%,rgba(243,201,63,.2),transparent 35%),rgba(3,6,14,.94);backdrop-filter:blur(12px);opacity:0;pointer-events:none;transition:opacity .22s ease}.ascCeremony.show{opacity:1;pointer-events:auto}.ascCeremony.leaving{opacity:0}.ascStars{position:absolute;inset:0;background:radial-gradient(circle at 18% 18%,rgba(255,255,255,.16) 0 1px,transparent 2px),radial-gradient(circle at 78% 22%,rgba(255,255,255,.12) 0 1px,transparent 2px),radial-gradient(circle at 60% 80%,rgba(255,255,255,.11) 0 1px,transparent 2px);animation:ascStars 6s linear infinite}@keyframes ascStars{from{transform:translateY(0)}to{transform:translateY(-18px)}}.ascPanel{position:relative;z-index:1;width:min(1120px,100%);max-height:min(94vh,980px);overflow:auto;border:1px solid color-mix(in srgb,var(--r),white 22%);border-radius:26px;background:radial-gradient(circle at 70% 0,color-mix(in srgb,var(--r),transparent 70%),transparent 34%),linear-gradient(145deg,#11172a,#070b16);box-shadow:0 28px 90px rgba(0,0,0,.55);padding:clamp(14px,2.3vw,24px)}.ascTop{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}.ascKicker{color:#f3c93f;font:900 .68rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.14em}.ascTop h1{margin:2px 0;font:900 clamp(2rem,6vw,4.8rem) Sora,Inter,sans-serif;color:var(--r);line-height:.96}.ascTop p{margin:0;color:#c8ccdf;font-weight:800}.ascClose{width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:#171b2f;color:#edf1ff;font-size:1.7rem}.ascStage{display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center}.ascOld{animation:ascShake .8s ease both}.ascNew{animation:ascPop 1.05s .35s cubic-bezier(.2,1.25,.25,1) both}.ascArrow{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#f3c93f,var(--r));color:#07101d;font:900 1.5rem Sora,Inter,sans-serif;box-shadow:0 0 38px color-mix(in srgb,var(--r),transparent 46%)}@keyframes ascShake{0%,100%{transform:translateX(0)}18%{transform:translateX(-7px) rotate(-1deg)}34%{transform:translateX(7px) rotate(1deg)}50%{transform:translateX(-4px)}70%{transform:scale(.94);opacity:.58}}@keyframes ascPop{0%{transform:scale(.35) rotate(-4deg);opacity:0;filter:brightness(2)}55%{transform:scale(1.08) rotate(1deg);opacity:1;filter:brightness(1.5)}100%{transform:scale(1);filter:brightness(1)}}.ascCard{border:1px solid color-mix(in srgb,var(--r),white 12%);border-radius:22px;background:linear-gradient(145deg,#10172b,#080d19);overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.35)}.ascCardLabel{padding:10px 12px;color:#aeb2cc;font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.12em}.ascArt{height:clamp(190px,30vw,360px);overflow:hidden;background:#0b1020}.ascArt img,.ascPh{width:100%;height:100%;object-fit:cover}.ascPh{display:grid;place-items:center;background:radial-gradient(circle at 30% 0,var(--a),#111827);font:900 3rem 'JetBrains Mono',monospace;color:#050812}.ascCardBody{padding:14px}.ascRarity{color:var(--r);font:900 .72rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.12em}.ascCard h2{margin:4px 0 10px;font:900 clamp(1.1rem,3vw,1.9rem) Sora,Inter,sans-serif}.ascCardStats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.ascCardStats span{border:1px solid rgba(255,255,255,.1);border-radius:12px;background:#0b1020;padding:8px;color:#9fa5bf;font:900 .62rem 'JetBrains Mono',monospace}.ascCardStats b{display:block;color:#edf1ff;font-size:1rem}.ascPassive{margin-top:10px;color:#c8ccdf;font-weight:900}.ascChanges{margin-top:16px;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:#0b1020;padding:14px}.ascChangeGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.ascStatRow{display:grid;grid-template-columns:1fr auto auto auto auto;gap:8px;align-items:center;border:1px solid rgba(255,255,255,.09);border-radius:13px;background:#090e1c;padding:10px}.ascStatRow small{color:#9fa5bf;font:900 .58rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.08em}.ascStatRow b{color:#edf1ff}.ascStatRow span{color:#5e6683}.ascStatRow em{font-style:normal;color:#35d6c5;font:900 .62rem 'JetBrains Mono',monospace;text-transform:uppercase}.ascActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.ascActions .gold,.ascActions .btn{min-height:44px}@media(max-width:760px){.ascPanel{max-height:96vh;border-radius:20px}.ascTop h1{font-size:2rem}.ascStage{grid-template-columns:1fr;gap:10px}.ascArrow{justify-self:center;transform:rotate(90deg);width:42px;height:42px}.ascArt{height:190px}.ascChangeGrid{grid-template-columns:1fr}.ascActions{display:grid}.ascActions .gold,.ascActions .btn{width:100%}.ascCardStats span{padding:7px}.ascStatRow{grid-template-columns:1fr auto auto auto;gap:6px}.ascStatRow em{grid-column:1/-1}}
`;
  document.head.appendChild(style);
}
injectAscensionCeremonyStyles();
