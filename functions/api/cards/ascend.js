import{CHARACTER_IDS,ensureGameSchema,getSessionUser,json}from'../../_shared/game.js';

const RARITIES=['common','uncommon','rare','legendary'];
const RARITY_BONUS={common:0,uncommon:12,rare:35,legendary:80};
const STAGE={
  common:{floor:1,cap:5,thresholds:[0,80,180,320,500],next:'uncommon',cost:250,statBonus:5,passiveBonus:.05},
  uncommon:{floor:6,cap:10,thresholds:[0,300,650,1050,1500],next:'rare',cost:1000,statBonus:10,passiveBonus:.12},
  rare:{floor:11,cap:20,thresholds:[0,500,1100,1800,2600,3600,4800,6200,7800,9500],next:'legendary',cost:3000,statBonus:18,passiveBonus:.25},
  legendary:{floor:21,cap:30,thresholds:[0,1000,2200,3600,5200,7000,9000,11200,13600,16200],next:null,cost:0,statBonus:0,passiveBonus:0}
};
function cleanNum(v,f=0){let n=Number(v);return Number.isFinite(n)?n:f}
function grade(c){return cleanNum(c.p)+cleanNum(c.d)+cleanNum(c.s)+(RARITY_BONUS[c.rar]||0)}
function progress(c){
  const rar=RARITIES.includes(String(c.rar))?String(c.rar):'common',s=STAGE[rar],xp=Math.max(0,cleanNum(c.xp,0));
  let plus=0;
  for(let i=1;i<s.thresholds.length;i++){if(xp>=s.thresholds[i])plus=i;else break}
  const level=Math.min(s.cap,s.floor+plus),need=s.next?s.thresholds[s.thresholds.length-1]:null;
  return{rar,level,cap:s.cap,xp,need,ready:!!s.next&&level>=s.cap&&xp>=need,next:s.next,cost:s.cost,stage:s};
}
function addStats(card,points){
  let stats=['p','d','s'];
  for(let i=0;i<points;i++){
    stats.sort((a,b)=>cleanNum(card[a])-cleanNum(card[b])||a.localeCompare(b));
    card[stats[0]]=cleanNum(card[stats[0]])+1;
  }
}
export async function onRequestPost({request,env}){
  try{
    await ensureGameSchema(env);
    const user=await getSessionUser(request,env);
    if(!user)return json({error:'Not logged in'},401);
    const b=await request.json();
    const id=String(b.id||'');
    if(!id)return json({error:'Missing card id'},400);
    const row=await env.DB.prepare('SELECT card_json FROM cards WHERE id=? AND owner_user_id=?').bind(id,user.id).first();
    if(!row)return json({error:'Card not found in your vault'},404);
    let card=JSON.parse(row.card_json);
    if(!CHARACTER_IDS.includes(card.cid))return json({error:'Invalid card character'},400);
    const p=progress(card);
    if(!p.next)return json({error:'Legendary cards cannot ascend yet'},400);
    if(!p.ready)return json({error:`${card.title||'Card'} needs Level ${p.cap} and ${p.need} XP before ascending.`},400);
    const bal=await env.DB.prepare('SELECT balance FROM token_balances WHERE user_id=? AND token_type=?').bind(user.id,card.cid).first();
    if(cleanNum(bal?.balance,0)<p.cost)return json({error:`Not enough ${card.cid} tokens. Ascension costs ${p.cost}.`},400);
    const oldRar=card.rar,oldXp=cleanNum(card.xp,0),oldLevel=p.level;
    card={...card,rar:p.next,xp:0,lifetimeXp:cleanNum(card.lifetimeXp,0)+oldXp,level:STAGE[p.next].floor,lastAscendedAt:new Date().toISOString(),ascensions:[...(Array.isArray(card.ascensions)?card.ascensions:[]),{from:oldRar,to:p.next,xp:oldXp,level:oldLevel,cost:p.cost,at:new Date().toISOString()}]};
    addStats(card,p.stage.statBonus);
    card.passive=Number((cleanNum(card.passive,0)+p.stage.passiveBonus).toFixed(2));
    card.grade=grade(card);
    await env.DB.batch([
      env.DB.prepare("UPDATE token_balances SET balance=balance-?,updated_at=datetime('now') WHERE user_id=? AND token_type=?").bind(p.cost,user.id,card.cid),
      env.DB.prepare("UPDATE cards SET card_json=?,updated_at=datetime('now') WHERE id=?").bind(JSON.stringify(card),card.id),
      env.DB.prepare("INSERT INTO card_xp_events (id,card_id,owner_user_id,character_id,xp,reason,battle_id,created_at) VALUES (?,?,?,?,?,?,?,datetime('now'))").bind(crypto.randomUUID(),card.id,user.id,card.cid,0,`Ascended ${card.title||'card'} from ${oldRar} to ${p.next} for ${p.cost} ${card.cid} tokens`,null)
    ]);
    return json({ok:true,card,cost:p.cost,from:oldRar,to:p.next});
  }catch(e){return json({error:e.message||'Ascension failed'},500)}
}
