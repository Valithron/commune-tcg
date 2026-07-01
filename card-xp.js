/*
 * Commune TCG Runtime Patch Inventory
 * Purpose: Adds card XP/level progress metadata and ascend controls into card HTML.
 * Original problem solved: Owned cards needed visible progression and ascension readiness without changing the original app.js card factory.
 * Key assumptions: `cardHtml`, `state`, `ch`, `h`, and `render` exist; owned player cards can be identified by state/XP/level fields; enemy cards should not receive XP controls.
 * Known interactions: `card-face-redesign.js` hides the legacy horizontal XP badge and replaces it visually with a vertical rail; `ascension-ceremony.js` and `ascension-failsafe.js` consume `[data-ascend-card]` buttons.
 * Mobile/Desktop differences: CSS shifts badge/control sizes and positions at 720px; battle/vault contexts intentionally hide ascend controls.
 */
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

// Global override: appends XP badge markup and ascension controls into every eligible owned card returned by the current cardHtml chain.
// Downstream note: the redesigned face hides `.cardXpBadge` and renders the vertical XP rail from state, but `[data-ascend-card]` remains the activation contract.
const cardXpOldCardHtml=cardHtml;
cardHtml=function(c,big=false){
  let html=cardXpOldCardHtml(c,big);
  if(!shouldShowCardXp(c))return html;
  return html.replace('</article>',cardXpBadge(c)+cardAscendControl(c)+'</article>');
};
injectCardXpStyles();

// Render trigger: card-xp is loaded dynamically after the initial app boot, so it forces one render to rebuild cards with XP/ascend markup.
setTimeout(()=>{if(user)render()},0);