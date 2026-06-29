function waitForUxRefreshGuard(){
  try{
    if(typeof loadState!=='function'||typeof render!=='function'||typeof bind!=='function'||typeof api!=='function'||typeof state!=='object'){
      setTimeout(waitForUxRefreshGuard,50);
      return;
    }
    installUxRefreshGuard();
  }catch(e){
    console.warn('UX refresh guard skipped',e);
  }
}
function installUxRefreshGuard(){
  try{
    if(window.__ctcgUxRefreshGuardInstalled)return;
    window.__ctcgUxRefreshGuardInstalled=true;
    const rawLoadState=loadState;
    const rawRender=render;
    window.__ctcgUxRefresh={pendingLoad:false,pendingRender:false,lastExplicit:0,quietLoading:false};
    function markExplicit(){window.__ctcgUxRefresh.lastExplicit=Date.now()}
    function activeElementIsEditing(){
      const el=document.activeElement;
      if(!el||el===document.body)return false;
      const tag=String(el.tagName||'').toLowerCase();
      return tag==='input'||tag==='textarea'||tag==='select'||el.isContentEditable;
    }
    function modalOrEditorOpen(){
      return activeElementIsEditing()||!!document.querySelector('.marketInfoOverlay.show,#ascCeremony,#ascFailsafeConfirm');
    }
    function shouldDeferLoad(){
      return modalOrEditorOpen()||!!document.querySelector('.battleFullscreen');
    }
    function shouldDeferRender(){
      return modalOrEditorOpen();
    }
    function battleSetupActive(){
      return typeof state==='object'&&state&&state.page==='battle'&&['team','enemy'].includes(state.battleView);
    }
    function battleSetupSnapshot(){
      if(!battleSetupActive())return null;
      return{
        battleView:state.battleView,
        aiBattleSquad:Array.isArray(state.aiBattleSquad)?state.aiBattleSquad.slice():[],
        aiBattleSquadMode:state.aiBattleSquadMode,
        aiEnemyType:state.aiEnemyType,
        battleTeamQ:state.battleTeamQ,
        battleTeamCid:state.battleTeamCid,
        battleTeamRar:state.battleTeamRar
      };
    }
    function restoreBattleSetup(snap){
      if(!snap||typeof state!=='object'||!state)return;
      state.battleView=snap.battleView;
      state.aiBattleSquad=snap.aiBattleSquad;
      state.aiBattleSquadMode=snap.aiBattleSquadMode;
      state.aiEnemyType=snap.aiEnemyType;
      state.battleTeamQ=snap.battleTeamQ;
      state.battleTeamCid=snap.battleTeamCid;
      state.battleTeamRar=snap.battleTeamRar;
    }
    function shouldRenderAfterLoad(){
      if(battleSetupActive())return false;
      const el=document.activeElement;
      const tag=String(el&&el.tagName||'').toLowerCase();
      if(Date.now()-window.__ctcgUxRefresh.lastExplicit<6500)return true;
      if(tag==='button'||tag==='a')return true;
      return false;
    }
    async function quietLoadState(){
      const preserve=battleSetupSnapshot();
      const d=await api('/api/state');
      user=d.user||user;
      state={...state,...d.state};
      restoreBattleSetup(preserve);
      if(!state.sel)state.sel='all';
      if(typeof cache==='function')cache();
      return d;
    }
    function tryFlush(){
      try{
        const ux=window.__ctcgUxRefresh;
        if(!ux||shouldDeferLoad()||shouldDeferRender())return;
        if(ux.pendingLoad){
          ux.pendingLoad=false;
          rawLoadState().catch(console.warn);
          return;
        }
        if(ux.pendingRender){
          ux.pendingRender=false;
          rawRender();
        }
      }catch(e){console.warn(e)}
    }
    loadState=async function(opts={}){
      const force=opts&&opts.force;
      if(force)return rawLoadState();
      if(shouldDeferLoad()){
        window.__ctcgUxRefresh.pendingLoad=true;
        return null;
      }
      if(shouldRenderAfterLoad())return rawLoadState();
      try{
        window.__ctcgUxRefresh.quietLoading=true;
        return await quietLoadState();
      }catch(e){
        return rawLoadState();
      }finally{
        window.__ctcgUxRefresh.quietLoading=false;
      }
    };
    render=function(){
      if(shouldDeferRender()){
        window.__ctcgUxRefresh.pendingRender=true;
        return;
      }
      return rawRender();
    };
    const rawBind=bind;
    bind=function(){
      rawBind();
      const sync=document.getElementById('sync');
      if(sync)sync.onclick=()=>{markExplicit();rawLoadState()};
    };
    ['pointerdown','touchstart','mousedown','keydown','input','change'].forEach(type=>{
      document.addEventListener(type,e=>{
        const t=e.target;
        if(!t)return;
        if(t.closest&&t.closest('button,a,input,textarea,select,[contenteditable="true"],.marketInfoPanel,.marketTradeControls,.form,.cropGrid,.battleSetup'))markExplicit();
      },true);
    });
    ['focusout','change','keyup','pointerup','touchend'].forEach(type=>document.addEventListener(type,()=>setTimeout(tryFlush,350),true));
    setInterval(tryFlush,1000);
  }catch(e){
    window.__ctcgUxRefreshGuardInstalled=false;
    console.warn('UX refresh guard failed safely',e);
  }
}
waitForUxRefreshGuard();
