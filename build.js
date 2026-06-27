const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'dist');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of ['index.html', '_headers', '_redirects']) {
  const source = path.join(__dirname, file);
  if (!fs.existsSync(source)) continue;

  if (file === 'index.html') {
    const html = fs.readFileSync(source, 'utf8')
      .replace(
        '.frame{min-height:100vh;border:10px solid #aeb6c8;border-radius:34px;overflow:hidden;background:#0f1224}',
        '.frame{min-height:100vh;overflow:hidden;background:#0f1224}'
      );
    fs.writeFileSync(path.join(outDir, file), html);
  } else {
    fs.copyFileSync(source, path.join(outDir, file));
  }
}

console.log('Commune TCG static build complete. Files copied to dist/.');
