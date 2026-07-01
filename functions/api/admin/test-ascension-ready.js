import{adminOnly}from'../../_shared/admin.js';
import{ensureGameSchema,json}from'../../_shared/game.js';

const OWNER='sterling';
const CID='sterling';
const TITLE='Test Ascension Ready';
const TAG='Ascension Test';
const RARITY='common';
const XP_READY_FOR_COMMON_ASCENSION=500;

function grade(card){return Number(card.p||0)+Number(card.d||0)+Number(card.s||0)}

export async function onRequestPost({request,env}){
  try{
    const block=await adminOnly(request,env);
    if(block)return block;
    await ensureGameSchema(env);

    const existing=await env.DB.prepare('SELECT id,card_json FROM cards WHERE owner_user_id=? AND character_id=?').bind(OWNER,CID).all();
    for(const row of existing.results||[]){
      try{
        const card=JSON.parse(row.card_json||'{}');
        if(card&&card.title===TITLE){
          return json({ok:true,created:false,message:'Test ascension card already exists.',card});
        }
      }catch(e){}
    }

    const id=crypto.randomUUID();
    const card={
      id,
      owner:OWNER,
      cid:CID,
      title:TITLE,
      tag:TAG,
      rar:RARITY,
      p:45,
      d:40,
      s:50,
      passive:0,
      effect:'Temporary test card for verifying the ascension flow.',
      img:null,
      imageKey:null,
      crop:{x:50,y:50,z:1},
      equipped:false,
      xp:XP_READY_FOR_COMMON_ASCENSION,
      level:5,
      lifetimeXp:0,
      battles:0,
      testCard:true,
      createdBy:'admin-test-ascension-ready'
    };
    card.grade=grade(card);

    await env.DB.prepare("INSERT INTO cards (id,owner_user_id,character_id,card_json,created_at,updated_at) VALUES (?,?,?,?,datetime('now'),datetime('now'))").bind(id,OWNER,CID,JSON.stringify(card)).run();
    return json({ok:true,created:true,message:'Created Sterling ascension-ready test card.',card});
  }catch(e){
    return json({error:e.message||'Failed to create test ascension card'},500);
  }
}
