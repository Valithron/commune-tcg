function injectBattleEnemyHighlightStyles(){
  document.getElementById('ctcgBattleEnemyHighlightStyles')?.remove();
  const style=document.createElement('style');
  style.id='ctcgBattleEnemyHighlightStyles';
  style.textContent=`
.battleFlowEnemy{position:relative;transition:border-color .16s ease,box-shadow .16s ease,background .16s ease,transform .16s ease}.battleFlowEnemy.on{border-color:#f3c93f!important;background:radial-gradient(circle at 20% 0,rgba(243,201,63,.22),transparent 34%),linear-gradient(145deg,rgba(243,201,63,.16),#0b1020)!important;box-shadow:0 0 0 2px rgba(243,201,63,.28),0 0 26px rgba(243,201,63,.34),inset 0 0 0 1px rgba(243,201,63,.22)!important;transform:translateY(-1px)}.battleFlowEnemy.on:after{content:'SELECTED';position:absolute;right:10px;top:10px;border:1px solid rgba(243,201,63,.65);border-radius:999px;background:#f3c93f;color:#080b15;padding:4px 7px;font:900 .52rem 'JetBrains Mono',monospace;letter-spacing:.08em}.battleFlowEnemy.on span{border-color:#f3c93f!important;background:rgba(243,201,63,.18)!important;color:#f3c93f!important}.battleFlowEnemy.on b{color:#fff7c8}.battleFlowEnemy.on small,.battleFlowEnemy.on em{color:#edf1ff}@media(max-width:720px){.battleFlowEnemy.on:after{position:static;width:max-content;margin-top:2px;order:-1}.battleFlowEnemy.on{transform:none}}
`;
  document.head.appendChild(style);
}
injectBattleEnemyHighlightStyles();
