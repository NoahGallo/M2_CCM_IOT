# 🚀 IoT Sensor Dashboard
![Dashboard Screenshot](./dashboard.png)

## Description
Real-time monitoring dashboard built with Next.js, React and MQTT.  
Displays live temperature, humidity, light and sound readings from IoT devices, with gauges, history charts, and individual student tracking.

## Prerequisites
- Node.js ≥ 14.x  
- npm or yarn  
- An MQTT broker (e.g. Mosquitto)  
- Devices publishing to the correct MQTT topics

## Installation
1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-username/iot-sensor-dashboard.git
   cd iot-sensor-dashboard
   ```
2. **Install dependencies**  
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment**  
   Copy `.env.example` to `.env` and update:
   ```env
   MQTT_BROKER_URL=mqtt://localhost:1883
   MQTT_STATUS_TOPIC=promo/abc/123/statut
   MQTT_DATA_TOPIC=promo/abc/123/data
   ```
4. **Run in development**  
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open http://localhost:3000 in your browser.

## File Structure
    ├── dashboard.png
    ├── 3. Activités-IoT-Microcontroleurs-et-Capteurs.pdf
    ├── 4. Activités-IoT-Communications.pdf
    ├── 5. Activités-IoT-NodeJS-Communications.pdf
    ├── 6. Activités-IoT-MQTT.pdf
    ├── 7. Synthèse-IoT-Visualisation.pdf
    ├── .env.example
    ├── package.json
    ├── next.config.js
    ├── public/
    │   └── dashboard.png
    ├── pages/
    │   ├── index.tsx
    │   └── api/
    ├── components/
    │   ├── Gauge.tsx
    │   └── Chart.tsx
    └── styles/
        └── globals.css

## Course Materials
- **3.** Activités-IoT-Microcontrôleurs-et-Capteurs.pdf  
- **4.** Activités-IoT-Communications.pdf  
- **5.** Activités-IoT-NodeJS-Communications.pdf  
- **6.** Activités-IoT-MQTT.pdf  
- **7.** Synthèse-IoT-Visualisation.pdf  

## Contributing
Feel free to open issues or pull requests to improve features, fix bugs, or enhance documentation.

## License
This project is licensed under the [MIT License](./LICENSE).
