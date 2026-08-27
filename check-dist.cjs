const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  console.log("dist folder exists.");
  const index = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  console.log("index.html size:", index.length);
  // Check for broken links in index.html
  const cssMatches = index.match(/href="([^"]+\.css)"/g);
  const jsMatches = index.match(/src="([^"]+\.js)"/g);
  
  if (cssMatches) {
    cssMatches.forEach(m => {
      const p = m.replace('href="', '').replace('"', '');
      const fullPath = path.join(distDir, p.replace(/^\/FrosterGym/, ''));
      console.log(`Checking CSS ${p}: ${fs.existsSync(fullPath)}`);
    });
  }
  if (jsMatches) {
    jsMatches.forEach(m => {
      const p = m.replace('src="', '').replace('"', '');
      const fullPath = path.join(distDir, p.replace(/^\/FrosterGym/, ''));
      console.log(`Checking JS ${p}: ${fs.existsSync(fullPath)}`);
    });
  }
} else {
  console.log("dist folder NOT found.");
}
