// index.js
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const readline = require('readline');

async function choosePort() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise(res => rl.question('Enter your Arduino port (e.g. /dev/tty.usbmodem312201): ', res));
  rl.close();
  return answer.trim();
}

async function main() {
  const portName = await choosePort();
  const port = new SerialPort({ path: portName, baudRate: 9600 });
  const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

  port.on('open', () => {
    console.log(`✳️  Opened ${portName} at 9600 baud`);
    console.log("Type commands (e.g. R, C 22, P) and press Enter:");
  });
  port.on('error', err => {
    console.error('Serial port error:', err.message);
    process.exit(1);
  });

  parser.on('data', line => {
    console.log(`← ${line}`);
  });

  const rlCmd = readline.createInterface({ input: process.stdin, output: process.stdout });
  rlCmd.on('line', input => {
    port.write(input + '\n', err => {
      if (err) console.error('Write error:', err.message);
      else console.log(`→ ${input}`);
    });
  });
}

main();
