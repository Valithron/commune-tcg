const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'dist');
fs.mkdirSync(outDir, { recursive: true });

const files = ['index.html', 'app.css', 'app.js', 'character-color-sync.js', 'ux-refresh-guard.js', 'crop-touch.css', 'crop-touch.js', 'title-limit.js', 'battle-end.js', 'mint-upload-enhance.js', 'mint-flavor.js', 'mint-success-redirect.js', 'ai-battle-squad.js', 'ai-enemy-type.js', 'market-sparklines.js', 'market-smooth-refresh.js', 'battle-history.js', 'card-xp.js', 'battle-rules.js', 'battle-flow.js', 'battle-team-fix.js', 'battle-fullscreen.js', 'battle-no-flavor.js', 'battle-ko-fix.js', 'battle-results-polish.js', 'battle-setup-fix.js', 'ascension-ceremony.js', 'ascension-mobile-click-fix.js', 'ascension-failsafe.js', 'mobile-collection-fix.js', 'vaults.js', 'card-polish-fix.js', 'card-face-redesign.js', 'card-title-stability.js', 'card-badge-compact.js', 'card-title-fit-final.js', 'no-sidebar-pages.js', 'home-page.js', 'collection-desktop-layout.css', 'collection-mobile.css', 'ticker-fix.css', '_headers', '_redirects'];
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