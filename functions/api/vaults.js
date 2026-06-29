import {USERS,CHARACTER_IDS,ensureGameSchema,getSessionUser,json} from '../_shared/game.js';

const RARITIES=['common','uncommon','rare','legendary'];
function safeParse(v){try{return JSON.parse(v)}catch{return null}}
function cleanCard(card,row){
  const c=card&&typeof card==='object'?card:{};
  const cid=CHARACTER_IDS.includes(c.cid)?c.cid:(CHARACTER_IDS.includes(row.character_id)?row.character_id:'cydney');
  const rar=RARITIES.includes(c.rar)?c.rar:'common';
  return {
    ...c,
    id:String(c.id||row.id),
    owner:String(c.owner||row.owner_user_id),
    cid,
    rar,
    title:String(c.title||'Untitled'),
    tag:String(c.tag||''),
    effect:String(c.effect||c.flavorText||''),
    flavorText:String(c.flavorText||c.effect||''),
    p:Number(c.p||0),
    d:Number(c.d||0),
    s:Number(c.s||0),
    passive:Number(c.passive||0),
    xp:Number(c.xp||0),
    lifetimeXp:Number(c.lifetimeXp||0),
    level:Number(c.level||0),
    battles:Number(c.battles||0),
    wins:Number(c.wins||0),
    mvpCount:Number(c.mvpCount||0),
    grade:Number(c.grade||0),
    equipped:!!c.equipped
  };
}

export async function onRequestGet({request,env}){
  try{
    await ensureGameSchema(env);
    const user=await getSessionUser(request,env);
    if(!user)return json({error:'Not logged in'},401);
    const rows=await env.DB.prepare('SELECT id,owner_user_id,character_id,card_json,created_at,updated_at FROM cards ORDER BY created_at DESC').all();
    const byOwner=Object.fromEntries(USERS.map(u=>[u.id,[]]));
    for(const row of rows.results||[]){
      if(!byOwner[row.owner_user_id])byOwner[row.owner_user_id]=[];
      const parsed=safeParse(row.card_json);
      if(parsed)byOwner[row.owner_user_id].push(cleanCard(parsed,row));
    }
    const vaults=USERS.map(u=>({id:u.id,displayName:u.displayName,initials:u.initials,color:u.color,isCurrent:u.id===user.id,cards:byOwner[u.id]||[]}));
    return json({user,vaults});
  }catch(e){
    return json({error:e.message||'Failed to load vaults'},500);
  }
}
