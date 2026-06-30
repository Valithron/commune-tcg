import {USERS,CHARACTER_IDS,ensureGameSchema,getSessionUser,json} from '../_shared/game.js';

const RARITIES=['common','uncommon','rare','legendary'];
const RARITY_BONUS={common:0,uncommon:12,rare:35,legendary:80};
const RARITY_WEIGHT={common:1,uncommon:1.6,rare:2.4,legendary:3.6};
function safeParse(v){try{return JSON.parse(v)}catch{return null}}
function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
function cardLevel(c){return num(c.level)||({common:1,uncommon:6,rare:11,legendary:21}[c.rar]||1)}
function cardPower(c){return num(c.grade)||num(c.p)+num(c.d)+num(c.s)+(RARITY_BONUS[c.rar]||0)}
function cleanCard(card,row,ownerMap){
  const c=card&&typeof card==='object'?card:{};
  const cid=CHARACTER_IDS.includes(c.cid)?c.cid:(CHARACTER_IDS.includes(row.character_id)?row.character_id:'cydney');
  const rar=RARITIES.includes(c.rar)?c.rar:'common';
  const owner=String(c.owner||row.owner_user_id||'');
  const ownerInfo=ownerMap.get(owner)||{};
  return {
    id:String(c.id||row.id),owner,cid,rar,
    title:String(c.title||'Untitled'),img:c.img||null,crop:c.crop||{x:50,y:50,z:1},
    p:num(c.p),d:num(c.d),s:num(c.s),xp:num(c.xp),lifetimeXp:num(c.lifetimeXp),level:num(c.level),
    battles:num(c.battles),wins:num(c.wins),mvpCount:num(c.mvpCount),grade:num(c.grade),
    _ownerName:ownerInfo.displayName||owner,_ownerInitials:ownerInfo.initials||'',_ownerColor:ownerInfo.color||'#f3c93f'
  };
}
function shuffle(list){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function publicCard(c){return{id:c.id,owner:c.owner,cid:c.cid,rar:c.rar,title:c.title,img:c.img,crop:c.crop,_ownerName:c._ownerName,_ownerInitials:c._ownerInitials,_ownerColor:c._ownerColor,battles:c.battles,wins:c.wins,mvpCount:c.mvpCount,xp:c.xp,lifetimeXp:c.lifetimeXp,level:c.level,grade:c.grade,p:c.p,d:c.d,s:c.s}}
function topPrestige(cards){
  let best=null;
  for(const id of CHARACTER_IDS){
    const owned=cards.filter(c=>c.cid===id);
    const ranked=owned.map(c=>({prestige:cardPower(c)*num(RARITY_WEIGHT[c.rar]||1)+cardLevel(c)*4+Math.sqrt(num(c.xp)+num(c.lifetimeXp))*3+num(c.wins)*2+num(c.mvpCount)*8})).sort((a,b)=>b.prestige-a.prestige);
    const topStrength=ranked.slice(0,5).reduce((s,c,i)=>s+c.prestige/(i+1),0);
    const activeCards=owned.filter(c=>num(c.xp)+num(c.lifetimeXp)>0).length;
    const wins=owned.reduce((s,c)=>s+num(c.wins),0),mvps=owned.reduce((s,c)=>s+num(c.mvpCount),0),battles=owned.reduce((s,c)=>s+num(c.battles),0);
    const breadth=Math.min(80,activeCards*4+owned.length*.5);
    const success=Math.min(100,wins*1.5+mvps*8+(battles?Math.round((wins/battles)*30):0));
    const score=Math.round(topStrength*.22+breadth+success);
    const info=USERS.find(u=>u.id===id)||{id,name:id,displayName:id,color:'#f3c93f'};
    if(!best||score>best.score)best={id,name:info.displayName,score,color:info.color,totalCards:owned.length};
  }
  return best||{id:'commune',name:'Commune',score:0,color:'#f3c93f',totalCards:0};
}

export async function onRequestGet({request,env}){
  try{
    await ensureGameSchema(env);
    const user=await getSessionUser(request,env);
    if(!user)return json({error:'Not logged in'},401);
    const ownerMap=new Map(USERS.map(u=>[u.id,u]));
    const rows=await env.DB.prepare('SELECT id,owner_user_id,character_id,card_json,created_at FROM cards ORDER BY created_at DESC').all();
    const cards=(rows.results||[]).map(row=>{const parsed=safeParse(row.card_json);return parsed?cleanCard(parsed,row,ownerMap):null}).filter(Boolean);
    const imageCards=cards.filter(c=>c.img);
    const backgroundPool=imageCards.length>=12?imageCards:cards;
    const featuredPool=cards.length?cards:backgroundPool;
    const mobilePool=(imageCards.length?imageCards:cards).slice(0,10);
    const battleAppearances=cards.reduce((s,c)=>s+num(c.battles),0);
    const stats={
      totalCardsMinted:cards.length,
      totalBattlesFought:Math.round(battleAppearances/3),
      topPrestigeCharacter:topPrestige(cards)
    };
    return json({
      user,
      stats,
      backgroundCards:shuffle(backgroundPool).slice(0,48).map(publicCard),
      mobileBackgroundCards:mobilePool.map(publicCard),
      featuredCards:shuffle(featuredPool).slice(0,8).map(publicCard)
    });
  }catch(e){
    return json({error:e.message||'Failed to load home data'},500);
  }
}
