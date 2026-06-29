import{CHARACTER_IDS,defaultPlayerMeta,ensureGameSchema,getSessionUser,json}from'../_shared/game.js';

const AI_ENEMY_TYPES=['random_encounter','household_chaos','yard_project','rival_commune','boss_fight'];
const BASE_PRICES={cydney:13.4,sterling:12.3,ryan:11.2,gabi:10.1,cooper:9,kenly:7.9,ashley:6.8};
const MARKET_VOL={cydney:.04,sterling:.05,ryan:.06,gabi:.05,cooper:.06,kenly:.05,ashley:.05};
const RARITY_BONUS={common:0,uncommon:12,rare:35,legendary:80};
const RARITY_WEIGHT={common:1,uncommon:1.6,rare:2.4,legendary:3.6};
const STERLING_ASC_TEST_FLAG='ascensionTestCardSeeded';
function validSel(sel,oldSel){return sel==='all'||CHARACTER_IDS.includes(sel)?sel:(oldSel||'all')}
function validAiBattleMode(mode,oldMode){return mode==='manual'||mode==='auto'?mode:(oldMode||'auto')}
function validAiEnemyType(type,oldType){return AI_ENEMY_TYPES.includes(type)?type:(AI_ENEMY_TYPES.includes(oldType)?oldType:'random_encounter')}
function cleanBattleSquad(list,oldList){return Array.isArray(list)?list.map(x=>String(x||'')).filter(Boolean).slice(0,3):(Array.isArray(oldList)?oldList:[])}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function safeParse(v){try{return JSON.parse(v)}catch{return null}}
function num(v){let n=Number(v);return Number.isFinite(n)?n:0}
function cardLevel(c){return num(c.level)||({common:1,uncommon:6,rare:11,legendary:21}[c.rar]||1)}
function cardPower(c){return num(c.grade)||num(c.p)+num(c.d)+num(c.s)+(RARITY_BONUS[c.rar]||0)}
function defaultMarketAnchors(){return Object.fromEntries(CHARACTER_IDS.map(id=>[id,{base:BASE_PRICES[id]||10,prestigeScore:0,multiplier:1,anchor:BASE_PRICES[id]||10}]))}
function buildMarketAnchors(cards,xp24Rows,xp7Rows){
  const xp24=Object.fromEntries(CHARACTER_IDS.map(id=>[id,0])),xp7=Object.fromEntries(CHARACTER_IDS.map(id=>[id,0])),activeOwners=Object.fromEntries(CHARACTER_IDS.map(id=>[id,new Set()]));
  for(const r of xp24Rows||[]){if(CHARACTER_IDS.includes(r.character_id))xp24[r.character_id]+=num(r.total_xp)}
  for(const r of xp7Rows||[]){if(CHARACTER_IDS.includes(r.character_id)){xp7[r.character_id]+=num(r.total_xp);if(r.owner_user_id)activeOwners[r.character_id].add(r.owner_user_id)}}
  const out={};
  for(const id of CHARACTER_IDS){
    const owned=cards.filter(c=>c.cid===id),owners=new Set(owned.map(c=>c.owner).filter(Boolean)),activeCards=owned.filter(c=>num(c.xp)+num(c.lifetimeXp)>0);
    const wins=owned.reduce((s,c)=>s+num(c.wins),0),mvps=owned.reduce((s,c)=>s+num(c.mvpCount),0),battles=owned.reduce((s,c)=>s+num(c.battles),0);
    const ranked=owned.map(c=>({prestige:cardPower(c)*num(RARITY_WEIGHT[c.rar]||1)+cardLevel(c)*4+Math.sqrt(num(c.xp)+num(c.lifetimeXp))*3+num(c.wins)*2+num(c.mvpCount)*8})).sort((a,b)=>b.prestige-a.prestige);
    const topStrength=ranked.slice(0,5).reduce((s,c,i)=>s+c.prestige/(i+1),0);
    const activity=Math.sqrt(xp24[id])*8+Math.sqrt(xp7[id])*2;
    const diversity=owners.size*12+activeOwners[id].size*10;
    const breadth=Math.min(80,activeCards.length*4+owned.length*.5);
    const success=Math.min(100,wins*1.5+mvps*8+(battles?Math.round((wins/battles)*30):0));
    const prestigeScore=Math.round(topStrength*.22+activity+diversity+breadth+success);
    const multiplier=Number(clamp(.75+prestigeScore/220,.75,3).toFixed(2));
    const base=num(BASE_PRICES[id]||10),anchor=Number((base*multiplier).toFixed(2));
    out[id]={base,prestigeScore,multiplier,anchor,recentXp24h:Math.round(xp24[id]),recentXp7d:Math.round(xp7[id]),activeCards:activeCards.length,totalCards:owned.length,owners:owners.size,activeOwners:activeOwners[id].size};
  }
  return out;
}
async function marketAnchors(env){
  try{
    const cardsRows=await env.DB.prepare('SELECT owner_user_id,character_id,card_json FROM cards').all();
    const xp24Rows=await env.DB.prepare("SELECT character_id, SUM(xp) total_xp FROM card_xp_events WHERE created_at >= datetime('now','-24 hours') GROUP BY character_id").all();
    const xp7Rows=await env.DB.prepare("SELECT character_id, owner_user_id, SUM(xp) total_xp FROM card_xp_events WHERE created_at >= datetime('now','-7 days') GROUP BY character_id, owner_user_id").all();
    const cards=(cardsRows.results||[]).map(r=>{let c=safeParse(r.card_json)||{};return{...c,owner:c.owner||r.owner_user_id,cid:c.cid||r.character_id}}).filter(c=>CHARACTER_IDS.includes(c.cid));
    return buildMarketAnchors(cards,xp24Rows.results||[],xp7Rows.results||[]);
  }catch(e){return defaultMarketAnchors()}
}
function nextMarketPrice(tokenType,currentPrice,anchorPrice){
  const base=Number(BASE_PRICES[tokenType]||10),anchor=Math.max(.5,Number(anchorPrice||base)),price=Math.max(.5,Number(currentPrice||anchor)),vol=Number(MARKET_VOL[tokenType]||.05);
  const randomMove=(Math.random()*2-1)*vol;
  let gravity=clamp(((anchor-price)/anchor)*.006,-.01,.01);
  const softFloor=anchor*.2,softCeiling=anchor*8;
  if(price>softCeiling)gravity-=clamp(((price/softCeiling)-1)*.04,0,.06);
  if(price<softFloor)gravity+=clamp(((softFloor/price)-1)*.04,0,.06);
  const move=clamp(randomMove+gravity,-.18,.18);
  return Math.max(.5,Number((price*(1+move)).toFixed(2)));
}
async function ensureMarketHistory(env){
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS market_price_history (id INTEGER PRIMARY KEY AUTOINCREMENT, token_type TEXT NOT NULL, price REAL NOT NULL, source TEXT NOT NULL DEFAULT "drift", created_at TEXT DEFAULT CURRENT_TIMESTAMP)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_market_history_token_time ON market_price_history(token_type,created_at)').run();
}
async function readMeta(env,user){let row=await env.DB.prepare('SELECT value FROM player_meta WHERE user_id=?').bind(user.id).first();if(!row)return defaultPlayerMeta(user.id);try{return{...defaultPlayerMeta(user.id),...JSON.parse(row.value)}}catch{return defaultPlayerMeta(user.id)}}
async function writeMeta(env,user,state){let old=await readMeta(env,user),meta={...old,page:state.page||old.page,sel:validSel(state.sel,old.sel),draft:state.draft||old.draft,log:Array.isArray(state.log)?state.log.slice(0,40):old.log,q:typeof state.q==='string'?state.q.slice(0,100):old.q,aiBattleSquadMode:validAiBattleMode(state.aiBattleSquadMode,old.aiBattleSquadMode),aiBattleSquad:cleanBattleSquad(state.aiBattleSquad,old.aiBattleSquad),aiEnemyType:validAiEnemyType(state.aiEnemyType,old.aiEnemyType),ascensionTestCardSeeded:old.ascensionTestCardSeeded,ascensionTestCardSeededAt:old.ascensionTestCardSeededAt};await env.DB.prepare("INSERT INTO player_meta (user_id,value,updated_at) VALUES (?,?,datetime('now')) ON CONFLICT(user_id) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(user.id,JSON.stringify(meta)).run()}
async function driftMarket(env){await ensureMarketHistory(env);let rows=await env.DB.prepare('SELECT token_type,price,updated_at FROM market_prices').all(),now=Date.now(),oldest=0;for(let r of rows.results||[]){let t=Date.parse((r.updated_at||'').replace(' ','T')+'Z')||0;if(!oldest||t<oldest)oldest=t}if(oldest&&now-oldest<30000)return;let anchors=await marketAnchors(env),jobs=[];for(let r of rows.results||[]){let price=nextMarketPrice(r.token_type,r.price,anchors[r.token_type]?.anchor);jobs.push(env.DB.prepare("UPDATE market_prices SET price=?,updated_at=datetime('now') WHERE token_type=?").bind(price,r.token_type));jobs.push(env.DB.prepare("INSERT INTO market_price_history (token_type,price,source,created_at) VALUES (?,?,?,datetime('now'))").bind(r.token_type,price,'prestige_drift'))}jobs.push(env.DB.prepare("DELETE FROM market_price_history WHERE created_at < datetime('now','-48 hours')"));if(jobs.length)await env.DB.batch(jobs)}
async function accrue(env,user,meta){let now=Date.now(),last=Number(meta.lastCollectedAt||now),mins=Math.max(0,Math.min(24*60,(now-last)/60000));if(mins<.05){return meta}let rows=await env.DB.prepare('SELECT card_json FROM cards WHERE owner_user_id=?').bind(user.id).all(),income=Object.fromEntries(CHARACTER_IDS.map(id=>[id,0]));for(let r of rows.results||[]){try{let c=JSON.parse(r.card_json);if(c.equipped)income[c.cid]=(income[c.cid]||0)+Number(c.passive||0)}catch{}}let jobs=[];for(let id of CHARACTER_IDS){let add=Number(((income[id]||0)*mins).toFixed(2));if(add>0)jobs.push(env.DB.prepare("UPDATE token_balances SET balance=balance+?,updated_at=datetime('now') WHERE user_id=? AND token_type=?").bind(add,user.id,id))}meta.lastCollectedAt=now;jobs.push(env.DB.prepare("INSERT INTO player_meta (user_id,value,updated_at) VALUES (?,?,datetime('now')) ON CONFLICT(user_id) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(user.id,JSON.stringify(meta)));await env.DB.batch(jobs);return meta}
async function ensureSterlingAscensionTestCard(env,user,meta){
  if(user.id!=='sterling'||meta[STERLING_ASC_TEST_FLAG])return meta;
  const rows=await env.DB.prepare('SELECT card_json FROM cards WHERE owner_user_id=? AND character_id=?').bind('sterling','sterling').all();
  const exists=(rows.results||[]).some(r=>{let c=safeParse(r.card_json)||{};return c.tag==='Ascension Test'&&String(c.title||'').includes('Test Anvil')});
  const next={...meta,[STERLING_ASC_TEST_FLAG]:true,ascensionTestCardSeededAt:new Date().toISOString()};
  const jobs=[];
  if(!exists){
    const id=crypto.randomUUID();
    const card={id,owner:'sterling',cid:'sterling',title:'Sterling, Test Anvil',tag:'Ascension Test',rar:'common',p:10,d:10,s:10,passive:.01,effect:'One spark away from ascension.',img:null,imageKey:null,crop:{x:50,y:50,z:1},equipped:false,xp:499,level:4,battles:0,wins:0,mvpCount:0,lifetimeXp:0,grade:30};
    jobs.push(env.DB.prepare("INSERT INTO cards (id,owner_user_id,character_id,card_json,created_at,updated_at) VALUES (?,?,?,?,datetime('now'),datetime('now'))").bind(id,'sterling','sterling',JSON.stringify(card)));
  }
  jobs.push(env.DB.prepare("INSERT INTO player_meta (user_id,value,updated_at) VALUES (?,?,datetime('now')) ON CONFLICT(user_id) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(user.id,JSON.stringify(next)));
  await env.DB.batch(jobs);
  return next;
}
async function readPlayerState(env,user){await driftMarket(env);let anchors=await marketAnchors(env),meta=await readMeta(env,user);meta.sel=validSel(meta.sel,'all');meta.aiBattleSquadMode=validAiBattleMode(meta.aiBattleSquadMode,'auto');meta.aiBattleSquad=cleanBattleSquad(meta.aiBattleSquad,[]);meta.aiEnemyType=validAiEnemyType(meta.aiEnemyType,'random_encounter');meta=await accrue(env,user,meta);meta=await ensureSterlingAscensionTestCard(env,user,meta);let wallet=await env.DB.prepare('SELECT commune_cash FROM wallets WHERE user_id=?').bind(user.id).first(),br=await env.DB.prepare('SELECT token_type,balance FROM token_balances WHERE user_id=?').bind(user.id).all(),cr=await env.DB.prepare('SELECT card_json FROM cards WHERE owner_user_id=? ORDER BY created_at DESC').bind(user.id).all(),pr=await env.DB.prepare('SELECT token_type,price FROM market_prices').all(),tokens=Object.fromEntries(CHARACTER_IDS.map(id=>[id,0])),prices=Object.fromEntries(CHARACTER_IDS.map(id=>[id,1]));for(let r of br.results||[])tokens[r.token_type]=Number(r.balance||0);for(let r of pr.results||[])prices[r.token_type]=Number(r.price||1);let cards=(cr.results||[]).map(r=>{try{return JSON.parse(r.card_json)}catch{return null}}).filter(Boolean);return{...meta,cards,tokens,prices,marketAnchors:anchors,cash:Number(wallet?.commune_cash??5000),user}}
export async function onRequestGet({request,env}){try{await ensureGameSchema(env);let user=await getSessionUser(request,env);if(!user)return json({error:'Not logged in'},401);return json({state:await readPlayerState(env,user),user})}catch(e){return json({error:e.message||'Failed to load state'},500)}}
export async function onRequestPost({request,env}){try{await ensureGameSchema(env);let user=await getSessionUser(request,env);if(!user)return json({error:'Not logged in'},401);let state=await request.json();await writeMeta(env,user,state);return json({ok:true})}catch(e){return json({error:e.message||'Failed to save state'},500)}}