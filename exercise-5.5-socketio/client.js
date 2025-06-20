// client.js
const io       = require("socket.io-client");
const readline = require("readline");

const socket = io("http://127.0.0.1:3000");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> "
});

console.log("Commands: turnOn | turnOff | servo <angle> | message <text>");
rl.prompt();

rl.on("line", (line) => {
  const [ cmd, ...args ] = line.trim().split(" ");
  const ordre = {};

  if (cmd === "turnOn") {
    ordre.led = 1;
  } else if (cmd === "turnOff") {
    ordre.led = 0;
  } else if (cmd === "servo") {
    const angle = parseInt(args[0], 10);
    if (!isNaN(angle)) ordre.angle = angle;
  } else if (cmd === "message") {
    ordre.message = args.join(" ");
  } else {
    console.log("Unknown command");
    rl.prompt();
    return;
  }

  console.log("🚀 Sending ordre:", ordre);
  socket.emit("ordre", ordre);
  rl.prompt();
});
