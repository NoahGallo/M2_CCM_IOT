// index.js

const five     = require("johnny-five");        // Johnny-Five core
const Oled     = require("oled-js");            // oled-js library :contentReference[oaicite:2]{index=2}
const font     = require("oled-font-5x7");      // 5×7 pixel font :contentReference[oaicite:3]{index=3}
const readline = require("readline");           // CLI input

// Set up command-line interface
const cli = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Disable Johnny-Five's REPL so stdin only goes to our CLI
const board = new five.Board({ repl: false });

board.on("ready", () => {
  console.log("✅ Board is ready");

  // 1) Initialize I²C on Firmata (enables the Wire library) 
  board.io.i2cConfig();

  // 2) OLED configuration: 128×64, common I²C address 0x3C :contentReference[oaicite:5]{index=5}
  const opts = {
    width:   128,
    height:  64,
    address: 0x3C
  };

  // 3) Instantiate the OLED (Johnny-Five compatible) 
  const oled = new Oled(board, five, opts);

  // Efface complètement l'écran au lancement (double clear pour éviter tout résidu)
  oled.clearDisplay();
  oled.clearDisplay();
  oled.fillRect(0, 0, opts.width, opts.height, 0);

  oled.setCursor(0, 0);
  oled.writeString(font, 1, "Hello", 1, true);
  oled.setCursor(0, 16);
  oled.writeString(font, 1, "Pot: ...", 1, true);

  // 5) Potentiometer on A1, sampling every 500ms :contentReference[oaicite:8]{index=8}
  const pot = new five.Sensor({ pin: "A1", freq: 500 });

  pot.on("data", function() {
    // Efface uniquement la ligne 2 (y=16 px)
    oled.fillRect(0, 16, opts.width, 8, 0);
    oled.setCursor(0, 16);
    oled.writeString(font, 1, `Pot: ${this.value}`, 1, true);
  });

  // 6) CLI input → OLED text (ligne 1)
  cli.on("line", input => {
    if (input.trim().toLowerCase() === "exit") {
      // Efface uniquement la ligne 1 avant d'afficher 'Bye'
      oled.fillRect(0, 0, opts.width, 8, 0);
      oled.setCursor(0, 0);
      oled.writeString(font, 1, "Bye", 1, true);
      console.log("Fermeture du programme...");
      setTimeout(() => {
        cli.close();
        process.exit(0);
      }, 1000); // Laisse le temps d'afficher le message
      return;
    }
    // Efface uniquement la ligne 1 avant d'afficher le texte utilisateur
    oled.fillRect(0, 0, opts.width, 8, 0);
    oled.setCursor(0, 0);
    oled.writeString(font, 1, input, 1, true);
    console.log(`→ Printed: "${input}"`);
  });
});