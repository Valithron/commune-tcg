const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'dist');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const marqueeCss = `
.strip{display:block;position:relative;overflow:hidden;padding:0;margin-bottom:30px;border:1px solid var(--line);border-radius:8px;background:rgba(23,26,45,.85)}
.strip:before,.strip:after{content:'';position:absolute;top:0;bottom:0;width:72px;z-index:2;pointer-events:none}
.strip:before{left:0;background:linear-gradient(90deg,var(--bg),transparent)}
.strip:after{right:0;background:linear-gradient(270deg,var(--bg),transparent)}
.tickerTrack{display:flex;width:max-content;animation:tokenTicker 42s linear infinite;will-change:transform}
.strip:hover .tickerTrack{animation-play-state:paused}
.tickerGroup{display:flex;gap:48px;flex:0 0 auto;padding:12px 48px 12px 14px}
.tickerGroup .tok{flex:0 0 190px}
@keyframes tokenTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){.tickerTrack{animation:none}.strip{overflow:auto}.strip:before,.strip:after{display:none}}
`;

const marqueeFunctions = `function tokHtml(c){return '<div class="tok"><span class="coin" style="--a:'+c.a+'">'+c.in+'</span><span>'+c.name+'</span><b>'+fmt(state.tokens[c.id])+'</b><small>+'+income(c.id)+'/m</small></div>'}
function strip(){let items=C.map(tokHtml).join('');return '<div class="strip"><div class="tickerTrack"><div class="tickerGroup">'+items+'</div><div class="tickerGroup" aria-hidden="true">'+items+'</div></div></div>'}
`;

for (const file of ['index.html', '_headers', '_redirects']) {
  const source = path.join(__dirname, file);
  if (!fs.existsSync(source)) continue;

  if (file === 'index.html') {
    let html = fs.readFileSync(source, 'utf8')
      .replace(
        '.frame{min-height:100vh;border:10px solid #aeb6c8;border-radius:34px;overflow:hidden;background:#0f1224}',
        '.frame{min-height:100vh;overflow:hidden;background:#0f1224}'
      )
      .replace('</style>', `${marqueeCss}</style>`);

    const stripStart = html.indexOf('function strip(){return');
    const stripEnd = html.indexOf('function cardHtml', stripStart);
    if (stripStart !== -1 && stripEnd !== -1) {
      html = html.slice(0, stripStart) + marqueeFunctions + html.slice(stripEnd);
    }

    fs.writeFileSync(path.join(outDir, file), html);
  } else {
    fs.copyFileSync(source, path.join(outDir, file));
  }
}

console.log('Commune TCG static build complete. Files copied to dist/.');
