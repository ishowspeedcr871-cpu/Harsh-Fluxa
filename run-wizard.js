const { spawn } = require('child_process');
const cp = spawn('npx', ['ruflo@latest', 'init', 'wizard']);

cp.stdout.on('data', (data) => {
  const str = data.toString();
  console.log(str);
  if (str.includes('?')) {
    cp.stdin.write('\n');
  }
});

cp.stderr.on('data', (data) => {
  console.error(data.toString());
});

cp.on('close', (code) => {
  console.log(`Wizard exited with code ${code}`);
});
