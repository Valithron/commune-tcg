import{adminOnly}from'../../_shared/admin.js';
import{CHARACTER_IDS,USERS,json,ensureGameSchema}from'../../_shared/game.js';
const BASE_PRICES={cydney:13.4,sterling:12.3,ryan:11.2,gabi:10.1,cooper:9,kenly:7.9,ashley:6.8};
const RARITY_BONUS={common:0,uncommon:12,rare:35,legendary:80};
const RARITY_WEIGHT={common:1,uncommon:1.6,rare:2.4,legendary:3.6};
function safeParse(v){try{return JSON.parse(v)}catch{return null}}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function num(v){let n=Number(v);return Number.isFinite(n)?n:0}
function cardLevel(c){return num(c.level)||({common:1,uncommon:6,rare:11,legendary:21}[c.rar]||1)}
function cardPower(c){return num(c.grade)||num(c.p)+num(c.d)+num(c.s)+(RARITY_BONUS[c.rar]||0)}
function templateRow(r){return{id:r.id,enemyType:r.enemy_type,cid:r.character_id,rar:r.rarity,title:r.title,tag:r.tag,effect:r.effect,p:Number(r.pow||0),d:Number(r.def||0),s:Number(r.spd||0),passive:Number(r.passive||0),img:r.image_url||null,imageKey:r.image_key||null,crop:safeParse(r.crop_json)||{x:50,y:50,z:1},weight:Number(r.weight||1),enabled:!!r.enabled,createdAt:r.created_at,updatedAt:r.updated_at}}
function buildPrestige(cards,market,xp24Rows,xp7Rows){
  const mPrice=Object.fromEntries((market||[]).map(m=>[m.id,num(m.price)]));
  const xp24=Object.fromEntries(CHARACTER_IDS.map(id=>[id,0])),xp7=Object.fromEntries(CHARACTER_IDS.map(id=>[id,0])),activeOwners=Object.fromEntries(CHARACTER_IDS.map(id=>[id,new Set()]));
  for(const r of xp24Rows||[]){if(CHARACTER_IDS.includes(r.character_id))xp24[r.character_id]+=num(r.total_xp)}
  for(const r of xp7Rows||[]){if(CHARACTER_IDS.includes(r.character_id)){xp7[r.character_id]+=num(r.total_xp);if(r.owner_user_id)activeOwners[r.character_id].add(r.owner_user_id)}}
  return CHARACTER_IDS.map(id=>{
    const owned=cards.filter(c=>c.cid===id);
    const owners=new Set(owned.map(c=>c.owner).filter(Boolean));
    const activeCards=owned.filter(c=>num(c.xp)+num(c.lifetimeXp)>0);
    const wins=owned.reduce((s,c)=>s+num(c.wins),0),mvps=owned.reduce((s,c)=>s+num(c.mvpCount),0),battles=owned.reduce((s,c)=>s+num(c.battles),0);
    const ranked=owned.map(c=>({id:c.id,title:c.title||'Untitled',owner:c.owner,rar:c.rar||'common',level:cardLevel(c),xp:num(c.xp),lifetimeXp:num(c.lifetimeXp),power:cardPower(c),wins:num(c.wins),mvpCount:num(c.mvpCount),prestige:cardPower(c)*num(RARITY_WEIGHT[c.rar]||1)+cardLevel(c)*4+Math.sqrt(num(c.xp)+num(c.lifetimeXp))*3+num(c.wins)*2+num(c.mvpCount)*8})).sort((a,b)=>b.prestige-a.prestige);
    const topStrength=ranked.slice(0,5).reduce((s,c,i)=>s+c.prestige/(i+1),0);
    const activity=Math.sqrt(xp24[id])*8+Math.sqrt(xp7[id])*2;
    const diversity=owners.size*12+activeOwners[id].size*10;
    const breadth=Math.min(80,activeCards.length*4+owned.length*.5);
    const success=Math.min(100,wins*1.5+mvps*8+(battles?Math.round((wins/battles)*30):0));
    const prestigeScore=Math.round(topStrength*.22+activity+diversity+breadth+success);
    const multiplier=Number(clamp(.75+prestigeScore/220,.75,3).toFixed(2));
    const base=num(BASE_PRICES[id]||10),anchor=Number((base*multiplier).toFixed(2));
    return{id,name:USERS.find(u=>u.id===id)?.displayName||id,base,currentPrice:mPrice[id]||base,prestigeScore,multiplier,anchorPreview:anchor,totalCards:owned.length,activeCards:activeCards.length,owners:owners.size,activeOwners:activeOwners[id].size,recentXp24h:Math.round(xp24[id]),recentXp7d:Math.round(xp7[id]),wins,mvps,battles,winRate:battles?Math.round((wins/battles)*100):0,topCards:ranked.slice(0,5)};
  }).sort((a,b)=>b.prestigeScore-a.prestigeScore);
}
export async function onRequestGet({request,env}){try{let block=await adminOnly(request,env);if(block)return block;await ensureGameSchema(env);
let usersRows=await env.DB.prepare('SELECT id,display_name,initials,color,pin_hash FROM users ORDER BY id').all();
let wallets=await env.DB.prepare('SELECT user_id,commune_cash FROM wallets').all();
let balances=await env.DB.prepare('SELECT user_id,token_type,balance FROM token_balances').all();
let cardsRows=await env.DB.prepare('SELECT id,owner_user_id,character_id,card_json,created_at,updated_at FROM cards ORDER BY created_at DESC').all();
let markets=await env.DB.prepare('SELECT token_type,price,updated_at FROM market_prices').all();
let templates=await env.DB.prepare('SELECT * FROM enemy_card_templates ORDER BY enabled DESC,enemy_type,rarity,title').all();
let xp24Rows=await env.DB.prepare("SELECT character_id, SUM(xp) total_xp FROM card_xp_events WHERE created_at >= datetime('now','-24 hours') GROUP BY character_id").all();
let xp7Rows=await env.DB.prepare("SELECT character_id, owner_user_id, SUM(xp) total_xp FROM card_xp_events WHERE created_at >= datetime('now','-7 days') GROUP BY character_id, owner_user_id").all();
let walletMap=new Map((wallets.results||[]).map(r=>[r.user_id,Number(r.commune_cash||0)]));
let tokenMap=new Map();for(let r of balances.results||[]){let m=tokenMap.get(r.user_id)||{};m[r.token_type]=Number(r.balance||0);tokenMap.set(r.user_id,m)}
let cardCount=new Map();let cards=[];for(let r of cardsRows.results||[]){let c=safeParse(r.card_json)||{};cardCount.set(r.owner_user_id,(cardCount.get(r.owner_user_id)||0)+1);cards.push({...c,id:r.id,owner:c.owner||r.owner_user_id,cid:c.cid||r.character_id,createdAt:r.created_at,updatedAt:r.updated_at})}
let users=(usersRows.results||[]).map(u=>({id:u.id,displayName:u.display_name,initials:u.initials,color:u.color,pinSet:!!u.pin_hash,cash:walletMap.get(u.id)||0,tokens:Object.fromEntries(CHARACTER_IDS.map(id=>[id,(tokenMap.get(u.id)||{})[id]||0])),cardCount:cardCount.get(u.id)||0}));
let market=(markets.results||[]).map(m=>({id:m.token_type,price:Number(m.price||0),updatedAt:m.updated_at}));
let enemyTemplates=(templates.results||[]).map(templateRow);
let prestige=buildPrestige(cards,market,xp24Rows.results||[],xp7Rows.results||[]);
let stats={users:users.length,cards:cards.length,enemyTemplates:enemyTemplates.length,totalCash:users.reduce((s,u)=>s+u.cash,0),totalTokens:users.reduce((s,u)=>s+CHARACTER_IDS.reduce((t,id)=>t+Number(u.tokens[id]||0),0),0),highestMarket:market.slice().sort((a,b)=>b.price-a.price)[0]||null,topPrestige:prestige[0]||null};
return json({users,cards,market,enemyTemplates,prestige,characters:USERS,stats});
}catch(e){return json({error:e.message||'Failed to load admin data'},500)}}