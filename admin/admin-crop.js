function installAdminCropTools(){
  if(window.__ctcgAdminCropInstalled)return;
  window.__ctcgAdminCropInstalled=true;
  function clamp(n,min,max){return Math.max(min,Math.min(max,Number(n)||0))}
  function cropOf(c){
    let r=c?.crop;
    if(typeof r==='string'){try{r=JSON.parse(r)}catch{r=null}}
    r=r&&typeof r==='object'?r:{};
    return{x:clamp(r.x??50,0,100),y:clamp(r.y??50,0,100),z:clamp(r.z??1,1,2.4)};
  }
  function cropStyleFromValues(x,y,z){
    return`object-position:${x}% ${y}%;transform:scale(${z});transform-origin:${x}% ${y}%`;
  }
  function currentCrop(){
    return{
      x:clamp(document.getElementById('f-cropX')?.value??50,0,100),
      y:clamp(document.getElementById('f-cropY')?.value??50,0,100),
      z:clamp((Number(document.getElementById('f-cropZ')?.value??100)/100),1,2.4)
    };
  }
  function updateCropPreview(){
    const img=document.getElementById('adminCropPreviewImg');
    const readout=document.getElementById('adminCropReadout');
    const r=currentCrop();
    if(img)img.setAttribute('style',cropStyleFromValues(r.x,r.y,r.z));
    if(readout)readout.textContent=`X ${Math.round(r.x)} · Y ${Math.round(r.y)} · Zoom ${Math.round(r.z*100)}%`;
  }
  const oldImageField=imageField;
  imageField=function(c={}){
    const r=cropOf(c),hasImg=!!c.img;
    return`<div class="field full adminCropField"><label>Image</label><div class="adminCropPreview ${hasImg?'hasImage':''}" id="adminCropPreview">${hasImg?`<img id="adminCropPreviewImg" src="${esc(c.img)}" style="${cropStyleFromValues(r.x,r.y,r.z)}">`:`<div class="adminCropEmpty" id="adminCropEmpty">Choose an image to preview crop</div>`}</div><input id="f-imgFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><small>Upload replaces the current image. Use the crop tools below before saving.</small><div class="adminCropControls"><label>Horizontal<input id="f-cropX" type="range" min="0" max="100" value="${r.x}"></label><label>Vertical<input id="f-cropY" type="range" min="0" max="100" value="${r.y}"></label><label>Zoom<input id="f-cropZ" type="range" min="100" max="240" value="${Math.round(r.z*100)}"></label><button class="btn" id="resetAdminCrop" type="button">Reset Crop</button></div><small id="adminCropReadout">X ${Math.round(r.x)} · Y ${Math.round(r.y)} · Zoom ${Math.round(r.z*100)}%</small></div>`;
  };
  const oldCardPayload=cardPayload;
  cardPayload=function(base={}){
    return{...oldCardPayload(base),crop:currentCrop()};
  };
  const oldEnemyPayload=enemyPayload;
  enemyPayload=function(base={}){
    return{...oldEnemyPayload(base),crop:currentCrop()};
  };
  function bindAdminCropControls(){
    const file=document.getElementById('f-imgFile');
    if(file&&!file.dataset.cropReady){
      file.dataset.cropReady='1';
      file.addEventListener('change',e=>{
        const f=e.target.files&&e.target.files[0];
        if(!f)return;
        const reader=new FileReader();
        reader.onload=()=>{
          const box=document.getElementById('adminCropPreview');
          if(!box)return;
          box.classList.add('hasImage');
          box.innerHTML=`<img id="adminCropPreviewImg" src="${reader.result}">`;
          updateCropPreview();
        };
        reader.readAsDataURL(f);
      });
    }
    ['f-cropX','f-cropY','f-cropZ'].forEach(id=>{
      const input=document.getElementById(id);
      if(input&&!input.dataset.cropReady){
        input.dataset.cropReady='1';
        input.addEventListener('input',updateCropPreview);
      }
    });
    const reset=document.getElementById('resetAdminCrop');
    if(reset&&!reset.dataset.cropReady){
      reset.dataset.cropReady='1';
      reset.addEventListener('click',e=>{
        e.preventDefault();
        const x=document.getElementById('f-cropX'),y=document.getElementById('f-cropY'),z=document.getElementById('f-cropZ');
        if(x)x.value=50;
        if(y)y.value=50;
        if(z)z.value=100;
        updateCropPreview();
      });
    }
    updateCropPreview();
  }
  function injectAdminCropStyles(){
    if(document.getElementById('ctcgAdminCropStyles'))return;
    const style=document.createElement('style');
    style.id='ctcgAdminCropStyles';
    style.textContent=`
.adminCropField{display:grid;gap:8px}.adminCropPreview{width:min(260px,100%);aspect-ratio:3/4;border:1px solid var(--line);border-radius:12px;background:#08111f;overflow:hidden;display:grid;place-items:center}.adminCropPreview img{width:100%;height:100%;object-fit:cover;display:block}.adminCropEmpty{color:var(--muted);font:900 .7rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.06em;text-align:center;padding:18px}.adminCropControls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) auto;gap:10px;align-items:end}.adminCropControls label{display:grid;gap:5px;color:var(--muted);font:900 .66rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.04em}.adminCropControls input[type='range']{width:100%}.adminCropControls .btn{height:38px;white-space:nowrap}@media(max-width:720px){.adminCropControls{grid-template-columns:1fr}.adminCropPreview{width:190px}}
`;
    document.head.appendChild(style);
  }
  const oldBind=bind;
  bind=function(){
    oldBind();
    injectAdminCropStyles();
    bindAdminCropControls();
  };
  injectAdminCropStyles();
  bindAdminCropControls();
}
installAdminCropTools();
