function installUxRefreshGuard(){
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
  function blockingUiOpen(){
    return !!document.querySelector('.marketInfoOverlay.show,#ascCeremony,#ascFailsafeConfirm,.battleFullscreen');
  }
  function shouldDeferRefresh(){
    return activeElementIsEditing()||blockingUiOpen();
  }
  function shouldRenderAfterLoad(){
    const el=document.activeElement;
    const tag=String(el?.tagName||'').toLowerCase();
    if(Date.now()-window.__ctcgUxRefresh.lastExplicit<6500)return true;
    if(tag==='button'||tag==='a')return true;
    return false;
  }
  async function quietLoadState(){
    const d=await api('/api/state');
    user=d.user||user;
    state={...state,...d.state};
    if(!state.sel)state.sel='all';
    cache();
    return d;
  }
  function tryFlush(){
    const ux=window.__ctcgUxRefresh;
    if(shouldDeferRefresh())return;
    if(ux.pendingLoad){
      ux.pendingLoad=false;
      rawLoadState().catch(console.warn);
      return;
    }
    if(ux.pendingRender){
      ux.pendingRender=false;
      rawRender();
    }
  }
  loadState=async function(opts={}){
    const force=opts&&opts.force;
    if(force)return rawLoadState();
    if(shouldDeferRefresh()){
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
    if(shouldDeferRefresh()){
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
      if(t.closest?.('button,a,input,textarea,select,[contenteditable="true"],.marketInfoPanel,.marketTradeControls,.form,.cropGrid'))markExplicit();
    },true);
  });
  ['focusout','change','keyup','pointerup','touchend'].forEach(type=>document.addEventListener(type,()=>setTimeout(tryFlush,350),true));
  setInterval(tryFlush,1000);
}
installUxRefreshGuard();
