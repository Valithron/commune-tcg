import{CHARACTER_IDS,ensureGameSchema,getSessionUser,json}from'../../_shared/game.js';
import{displayName,makeCard,mod,score}from'../../_shared/actions.js';

const RARITY_HP={common:0,uncommon:2,rare:5,legendary:10};
const RARITY_CRIT={common:0,uncommon:.01,rare:.02,legendary:.05};
const BOT_CACHE_TYPE='system-vs-ai-bot';
const BOT_RULESET='ai-autobattle-v1';
const RARITY_ORDER=['common','uncommon','rare','legendary'];
const ENEMY_TYPES={
  random_encounter:{label:'Random Encounter',characters:CHARACTER_IDS,names:{common:['Loose Coffee Goblin','Unexpected Errand','Side Quest Bandit','Mild Crisis','Forgotten Appointment','Coupon Gremlin'],uncommon:['Rogue Min-Maxer','Vibes Strategist','Calendar Goblin','Overthinking Imp','Budget Sidewinder','Inbox Phantom'],rare:['Errand Chain Warden','Panic Purchase Baron','Deadline Marauder','The Wrong Receipt','Schedule Saboteur'],legendary:['The Minor Emergency','Lord of One More Thing','The Sudden Obligation','The Vibes Tribunal']},bias:{p:1,d:1,s:1},difficulty:1},
  household_chaos:{label:'Household Chaos',characters:['cydney','gabi','ashley'],names:{common:['Sticky Floor Imp','Crayon Goblin','Sippy Cup Ghost','Missing Shoe Spirit','Cereal Spill Sprite','Sock Drawer Gremlin'],uncommon:['Laundry Hydra','Unfolded Load','Cabinet Door Wraith','Tiny Crumb Swarm','Bedtime Delay Goblin','Mystery Smell'],rare:['Toy Box Revenant','The Breakfast Aftermath','Diaper Bag Phantom','Kitchen Counter Golem','The Wet Sleeve'],legendary:['The Great Domestic Calamity','Queen of the Unsorted Pile','The Never-Clean Room','Matriarch of Mess']},bias:{p:.97,d:1.14,s:1.03},difficulty:1},
  yard_project:{label:'Yard Project',characters:['sterling','cooper','ashley'],names:{common:['Deck Splinter','Unleveled Paver','Loose Gravel Rat','Bent Screw Spirit','Patchy Lawn Goblin','Shovel Blister'],uncommon:['Retaining Wall Golem','Gravel Wraith','Broken Sprinkler','Creeping Bindweed','Fence Leaner','Mud Pit Ambusher'],rare:['Drainage Problem','The Crooked String Line','Pressure Washer Wraith','Three Trips to Lowe\'s','The Wrong Board Length'],legendary:['The Endless Deck Project','The Slope That Fought Back','Lord of the Gravel Base','The Saturday Devourer']},bias:{p:1.1,d:1.1,s:.93},difficulty:1},
  rival_commune:{label:'Rival Commune',characters:CHARACTER_IDS,names:{common:['Rival Helper','Borrowed Tool Guy','Awkward Houseguest','Uninvited Advisor','Snack Table Scout','Minor Contrarian'],uncommon:['False Project Manager','Garage Sale Baron','Sourdough Oracle','Softball Revenant','Overcommitted Wizard','Budget Prophet'],rare:['Rival Matriarch','Counterpart Strategist','The Other Best Man','Schedule Negotiator','Passive Income Pretender'],legendary:['The Mirror Commune','The Rival Council','The Sevenfold Opposition','The Almost Better Plan']},bias:{p:1.04,d:1.04,s:1.04},difficulty:1.04},
  boss_fight:{label:'Boss Fight',characters:CHARACTER_IDS,names:{common:['Heavy Errand','Large Problem','Serious Invoice','Dire Calendar Block'],uncommon:['Schedule Devourer','Budget Leviathan','Appointment Hydra','Great Paperwork Beast','Final Errand'],rare:['Domestic Calamity','Endless Deck Project','The Month-End Monster','The Overtime Warden','The Broken Routine'],legendary:['The Final Obligation','The Great Household Reckoning','The Project That Would Not Die','The Budget Apocalypse']},bias:{p:1.12,d:1.18,s:1.04},difficulty:1.1}
};

function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function randFloat(a,b){return a+Math.random()*(b-a)}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function avg(arr){return arr.length?arr.reduce((s,n)=>s+n,0)/arr.length:0}
function cardScore(c){return Number(c.grade||0)||score(c)}
function maxHp(c){return Math.max(20,Math.round(80+Number(c.d||0)*2+(RARITY_HP[c.rar]||0))) }
function critChance(c){return Math.min(.35,.05+Number(c.s||0)*.0025+(RARITY_CRIT[c.rar]||0))}
function matchupMult(a,b){let m=mod(a,b);return m>1?1.15:m<1?.9:1}
function matchupText(a,b){let m=mod(a,b);return m>1?'strong':m<1?'weak':'neutral'}
function glanceChance(attacker,defender){return Math.min(.25,Math.max(.03,(Number(defender.s||0)-Number(attacker.s||0))*.0025))}
function enemyTypeConfig(type){return ENEMY_TYPES[type]||ENEMY_TYPES.random_encounter}
function validEnemyType(type){return ENEMY_TYPES[type]?type:'random_encounter'}
function resolveEnemyType(meta,body){return validEnemyType(body?.aiEnemyType||meta?.aiEnemyType||'random_encounter')}
function namePoolFor(type,rarity){const names=enemyTypeConfig(type).names||{};return Array.isArray(names)?names:[...(names[rarity]||[]),...(names.any||[])]}
function themedEnemyName(type,enemy,index,used=new Set()){let pool=namePoolFor(type,enemy.rar).filter(Boolean);if(!pool.length)pool=[`Rival ${displayName(enemy.cid)} ${index+1}`];let name=pick(pool);for(let i=0;i<7&&used.has(name)&&pool.length>1;i++)name=pick(pool);used.add(name);return String(name).slice(0,25)}
function cleanCard(c){return{...c,title:String(c.title||'Untitled').slice(0,25),p:Number(c.p||0),d:Number(c.d||0),s:Number(c.s||0),passive:Number(c.passive||0),grade:cardScore(c)}}
function cacheCard(c){let x=cleanCard(c);return{id:x.id,cid:x.cid,title:x.title,tag:x.tag||'AI Bot',rar:x.rar,p:x.p,d:x.d,s:x.s,passive:x.passive,effect:x.effect||'',grade:x.grade,img:x.img||null,imageKey:x.imageKey||null,crop:x.crop||{x:50,y:50,z:1},equipped:false,enemyType:x.enemyType||null,enemyTypeLabel:x.enemyTypeLabel||null,templateId:x.templateId||null}}
function topOwned(cards,exclude=new Set()){return cards.map(cleanCard).filter(c=>!exclude.has(c.id)).sort((a,b)=>cardScore(b)-cardScore(a)||String(a.title||'').localeCompare(String(b.title||'')))}
function cleanSquadIds(list){return Array.isArray(list)?list.map(x=>String(x||'')).filter(Boolean).slice(0,3):[]}
function parseCrop(v){try{return JSON.parse(v||'')}catch{return{x:50,y:50,z:1}}}
function templateFromRow(r){return{id:r.id,enemyType:r.enemy_type,cid:r.character_id,rar:r.rarity,title:r.title,tag:r.tag,effect:r.effect,p:Number(r.pow||0),d:Number(r.def||0),s:Number(r.spd||0),passive:Number(r.passive||0),img:r.image_url||null,imageKey:r.image_key||null,crop:parseCrop(r.crop_json),weight:Math.max(0,Number(r.weight||1)),enabled:!!r.enabled}}
async function loadEnemyTemplates(env,type){try{let rows=await env.DB.prepare('SELECT * FROM enemy_card_templates WHERE enemy_type=? AND enabled=1 ORDER BY rarity,title').bind(type).all();return(rows.results||[]).map(templateFromRow).filter(t=>CHARACTER_IDS.includes(t.cid)&&RARITY_ORDER.includes(t.rar))}catch{return[]}}
function weightedPick(arr){let total=arr.reduce((s,x)=>s+Math.max(0,Number(x.weight||1)),0);if(total<=0)return pick(arr);let roll=Math.random()*total;for(const x of arr){roll-=Math.max(0,Number(x.weight||1));if(roll<=0)return x}return arr[arr.length-1]}
function chooseTemplate(templates,targetRarity,playerCid,used=new Set()){if(!templates.length)return null;let pool=templates.filter(t=>t.rar===targetRarity&&t.cid!==playerCid&&!used.has(t.id));if(!pool.length)pool=templates.filter(t=>t.rar===targetRarity&&t.cid!==playerCid);if(!pool.length)pool=templates.filter(t=>t.cid!==playerCid&&!used.has(t.id));if(!pool.length)pool=templates.filter(t=>t.cid!==playerCid);if(!pool.length)pool=templates.filter(t=>!used.has(t.id));if(!pool.length)pool=templates;if(!pool.length)return null;let t=weightedPick(pool);used.add(t.id);return t}
function cardFromTemplate(t,type){const label=enemyTypeConfig(type).label;return cleanCard({id:crypto.randomUUID(),templateId:t.id,cid:t.cid,title:t.title,tag:t.tag||label,rar:t.rar,p:t.p,d:t.d,s:t.s,passive:t.passive,effect:t.effect||'',img:t.img||null,imageKey:t.imageKey||null,crop:t.crop||{x:50,y:50,z:1},equipped:false,enemyType:type,enemyTypeLabel:label,grade:cardScore(t)})}
function resolveSquadConfig(meta,body){
  const incomingMode=body?.aiBattleSquadMode;
  const mode=incomingMode==='manual'||incomingMode==='auto'?incomingMode:(meta?.aiBattleSquadMode==='manual'?'manual':'auto');
  const ids=cleanSquadIds(Array.isArray(body?.aiBattleSquad)?body.aiBattleSquad:meta?.aiBattleSquad);
  return{mode,ids};
}
function chooseSquad(cards,meta={},body={}){
  const config=resolveSquadConfig(meta,body);
  const all=cards.map(cleanCard),byId=new Map(all.map(c=>[String(c.id),c]));
  if(config.mode!=='manual')return{cards:topOwned(all).slice(0,3),mode:'auto',selectedIds:[]};
  const chosen=[],used=new Set();
  for(const id of config.ids){let c=byId.get(String(id));if(c&&!used.has(c.id)&&chosen.length<3){chosen.push(c);used.add(c.id)}}
  for(const c of topOwned(all,used)){if(chosen.length<3&&!used.has(c.id)){chosen.push(c);used.add(c.id)}}
  return{cards:chosen,mode:'manual',selectedIds:config.ids};
}
function enemyRarity(r){
  if(Math.random()<.72)return r;
  return pick(RARITY_ORDER);
}
function applyEnemyType(enemy,type,index,usedNames=new Set()){
  const pool=enemyTypeConfig(type),bias=pool.bias||{},difficulty=Number(pool.difficulty||1);
  enemy.title=themedEnemyName(type,enemy,index,usedNames);
  enemy.tag=pool.label;
  enemy.enemyType=type;
  enemy.enemyTypeLabel=pool.label;
  enemy.p=Math.max(4,Math.round(Number(enemy.p||0)*Number(bias.p||1)*difficulty));
  enemy.d=Math.max(4,Math.round(Number(enemy.d||0)*Number(bias.d||1)*difficulty));
  enemy.s=Math.max(4,Math.round(Number(enemy.s||0)*Number(bias.s||1)*difficulty));
  enemy.grade=score(enemy);
  return cleanCard(enemy);
}
function makeEnemySquad(playerSquad,type='random_encounter',templates=[]){
  const pool=enemyTypeConfig(type),chars=(pool.characters||CHARACTER_IDS).filter(id=>CHARACTER_IDS.includes(id)),usedNames=new Set(),usedTemplates=new Set();
  return playerSquad.map((c,i)=>{
    const targetRarity=enemyRarity(c.rar);
    const t=chooseTemplate(templates,targetRarity,c.cid,usedTemplates);
    if(t)return cardFromTemplate(t,type);
    const candidates=(chars.length?chars:CHARACTER_IDS).filter(id=>id!==c.cid);
    const cid=pick(candidates.length?candidates:(chars.length?chars:CHARACTER_IDS));
    const enemy=makeCard({cid,rar:targetRarity,title:`Rival ${displayName(cid)} ${i+1}`,tag:pool.label});
    return applyEnemyType(enemy,type,i,usedNames);
  });
}
function fighter(card,team,index){
  const hp=maxHp(card);
  return{...card,team,index,maxHp:hp,hp,alive:true,damageDone:0,crits:0};
}
function publicFighter(f){
  return{id:f.id,team:f.team,index:f.index,cid:f.cid,title:f.title,tag:f.tag,rar:f.rar,p:f.p,d:f.d,s:f.s,passive:f.passive,effect:f.effect,grade:f.grade,img:f.img||null,imageKey:f.imageKey||null,crop:f.crop||{x:50,y:50,z:1},equipped:!!f.equipped,maxHp:f.maxHp,finalHp:f.hp,damageDone:f.damageDone,crits:f.crits,enemyType:f.enemyType||null,enemyTypeLabel:f.enemyTypeLabel||null,templateId:f.templateId||null};
}
function living(list){return list.filter(f=>f.alive&&f.hp>0)}
function targetFor(attacker,opponents){
  const live=living(opponents);
  if(!live.length)return null;
  if(Math.random()<.7)return live.slice().sort((a,b)=>a.hp-b.hp||a.d-b.d)[0];
  return pick(live);
}
function attack(attacker,defender){
  const matchup=matchupText(attacker.cid,defender.cid),mult=matchupMult(attacker.cid,defender.cid);
  const crit=Math.random()<critChance(attacker);
  const glance=Math.random()<glanceChance(attacker,defender);
  let raw=(Number(attacker.p||0)*randFloat(.85,1.15)*mult*(crit?1.6:1))-Number(defender.d||0)*.35;
  let damage=Math.max(5,Math.round(raw));
  if(glance)damage=Math.max(3,Math.round(damage*.5));
  const before=defender.hp;
  defender.hp=Math.max(0,defender.hp-damage);
  if(defender.hp<=0)defender.alive=false;
  attacker.damageDone+=damage;
  if(crit)attacker.crits+=1;
  const defeated=before>0&&defender.hp===0;
  const flags=[crit?'CRIT':null,glance?'GLANCE':null,matchup!=='neutral'?matchup.toUpperCase():null].filter(Boolean).join(' · ');
  return{type:'hit',attackerTeam:attacker.team,attackerId:attacker.id,attackerTitle:attacker.title,defenderTeam:defender.team,defenderId:defender.id,defenderTitle:defender.title,damage,crit,glance,matchup,defeated,defenderHp:defender.hp,defenderMaxHp:defender.maxHp,text:`${attacker.title} hit ${defender.title} for ${damage} damage${flags?` (${flags})`:''}${defeated?' and knocked them out.':'.'}`};
}
function runBattle(playerCards,enemyCards,meta={}){
  const player=playerCards.map((c,i)=>fighter(c,'player',i));
  const enemy=enemyCards.map((c,i)=>fighter(c,'enemy',i));
  const rounds=[];
  for(let round=1;round<=8;round++){
    if(!living(player).length||!living(enemy).length)break;
    const order=[...living(player),...living(enemy)].sort((a,b)=>(Number(b.s||0)+rnd(0,8))-(Number(a.s||0)+rnd(0,8)));
    const events=[];
    for(const actor of order){
      if(!actor.alive||actor.hp<=0)continue;
      const opponents=actor.team==='player'?enemy:player;
      const target=targetFor(actor,opponents);
      if(!target)break;
      events.push(attack(actor,target));
      if(!living(player).length||!living(enemy).length)break;
    }
    rounds.push({round,events});
  }
  const playerAlive=living(player),enemyAlive=living(enemy);
  let win;
  let reason='';
  if(playerAlive.length&&!enemyAlive.length){win=true;reason='Enemy squad defeated'}
  else if(enemyAlive.length&&!playerAlive.length){win=false;reason='Your squad was defeated'}
  else{
    const php=player.reduce((s,f)=>s+f.hp,0),ehp=enemy.reduce((s,f)=>s+f.hp,0);
    win=php>=ehp;reason='Round limit reached';
  }
  const playerCrits=player.reduce((s,f)=>s+f.crits,0),allSurvive=player.every(f=>f.hp>0),enemyAvg=avg(enemy.map(cardScore));
  const mvp=player.slice().sort((a,b)=>b.damageDone-a.damageDone||cardScore(b)-cardScore(a))[0]||player[0];
  const reward=win?Math.round(40+enemyAvg*.8+playerCrits*5+(allSurvive?10:0)):Math.round(10+player.length*5+playerCrits*2);
  const enemyType=validEnemyType(meta.enemyType||'random_encounter'),enemyTypeLabel=enemyTypeConfig(enemyType).label;
  return{ id:crypto.randomUUID(),createdAt:new Date().toISOString(),battleType:BOT_CACHE_TYPE,rulesVersion:BOT_RULESET,mode:meta.mode||'next',squadMode:meta.squadMode||'auto',selectedSquadIds:meta.selectedSquadIds||[],enemyType,enemyTypeLabel,opponentCacheId:meta.opponentCacheId||null,opponentSource:meta.opponentSource||'generated-ai-bot',win,reason,reward,tokenType:mvp.cid,tokenName:displayName(mvp.cid),mvpId:mvp.id,mvpTitle:mvp.title,summary:`${win?'Victory':'Defeat'} vs ${enemyTypeLabel}: ${reason}. MVP: ${mvp.title}. ${win?'+':'Consolation +'}${reward} ${displayName(mvp.cid)} Tokens.`,player:player.map(publicFighter),enemy:enemy.map(publicFighter),rounds };
}
function readCachedOpponent(meta){
  const cached=meta?.aiBotOpponentCache;
  if(cached?.type===BOT_CACHE_TYPE&&Array.isArray(cached.enemySquad)&&cached.enemySquad.length)return cached;
  if(meta?.lastBattle?.battleType===BOT_CACHE_TYPE&&meta.lastBattle.win===false&&Array.isArray(meta.lastBattle.enemy)&&meta.lastBattle.enemy.length){
    const enemyType=validEnemyType(meta.lastBattle.enemyType||'random_encounter');
    return{type:BOT_CACHE_TYPE,rulesVersion:BOT_RULESET,opponentId:meta.lastBattle.opponentCacheId||`legacy-${meta.lastBattle.id||crypto.randomUUID()}`,enemyType,enemyTypeLabel:enemyTypeConfig(enemyType).label,enemySquad:meta.lastBattle.enemy.map(cacheCard),createdAt:meta.lastBattle.createdAt||new Date().toISOString()};
  }
  return null;
}
function makeOpponentCache(enemySquad,existingId=null,enemyType='random_encounter'){
  enemyType=validEnemyType(enemyType);
  return{type:BOT_CACHE_TYPE,rulesVersion:BOT_RULESET,opponentId:existingId||crypto.randomUUID(),enemyType,enemyTypeLabel:enemyTypeConfig(enemyType).label,enemySquad:enemySquad.map(cacheCard),updatedAt:new Date().toISOString()};
}
function battleHistorySummary(b){
  const player=b.player||[],enemy=b.enemy||[];
  return{id:b.id,createdAt:b.createdAt,win:!!b.win,enemyType:b.enemyType||'random_encounter',enemyTypeLabel:b.enemyTypeLabel||enemyTypeConfig(b.enemyType).label,squadMode:b.squadMode||'auto',mode:b.mode||'next',mvpTitle:b.mvpTitle||'None',reward:Number(b.reward||0),tokenType:b.tokenType||'cydney',tokenName:b.tokenName||displayName(b.tokenType||'cydney'),rounds:(b.rounds||[]).length,playerStanding:player.filter(f=>Number(f.finalHp||0)>0).length,playerCount:player.length,enemyStanding:enemy.filter(f=>Number(f.finalHp||0)>0).length,enemyCount:enemy.length,totalDamage:player.reduce((s,f)=>s+Number(f.damageDone||0),0),crits:player.reduce((s,f)=>s+Number(f.crits||0),0),summary:b.summary||''};
}

export async function onRequestPost({request,env}){
  try{
    await ensureGameSchema(env);
    const user=await getSessionUser(request,env);
    if(!user)return json({error:'Not logged in'},401);
    let body={};
    try{body=await request.json()}catch{body={}}
    const mode=body?.mode==='rematch'?'rematch':'next';
    const rows=await env.DB.prepare('SELECT card_json FROM cards WHERE owner_user_id=?').bind(user.id).all();
    const cards=(rows.results||[]).map(r=>{try{return JSON.parse(r.card_json)}catch{return null}}).filter(Boolean);
    if(!cards.length)return json({error:'Mint a card before battling'},400);
    const metaRow=await env.DB.prepare('SELECT value FROM player_meta WHERE user_id=?').bind(user.id).first();
    let meta={};
    try{meta=metaRow?JSON.parse(metaRow.value):{}}catch{meta={}}
    const requestedEnemyType=resolveEnemyType(meta,body);
    const squadConfig=chooseSquad(cards,meta,body);
    const squad=squadConfig.cards;
    if(!squad.length)return json({error:'No valid battle cards found'},400);
    let enemy,opponentCache,opponentSource,enemyType;
    if(mode==='rematch'){
      opponentCache=readCachedOpponent(meta);
      if(!opponentCache)return json({error:'No cached AI bot opponent is available for rematch'},400);
      enemyType=validEnemyType(opponentCache.enemyType||'random_encounter');
      enemy=opponentCache.enemySquad.map(cleanCard);
      opponentSource='cached-ai-bot-rematch';
    }else{
      enemyType=requestedEnemyType;
      const templates=await loadEnemyTemplates(env,enemyType);
      enemy=makeEnemySquad(squad,enemyType,templates);
      opponentCache=makeOpponentCache(enemy,null,enemyType);
      opponentSource=templates.length?'admin-template-or-generated-ai-bot':'generated-ai-bot';
    }
    const battle=runBattle(squad,enemy,{mode,squadMode:squadConfig.mode,selectedSquadIds:squadConfig.selectedIds,enemyType,opponentCacheId:opponentCache.opponentId,opponentSource});
    meta.aiBattleSquadMode=squadConfig.mode;
    meta.aiBattleSquad=squadConfig.selectedIds;
    meta.aiEnemyType=requestedEnemyType;
    meta.aiBotOpponentCache=makeOpponentCache(enemy,opponentCache.opponentId,enemyType);
    meta.aiBotOpponentCache.lastMode=mode;
    meta.aiBotOpponentCache.lastBattleId=battle.id;
    meta.lastBattle=battle;
    meta.battleHistory=[battleHistorySummary(battle),...(Array.isArray(meta.battleHistory)?meta.battleHistory:[])].slice(0,50);
    meta.log=[{win:battle.win,txt:battle.summary},...(Array.isArray(meta.log)?meta.log:[])].slice(0,40);
    await env.DB.batch([
      env.DB.prepare("UPDATE token_balances SET balance=balance+?,updated_at=datetime('now') WHERE user_id=? AND token_type=?").bind(battle.reward,user.id,battle.tokenType),
      env.DB.prepare("INSERT INTO player_meta (user_id,value,updated_at) VALUES (?,?,datetime('now')) ON CONFLICT(user_id) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(user.id,JSON.stringify(meta))
    ]);
    return json({ok:true,battle,battleHistory:meta.battleHistory,win:battle.win,reward:battle.reward,tokenType:battle.tokenType,txt:battle.summary});
  }catch(e){return json({error:e.message||'Battle failed'},500)}
}
