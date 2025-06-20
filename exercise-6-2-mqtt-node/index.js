// index.js
const mqtt = require("mqtt");

// 1) Broker connection options, including LWT (“offline”) and retain
const options = {
  host: "mqtt.u-picardie.fr",
  port: 8883,
  protocol: "mqtts",
  username: "noah.gallo",
  password: "g22315333",
  // Last Will & Testament: publish “offline” if we disconnect unexpectedly
  will: {
    topic: "m2ccm/noa/g22315333/statut",
    payload: "offline",
    qos: 0,
    retain: true
  }
};

// 2) Connect to the broker
const client = mqtt.connect(options);  
// Connects over TLS by default on port 8883 :contentReference[oaicite:1]{index=1}.

// 3) When connected: subscribe & publish “online”
client.on("connect", () => {
  console.log("🔌 Connected to MQTT broker");

  // a) Subscribe to status and data topics
  client.subscribe("m2ccm/noa/g22315333/statut", { qos: 0 });  // status :contentReference[oaicite:2]{index=2}
  client.subscribe("m2ccm/noa/g22315333/data",   { qos: 0 });  // data :contentReference[oaicite:3]{index=3}

  // b) Publish “online” on statut (retained)
  client.publish(
    "m2ccm/noa/g22315333/statut",
    "online",
    { qos: 0, retain: true }
  );  // retains the last status message :contentReference[oaicite:4]{index=4}

  // c) Publish a sample data point (e.g. “42”) retained
  client.publish(
    "m2ccm/noa/g22315333/data",
    "42",
    { qos: 0, retain: true }
  );  // retains the last data message :contentReference[oaicite:5]{index=5}
});

// 4) Handle incoming messages
client.on("message", (topic, message) => {
  console.log(`📥 ${topic} → ${message.toString()}`);
});

// 5) On clean shutdown, publish “offline” then end
function gracefulExit() {
  console.log("⚡ Exiting, publishing offline…");
  client.publish(
    "m2ccm/noa/g22315333/statut",
    "offline",
    { qos: 0, retain: true },
    () => client.end(false, () => process.exit(0))
  );
}
process.on("SIGINT",  gracefulExit);
process.on("SIGTERM", gracefulExit);
