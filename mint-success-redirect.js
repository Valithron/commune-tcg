function mintedCardIdFromResponse(result){return result&&result.card&&result.card.id?result.card.id:null}
function mintedCardCidFromResponse(result,draft){return result&&result.card&&result.card.cid?result.card.cid:(draft&&draft.cid?draft.cid:'all')}
async function showMintResultInCollection(result,draft){
  const newId=mintedCardIdFromResponse(result);
  const cid=mintedCardCidFromResponse(result,draft);
  img=null;
  clearTimeout(timer);
  let fresh=null;
  try{fresh=await api('/api/state')}catch(e){fresh=null}
  if(fresh){user=fresh.user||user;state={...state,...fresh.state}}
  state.page='collection';
  state.sel=cid;
  cache();
  render();
  try{await api('/api/state',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(state)})}catch(e){}
  if(newId&&typeof highlightMintedCard==='function')highlightMintedCard(newId);
}
mintCard=async function(){
  let mintBtn=document.getElementById('mintBtn');
  try{
    if(typeof ensureDraftFlavor==='function')ensureDraftFlavor();
    let d=state.draft,art=null,key=null;
    if(mintBtn){mintBtn.disabled=true;mintBtn.textContent='Minting...'}
    if(img){let up=await api('/api/upload',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({dataUrl:img,cid:d.cid,id:crypto.randomUUID()})});art=up.url;key=up.key}
    let flavor=typeof cleanFlavorText==='function'?cleanFlavorText(d.effect||d.flavorText):String(d.effect||d.flavorText||'').slice(0,120);
    let minted=await api('/api/cards/mint',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({cid:d.cid,title:d.title,tag:d.tag,effect:flavor,flavorText:flavor,img:art,imageKey:key,crop:cropOf(d)})});
    if(typeof showMintToast==='function')showMintToast('Success! Card minted.');
    await showMintResultInCollection(minted,d);
  }catch(e){
    if(mintBtn){mintBtn.disabled=false;mintBtn.textContent='Mint Card'}
    alert(e.message||'Mint failed')
  }
};
