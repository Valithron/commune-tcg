let mintPasteReady=false;
function isImageUploadFile(file){return file&&/^image\/(png|jpe?g|webp|gif|bmp)$/i.test(file.type||'')}
function firstImageFileFromList(list){return Array.from(list||[]).find(isImageUploadFile)||null}
async function useMintImageFile(file,source='upload'){
  if(!isImageUploadFile(file)){alert('Drop or paste a PNG, JPG, WEBP, GIF, or BMP image.');return}
  try{
    img=await resizeImageFile(file);
    state.draft.crop={x:50,y:50,z:1};
    render();
    setTimeout(()=>{let box=document.querySelector('.upload');if(box){box.classList.add('uploadFlash');setTimeout(()=>box.classList.remove('uploadFlash'),700)}},30);
  }catch(err){alert(err.message||`Image ${source} failed`)}
}
function setupMintUploadEnhancements(){
  if(state.page!=='mint')return;
  const box=document.querySelector('.upload');
  const input=document.getElementById('up');
  if(!box||box.dataset.dropPasteReady)return;
  box.dataset.dropPasteReady='1';
  box.classList.add('dropPasteUpload');
  if(!box.querySelector('.dropPasteHint')){
    const hint=document.createElement('div');
    hint.className='dropPasteHint';
    hint.textContent='Click, drag and drop, or paste an image here.';
    box.appendChild(hint);
  }
  ['dragenter','dragover'].forEach(type=>box.addEventListener(type,e=>{
    const file=firstImageFileFromList(e.dataTransfer?.items)||firstImageFileFromList(e.dataTransfer?.files);
    if(file||type==='dragover'){
      e.preventDefault();
      e.stopPropagation();
      box.classList.add('dragOver');
      if(e.dataTransfer)e.dataTransfer.dropEffect='copy';
    }
  }));
  ['dragleave','dragend'].forEach(type=>box.addEventListener(type,e=>{
    e.preventDefault();
    e.stopPropagation();
    box.classList.remove('dragOver');
  }));
  box.addEventListener('drop',e=>{
    e.preventDefault();
    e.stopPropagation();
    box.classList.remove('dragOver');
    const file=firstImageFileFromList(e.dataTransfer?.files);
    if(file)useMintImageFile(file,'drop');
  });
  if(input&&!input.dataset.enhancedPickerReady){
    input.dataset.enhancedPickerReady='1';
    input.addEventListener('change',e=>{
      const file=e.target.files&&e.target.files[0];
      if(file)useMintImageFile(file,'upload');
    },true);
  }
}
function setupMintPasteListener(){
  if(mintPasteReady)return;
  mintPasteReady=true;
  document.addEventListener('paste',e=>{
    if(state.page!=='mint')return;
    const items=Array.from(e.clipboardData?.items||[]);
    const fileItem=items.find(item=>item.kind==='file'&&/^image\//i.test(item.type||''));
    const file=fileItem?.getAsFile?.();
    if(!file)return;
    e.preventDefault();
    useMintImageFile(file,'paste');
  });
}
function injectMintUploadEnhanceStyles(){
  if(document.getElementById('ctcgMintUploadEnhanceStyles'))return;
  const style=document.createElement('style');
  style.id='ctcgMintUploadEnhanceStyles';
  style.textContent=`
.upload.dropPasteUpload{position:relative;outline:1px dashed rgba(255,255,255,.18);outline-offset:-8px;transition:outline-color .16s ease,box-shadow .16s ease,filter .16s ease}.upload.dropPasteUpload.dragOver{outline-color:#f3c93f;box-shadow:0 0 0 2px rgba(243,201,63,.25),0 0 34px rgba(243,201,63,.22);filter:brightness(1.08)}.upload.dropPasteUpload.dragOver:after{content:'Drop image to use it';position:absolute;inset:12px;border-radius:16px;background:rgba(8,12,24,.74);display:grid;place-items:center;color:#f3c93f;font:900 1rem Sora,Inter,sans-serif;z-index:5;pointer-events:none}.dropPasteHint{position:absolute;left:12px;right:12px;bottom:10px;text-align:center;color:#aeb2cc;font:800 .68rem 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.04em;pointer-events:none;text-shadow:0 1px 2px #000}.upload.dropPasteUpload img+.dropPasteHint{background:rgba(5,8,16,.65);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:5px 8px}.upload.uploadFlash{animation:uploadFlash .7s ease}@keyframes uploadFlash{0%{box-shadow:0 0 0 0 rgba(53,214,197,.8)}100%{box-shadow:0 0 0 18px rgba(53,214,197,0)}}
`;
  document.head.appendChild(style);
}
const mintUploadOldBind=bind;
bind=function(){
  mintUploadOldBind();
  injectMintUploadEnhanceStyles();
  setupMintPasteListener();
  setupMintUploadEnhancements();
};
