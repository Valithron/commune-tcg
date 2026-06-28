const BATTLE_RULES_SECTIONS=[
  ['Battle Overview','Battles are automated fights between your squad and an AI enemy squad. The server resolves the fight, then the client plays it back.'],
  ['Squad Size','A squad can contain up to three cards. The game can auto-pick your strongest available team, or you can manually choose cards in the coming battle flow refactor.'],
  ['Enemy Types','Current enemy pools are Random Encounter, Household Chaos, Yard Project, Rival Commune, and Boss Fight. Enemy type affects theme, names, character pools, and stat bias.'],
  ['Turn Order','Turn order is based mostly on SPD with a small random factor. Faster fighters are more likely to act earlier each round.'],
  ['Damage','Damage uses attacker POW, defender DEF, random variance, and matchup modifiers. Every hit has a minimum damage floor.'],
  ['Matchups','Hits can be strong, weak, or neutral depending on character matchup. The battle caption can show flags such as WEAK or STRONG.'],
  ['Critical and Glancing Hits','Critical hits increase damage. Higher SPD improves critical chance. Glancing hits reduce damage and are more likely when the defender is faster than the attacker.'],
  ['Victory and Defeat','A battle ends when one side is defeated or when the round limit is reached. If the round limit is reached, remaining HP determines the winner.'],
  ['Rewards','Battles pay character tokens. The MVP determines which character token is awarded.'],
  ['Card XP','Cards used in battle earn XP from participation, wins, surviving, MVP, damage, and critical hits.'],
  ['Leveling','Cards gain levels from XP within their current rarity stage.'],
  ['Ascension','Eligible cards can ascend by spending same-character tokens. Ascension preserves card identity while upgrading rarity, stats, and passive income.'],
  ['Prestige and Market Influence','Card strength, XP, owner diversity, wins, MVPs, and recent activity contribute to character prestige. Prestige affects each token market anchor.'],
  ['Rules Source','The working source of truth is docs/battle-rules.md in the repo. We will expand and check the popup against that document as rules are finalized.']
];
function closeBattleRules(){document.querySelectorAll('.battleRulesBackdrop,#battleRulesModal').forEach(x=>x.remove())}
function battleRulesHtml(){return`<div class="battleRulesBackdrop" id="battleRulesModal" role="dialog" aria-modal="true" aria-labelledby="battleRulesTitle" data-battle-rules-backdrop="true"><div class="battleRulesModal"><div class="battleRulesTop"><div><h2 id="battleRulesTitle">Battle Rules</h2><p>Draft reference. Full rules source lives in docs/battle-rules.md.</p></div><button class="btn" data-battle-rules-close="true" type="button">Close</button></div><div class="battleRulesBody">${BATTLE_RULES_SECTIONS.map(([title,body])=>`<section><h3>${h(title)}</h3><p>${h(body)}</p></section>`).join('')}</div></div></div>`}
function openBattleRules(e){
  if(e){e.preventDefault();e.stopPropagation()}
  closeBattleRules();
  document.body.insertAdjacentHTML('beforeend',battleRulesHtml());
}
function injectBattleRulesButton(){
  const old=document.getElementById('battleRulesBtn');
  const view=state&&state.battleView?state.battleView:'home';
  if(!user||state.page!=='battle'||view!=='home'){old?.remove();if(state.page!=='battle')closeBattleRules();return}
  const head=document.querySelector('main.content .head');
  if(!head||old)return;
  const btn=document.createElement('button');
  btn.className='btn battleRulesBtn';
  btn.id='battleRulesBtn';
  btn.type='button';
  btn.textContent='Rules';
  btn.setAttribute('data-battle-rules-open','true');
  const row=head.querySelector('.row');
  if(row)row.appendChild(btn);else head.appendChild(btn);
}
function bindBattleRulesDelegates(){
  if(window.__ctcgBattleRulesDelegates)return;
  window.__ctcgBattleRulesDelegates=true;
  document.addEventListener('click',e=>{
    const open=e.target.closest&&e.target.closest('[data-battle-rules-open]');
    if(open){openBattleRules(e);return}
    const close=e.target.closest&&e.target.closest('[data-battle-rules-close]');
    if(close){e.preventDefault();e.stopPropagation();closeBattleRules();return}
    if(e.target&&e.target.matches&&e.target.matches('[data-battle-rules-backdrop]')){closeBattleRules()}
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeBattleRules()});
}
function injectBattleRulesStyles(){
  if(document.getElementById('ctcgBattleRulesStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgBattleRulesStyles';
  style.textContent=`
.battleRulesBtn{border-color:rgba(243,201,63,.42)!important;color:#f3c93f!important}.battleRulesBackdrop{position:fixed;inset:0;z-index:9999;background:rgba(3,5,12,.78);backdrop-filter:blur(8px);display:grid;place-items:center;padding:18px}.battleRulesModal{width:min(760px,100%);max-height:min(82vh,780px);border:1px solid rgba(255,255,255,.16);border-radius:20px;background:linear-gradient(145deg,#11182a,#070b15);box-shadow:0 24px 90px rgba(0,0,0,.55);display:grid;grid-template-rows:auto minmax(0,1fr);overflow:hidden}.battleRulesTop{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;padding:18px;border-bottom:1px solid rgba(255,255,255,.12)}.battleRulesTop h2{margin:0;font:900 1.5rem Sora,Inter,sans-serif}.battleRulesTop p{margin:4px 0 0;color:#aeb2cc}.battleRulesBody{overflow:auto;padding:18px;display:grid;gap:14px}.battleRulesBody section{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0b1020;padding:13px}.battleRulesBody h3{margin:0 0 6px;color:#f3c93f;font:900 .86rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.06em}.battleRulesBody p{margin:0;color:#dfe4ff;line-height:1.45}@media(max-width:720px){.battleRulesBackdrop{padding:10px}.battleRulesModal{max-height:88vh;border-radius:16px}.battleRulesTop{padding:14px}.battleRulesTop h2{font-size:1.25rem}.battleRulesBody{padding:12px}.battleRulesBody section{padding:11px}}
`;
  document.head.appendChild(style);
}
const battleRulesOldBind=bind;
bind=function(){battleRulesOldBind();injectBattleRulesStyles();bindBattleRulesDelegates();injectBattleRulesButton()};
injectBattleRulesStyles();
bindBattleRulesDelegates();
setTimeout(injectBattleRulesButton,0);
