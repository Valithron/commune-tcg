import{ensureGameSchema,json}from'./game.js';
const COOKIE='ctcg_admin_session';
function cookies(request){let raw=request.headers.get('cookie')||'';return Object.fromEntries(raw.split(';').map(p=>{let i=p.indexOf('=');return i<0?['','']:[p.slice(0,i).trim(),decodeURIComponent(p.slice(i+1).trim())]}).filter(x=>x[0]))}
function setCookie(token,age=60*60*8){return`${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`}
export function clearAdminCookie(){return`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`}
export async function ensureAdminSchema(env){await ensureGameSchema(env);await env.DB.prepare('CREATE TABLE IF NOT EXISTS admin_sessions (token TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)').run()}
export async function createAdminSession(env){let token=`${crypto.randomUUID()}-${crypto.randomUUID()}`,expires=Math.floor(Date.now()/1000)+60*60*8;await env.DB.prepare('INSERT INTO admin_sessions (token,expires_at) VALUES (?,?)').bind(token,expires).run();return{token,cookie:setCookie(token),expires}}
export async function destroyAdminSession(request,env){let token=cookies(request)[COOKIE];if(token)await env.DB.prepare('DELETE FROM admin_sessions WHERE token=?').bind(token).run()}
export async function requireAdmin(request,env){await ensureAdminSchema(env);let token=cookies(request)[COOKIE];if(!token)return null;let row=await env.DB.prepare('SELECT expires_at FROM admin_sessions WHERE token=?').bind(token).first();let now=Math.floor(Date.now()/1000);if(!row||Number(row.expires_at)<now){if(token)await env.DB.prepare('DELETE FROM admin_sessions WHERE token=?').bind(token).run();return null}return{ok:true}}
export async function adminOnly(request,env){let a=await requireAdmin(request,env);if(!a)return json({error:'Admin login required'},401);return null}
