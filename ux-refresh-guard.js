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
    const UI_KEYS=['page','sel','q','draft','vaultOwner','battleView','aiBattleSquad','aiBattleSquadMode','aiEnemyType','battleTeamQ','battleTeamCid','battleTeamRar'];
    function markExplicit(){window.__ctcgUxRefresh.lastExplicit=Date.now()}
    function recentlyExplicit(){return Date.now()-window.__ctcgUxRefresh.lastExplicit<6500}
    function mobileViewport(){return (window.matchMedia&&window.matchMedia('(max-width: 820px), (pointer: coarse)').matches)||window.innerWidth<=820}
    function appStillLoading(){
      const app=document.getElementById('app');
      return !app||!!app.querySelector('.loading');
    }
    function activeElementIsEditing(){
      const el=document.activeElement;
      if(!el||el===document.body)return false;
      const tag=String(el.tagName||'').toLowerCase();
      return tag==='input'||tag==='textarea'||tag==='select'||el.isContentEditable;
    }
    function modalOrEditorOpen(){
      return activeElementIsEditing()||!!document.querySelector('.marketInfoOverlay.show,#ascCeremony,#ascFailsafeConfirm,.cardDetailBackdrop,.vaultCardModalBackdrop');
    }
    function shouldDeferLoad(){
      if(appStillLoading())return false;
      return modalOrEditorOpen()||!!document.querySelector('.battleFullscreen');
    }
    function shouldDeferRender(){
      if(appStillLoading())return false;
      return modalOrEditorOpen();
    }
    function uiSnapshot(){
      if(typeof state!=='object'||!state)return{};
      const snap={};
      UI_KEYS.forEach(k=>{if(Object.prototype.hasOwnProperty.call(state,k))snap[k]=Array.isArray(state[k])?state[k].slice():state[k]});
      return snap;
    }
    function restoreUiSnapshot(snap){
      if(!snap||typeof state!=='object'||!state)return;
      Object.keys(snap).forEach(k=>{state[k]=snap[k]});
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
      if(appStillLoading())return true;
      if(battleSetupActive())return false;
      if(recentlyExplicit())return true;
      return false;
    }
    async function quietLoadState(){
      const preserveUi=uiSnapshot();
      const preserveBattle=battleSetupSnapshot();
      const d=await api('/api/state');
      user=d.user||user;
      state={...state,...d.state};
      restoreUiSnapshot(preserveUi);
      restoreBattleSetup(preserveBattle);
      if(!state.sel)state.sel='all';
      if(typeof cache==='function')cache();
      return d;
    }
    async function mobileQuietOnly(){
      try{
        window.__ctcgUxRefresh.quietLoading=true;
        return await quietLoadState();
      }catch(e){
        console.warn('Mobile background refresh skipped',e);
        return null;
      }finally{
        window.__ctcgUxRefresh.quietLoading=false;
      }
    }
    function tryFlush(){
      try{
        const ux=window.__ctcgUxRefresh;
        if(!ux||shouldDeferLoad()||shouldDeferRender())return;
        if(ux.pendingLoad){
          ux.pendingLoad=false;
          if(mobileViewport()&&!recentlyExplicit())mobileQuietOnly();
          else rawLoadState().catch(console.warn);
          return;
        }
        if(ux.pendingRender){
          ux.pendingRender=false;
          if(!(mobileViewport()&&!recentlyExplicit()))rawRender();
        }
      }catch(e){console.warn(e)}
    }
    loadState=async function(opts={}){
      const force=opts&&opts.force;
      if(force||appStillLoading())return rawLoadState();
      if(mobileViewport()&&!recentlyExplicit()){
        if(shouldDeferLoad())return null;
        return mobileQuietOnly();
      }
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
        if(t.closest&&t.closest('button,a,input,textarea,select,[contenteditable="true"],.marketInfoPanel,.marketTradeControls,.form,.cropGrid,.battleSetup,.cardDetailModal,.vaultCardModal'))markExplicit();
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
