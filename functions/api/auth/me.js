import{ensureGameSchema,getSessionUser,json}from'../../_shared/game.js';
export async function onRequestGet({request,env}){try{await ensureGameSchema(env);let user=await getSessionUser(request,env);return user?json({user}):json({user:null},401)}catch(e){return json({error:e.message||'Request failed'},500)}}
