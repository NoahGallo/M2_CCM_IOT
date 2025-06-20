const readline = require('readline');

// Helper to ask a question on stdin and return a Promise
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  try {
    // 1. Prompt the user
    const input = await askQuestion('Enter a string: ');
    // 2. Build the URL, encoding the user input
    const url = `https://daviddurand.info/web/vue-api/username/test/${encodeURIComponent(input)}`;
    // 3. Fetch the JSON
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    // 4. Print the result, formatted
    console.log('Result:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
