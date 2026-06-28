const CARD_XP_RARITY_FLOOR={common:1,uncommon:6,rare:11,legendary:21};
const CARD_XP_STEPS=[0,80,180,320,500,750,1050,1400,1800,2250,2800,3400,4100,4900,5800,6800,7950,9250,10700,12300,14100,16100,18300,20700,23300,26200,29400,32900,36700,40800];
function cardXpProgress(c){
  const rar=String(c&&c.rar||'common').toLowerCase(),floor=CARD_XP_RARITY_FLOOR[rar]||1,xp=Math.max(0,Number(c&&c.xp||0));
  let plus=0;
  for(let i=1;i<CARD_XP_STEPS.length&&floor+i<=30;i++){if(xp>=CARD_XP_STEPS[i])plus=i;else break}
  const level=Math.min(30,Number(c&&c.level||0)||floor+plus),stepIndex=Math.max(0,level-floor),current=CARD_XP_STEPS[stepIndex]||0,next=level>=30?null:CARD_XP_STEPS[stepIndex+1]||null;
  const pct=next?Math.max(0,Math.min(100,((xp-current)/(next-current))*100)):100;
  return{level,xp,current,next,pct};
}
function shouldShowCardXp(c){return c&&c.id&&c.id!=='preview'&&(c.owner!==undefined||c.xp!==undefined||c.level!==undefined||c.battles!==undefined)&&!c.enemyType}
function cardXpBadge(c){
  const p=cardXpProgress(c),label=p.next?`${Math.floor(p.xp)}/${p.next} XP`:`${Math.floor(p.xp)} XP`;
  return`<div class="cardXpBadge"><div class="cardXpTop"><span>LVL ${p.level}</span><b>${label}</b></div><div class="cardXpTrack"><i style="width:${p.pct.toFixed(1)}%"></i></div></div>`;
}
function injectCardXpStyles(){
  if(document.getElementById('ctcgCardXpStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgCardXpStyles';
  style.textContent=`
.cardXpBadge{position:absolute;z-index:5;left:12px;right:78px;top:34px;display:grid;gap:2px;pointer-events:none}.cardXpTop{display:flex;justify-content:space-between;gap:6px;align-items:center;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(8,10,22,.78);backdrop-filter:blur(5px);padding:3px 6px;color:#edf1ff;font:900 .47rem 'JetBrains Mono',monospace;text-transform:uppercase;line-height:1}.cardXpTop span{color:var(--r)}.cardXpTop b{color:#dfe4ff;font-size:.42rem}.cardXpTrack{height:4px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden;box-shadow:0 0 0 1px rgba(0,0,0,.18)}.cardXpTrack i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--r),#35d6c5)}.bigcard .cardXpBadge{top:46px;left:20px;right:20px}.bigcard .cardXpTop{padding:6px 10px;font-size:.72rem}.bigcard .cardXpTop b{font-size:.65rem}.bigcard .cardXpTrack{height:7px}.battleAuto .cardXpBadge,.battle .cardXpBadge{right:12px}.grid .cardXpBadge{right:68px}.vaults .cardXpBadge{right:68px}@media(max-width:720px){.cardXpBadge{left:10px;right:66px;top:32px}.cardXpTop{font-size:.42rem}.cardXpTop b{font-size:.38rem}.grid .cardXpBadge{right:60px}}
`;
  document.head.appendChild(style);
}
const cardXpOldCardHtml=cardHtml;
cardHtml=function(c,big=false){
  let html=cardXpOldCardHtml(c,big);
  if(!shouldShowCardXp(c))return html;
  return html.replace('</article>',cardXpBadge(c)+'</article>');
};
injectCardXpStyles();
setTimeout(()=>{if(user)render()},0);
