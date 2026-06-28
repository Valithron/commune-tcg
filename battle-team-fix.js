function battleTeamCardSearchText(c){return `${c.title||''} ${c.tag||''} ${c.effect||''} ${ch(c.cid).name} ${c.rar||''}`.toLowerCase()}
function battlePickCard(c,selected=false){
  const cc=ch(c.cid),rr=R[c.rar]||R.common;
  const img=c.img?`<img src="${h(c.img)}" style="${cropStyle(c)}" alt="">`:`<div class="battlePickPh" style="--a:${cc.a}">${cc.in}</div>`;
  return `<div class="battlePickCard" style="--a:${cc.a};--r:${rr[2]}"><div class="battlePickArt">${img}</div><div class="battlePickInfo"><div class="battlePickTitle">${h((c.title||'Untitled').slice(0,30))}</div><div class="battlePickMeta">${h(cc.name)} · ${h(rr[0])} · Grade ${h(battleFlowCardScore(c))}</div><div class="battlePickStats"><span>POW <b>${h(c.p)}</b></span><span>DEF <b>${h(c.d)}</b></span><span>SPD <b>${h(c.s)}</b></span></div></div><span class="battlePickCheck">${selected?'Selected':'Choose'}</span></div>`;
}
function battleFlowTeam(){
  const selectedIds=battleFlowSelectedIds();
  const selected=selectedIds.map(id=>(state.cards||[]).find(c=>String(c.id)===String(id))).filter(Boolean).slice(0,3);
  const selectedSet=new Set(selected.map(c=>c.id));
  const cards=battleFlowSortedCards();
  const canContinue=(state.cards||[]).length>0;
  return shell(`<div class="battleFlow battleSetup battleTeamView">${battleFlowSteps('team')}<div class="head"><div><h1>Choose Your Squad</h1><p>Pick up to three cards, or auto-pick your strongest team.</p></div><div class="row"><button class="btn" data-battle-flow="home">Back</button><button class="gold" data-battle-flow="enemy" ${canContinue?'':'disabled'}>Continue</button></div></div><section class="box battleFlowSelected"><div class="battleFlowTop"><div><h3>Selected Squad</h3><p>${selected.length}/3 chosen · ${state.aiBattleSquadMode==='manual'?'Manual team':'Auto best team'}</p></div><div class="row"><button class="btn" data-battle-auto-squad type="button">Auto Pick Best</button><button class="btn" data-battle-clear-squad type="button">Manual Clear</button></div></div><div class="battleFlowSlots">${[0,1,2].map(i=>battleFlowSlot(selected[i],i)).join('')}</div></section><section class="box battleCardPoolBox"><div class="battleFlowTop"><div><h3>Card Pool</h3><p><span id="battleVisibleCount">${cards.length}</span> visible · tap a card to add or remove it</p></div></div>${battleFlowTeamFilters()}<div class="battleFlowPickGrid">${cards.length?cards.map(c=>`<button class="battleFlowPick ${selectedSet.has(c.id)?'on':''}" data-battle-pick="${h(c.id)}" data-card-cid="${h(c.cid)}" data-card-rar="${h(c.rar||'common')}" data-card-search="${h(battleTeamCardSearchText(c))}">${battlePickCard(c,selectedSet.has(c.id))}</button>`).join(''):'<div class="battleFlowEmptyPanel">No cards available. Mint a card first.</div>'}</div><div class="battleFlowEmptyPanel" id="battleNoFilterMatches" style="display:none">No cards match these filters.</div></section></div>`);
}
function battleApplyTeamFilters(){
  const search=document.getElementById('battleTeamSearch'),cid=document.getElementById('battleTeamCharacter'),rar=document.getElementById('battleTeamRarity');
  const q=String(search?.value||'').toLowerCase().trim(),cval=cid?.value||'all',rval=rar?.value||'all';
  state.battleTeamQ=search?.value||'';state.battleTeamCid=cval;state.battleTeamRar=rval;
  let visible=0;
  document.querySelectorAll('.battleFlowPick').forEach(btn=>{
    const ok=(!q||String(btn.dataset.cardSearch||'').includes(q))&&(cval==='all'||btn.dataset.cardCid===cval)&&(rval==='all'||btn.dataset.cardRar===rval);
    btn.style.display=ok?'grid':'none';
    if(ok)visible++;
  });
  const count=document.getElementById('battleVisibleCount');if(count)count.textContent=String(visible);
  const empty=document.getElementById('battleNoFilterMatches');if(empty)empty.style.display=visible?'none':'block';
}
function bindBattleFlow(){
  document.getElementById('battleHistoryPanel')?.remove();
  document.querySelectorAll('[data-battle-flow]').forEach(b=>{if(b.dataset.battleFlowReady)return;b.dataset.battleFlowReady='1';b.onclick=()=>setBattleFlowView(b.dataset.battleFlow)});
  document.querySelectorAll('[data-battle-history-filter]').forEach(b=>{if(b.dataset.battleHistoryReady)return;b.dataset.battleHistoryReady='1';b.onclick=()=>{state.battleHistoryFilter=b.dataset.battleHistoryFilter;render()}});
  document.querySelectorAll('[data-battle-pick]').forEach(b=>{if(b.dataset.battlePickReady)return;b.dataset.battlePickReady='1';b.onclick=()=>{let id=b.dataset.battlePick,ids=battleFlowSquadIds();ids=ids.includes(id)?ids.filter(x=>x!==id):(ids.length<3?[...ids,id]:ids);state.aiBattleSquad=ids;state.aiBattleSquadMode='manual';render()}});
  document.querySelectorAll('[data-battle-remove]').forEach(b=>{if(b.dataset.battleRemoveReady)return;b.dataset.battleRemoveReady='1';b.onclick=e=>{e.stopPropagation();state.aiBattleSquad=battleFlowSquadIds().filter(id=>id!==b.dataset.battleRemove);state.aiBattleSquadMode='manual';render()}});
  document.querySelector('[data-battle-auto-squad]')?.addEventListener('click',()=>{state.aiBattleSquad=[];state.aiBattleSquadMode='auto';render()});
  document.querySelector('[data-battle-clear-squad]')?.addEventListener('click',()=>{state.aiBattleSquad=[];state.aiBattleSquadMode='manual';render()});
  const search=document.getElementById('battleTeamSearch');if(search&&!search.dataset.ready){search.dataset.ready='1';search.oninput=()=>battleApplyTeamFilters()}
  const cid=document.getElementById('battleTeamCharacter');if(cid&&!cid.dataset.ready){cid.dataset.ready='1';cid.onchange=()=>battleApplyTeamFilters()}
  const rar=document.getElementById('battleTeamRarity');if(rar&&!rar.dataset.ready){rar.dataset.ready='1';rar.onchange=()=>battleApplyTeamFilters()}
  document.querySelector('[data-battle-clear-filters]')?.addEventListener('click',()=>{state.battleTeamQ='';state.battleTeamCid='all';state.battleTeamRar='all';const s=document.getElementById('battleTeamSearch'),c=document.getElementById('battleTeamCharacter'),r=document.getElementById('battleTeamRarity');if(s)s.value='';if(c)c.value='all';if(r)r.value='all';battleApplyTeamFilters()});
  battleApplyTeamFilters();
  document.querySelectorAll('[data-battle-enemy]').forEach(b=>{if(b.dataset.battleEnemyReady)return;b.dataset.battleEnemyReady='1';b.onclick=()=>{state.aiEnemyType=b.dataset.battleEnemy;render()}});
  document.querySelector('[data-begin-battle-flow]')?.addEventListener('click',beginBattleFlow);
}
function injectBattleTeamFixStyles(){
  if(document.getElementById('ctcgBattleTeamFixStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgBattleTeamFixStyles';
  style.textContent=`
.battleFlowPickGrid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))!important;align-items:stretch}.battleFlowPick{display:grid!important;padding:0!important;min-height:0!important;overflow:hidden}.battleFlowPick[style*="display: none"]{display:none!important}.battlePickCard{height:100%;display:grid;grid-template-columns:84px minmax(0,1fr);gap:10px;align-items:center;padding:10px;position:relative;background:#0b1020}.battlePickArt{width:84px;height:112px;border-radius:10px;overflow:hidden;background:#070b15;border:1px solid rgba(255,255,255,.12);display:grid;place-items:center}.battlePickArt img{width:100%;height:100%;object-fit:cover}.battlePickPh{width:100%;height:100%;display:grid;place-items:center;background:radial-gradient(circle at 30% 0,var(--a),#111827);font:900 1.2rem 'JetBrains Mono',monospace;color:#050812}.battlePickInfo{min-width:0;display:grid;gap:7px}.battlePickTitle{font:900 .9rem Sora,Inter,sans-serif;color:#edf1ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.battlePickMeta{font:900 .58rem 'JetBrains Mono',monospace;color:#aeb2cc;text-transform:uppercase;letter-spacing:.05em}.battlePickStats{display:flex;gap:5px;flex-wrap:wrap}.battlePickStats span{border:1px solid rgba(255,255,255,.1);border-radius:999px;background:#151b2e;color:#aeb2cc;padding:4px 6px;font:900 .56rem 'JetBrains Mono',monospace}.battlePickStats b{color:#edf1ff}.battlePickCheck{position:absolute;right:9px;top:9px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(8,10,22,.9);padding:5px 7px;color:#dfe4ff;font:900 .52rem 'JetBrains Mono',monospace;text-transform:uppercase}.battleFlowPick.on .battlePickCheck{background:#f3c93f;color:#080b15;border-color:#f3c93f}.battleFlowPick.on .battlePickCard{box-shadow:inset 0 0 0 2px #f3c93f}.battleCardPoolBox{overflow:visible!important}@media(max-width:720px){.battleFlowPickGrid{grid-template-columns:1fr!important}.battlePickCard{grid-template-columns:74px minmax(0,1fr)}.battlePickArt{width:74px;height:98px}}
`;
  document.head.appendChild(style);
}
injectBattleTeamFixStyles();
if(user&&state.page==='battle'){render()}
