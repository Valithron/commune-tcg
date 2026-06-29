function installAdminUxFix(){
  if(window.__ctcgAdminUxFixInstalled)return;
  window.__ctcgAdminUxFixInstalled=true;
  state.adminCardSort=state.adminCardSort||{idx:1,dir:'asc'};
  state.adminEnemySort=state.adminEnemySort||{idx:1,dir:'asc'};
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
  function panelTableFor(inputId){
    const input=document.getElementById(inputId);
    return input?.closest('.panel')?.querySelector('table')||null;
  }
  function filterRows(inputId,tableSelector,stateKey){
    const input=document.getElementById(inputId),table=tableSelector==='self'?panelTableFor(inputId):document.querySelector(tableSelector);
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
    filterRows('search','self','query');
    filterRows('enemySearch','self','enemyQuery');
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
  function cellValue(row,idx,type){
    const text=normalize(row.children[idx]?.textContent||'');
    if(type==='number')return Number(text.replace(/[^0-9.-]/g,''))||0;
    if(type==='rarity')return {common:1,uncommon:2,rare:3,legendary:4}[text]||0;
    if(type==='equipped')return text.includes('yes')?1:0;
    return text;
  }
  function sortRows(table,sortState,typeMap){
    if(!table||!sortState)return;
    const tbody=table.querySelector('tbody');
    if(!tbody)return;
    const idx=Number(sortState.idx),dir=sortState.dir==='desc'?-1:1,type=typeMap[idx]||'text';
    const rows=Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a,b)=>{
      const av=cellValue(a,idx,type),bv=cellValue(b,idx,type);
      if(av<bv)return -1*dir;
      if(av>bv)return 1*dir;
      return normalize(a.textContent).localeCompare(normalize(b.textContent));
    });
    rows.forEach(row=>tbody.appendChild(row));
  }
  function decorateSortableTable(table,sortState,stateKey,typeMap,skip=new Set()){ 
    if(!table)return;
    table.querySelectorAll('thead th').forEach((th,idx)=>{
      if(skip.has(idx))return;
      th.dataset.adminSortable='1';
      th.tabIndex=0;
      const base=th.dataset.sortLabel||th.textContent.trim();
      th.dataset.sortLabel=base;
      const active=Number(sortState.idx)===idx;
      th.innerHTML=`<span>${esc(base)}</span><i>${active?(sortState.dir==='asc'?'▲':'▼'):'↕'}</i>`;
      th.onclick=()=>{
        const current=state[stateKey]||sortState;
        const dir=Number(current.idx)===idx&&current.dir==='asc'?'desc':'asc';
        state[stateKey]={idx,dir};
        sortRows(table,state[stateKey],typeMap);
        decorateSortableTable(table,state[stateKey],stateKey,typeMap,skip);
        applyAdminFilters();
      };
      th.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();th.click()}};
    });
    sortRows(table,sortState,typeMap);
  }
  function injectAdminUxStyles(){
    if(document.getElementById('ctcgAdminUxStyles'))return;
    const style=document.createElement('style');
    style.id='ctcgAdminUxStyles';
    style.textContent=`
.table th[data-admin-sortable='1']{cursor:pointer;user-select:none;white-space:nowrap}.table th[data-admin-sortable='1']:hover{color:#e8ecff}.table th[data-admin-sortable='1'] span{vertical-align:middle}.table th[data-admin-sortable='1'] i{display:inline-block;margin-left:6px;color:#aeb8ff;font-style:normal;font-size:.68rem}.table th[data-admin-sortable='1']:focus-visible{outline:2px solid #aeb8ff;outline-offset:-2px;border-radius:4px}
`;
    document.head.appendChild(style);
  }
  function setupSorters(){
    injectAdminUxStyles();
    const cardTable=panelTableFor('search');
    decorateSortableTable(cardTable,state.adminCardSort,'adminCardSort',{5:'number',6:'number',7:'number',8:'number',9:'equipped',4:'rarity'},new Set([0,10]));
    const enemyTable=panelTableFor('enemySearch');
    decorateSortableTable(enemyTable,state.adminEnemySort,'adminEnemySort',{5:'number',6:'number',7:'equipped',4:'rarity'},new Set([0,8]));
  }
  const originalBind=bind;
  bind=function(){
    originalBind();
    captureSearchInput('search','query','self');
    captureClearButton('clearSearch','search','query','self');
    captureSearchInput('enemySearch','enemyQuery','self');
    captureClearButton('clearEnemySearch','enemySearch','enemyQuery','self');
    setupSorters();
    applyAdminFilters();
  };
  const originalRender=render;
  render=function(){
    const active=document.activeElement;
    const preserve=active&&['INPUT','TEXTAREA','SELECT'].includes(active.tagName)?{id:active.id,value:active.value,start:active.selectionStart,end:active.selectionEnd}:null;
    originalRender();
    setupSorters();
    applyAdminFilters();
    if(preserve&&preserve.id){
      const next=document.getElementById(preserve.id);
      if(next&&next.value===preserve.value){
        next.focus();
        try{if(typeof preserve.start==='number')next.setSelectionRange(preserve.start,preserve.end)}catch{}
      }
    }
  };
  injectAdminUxStyles();
  setupSorters();
  applyAdminFilters();
}
installAdminUxFix();
