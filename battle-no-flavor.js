function injectBattleNoFlavorStyles(){
  if(document.getElementById('ctcgBattleNoFlavorStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgBattleNoFlavorStyles';
  style.textContent=`
/* Battle views should show combat information, not card flavor text. */
.battleFlow .fx,
.battleFullscreen .fx,
.battleStage .fx,
.battleFsMode .fx,
.battle .fx{display:none!important}
.battleFlow .card .cbot,
.battleFullscreen .card .cbot,
.battleStage .card .cbot,
.battleFsMode .card .cbot,
.battle .card .cbot{display:none!important}
.battleFlow .card,
.battleFullscreen .card,
.battleStage .card,
.battleFsMode .card,
.battle .card{min-height:auto!important}
`;
  document.head.appendChild(style);
}
injectBattleNoFlavorStyles();
