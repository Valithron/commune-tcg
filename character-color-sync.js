(function(){
  if(window.__ctcgCharacterColorSync)return;
  window.__ctcgCharacterColorSync=true;
  var COLORS={cydney:'#789461'};
  function syncCharacterColors(){
    try{
      if(typeof C!=='undefined'&&Array.isArray(C))C.forEach(function(c){if(c&&COLORS[c.id])c.a=COLORS[c.id]});
      if(typeof accounts!=='undefined'&&Array.isArray(accounts))accounts.forEach(function(a){if(a&&COLORS[a.id])a.color=COLORS[a.id]});
      if(typeof user!=='undefined'&&user&&COLORS[user.id])user.color=COLORS[user.id];
    }catch(e){}
  }
  window.syncCharacterColors=syncCharacterColors;
  syncCharacterColors();
  var tries=0,t=setInterval(function(){syncCharacterColors();tries++;if(tries>20)clearInterval(t)},250);
})();
