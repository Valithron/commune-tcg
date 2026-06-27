const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'dist');
fs.mkdirSync(outDir, { recursive: true });

for (const file of ['index.html', 'app.js', '_headers', '_redirects']) {
  const source = path.join(__dirname, file);
  if (!fs.existsSync(source)) continue;
  fs.copyFileSync(source, path.join(outDir, file));
}

console.log('Build complete.');
