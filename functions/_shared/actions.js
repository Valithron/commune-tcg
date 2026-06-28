import{CHARACTER_IDS,USERS}from'./game.js';
export const R={common:['Common','C',62,14,34,1,2,'#9da2b7'],uncommon:['Uncommon','U',25,26,48,2,3,'#35d6c5'],rare:['Rare','R',10,40,68,3,5,'#f3c93f'],legendary:['Legendary','L',3,62,96,5,8,'#b178ff']};
export const E={cydney:'Silent Judgment',sterling:'Scope Creep',ryan:'Rules Exploit',gabi:'Baked Goods Morale',cooper:'Wrong Quest Momentum',kenly:'Precision Strike',ashley:'Softball Cannon'};
export const STR={cydney:['sterling','cooper','ryan'],sterling:['gabi','ashley','cooper'],ryan:['sterling','cooper','gabi'],gabi:['cydney','ashley','kenly'],cooper:['gabi','kenly','ashley'],kenly:['sterling','ryan','cydney'],ashley:['cydney','ryan','kenly']};
export const WEAK={cydney:['gabi','kenly','ashley'],sterling:['cydney','ryan','kenly'],ryan:['cydney','ashley','kenly'],gabi:['sterling','ryan','cooper'],cooper:['cydney','sterling','ryan'],kenly:['gabi','cooper','ashley'],ashley:['sterling','gabi','cooper']};
export function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a}
export function pick(a){return a[Math.floor(Math.random()*a.length)]}
export function rarity(){let t=Object.values(R).reduce((s,r)=>s+r[2],0),x=Math.random()*t;for(const k in R){x-=R[k][2];if(x<=0)return k}return'common'}
export function displayName(id){return USERS.find(u=>u.id===id)?.displayName||'Cydney'}
export function title(id){let m={cydney:'Kitchen Authority',sterling:'Scope Creep Prophet',ryan:'Belligerent Min-Maxer',gabi:'Sourdough Spirit',cooper:'Wrong Quest Champion',kenly:'Decisive Comment',ashley:'Softball Cannon'};return displayName(id)+', '+(m[id]||'Identity')}
export function makeCard(o={}){let cid=CHARACTER_IDS.includes(o.cid)?o.cid:'cydney',rar=R[o.rar]?o.rar:rarity(),r=R[rar],p=rnd(r[3],r[4]),d=rnd(r[3],r[4]),s=rnd(r[3],r[4]),passive=rnd(r[5],r[6]),effect=String(o.effect||o.flavorText||E[cid]).slice(0,120);return{id:crypto.randomUUID(),owner:o.owner||null,cid,title:String(o.title||title(cid)).slice(0,25),tag:String(o.tag||'Battle').slice(0,40),rar,p,d,s,passive,effect,grade:p+d+s+(rar==='legendary'?80:rar==='rare'?35:rar==='uncommon'?12:0),img:o.img||null,imageKey:o.imageKey||null,crop:o.crop||{x:50,y:50,z:1},equipped:false}}
export function score(c){return Number(c.p||0)+Number(c.d||0)+Number(c.s||0)}
export function mod(a,d){return(STR[a]||[]).includes(d)?1.25:((WEAK[a]||[]).includes(d)?0.75:1)}