import{clearSessionCookie,destroySession,ensureGameSchema,json}from'../../_shared/game.js';
export async function onRequestPost({request,env}){try{await ensureGameSchema(env);await destroySession(request,env);return json({ok:true},200,{'set-cookie':clearSessionCookie()})}catch(e){return json({error:e.message||'Request failed'},500,{'set-cookie':clearSessionCookie()})}}
