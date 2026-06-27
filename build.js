const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'dist');
fs.mkdirSync(outDir, { recursive: true });

for (const file of ['index.html', 'app.js', '_headers', '_redirects']) {
  const source = path.join(__dirname, file);
  if (!fs.existsSync(source)) continue;
  const target = path.join(outDir, file);

  if (file === 'index.html') {
    let html = fs.readFileSync(source, 'utf8');
    html = html.replace(
      "let state=JSON.parse(localStorage.ctcg||'null')||",
      "let state=(()=>{try{return JSON.parse(localStorage.ctcg||'null')}catch(e){localStorage.removeItem('ctcg');return null}})()||"
    );
    fs.writeFileSync(target, html);
  } else {
    fs.copyFileSync(source, target);
  }
}

console.log('Build complete.');
