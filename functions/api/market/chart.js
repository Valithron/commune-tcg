import{CHARACTER_IDS,ensureGameSchema,getSessionUser,json}from'../../_shared/game.js';
async function ensureChartTable(env){
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS market_price_history (id INTEGER PRIMARY KEY, token_type TEXT NOT NULL, price REAL NOT NULL, source TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_market_history_token_time ON market_price_history(token_type,created_at)').run();
}
export async function onRequestGet({request,env}){
  try{
    await ensureGameSchema(env);
    await ensureChartTable(env);
    const user=await getSessionUser(request,env);
    if(!user)return json({error:'Not logged in'},401);
    const rows=await env.DB.prepare("SELECT token_type,price,source,created_at FROM market_price_history WHERE created_at >= datetime('now','-24 hours') ORDER BY created_at ASC,id ASC").all();
    const current=await env.DB.prepare('SELECT token_type,price,updated_at FROM market_prices').all();
    const out=Object.fromEntries(CHARACTER_IDS.map(id=>[id,[]]));
    for(const r of rows.results||[]){if(out[r.token_type])out[r.token_type].push({price:Number(r.price||0),createdAt:r.created_at,source:r.source||'history'})}
    for(const r of current.results||[]){if(out[r.token_type]&&!out[r.token_type].length)out[r.token_type].push({price:Number(r.price||0),createdAt:r.updated_at,source:'current'})}
    return json({ok:true,hours:24,history:out});
  }catch(e){return json({error:e.message||'Chart failed'},500)}
}
