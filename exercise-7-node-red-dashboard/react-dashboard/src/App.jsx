import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Sun, Volume2, Droplets, Activity } from 'lucide-react';
import { useMQTT } from './hooks/useMQTT';
import SensorGauge from './components/SensorGauge';
import SensorChart from './components/SensorChart';
import AllSensorsChart from './components/AllSensorsChart';
import ControlPanel from './components/ControlPanel';
import StatusBanner from './components/StatusBanner';
import ClassTemperature from './components/ClassTemperature';
import ClassStudentsChart from './components/ClassStudentsChart';

function App() {
  const {
    isConnected,
    connectionStatus,
    deviceStatus,
    overallStatus,
    systemHealth,
    sensorData,
    classAverage,
    classTemperatures,
    // 🆕 FIXED: Added missing destructured variables
    classData,
    classStats,
    studentData,
    toggleLED,
    toggleDataTransmission,
    lastMessageTimes
  } = useMQTT();

  const { temperature, humidity, luminosity, sound } = sensorData;
  const isSystemHealthy = overallStatus === 'healthy';

  useEffect(() => {
    document.title = `IoT Dashboard - ${isSystemHealthy ? '🟢 Online' : '🟡 Warning'}`;
  }, [isSystemHealthy]);

  return (
    <div className="min-h-screen animated-gradient cyber-grid">
      <div className="min-h-screen p-4 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(6,182,212,0.5)',
                  '0 0 40px rgba(6,182,212,0.8)',
                  '0 0 20px rgba(6,182,212,0.5)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🚀 IoT Sensor Dashboard
            </motion.h1>
            <motion.p 
              className="text-xl text-cyan-100 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Real-time monitoring with MQTT • Noah Gallo • Exercise 7
            </motion.p>
          </motion.div>

          {/* Status Banner */}
          <StatusBanner 
            isConnected={isConnected}
            deviceStatus={deviceStatus}
            overallStatus={overallStatus}
            systemHealth={systemHealth}
            connectionStatus={connectionStatus}
          />

          {/* 4 Sensor Gauges Grid - Now with Humidity! */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, staggerChildren: 0.1 }}
          >
            <SensorGauge
              title="Temperature"
              value={temperature.value}
              unit="°C"
              min={temperature.min}
              max={temperature.max}
              color="#ef4444"
              icon={Thermometer}
              maxValue={50}
              isOnline={isSystemHealthy}
            />

            <SensorGauge
              title="Humidity"
              value={humidity.value}
              unit="%"
              min={humidity.min}
              max={humidity.max}
              color="#06b6d4"
              icon={Droplets}
              maxValue={100}
              isOnline={isSystemHealthy}
            />
            
            <SensorGauge
              title="Light Level"
              value={luminosity.value}
              unit="%"
              min={luminosity.min}
              max={luminosity.max}
              color="#f59e0b"
              icon={Sun}
              maxValue={100}
              isOnline={isSystemHealthy}
            />
            
            <SensorGauge
              title="Sound Level"
              value={sound.value}
              unit="%"
              min={sound.min}
              max={sound.max}
              color="#10b981"
              icon={Volume2}
              maxValue={100}
              isOnline={isSystemHealthy}
            />
          </motion.div>

          {/* Mixed Chart */}
          <div className="mb-8">
            <AllSensorsChart 
              sensorData={sensorData}
              isOnline={isSystemHealthy}
            />
          </div>

          {/* 🆕 NEW: Multi-Student Chart */}
          <div className="mb-8">
            <ClassStudentsChart 
              studentData={studentData || {}}
              isOnline={isSystemHealthy}
            />
          </div>

          {/* Individual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <SensorChart
              title="Temperature"
              data={temperature.history}
              color="#ef4444"
              unit="°C"
              isOnline={isSystemHealthy}
            />

            <SensorChart
              title="Humidity"
              data={humidity.history}
              color="#06b6d4"
              unit="%"
              isOnline={isSystemHealthy}
            />
            
            <SensorChart
              title="Light Level"
              data={luminosity.history}
              color="#f59e0b"
              unit="%"
              isOnline={isSystemHealthy}
            />
            
            <SensorChart
              title="Sound Level"
              data={sound.history}
              color="#10b981"
              unit="%"
              isOnline={isSystemHealthy}
            />
            
            <div className="lg:col-span-2 xl:col-span-2">
              {/* 🆕 UPDATED: Added new props to ClassTemperature */}
              <ClassTemperature 
                classAverage={classAverage}
                classTemperatures={classTemperatures}
                classStats={classStats}
                studentData={studentData || {}}
              />
            </div>
          </div>

          {/* Control Panel */}
          <ControlPanel 
            toggleLED={toggleLED}
            toggleDataTransmission={toggleDataTransmission}
            isConnected={isConnected}
            deviceOnline={deviceStatus === 'online'}
          />

          {/* Footer */}
          <motion.div 
            className="text-center mt-12 text-cyan-100/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              className="inline-block"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-lg mb-2">
                🚀 <strong>Noah Gallo</strong> - IoT Exercise 7 - React Dashboard Alternative to Node-RED
              </p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span>📡 MQTT Connected: {isConnected ? '✅' : '❌'}</span>
                <span>🔌 Device: {deviceStatus === 'online' ? '✅' : '❌'}</span>
                <span>📊 Data Points: {temperature.history.length + humidity.history.length + luminosity.history.length + sound.history.length}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App;
