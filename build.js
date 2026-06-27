const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'dist');
fs.mkdirSync(outDir, { recursive: true });

const files = ['index.html', 'app.css', 'app.js', 'crop-touch.css', 'crop-touch.js', 'collection-mobile.css', '_headers', '_redirects'];
for (const file of files) {
  const source = path.join(__dirname, file);
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, path.join(outDir, file));
  }
}

console.log('Build complete.');
