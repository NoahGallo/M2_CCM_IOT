// index.js
console.log("Script start");

// Schedule a process.nextTick callback (runs after current operation completes)
process.nextTick(() => {
  console.log("process.nextTick callback");
});

// Schedule a setTimeout callback with 0 delay (runs in the timers phase)
setTimeout(() => {
  console.log("setTimeout callback");
  // Nest a nextTick callback inside setTimeout
  process.nextTick(() => {
    console.log("process.nextTick inside setTimeout");
  });
}, 0);

// Schedule a setImmediate callback (runs in the check phase)
setImmediate(() => {
  console.log("setImmediate callback");
});

// Schedule a setInterval callback that repeats every 1 second
setInterval(() => {
  console.log("setInterval callback (every 1 second)");
}, 1000);

// Console message before reading from stdin
console.log("Before reading from standard input (stdin)");

// Set encoding and listen for data on standard input
process.stdin.setEncoding('utf8');
console.log("Type something and press Enter:");

// When you type and press Enter, this callback is triggered
process.stdin.on('data', (data) => {
  const input = data.trim();
  if (input.toLowerCase() === 'exit') {
    console.log("Exiting program.");
    process.exit();
  } else {
    console.log("You typed: " + input);
    console.log("Type something else or 'exit' to quit:");
  }
});

console.log("Script end");
