const fs = require('fs');
const path = require('path');

const srcDir = '/Users/seojun/.gemini/antigravity/brain/6f07c709-408b-4bdc-8dbb-3a26154b59e5';
const destDir = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  if (file.startsWith('trend_drink_') && file.endsWith('.png')) {
    const srcPath = path.join(srcDir, file);
    // Keep it simple and predictable for Next.js 
    // trend_drink_matcha_espresso_12312.png -> trend_drink_matcha_espresso.png
    const cleanName = file.replace(/_\d+\.png$/, '.png');
    const destPath = path.join(destDir, cleanName);
    
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} -> ${cleanName}`);
  }
});
