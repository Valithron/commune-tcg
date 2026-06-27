import{clearAdminCookie,destroyAdminSession,ensureAdminSchema}from'../../_shared/admin.js';
import{json}from'../../_shared/game.js';
export async function onRequestPost({request,env}){try{await ensureAdminSchema(env);await destroyAdminSession(request,env);return json({ok:true},200,{'set-cookie':clearAdminCookie()})}catch(e){return json({ok:true},200,{'set-cookie':clearAdminCookie()})}}
