#include <WiFiNINA.h>       // Wi-Fi for MKR1010
#include <utility/wifi_drv.h>  // For RGB LED control
#include <PubSubClient.h>   // MQTT client
#include <DHT.h>            // DHT11 temp/humidity

// WiFi config
const char* ssid     = "Noah’s iPhone 15 Pro Max";
const char* pass     = "test..123";
const char* mqttUser = "noah.gallo";
const char* mqttPass = "g22315333";
const char* mqttHost = "mqtt.u-picardie.fr";
const uint16_t mqttPort = 8883;

// Topic root
const char* baseTopic = "m2ccm/noa/g22315333";

// Pins
#define DHTPIN      2      // DHT11 data → D2
#define DHTTYPE     DHT11
#define LIGHT_PIN   A0     // LDR → A0
#define SOUND_PIN   A1     // Sound sensor → A1

// RGB LED pins (built-in)
#define RGB_GREEN   25     // Green LED
#define RGB_RED     26     // Red LED  
#define RGB_BLUE    27     // Blue LED

DHT dht(DHTPIN, DHTTYPE);
WiFiSSLClient net;
PubSubClient client(net);

// Control variables
bool dataTransmissionEnabled = true;
bool ledManuallyControlled = false;
String ledState = "off";
unsigned long lastPub = 0;
unsigned long lastSensorRead = 0;
unsigned long lastStatusPub = 0;
unsigned long lastClassDataPub = 0; 

// Anti-flood protection
const unsigned long MIN_PUBLISH_INTERVAL = 900;

void setup() {
  Serial.begin(115200);
  while (!Serial);

  Serial.println("=== Arduino MKR WiFi 1010 Starting ===");
  
  // Setup RGB LED pins
  WiFiDrv::pinMode(RGB_GREEN, OUTPUT);
  WiFiDrv::pinMode(RGB_RED, OUTPUT);
  WiFiDrv::pinMode(RGB_BLUE, OUTPUT);
  
  // Turn off RGB LED initially
  setRGBColor(0, 0, 0);
  
  dht.begin();
  
  Serial.println("DHT11 sensor initialized");
  Serial.println("RGB LED initialized (OFF by default)");
  Serial.println("Class data publishing enabled on /temp topic"); 
  Serial.println("Starting WiFi connection...");
  connectWiFi();

  client.setServer(mqttHost, mqttPort);
  client.setCallback(mqttCallback);

  Serial.println("Connecting to MQTT broker...");
  connectMQTT();
  
  Serial.println("Setup complete!");
  
  // Brief flash to indicate successful setup, then turn off
  flashSuccess();
  setRGBColor(0, 0, 0); // Ensure LED is off after setup
}

void loop() {
  // Keep client alive
  if (!client.connected()) {
    Serial.println("MQTT disconnected, reconnecting...");
    connectMQTT();
  }
  client.loop();

  unsigned long now = millis();
  
  // Publish every 1 second
  if (now - lastPub >= 1000 && dataTransmissionEnabled) {
    if (now - lastSensorRead >= MIN_PUBLISH_INTERVAL) {
      publishSensorData();
      lastPub = now;
      lastSensorRead = now;
    }
  }
  
  // 🆕 NEW: Publish class data every 5 seconds (different interval)
  if (now - lastClassDataPub >= 5000 && dataTransmissionEnabled) {
    publishClassData();
    lastClassDataPub = now;
  }
  
  // Republish online status every 30 seconds to ensure it stays active
  if (now - lastStatusPub >= 30000) {
    if (client.connected()) {
      char statusTopic[64];
      snprintf(statusTopic, sizeof(statusTopic), "%s/statut", baseTopic);
      
      if (client.publish(statusTopic, "online", true)) {
        Serial.println("🔄 Republished online status - DASHBOARD SHOULD NOW WORK!");
      } else {
        Serial.println("❌ Failed to republish online status");
      }
    }
    lastStatusPub = now;
  }
  
  // LED Control - Only manual control, no automatic status colors
  if (ledManuallyControlled) {
    if (ledState == "on") {
      // LED is ON - show a nice cyan color
      setRGBColor(0, 255, 255); // Bright cyan
    } else {
      // LED is OFF
      setRGBColor(0, 0, 0); // Off
    }
  } else {
    // LED not manually controlled - keep it off
    setRGBColor(0, 0, 0); // Off
  }
}

// 🆕 NEW: Publish class data in the agreed format
void publishClassData() {
  Serial.println("--- Publishing Class Data ---");
  
  float temperature = dht.readTemperature();
  int lightLevel = analogRead(LIGHT_PIN);
  int soundLevel = analogRead(SOUND_PIN);

  // Validate readings before publishing
  if (isnan(temperature) || temperature < -40 || temperature > 85) {
    Serial.println("❌ Invalid temperature for class data, skipping");
    return;
  }
  
  if (lightLevel < 0 || lightLevel > 1023) {
    Serial.println("❌ Invalid light level for class data, skipping");
    return;
  }
  
  if (soundLevel < 0 || soundLevel > 1023) {
    Serial.println("❌ Invalid sound level for class data, skipping");
    return;
  }

  char classTopicBuf[64];
  char classPayload[128];
  
  // Create topic: m2ccm/noa/g22315333/temp
  snprintf(classTopicBuf, sizeof(classTopicBuf), "%s/temp", baseTopic);
  
  // Create payload in agreed format: { "temp":31.6, "lum":184, "sound":0 }
  snprintf(classPayload, sizeof(classPayload), "{\"temp\":%.1f,\"lum\":%d,\"sound\":%d}", 
           temperature, lightLevel, soundLevel);
  
  Serial.print("📊 Publishing class data to: ");
  Serial.println(classTopicBuf);
  Serial.print("📊 Class payload: ");
  Serial.println(classPayload);
  
  if(client.publish(classTopicBuf, classPayload, true)) {
    Serial.println("✅ Published class data successfully - CLASS AVERAGE SHOULD UPDATE!");
  } else {
    Serial.println("❌ Failed to publish class data");
  }
  
  Serial.println("--- Class Data Publishing Complete ---\n");
}

// Set RGB LED color (0-255 for each color)
void setRGBColor(int red, int green, int blue) {
  WiFiDrv::analogWrite(RGB_RED, red);
  WiFiDrv::analogWrite(RGB_GREEN, green);
  WiFiDrv::analogWrite(RGB_BLUE, blue);
}

// Flash success pattern (only during setup/connection)
void flashSuccess() {
  Serial.println("🎉 Flashing success pattern");
  for (int i = 0; i < 3; i++) {
    setRGBColor(0, 255, 0); // Bright green
    delay(200);
    setRGBColor(0, 0, 0);   // Off
    delay(200);
  }
}

// Flash error pattern
void flashError() {
  Serial.println("❌ Flashing error pattern");
  for (int i = 0; i < 5; i++) {
    setRGBColor(255, 0, 0); // Bright red
    delay(100);
    setRGBColor(0, 0, 0);   // Off
    delay(100);
  }
}

void publishSensorData() {
  Serial.println("--- Reading Sensors ---");
  
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int lightLevel = analogRead(LIGHT_PIN);
  int soundLevel = analogRead(SOUND_PIN);

  Serial.print("Raw sensor readings - Temperature: ");
  Serial.print(temperature);
  Serial.print(" C, Humidity: ");
  Serial.print(humidity);
  Serial.print(" %, Light: ");
  Serial.print(lightLevel);
  Serial.print(", Sound: ");
  Serial.println(soundLevel);

  // Check DHT sensor status
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("ERROR: DHT11 sensor reading failed!");
  }

  char topicBuf[64];
  char payload[128];

  // Validate and publish temperature
  if (!isnan(temperature) && temperature >= -40 && temperature <= 85) {
    snprintf(topicBuf, sizeof(topicBuf), "%s/data/temperature", baseTopic);
    snprintf(payload, sizeof(payload), "{\"value\":%.1f,\"humidity\":%.1f,\"timestamp\":%lu}", 
             temperature, humidity, millis());
    
    if(client.publish(topicBuf, payload, true)) {
      Serial.println("✓ Published temperature data successfully");
    } else {
      Serial.println("✗ Failed to publish temperature data");
    }
  } else {
    Serial.println("✗ Temperature reading invalid, not publishing");
  }

  // Validate and publish light level
  if (lightLevel >= 0 && lightLevel <= 1023) {
    float lightPercent = (lightLevel / 1023.0) * 100;
    snprintf(topicBuf, sizeof(topicBuf), "%s/data/luminosity", baseTopic);
    snprintf(payload, sizeof(payload), "{\"value\":%.1f,\"raw\":%d,\"timestamp\":%lu}", 
             lightPercent, lightLevel, millis());
    
    if(client.publish(topicBuf, payload, true)) {
      Serial.println("✓ Published luminosity data successfully");
    } else {
      Serial.println("✗ Failed to publish luminosity data");
    }
  }

  // Validate and publish sound level
  if (soundLevel >= 0 && soundLevel <= 1023) {
    float soundPercent = (soundLevel / 1023.0) * 100;
    snprintf(topicBuf, sizeof(topicBuf), "%s/data/sound", baseTopic);
    snprintf(payload, sizeof(payload), "{\"value\":%.1f,\"raw\":%d,\"timestamp\":%lu}", 
             soundPercent, soundLevel, millis());
    
    if(client.publish(topicBuf, payload, true)) {
      Serial.println("✓ Published sound data successfully");
    } else {
      Serial.println("✗ Failed to publish sound data");
    }
  }
  
  Serial.println("--- Sensor Reading Complete ---\n");
}

void connectWiFi() {
  Serial.println("Scanning for networks...");
  int n = WiFi.scanNetworks();
  Serial.print("Found ");
  Serial.print(n);
  Serial.println(" networks:");
  
  for (int i = 0; i < n; i++) {
    Serial.print(i + 1);
    Serial.print(": ");
    Serial.print(WiFi.SSID(i));
    Serial.print(" (");
    Serial.print(WiFi.RSSI(i));
    Serial.println(" dBm)");
  }

  Serial.print("Connecting to Wi-Fi \"");
  Serial.print(ssid);
  Serial.println("\"");

  unsigned long start = millis();
  WiFi.begin(ssid, pass);
  
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start >= 15000) {
      Serial.println("\n✗ Wi-Fi connect timeout after 15 seconds");
      flashError();
      return;
    }
    Serial.print(".");
    delay(500);
    yield();
  }
  
  Serial.println("\n✓ Wi-Fi connected successfully!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Signal strength: ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");
  
  flashSuccess(); // Flash green on successful WiFi connection
}

void connectMQTT() {
  char willTopic[64];
  snprintf(willTopic, sizeof(willTopic), "%s/statut", baseTopic);

  uint8_t mac[6];
  WiFi.macAddress(mac);
  char clientId[32];
  snprintf(clientId, sizeof(clientId), "MKR1010_%02X%02X%02X", 
           mac[3], mac[4], mac[5]);

  Serial.print("MQTT Client ID: ");
  Serial.println(clientId);
  Serial.print("Connecting to MQTT broker ");
  Serial.print(mqttHost);
  Serial.print(":");
  Serial.print(mqttPort);
  Serial.println("...");
  
  unsigned long start = millis();
  while (!client.connect(clientId, mqttUser, mqttPass, 
                        willTopic, 1, true, "offline")) {
    if (millis() - start >= 10000) {
      Serial.println("\n✗ MQTT connect timeout after 10 seconds");
      flashError();
      return;
    }
    Serial.print(".");
    delay(500);
    yield();
  }
  
  Serial.println("\n✓ MQTT connected successfully!");
  flashSuccess(); // Flash green on successful MQTT connection

  // IMPROVED: Multiple attempts to publish online status with delays
  bool statusPublished = false;
  for (int attempt = 1; attempt <= 3; attempt++) {
    Serial.print("📡 Publishing online status (attempt ");
    Serial.print(attempt);
    Serial.print("/3)... ");
    
    if (client.publish(willTopic, "online", true)) {
      Serial.println("✓ SUCCESS! Published online status - Dashboard should show ONLINE now!");
      statusPublished = true;
      break;
    } else {
      Serial.println("✗ FAILED");
      delay(1000); // Wait 1 second before retry
    }
  }
  
  if (!statusPublished) {
    Serial.println("❌ CRITICAL: Failed to publish online status after 3 attempts!");
    Serial.println("❌ Dashboard will show OFFLINE - LED button will be disabled");
  }

  // Small delay to ensure status message is processed
  delay(500);

  // Subscribe to command topics
  char ledTopic[64];
  char dataTopic[64];
  snprintf(ledTopic, sizeof(ledTopic), "%s/command/led", baseTopic);
  snprintf(dataTopic, sizeof(dataTopic), "%s/command/data_transmission", baseTopic);
  
  if(client.subscribe(ledTopic)) {
    Serial.print("✓ Subscribed to: ");
    Serial.println(ledTopic);
  } else {
    Serial.print("✗ Failed to subscribe to: ");
    Serial.println(ledTopic);
  }
  
  if(client.subscribe(dataTopic)) {
    Serial.print("✓ Subscribed to: ");
    Serial.println(dataTopic);
  } else {
    Serial.print("✗ Failed to subscribe to: ");
    Serial.println(dataTopic);
  }

  // Initialize timers
  lastStatusPub = millis();
  lastClassDataPub = millis();
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  String msg = String((char*)payload);

  Serial.println("--- MQTT Command Received ---");
  Serial.print("Topic: ");
  Serial.println(topic);
  Serial.print("Message: ");
  Serial.println(msg);

  // Control RGB LED - ON/OFF instead of flash
  if (String(topic).endsWith("/command/led")) {
    ledManuallyControlled = true; // Mark as manually controlled
    
    if (msg == "on") {
      ledState = "on";
      Serial.println("💡 LED turned ON (Cyan)");
    } else if (msg == "off") {
      ledState = "off";
      Serial.println("💡 LED turned OFF");
    } else if (msg == "disable") {
      // Reset to automatic mode (off)
      ledManuallyControlled = false;
      ledState = "off";
      Serial.println("💡 LED control disabled (Auto OFF)");
    }
    
    Serial.print("LED State: ");
    Serial.print(ledState);
    Serial.print(" | Manually Controlled: ");
    Serial.println(ledManuallyControlled ? "YES" : "NO");
  }
  
  // Control data transmission
  if (String(topic).endsWith("/command/data_transmission")) {
    bool previousState = dataTransmissionEnabled;
    dataTransmissionEnabled = (msg == "on" || msg == "enable");
    Serial.print("Data transmission: ");
    Serial.print(previousState ? "ENABLED" : "DISABLED");
    Serial.print(" -> ");
    Serial.println(dataTransmissionEnabled ? "ENABLED" : "DISABLED");
  }
  
  Serial.println("--- Command Processing Complete ---\n");
}
