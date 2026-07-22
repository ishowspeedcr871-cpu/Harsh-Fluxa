const fs = require('fs');
const content = fs.readFileSync('prisma/schema.prisma', 'utf8');
const lines = content.split('\n');

let resultLines = [];
let i = 0;

while (i < lines.length) {
  let line = lines[i];
  if (line.startsWith('model ')) {
    resultLines.push(line);
    let modelLines = [];
    i++;
    while (i < lines.length && !lines[i].startsWith('}')) {
      modelLines.push(lines[i]);
      i++;
    }
    
    let fieldMap = new Map();
    let indexLines = [];
    for (let mLine of modelLines) {
      if (mLine.trim() === '') continue;
      if (mLine.trim().startsWith('@@')) {
        indexLines.push(mLine);
      } else {
        let name = mLine.trim().split(/\s+/)[0];
        fieldMap.set(name, mLine);
      }
    }
    
    for (let value of fieldMap.values()) {
      resultLines.push(value);
    }
    for (let idx of indexLines) {
      resultLines.push(idx);
    }
    resultLines.push('}');
  } else {
    resultLines.push(line);
  }
  i++;
}

fs.writeFileSync('prisma/schema.prisma', resultLines.join('\n'));
