export const USERS=[['cydney','Cydney','CY','#f3c93f'],['sterling','Sterling','ST','#c4c5db'],['ryan','Ryan','RY','#a98cff'],['gabi','Gabi','GA','#8ccdff'],['cooper','Cooper','CO','#ff8f70'],['kenly','Kenly','KE','#73e1c2'],['ashley','Ashley','AS','#ff9ccf']].map(([id,displayName,initials,color])=>({id,displayName,initials,color}));
export const CHARACTER_IDS=USERS.map(u=>u.id);
const DEFAULT_PRICES={cydney:13.4,sterling:12.3,ryan:11.2,gabi:10.1,cooper:9,kenly:7.9,ashley:6.8};

export function json(data,status=200,extraHeaders={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extraHeaders}})}
export function validatePin(pin){return typeof pin==='string'&&/^\d{4}$/.test(pin)}
function toHex(buffer){return[...new Uint8Array(buffer)].map(b=>b.toString(16).padStart(2,'0')).join('')}
export async function hashPin(pin){const salt=crypto.randomUUID(),bytes=new TextEncoder().encode(`${salt}:${pin}`),digest=await crypto.subtle.digest('SHA-256',bytes);return`${salt}:${toHex(digest)}`}
export async function verifyPin(pin,storedHash){if(!validatePin(pin)||!storedHash||!storedHash.includes(':'))return false;const[salt,expected]=storedHash.split(':'),bytes=new TextEncoder().encode(`${salt}:${pin}`),digest=await crypto.subtle.digest('SHA-256',bytes);return toHex(digest)===expected}
function parseCookies(request){const cookie=request.headers.get('cookie')||'';return Object.fromEntries(cookie.split(';').map(part=>{const index=part.indexOf('=');if(index===-1)return['',''];return[part.slice(0,index).trim(),decodeURIComponent(part.slice(index+1).trim())]}).filter(([key])=>key))}
export function getSessionToken(request){return parseCookies(request).ctcg_session||''}
export function sessionCookie(token,maxAge=60*60*24*30){return`ctcg_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`}
export function clearSessionCookie(){return'ctcg_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'}

export async function ensureGameSchema(env){
  const ddl=[
    'CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, display_name TEXT NOT NULL, initials TEXT NOT NULL, color TEXT NOT NULL, pin_hash TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)',
    'CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)',
    'CREATE TABLE IF NOT EXISTS wallets (user_id TEXT PRIMARY KEY, commune_cash REAL NOT NULL DEFAULT 5000, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)',
    'CREATE TABLE IF NOT EXISTS token_balances (user_id TEXT NOT NULL, token_type TEXT NOT NULL, balance REAL NOT NULL DEFAULT 0, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, token_type))',
    'CREATE TABLE IF NOT EXISTS cards (id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, character_id TEXT NOT NULL, card_json TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)',
    'CREATE TABLE IF NOT EXISTS player_meta (user_id TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)',
    'CREATE TABLE IF NOT EXISTS market_prices (token_type TEXT PRIMARY KEY, price REAL NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)'
  ];
  for(const sql of ddl){await env.DB.prepare(sql).run()}
  const statements=[];
  for(const user of USERS){
    statements.push(env.DB.prepare('INSERT OR IGNORE INTO users (id, display_name, initials, color) VALUES (?, ?, ?, ?)').bind(user.id,user.displayName,user.initials,user.color));
    statements.push(env.DB.prepare('INSERT OR IGNORE INTO wallets (user_id, commune_cash) VALUES (?, ?)').bind(user.id,5000));
    for(const tokenType of CHARACTER_IDS){statements.push(env.DB.prepare('INSERT OR IGNORE INTO token_balances (user_id, token_type, balance) VALUES (?, ?, ?)').bind(user.id,tokenType,tokenType===user.id?1000:100))}
  }
  for(const tokenType of CHARACTER_IDS){statements.push(env.DB.prepare('INSERT OR IGNORE INTO market_prices (token_type, price) VALUES (?, ?)').bind(tokenType,DEFAULT_PRICES[tokenType]))}
  if(statements.length)await env.DB.batch(statements)
}

export async function createSession(env,userId){const token=`${crypto.randomUUID()}-${crypto.randomUUID()}`,expiresAt=Math.floor(Date.now()/1000)+60*60*24*30;await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').bind(token,userId,expiresAt).run();return{token,expiresAt}}
export async function getSessionUser(request,env){const token=getSessionToken(request);if(!token)return null;const now=Math.floor(Date.now()/1000),row=await env.DB.prepare('SELECT users.id, users.display_name, users.initials, users.color, sessions.expires_at FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token = ?').bind(token).first();if(!row)return null;if(Number(row.expires_at)<now){await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();return null}return{id:row.id,displayName:row.display_name,initials:row.initials,color:row.color}}
export async function destroySession(request,env){const token=getSessionToken(request);if(token)await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()}
export function defaultPlayerMeta(userId){const name=USERS.find(u=>u.id===userId)?.displayName||'Cydney';return{page:'collection',sel:'cydney',draft:{cid:userId,title:`${name}, First Identity`,tag:'Kitchen',prev:'rare',roll:null,crop:{x:50,y:50,z:1}},log:[],q:'',lastCollectedAt:Date.now()}}
