function installAscensionFailsafe(){
  if(window.__ctcgAscFailsafe)return;
  window.__ctcgAscFailsafe=true;
  let activeId=null;
  let busy=false;
  let suspendRefresh=false;
  function ascFailsafeTime(){return typeof performance!=='undefined'?performance.now().toFixed(1):Date.now()}
  function cardById(id){return(state.cards||[]).find(c=>String(c.id)===String(id))}
  function visible(el){
    if(!el||el.disabled)return false;
    const r=el.getBoundingClientRect();
    return r.width>0&&r.height>0&&r.bottom>0&&r.top<window.innerHeight;
  }
  function readyButtons(){return Array.from(document.querySelectorAll('[data-ascend-card]')).filter(visible)}
  function firstReady(){return readyButtons()[0]||null}
  function progress(card){return typeof cardXpProgress==='function'?cardXpProgress(card):null}
  function eligibleCard(id){
    const card=cardById(id),p=card&&progress(card);
    if(!card||!p||!p.ready)return null;
    if(Number(state.tokens?.[card.cid]||0)<Number(p.stage.cost||0))return null;
    return{card,p};
  }
  function showBar(){
    if(suspendRefresh)return;
    const btn=firstReady();
    let bar=document.getElementById('ascFailsafeBar');
    if(!btn){if(bar)bar.remove();document.body.classList.remove('ascFailsafeActive');return}
    const id=btn.dataset.ascendCard,info=eligibleCard(id),card=info?.card||cardById(id),cc=ch(card?.cid||'sterling');
    activeId=id;
    if(!bar){
      bar=document.createElement('div');
      bar.id='ascFailsafeBar';
      bar.innerHTML=`<button id="ascFailsafeButton" type="button"><span class="coin" id="ascFailsafeCoin"></span><b id="ascFailsafeTitle">Ascend Ready</b><small id="ascFailsafeHint">Tap here if the card button will not respond</small></button>`;
      document.body.appendChild(bar);
      const action=e=>{e.preventDefault();e.stopPropagation();openConfirm(activeId)};
      const b=bar.querySelector('#ascFailsafeButton');
      b.onclick=action;
      b.ontouchend=action;
      b.onpointerup=action;
    }
    bar.style.setProperty('--a',cc.a);
    bar.querySelector('#ascFailsafeCoin').textContent=cc.in;
    bar.querySelector('#ascFailsafeCoin').style.setProperty('--a',cc.a);
    bar.querySelector('#ascFailsafeTitle').textContent=card?`Ascend ${card.title}`:'Ascend Ready';
    document.body.classList.add('ascFailsafeActive');
  }
  function openConfirm(id){
    if(busy)return;
    const info=eligibleCard(id);
    if(!info){alert('This card is not ready to ascend, or you need more tokens. Tap Sync and try again.');return}
    const {card,p}=info,cc=ch(card.cid);
    document.getElementById('ascFailsafeConfirm')?.remove();
    const modal=document.createElement('div');
    modal.id='ascFailsafeConfirm';
    modal.innerHTML=`<div class="ascFailsafeSheet" style="--a:${cc.a}"><h2>Ascend ${h(card.title)}?</h2><p>This will spend <b>${num(p.stage.cost)} ${cc.name} tokens</b> and raise the card to <b>${h(String(p.stage.next).toUpperCase())}</b>.</p><div><button class="gold" id="ascFailsafeConfirmGo" type="button">Confirm Ascension</button><button class="btn" id="ascFailsafeCancel" type="button">Cancel</button></div></div>`;
    document.body.appendChild(modal);
    const close=()=>modal.remove();
    modal.querySelector('#ascFailsafeCancel').onclick=close;
    modal.onclick=e=>{if(e.target===modal)close()};
    const go=e=>{e.preventDefault();e.stopPropagation();doAscend(id,modal)};
    const goBtn=modal.querySelector('#ascFailsafeConfirmGo');
    goBtn.onclick=go;goBtn.ontouchend=go;goBtn.onpointerup=go;
  }
  async function doAscend(id,modal){
    if(busy)return;
    const info=eligibleCard(id);
    if(!info){alert('This card is not ready to ascend anymore. Tap Sync and try again.');return}
    const {card}=info;
    const oldSnapshot=JSON.parse(JSON.stringify(card));
    const returnState={page:state.page,battleView:state.battleView,sel:state.sel};
    try{
      busy=true;
      suspendRefresh=true;
      const go=modal?.querySelector('#ascFailsafeConfirmGo');
      if(go){go.disabled=true;go.textContent='Ascending...'}
      const result=await api('/api/cards/ascend',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id})});
      console.time('ascension-ceremony');
      console.log('[ascension][failsafe] server response received',ascFailsafeTime());
      const newCard=result.card;
      modal?.remove();
      console.log('[ascension][failsafe] before ascShowCeremony',ascFailsafeTime());
      if(typeof ascShowCeremony==='function'){
        ascShowCeremony(oldSnapshot,newCard,result,returnState);
        console.log('[ascension][failsafe] ascShowCeremony returned',ascFailsafeTime(),!!document.getElementById('ascCeremony'));
      }else{
        alert(`${newCard.title} ascended to ${String(result.to||newCard.rar).toUpperCase()}.`);
        await loadState();
      }
      setTimeout(()=>{
        state.cards=(state.cards||[]).map(c=>String(c.id)===String(newCard.id)?newCard:c);
        state.tokens={...(state.tokens||{}),[newCard.cid]:Math.max(0,Number(state.tokens?.[newCard.cid]||0)-Number(result.cost||0))};
        console.log('[ascension][failsafe] light state patch after ceremony start',ascFailsafeTime());
      },900);
    }catch(e){alert(e.message||'Ascension failed')}
    finally{busy=false;setTimeout(()=>{suspendRefresh=false;refresh()},1500)}
  }
  function refresh(){showBar()}
  const style=document.createElement('style');
  style.id='ctcgAscFailsafeStyles';
  style.textContent=`
#ascFailsafeBar{position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:10010;display:grid;pointer-events:none}#ascFailsafeButton{pointer-events:auto;display:flex;align-items:center;gap:10px;width:100%;border:1px solid rgba(243,201,63,.7);border-radius:18px;background:linear-gradient(135deg,#f3c93f,#35d6c5);color:#06101d;padding:12px 14px;box-shadow:0 16px 42px rgba(0,0,0,.45),0 0 34px rgba(243,201,63,.38);font-family:Sora,Inter,sans-serif;animation:ascFailsafePulse 1.2s ease-in-out infinite}#ascFailsafeButton .coin{width:36px;height:36px;flex:0 0 auto}#ascFailsafeButton b{display:block;text-align:left;font-size:.88rem;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#ascFailsafeButton small{display:block;text-align:left;font:900 .52rem 'JetBrains Mono',monospace;text-transform:uppercase;opacity:.75}.ascFailsafeActive{padding-bottom:92px!important}@keyframes ascFailsafePulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.14)}}#ascFailsafeConfirm{position:fixed;inset:0;z-index:10030;background:rgba(3,6,14,.72);display:grid;place-items:end center;padding:16px;padding-bottom:calc(16px + env(safe-area-inset-bottom));backdrop-filter:blur(7px)}.ascFailsafeSheet{width:min(520px,100%);border:1px solid rgba(243,201,63,.35);border-radius:22px;background:#0b1020;color:#edf1ff;padding:18px;box-shadow:0 22px 70px rgba(0,0,0,.55)}.ascFailsafeSheet h2{margin:0 0 8px;font:900 1.35rem Sora,Inter,sans-serif;color:#f3c93f}.ascFailsafeSheet p{margin:0 0 14px;color:#c8ccdf;font-weight:800}.ascFailsafeSheet>div{display:grid;gap:10px}.ascFailsafeSheet button{width:100%;min-height:46px}.cardAscendBtn.ready,.battleResultAscend{min-height:34px!important;min-width:90px!important}
@media(min-width:821px){#ascFailsafeBar{left:auto;width:430px}.ascFailsafeActive{padding-bottom:0!important}}
`;
  document.getElementById('ctcgAscFailsafeStyles')?.remove();
  document.head.appendChild(style);
  refresh();
  setInterval(refresh,700);
  new MutationObserver(()=>setTimeout(refresh,40)).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class','disabled']});
}
installAscensionFailsafe();