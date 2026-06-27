import{adminOnly}from'../../_shared/admin.js';
import{CHARACTER_IDS,USERS,json}from'../../_shared/game.js';
function safeParse(v){try{return JSON.parse(v)}catch{return null}}
export async function onRequestGet({request,env}){try{let block=await adminOnly(request,env);if(block)return block;
let usersRows=await env.DB.prepare('SELECT id,display_name,initials,color,pin_hash FROM users ORDER BY id').all();
let wallets=await env.DB.prepare('SELECT user_id,commune_cash FROM wallets').all();
let balances=await env.DB.prepare('SELECT user_id,token_type,balance FROM token_balances').all();
let cardsRows=await env.DB.prepare('SELECT id,owner_user_id,character_id,card_json,created_at,updated_at FROM cards ORDER BY created_at DESC').all();
let markets=await env.DB.prepare('SELECT token_type,price,updated_at FROM market_prices').all();
let walletMap=new Map((wallets.results||[]).map(r=>[r.user_id,Number(r.commune_cash||0)]));
let tokenMap=new Map();for(let r of balances.results||[]){let m=tokenMap.get(r.user_id)||{};m[r.token_type]=Number(r.balance||0);tokenMap.set(r.user_id,m)}
let cardCount=new Map();let cards=[];for(let r of cardsRows.results||[]){let c=safeParse(r.card_json)||{};cardCount.set(r.owner_user_id,(cardCount.get(r.owner_user_id)||0)+1);cards.push({...c,id:r.id,owner:c.owner||r.owner_user_id,cid:c.cid||r.character_id,createdAt:r.created_at,updatedAt:r.updated_at})}
let users=(usersRows.results||[]).map(u=>({id:u.id,displayName:u.display_name,initials:u.initials,color:u.color,pinSet:!!u.pin_hash,cash:walletMap.get(u.id)||0,tokens:Object.fromEntries(CHARACTER_IDS.map(id=>[id,(tokenMap.get(u.id)||{})[id]||0])),cardCount:cardCount.get(u.id)||0}));
let market=(markets.results||[]).map(m=>({id:m.token_type,price:Number(m.price||0),updatedAt:m.updated_at}));
let stats={users:users.length,cards:cards.length,totalCash:users.reduce((s,u)=>s+u.cash,0),totalTokens:users.reduce((s,u)=>s+CHARACTER_IDS.reduce((t,id)=>t+Number(u.tokens[id]||0),0),0),highestMarket:market.slice().sort((a,b)=>b.price-a.price)[0]||null};
return json({users,cards,market,characters:USERS,stats});
}catch(e){return json({error:e.message||'Failed to load admin data'},500)}}
