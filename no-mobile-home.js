(function(){
  if(window.__ctcgNoMobileHome)return;
  window.__ctcgNoMobileHome=true;
  function isMobile(){return !!((window.matchMedia&&window.matchMedia('(max-width:920px)').matches)||window.innerWidth<=920)}
  function redirectHome(){
    if(typeof user==='undefined'||!user||typeof state==='undefined'||!state||!isMobile())return false;
    if(state.page==='home'){
      state.page='collection';
      if(typeof queueMeta==='function')queueMeta();
      return true;
    }
    return false;
  }
  var oldRender=typeof render==='function'?render:null;
  if(oldRender&&!oldRender.__ctcgNoMobileHome){
    render=function(){redirectHome();return oldRender.apply(this,arguments)};
    render.__ctcgNoMobileHome=true;
  }
  var oldBind=typeof bind==='function'?bind:null;
  if(oldBind&&!oldBind.__ctcgNoMobileHome){
    bind=function(){
      oldBind.apply(this,arguments);
      if(!isMobile())return;
      var brand=document.querySelector('.top .brand');
      if(brand){
        brand.dataset.page='collection';
        brand.onclick=function(){state.page='collection';if(typeof queueMeta==='function')queueMeta();render()};
      }
      document.querySelectorAll('[data-page="home"]').forEach(function(el){el.dataset.page='collection'});
    };
    bind.__ctcgNoMobileHome=true;
  }
  if(redirectHome()&&typeof render==='function')setTimeout(render,0);
})();
