const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'dist');
fs.mkdirSync(outDir, { recursive: true });

const files = ['index.html', 'app.css', 'app.js', 'crop-touch.css', 'crop-touch.js', 'title-limit.js', 'battle-end.js', 'mint-upload-enhance.js', 'ai-battle-squad.js', 'ai-enemy-type.js', 'mobile-collection-fix.js', 'collection-mobile.css', 'ticker-fix.css', '_headers', '_redirects'];
for (const file of files) {
  const source = path.join(__dirname, file);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(outDir, file));
}

const adminSource = path.join(__dirname, 'admin');
const adminTarget = path.join(outDir, 'admin');
if (fs.existsSync(adminSource)) {
  fs.rmSync(adminTarget, { recursive: true, force: true });
  fs.cpSync(adminSource, adminTarget, { recursive: true });
}

console.log('Build complete.' );