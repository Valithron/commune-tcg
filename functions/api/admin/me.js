import{requireAdmin}from'../../_shared/admin.js';
import{json}from'../../_shared/game.js';
export async function onRequestGet({request,env}){try{let admin=await requireAdmin(request,env);return admin?json({admin:true}):json({admin:false},401)}catch(e){return json({error:e.message||'Admin check failed'},500)}}
