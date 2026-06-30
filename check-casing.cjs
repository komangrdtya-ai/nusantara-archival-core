const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src').filter(f => f.endsWith('.astro') || f.endsWith('.js'));
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const dir = path.dirname(file);
      // Resolve path ignoring extension if it's missing (though Astro imports usually have extensions for .astro)
      const absoluteImportPath = path.resolve(dir, importPath);
      // In windows, existsSync is case-insensitive, so it won't catch case mismatch.
      // We must check if the exact basename exists in the readdir of the dirname.
      const targetDir = path.dirname(absoluteImportPath);
      const targetBase = path.basename(absoluteImportPath);
      
      if (fs.existsSync(targetDir)) {
          const actualFiles = fs.readdirSync(targetDir);
          if (!actualFiles.includes(targetBase)) {
              console.log(`CASE MISMATCH in ${file}: Imported '${importPath}' but exact file '${targetBase}' not found!`);
          }
      }
    }
  }
});
console.log('Check complete');
