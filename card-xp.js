const CARD_XP_STAGE={
  common:{floor:1,cap:5,thresholds:[0,80,180,320,500],next:'uncommon',cost:250},
  uncommon:{floor:6,cap:10,thresholds:[0,300,650,1050,1500],next:'rare',cost:1000},
  rare:{floor:11,cap:20,thresholds:[0,500,1100,1800,2600,3600,4800,6200,7800,9500],next:'legendary',cost:3000},
  legendary:{floor:21,cap:30,thresholds:[0,1000,2200,3600,5200,7000,9000,11200,13600,16200],next:null,cost:0}
};
function cardXpProgress(c){
  const rar=String(c&&c.rar||'common').toLowerCase(),stage=CARD_XP_STAGE[rar]||CARD_XP_STAGE.common,xp=Math.max(0,Number(c&&c.xp||0));
  let plus=0;
  for(let i=1;i<stage.thresholds.length;i++){if(xp>=stage.thresholds[i])plus=i;else break}
  const level=Math.min(stage.cap,stage.floor+plus),current=stage.thresholds[plus]||0,next=level>=stage.cap?null:stage.thresholds[plus+1]||null,need=stage.next?stage.thresholds[stage.thresholds.length-1]:null;
  const pct=next?Math.max(0,Math.min(100,((xp-current)/(next-current))*100)):(stage.next?100:100);
  return{level,xp,current,next,pct,need,stage,rar,ready:!!stage.next&&level>=stage.cap&&xp>=need};
}
function shouldShowCardXp(c){return c&&c.id&&c.id!=='preview'&&(c.owner!==undefined||c.xp!==undefined||c.level!==undefined||c.battles!==undefined)&&!c.enemyType}
function cardXpBadge(c){
  const p=cardXpProgress(c),label=p.next?`${Math.floor(p.xp)}/${p.next} XP`:(p.stage.next?`${Math.floor(p.xp)}/${p.need} XP`:`${Math.floor(p.xp)} XP`);
  return`<div class="cardXpBadge"><div class="cardXpTop"><span>LVL ${p.level}</span><b>${label}</b></div><div class="cardXpTrack"><i style="width:${p.pct.toFixed(1)}%"></i></div></div>`;
}
function cardAscendControl(c){
  const p=cardXpProgress(c);
  if(!p.stage.next)return'';
  const token=ch(c.cid),balance=Number(state.tokens&&state.tokens[c.cid]||0),canPay=balance>=p.stage.cost;
  if(p.ready&&canPay)return`<button class="cardAscendBtn ready" data-ascend-card="${h(c.id)}" title="Ascend to ${p.stage.next} for ${p.stage.cost} ${token.name} tokens">Ascend</button>`;
  if(p.ready&&!canPay)return`<div class="cardAscendHint">Need ${p.stage.cost} ${token.in}</div>`;
  return'';
}
function injectCardXpStyles(){
  if(document.getElementById('ctcgCardXpStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgCardXpStyles';
  style.textContent=`
.cardXpBadge{position:absolute;z-index:5;left:12px;right:78px;top:34px;display:grid;gap:2px;pointer-events:none}.cardXpTop{display:flex;justify-content:space-between;gap:6px;align-items:center;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(8,10,22,.78);backdrop-filter:blur(5px);padding:3px 6px;color:#edf1ff;font:900 .47rem 'JetBrains Mono',monospace;text-transform:uppercase;line-height:1}.cardXpTop span{color:var(--r)}.cardXpTop b{color:#dfe4ff;font-size:.42rem}.cardXpTrack{height:4px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden;box-shadow:0 0 0 1px rgba(0,0,0,.18)}.cardXpTrack i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--r),#35d6c5)}.bigcard .cardXpBadge{top:46px;left:20px;right:20px}.bigcard .cardXpTop{padding:6px 10px;font-size:.72rem}.bigcard .cardXpTop b{font-size:.65rem}.bigcard .cardXpTrack{height:7px}.battleAuto .cardXpBadge,.battle .cardXpBadge{right:12px}.grid .cardXpBadge{right:68px}.vaults .cardXpBadge{right:68px}.cardAscendBtn,.cardAscendHint{position:absolute;z-index:8;right:12px;top:57px;border-radius:999px;border:1px solid rgba(255,255,255,.18);padding:5px 7px;background:rgba(8,10,22,.84);backdrop-filter:blur(5px);color:#f3c93f;font:900 .5rem 'JetBrains Mono',monospace;text-transform:uppercase;box-shadow:0 8px 18px rgba(0,0,0,.25)}.cardAscendBtn{cursor:pointer;background:linear-gradient(135deg,#f3c93f,#35d6c5);color:#07101d;border-color:rgba(243,201,63,.8)}.cardAscendBtn:hover{filter:brightness(1.08);transform:translateY(-1px)}.cardAscendBtn:disabled{opacity:.6;cursor:wait;transform:none}.cardAscendHint{color:#aeb2cc}.bigcard .cardAscendBtn,.bigcard .cardAscendHint{top:86px;right:20px;font-size:.68rem;padding:7px 10px}.battleAuto .cardAscendBtn,.battle .cardAscendBtn,.battleAuto .cardAscendHint,.battle .cardAscendHint,.vaults .cardAscendBtn,.vaults .cardAscendHint{display:none}@media(max-width:720px){.cardXpBadge{left:10px;right:66px;top:32px}.cardXpTop{font-size:.42rem}.cardXpTop b{font-size:.38rem}.grid .cardXpBadge{right:60px}.cardAscendBtn,.cardAscendHint{right:10px;top:53px;font-size:.46rem;padding:4px 6px}}
`;
  document.head.appendChild(style);
}
const cardXpOldCardHtml=cardHtml;
cardHtml=function(c,big=false){
  let html=cardXpOldCardHtml(c,big);
  if(!shouldShowCardXp(c))return html;
  return html.replace('</article>',cardXpBadge(c)+cardAscendControl(c)+'</article>');
};
async function ascendCard(id,btn){
  const card=(state.cards||[]).find(c=>String(c.id)===String(id));
  if(!card)return;
  const p=cardXpProgress(card),token=ch(card.cid);
  if(!p.ready){alert(`This card needs Level ${p.stage.cap} and ${p.need} XP first.`);return}
  if(Number(state.tokens[card.cid]||0)<p.stage.cost){alert(`Ascension costs ${p.stage.cost} ${token.name} tokens.`);return}
  if(!confirm(`Ascend ${card.title} to ${p.stage.next.toUpperCase()} for ${p.stage.cost} ${token.name} tokens?`))return;
  try{
    if(btn){btn.disabled=true;btn.textContent='Ascending...'}
    await api('/api/cards/ascend',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id})});
    await loadState();
  }catch(e){alert(e.message||'Ascension failed');if(btn){btn.disabled=false;btn.textContent='Ascend'}}
}
function bindCardXpControls(){
  document.querySelectorAll('[data-ascend-card]').forEach(btn=>btn.onclick=e=>{e.stopPropagation();ascendCard(btn.dataset.ascendCard,btn)});
}
const cardXpOldBind=bind;
bind=function(){cardXpOldBind();bindCardXpControls()};
injectCardXpStyles();
setTimeout(()=>{if(user)render()},0);
