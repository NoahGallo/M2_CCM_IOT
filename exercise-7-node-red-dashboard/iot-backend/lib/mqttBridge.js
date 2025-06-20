import mqtt from 'mqtt';
import { WebSocketServer } from 'ws';

class MQTTBridge {
  constructor() {
    this.mqttClient = null;
    this.wsServer = null;
    this.connectedClients = new Set();
    this.isConnected = false;
  }

  async connectMQTT() {
    if (this.mqttClient) {
      console.log('🔄 MQTT already connecting/connected');
      return;
    }

    const options = {
      host: 'mqtt.u-picardie.fr',
      port: 8883,
      protocol: 'mqtts',
      username: 'noah.gallo',
      password: 'g22315333',
      clean: true,
      keepalive: 60,
      will: {
        topic: 'm2ccm/noa/g22315333/statut',
        payload: 'offline',
        qos: 0,
        retain: true
      }
    };

    console.log('🔄 Next.js Backend connecting to MQTT broker...');
    
    this.mqttClient = mqtt.connect(options);

    this.mqttClient.on('connect', () => {
      console.log('🚀 Next.js Backend connected to MQTT broker!');
      this.isConnected = true;
      
      global.mqttConnected = true;
      global.mqttBridge = this;
      
      console.log('📊 Connection status set to:', this.isConnected);
      console.log('🌍 Global status set to:', global.mqttConnected);
      
      this.mqttClient.publish('m2ccm/noa/g22315333/statut', 'online', { retain: true });
      
      const topics = [
        'm2ccm/noa/g22315333/data/temperature',
        'm2ccm/noa/g22315333/data/luminosity',
        'm2ccm/noa/g22315333/data/sound',
        'm2ccm/noa/g22315333/statut',
        'm2ccm/+/+/temp'
      ];

      topics.forEach(topic => {
        this.mqttClient.subscribe(topic, { qos: 0 }, (err) => {
          if (err) {
            console.error(`❌ Failed to subscribe to ${topic}:`, err);
          } else {
            console.log(`✅ Subscribed to ${topic}`);
          }
        });
      });
    });

    this.mqttClient.on('message', (topic, message) => {
      const data = {
        topic,
        message: message.toString(),
        timestamp: Date.now()
      };
      
      if (topic.includes('/temp')) {
        console.log(`📊 CLASS DATA RECEIVED → ${topic}: ${message.toString()}`);
      } else {
        console.log(`📨 MQTT → WebSocket: ${topic}`);
      }
      
      this.broadcastToClients(data);
    });

    this.mqttClient.on('error', (error) => {
      console.error('❌ MQTT Error:', error);
      this.isConnected = false;
      global.mqttConnected = false;
    });

    this.mqttClient.on('disconnect', () => {
      console.log('📡 MQTT Disconnected');
      this.isConnected = false;
      global.mqttConnected = false;
    });
  }

  createWebSocketServer(server) {
    this.wsServer = new WebSocketServer({ 
      server,
      path: '/api/mqtt-ws' 
    });

    this.wsServer.on('connection', (ws) => {
      console.log('🔌 React client connected to WebSocket');
      this.connectedClients.add(ws);

      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        mqttConnected: this.isConnected
      }));

      ws.on('message', (data) => {
        try {
          const command = JSON.parse(data.toString());
          console.log(`📤 React → MQTT: ${command.topic}`);
          
          if (this.mqttClient && this.isConnected) {
            this.mqttClient.publish(command.topic, command.message, { qos: 0 });
          }
        } catch (error) {
          console.error('❌ WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        console.log('🔌 React client disconnected');
        this.connectedClients.delete(ws);
      });
    });
  }

  broadcastToClients(data) {
    const message = JSON.stringify({
      type: 'mqtt-message',
      ...data
    });

    this.connectedClients.forEach(client => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  publishCommand(topic, message) {
    const activeBridge = this.isConnected ? this : global.mqttBridge;
    
    if (activeBridge && activeBridge.mqttClient && activeBridge.isConnected) {
      console.log(`📤 API → MQTT: ${topic}`);
      activeBridge.mqttClient.publish(topic, message, { qos: 0 });
      return true;
    }
    return false;
  }

  getStatus() {
    const connected = this.isConnected || global.mqttConnected || false;
    const clients = this.connectedClients?.size || global.mqttBridge?.connectedClients?.size || 0;
    
    console.log('🔍 getStatus - local isConnected:', this.isConnected);
    console.log('🔍 getStatus - global mqttConnected:', global.mqttConnected);
    console.log('🔍 getStatus - final result:', connected);
    
    return {
      mqttConnected: connected,
      connectedClients: clients
    };
  }
}

const mqttBridge = new MQTTBridge();
export default mqttBridge;
