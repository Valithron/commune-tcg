(function(){
  if(window.__ctcgNoSidebarPagesV2)return;
  window.__ctcgNoSidebarPagesV2=true;
  var FULL_WIDTH_PAGES={market:true,tokens:true,battle:true};
  function currentPage(){
    try{return typeof state!=='undefined'?state.page:''}catch(e){return''}
  }
  function shouldFullWidth(){return !!FULL_WIDTH_PAGES[currentPage()];}
  function installStyles(){
    if(document.getElementById('ctcgNoSidebarPagesStyles'))return;
    var style=document.createElement('style');
    style.id='ctcgNoSidebarPagesStyles';
    style.textContent='\
.layout.noCharSidebarLayout{grid-template-columns:1fr!important}\
.layout.noCharSidebarLayout>aside,.layout.noCharSidebarLayout .noCharSidebarAside{display:none!important}\
.layout.noCharSidebarLayout main.content{min-width:0!important}\
@media(max-width:1080px){.layout.noCharSidebarLayout{grid-template-columns:1fr!important}}\
';
    document.head.appendChild(style);
  }
  function markFullWidthLayout(){
    installStyles();
    var layout=document.querySelector('.layout');
    if(!layout)return;
    if(!shouldFullWidth()){
      layout.classList.remove('noCharSidebarLayout');
      layout.querySelectorAll('.noCharSidebarAside').forEach(function(a){a.classList.remove('noCharSidebarAside')});
      return;
    }
    layout.classList.add('noCharSidebarLayout');
    var aside=layout.children&&layout.children.length?layout.children[0]:layout.querySelector('aside');
    if(aside&&aside.tagName&&aside.tagName.toLowerCase()==='aside')aside.classList.add('noCharSidebarAside');
  }
  if(typeof shell==='function'&&!shell.__ctcgNoSidebarWrapped){
    var oldShell=shell;
    shell=function(content){
      var html=oldShell.apply(this,arguments);
      if(shouldFullWidth()){
        html=html.replace('<div class="layout">','<div class="layout noCharSidebarLayout">');
        html=html.replace('<aside>','<aside class="noCharSidebarAside">');
      }
      return html;
    };
    shell.__ctcgNoSidebarWrapped=true;
  }
  if(typeof render==='function'&&!render.__ctcgNoSidebarWrapped){
    var oldRender=render;
    render=function(){
      var out=oldRender.apply(this,arguments);
      markFullWidthLayout();
      return out;
    };
    render.__ctcgNoSidebarWrapped=true;
  }
  installStyles();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',markFullWidthLayout);
  else markFullWidthLayout();
  setTimeout(markFullWidthLayout,80);
  setTimeout(markFullWidthLayout,260);
})();
