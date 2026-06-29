(function(){
  if(window.__ctcgNoSidebarPages)return;
  window.__ctcgNoSidebarPages=true;
  var FULL_WIDTH_PAGES={market:true,tokens:true,battle:true};
  function shouldFullWidth(){return !!(window.state&&FULL_WIDTH_PAGES[state.page]);}
  function installStyles(){
    if(document.getElementById('ctcgNoSidebarPagesStyles'))return;
    var style=document.createElement('style');
    style.id='ctcgNoSidebarPagesStyles';
    style.textContent='\
.layout.noCharSidebarLayout{grid-template-columns:1fr!important}\
.layout.noCharSidebarLayout>aside{display:none!important}\
.layout.noCharSidebarLayout main.content{min-width:0!important}\
@media(max-width:1080px){.layout.noCharSidebarLayout{grid-template-columns:1fr!important}}\
';
    document.head.appendChild(style);
  }
  function markFullWidthLayout(){
    installStyles();
    if(!shouldFullWidth())return;
    var layout=document.querySelector('.layout');
    if(!layout)return;
    layout.classList.add('noCharSidebarLayout');
    var aside=layout.querySelector(':scope > aside')||layout.querySelector('aside');
    if(aside)aside.classList.add('noCharSidebarAside');
  }
  if(typeof shell==='function'){
    var oldShell=shell;
    shell=function(content){
      var html=oldShell.apply(this,arguments);
      if(shouldFullWidth()){
        html=html.replace('<div class="layout">','<div class="layout noCharSidebarLayout">');
        html=html.replace('<aside>','<aside class="noCharSidebarAside">');
      }
      return html;
    };
  }
  if(typeof render==='function'){
    var oldRender=render;
    render=function(){
      var out=oldRender.apply(this,arguments);
      markFullWidthLayout();
      return out;
    };
  }
  installStyles();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',markFullWidthLayout);
  else markFullWidthLayout();
})();
