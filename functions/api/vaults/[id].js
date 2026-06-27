import{CHARACTER_IDS,USERS,ensureGameSchema,getSessionUser,json}from'../../_shared/game.js';

function safeCard(row){
  const card=JSON.parse(row.card_json||'{}');
  return{...card,owner:row.owner_user_id||card.owner||null,cid:row.character_id||card.cid};
}

export async function onRequestGet({request,params,env}){
  try{
    await ensureGameSchema(env);
    const viewer=await getSessionUser(request,env);
    if(!viewer)return json({error:'Not logged in'},401);
    const id=String(params.id||'').toLowerCase();
    if(!CHARACTER_IDS.includes(id))return json({error:'Unknown vault'},404);
    const owner=USERS.find(u=>u.id===id);
    const rows=await env.DB.prepare('SELECT id, owner_user_id, character_id, card_json, created_at, updated_at FROM cards WHERE owner_user_id=? ORDER BY created_at DESC').bind(id).all();
    const cards=(rows.results||[]).map(safeCard);
    const passive=cards.filter(c=>c.equipped).reduce((s,c)=>s+Number(c.passive||0),0);
    const equipped=cards.filter(c=>c.equipped).length;
    const counts={total:cards.length,equipped,passive,byRarity:{legendary:0,rare:0,uncommon:0,common:0}};
    for(const c of cards){if(counts.byRarity[c.rar]!==undefined)counts.byRarity[c.rar]++}
    return json({ok:true,viewer:{id:viewer.id,displayName:viewer.displayName},owner,cards,counts});
  }catch(e){return json({error:e.message||'Failed to load vault'},500)}
}
