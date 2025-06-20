// server.js
const express  = require("express");
const http     = require("http");
const { Server } = require("socket.io");
const five     = require("johnny-five");
const Oled     = require("oled-js");         // oled-js for SSD1306
const font     = require("oled-font-5x7");   // 5×7 font for oled-js

const app    = express();
const server = http.createServer(app);
const io     = new Server(server);

const board = new five.Board({ repl: false });

board.on("ready", () => {
  console.log("🔌 Arduino connected");

  // 1) enable I2C on Firmata so oled-js can use it:
  board.io.i2cConfig();

  // 2) create an oled-js display instance
  const opts = {
    width:    128,
    height:   64,
    address:  0x3C   // your OLED’s I²C address
  };
  const oled = new Oled(board, five, opts);

  // 3) blank display fully
  oled.clearDisplay();
  oled.clearDisplay();
  oled.update();  // ensure hardware is cleared

  // 4) other components
  const led   = new five.Led(3);      // LED on D3
  const servo = new five.Servo(1);    // Servo on D1

  io.on("connection", socket => {
    console.log("📱 Client connected");

    socket.on("ordre", cmd => {
      console.log("➡️ ordre received:", cmd);

      // LED:
      if (cmd.led === 1)      led.on();
      else if (cmd.led === 0) led.off();

      // Servo:
      if (typeof cmd.angle === "number") {
        servo.to(cmd.angle);
      }

      // OLED message:
      if (typeof cmd.message === "string") {
        // pad/trim to avoid leftover bits
        const msg = cmd.message.substring(0,16).padEnd(16," ");
        oled.clearDisplay();
        oled.setCursor(0, 0);
        oled.writeString(font, 1, msg, 1, true);
        oled.update();  // flush buffer to display
      }
    });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🌐 Socket.IO server up at http://127.0.0.1:${PORT}`);
});
