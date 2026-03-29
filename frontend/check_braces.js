const fs = require('fs');
const lines = fs.readFileSync('app.js','utf8').split('\n');
let depth = 0, maxDepth = 0, maxLine = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (ch === '{') {
      depth++; if (depth > maxDepth) { maxDepth = depth; maxLine = i + 1; }
    } else if (ch === '}') {
      depth--; }
  }
  if (depth < 0) {
    console.log('negative', i + 1);
    depth = 0;
  }
}
console.log('final', depth, 'max', maxDepth, 'maxline', maxLine);
