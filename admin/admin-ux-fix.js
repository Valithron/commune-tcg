function installAdminUxFix(){
  if(window.__ctcgAdminUxFixInstalled)return;
  window.__ctcgAdminUxFixInstalled=true;
  const originalCards=cards;
  const originalEnemies=enemies;
  function withBlankQuery(kind,fn){
    const key=kind==='enemy'?'enemyQuery':'query';
    const saved=state[key]||'';
    state[key]='';
    let html=fn();
    state[key]=saved;
    const id=kind==='enemy'?'enemySearch':'search';
    html=html.replace(new RegExp(`id="${id}"([^>]*)value=""`),`id="${id}"$1value="${esc(saved)}"`);
    return html;
  }
  cards=function(){return withBlankQuery('card',originalCards)};
  enemies=function(){return withBlankQuery('enemy',originalEnemies)};
  function normalize(v){return String(v||'').toLowerCase().trim()}
  function filterRows(inputId,tableSelector,stateKey){
    const input=document.getElementById(inputId),table=document.querySelector(tableSelector);
    if(!input||!table)return;
    const q=normalize(input.value);
    state[stateKey]=input.value;
    let visible=0;
    table.querySelectorAll('tbody tr').forEach(row=>{
      const hay=normalize(row.textContent);
      const show=!q||hay.includes(q);
      row.style.display=show?'':'none';
      if(show)visible++;
    });
    table.dataset.visibleCount=String(visible);
  }
  function applyAdminFilters(){
    filterRows('search','.table','query');
    filterRows('enemySearch','.table','enemyQuery');
  }
  function captureSearchInput(inputId,stateKey,tableSelector){
    const input=document.getElementById(inputId);
    if(!input||input.dataset.adminUxFixed)return;
    input.dataset.adminUxFixed='1';
    input.addEventListener('input',e=>{
      e.stopImmediatePropagation();
      state[stateKey]=input.value;
      filterRows(inputId,tableSelector,stateKey);
    },true);
    input.addEventListener('keydown',e=>{
      e.stopPropagation();
    },true);
  }
  function captureClearButton(buttonId,inputId,stateKey,tableSelector){
    const btn=document.getElementById(buttonId);
    if(!btn||btn.dataset.adminUxFixed)return;
    btn.dataset.adminUxFixed='1';
    btn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      state[stateKey]='';
      const input=document.getElementById(inputId);
      if(input){input.value='';input.focus()}
      filterRows(inputId,tableSelector,stateKey);
    },true);
  }
  const originalBind=bind;
  bind=function(){
    originalBind();
    captureSearchInput('search','query','.table');
    captureClearButton('clearSearch','search','query','.table');
    captureSearchInput('enemySearch','enemyQuery','.table');
    captureClearButton('clearEnemySearch','enemySearch','enemyQuery','.table');
    applyAdminFilters();
  };
  const originalRender=render;
  render=function(){
    const active=document.activeElement;
    const preserve=active&&['INPUT','TEXTAREA','SELECT'].includes(active.tagName)?{id:active.id,value:active.value,start:active.selectionStart,end:active.selectionEnd}:null;
    originalRender();
    applyAdminFilters();
    if(preserve&&preserve.id){
      const next=document.getElementById(preserve.id);
      if(next&&next.value===preserve.value){
        next.focus();
        try{if(typeof preserve.start==='number')next.setSelectionRange(preserve.start,preserve.end)}catch{}
      }
    }
  };
  applyAdminFilters();
}
installAdminUxFix();
