import { createServer } from 'http';
import next from 'next';
import mqttBridge from './lib/mqttBridge.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3001;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    await handle(req, res);
  });

  mqttBridge.connectMQTT();
  mqttBridge.createWebSocketServer(server);

  server.listen(port, () => {
    console.log(`🚀 Next.js Backend ready on http://${hostname}:${port}`);
    console.log(`📡 WebSocket available at ws://${hostname}:${port}/api/mqtt-ws`);
  });
});
