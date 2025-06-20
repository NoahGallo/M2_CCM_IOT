import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, LightbulbOff, Play, Pause, Power, Wifi } from 'lucide-react';

const ControlPanel = ({ toggleLED, toggleDataTransmission, isConnected, deviceOnline }) => {
  const [dataEnabled, setDataEnabled] = useState(true);
  const [ledEnabled, setLedEnabled] = useState(false);

  const handleDataToggle = () => {
    const newState = !dataEnabled;
    setDataEnabled(newState);
    toggleDataTransmission(newState);
  };

  const handleLEDToggle = () => {
    const newState = !ledEnabled;
    setLedEnabled(newState);
    
    // Send the appropriate command based on new state
    if (newState) {
      toggleLED("on");  // Turn LED ON
    } else {
      toggleLED("off"); // Turn LED OFF
    }
  };

  return (
    <motion.div 
      className="glass-effect rounded-xl p-6 text-white relative overflow-hidden"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      whileHover={{ y: -3 }}
    >
      {/* Background effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full animated-gradient rounded-xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Power className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-semibold">Control Panel</h3>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-3 h-3 rounded-full ${
              isConnected && deviceOnline ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
        </div>

        {/* Connection Status */}
        <div className="bg-black/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className={`w-5 h-5 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
              <span className="font-medium">System Status</span>
            </div>
            <div className="text-right">
              <div className={`font-semibold ${
                isConnected && deviceOnline ? 'text-green-400' : 'text-red-400'
              }`}>
                {isConnected && deviceOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
              </div>
              <div className="text-xs opacity-60">
                MQTT: {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LED Toggle Control */}
          <motion.button
            onClick={handleLEDToggle}
            disabled={!isConnected || !deviceOnline}
            className={`relative flex items-center justify-center gap-3 rounded-lg py-4 px-6 font-medium transition-all overflow-hidden ${
              !isConnected || !deviceOnline
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : ledEnabled
                ? 'bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 glow-teal'
                : 'bg-slate-600 hover:bg-slate-700 active:bg-slate-800'
            }`}
            whileHover={isConnected && deviceOnline ? { scale: 1.05 } : {}}
            whileTap={isConnected && deviceOnline ? { scale: 0.95 } : {}}
          >
            <AnimatePresence mode="wait">
              {ledEnabled ? (
                <motion.div
                  key="on"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Lightbulb className="w-5 h-5" />
                  </motion.div>
                  LED ON
                </motion.div>
              ) : (
                <motion.div
                  key="off"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <LightbulbOff className="w-5 h-5" />
                  LED OFF
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Glow effect when LED is on */}
            <AnimatePresence>
              {ledEnabled && isConnected && deviceOnline && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-cyan-400/20 rounded-lg"
                />
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* Data Transmission Control */}
          <motion.button
            onClick={handleDataToggle}
            disabled={!isConnected}
            className={`flex items-center justify-center gap-3 rounded-lg py-4 px-6 font-medium transition-all ${
              !isConnected
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : dataEnabled 
                ? 'bg-red-500 hover:bg-red-600 active:bg-red-700' 
                : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
            }`}
            whileHover={isConnected ? { scale: 1.05 } : {}}
            whileTap={isConnected ? { scale: 0.95 } : {}}
          >
            <motion.div
              animate={{ rotate: dataEnabled ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {dataEnabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </motion.div>
            {dataEnabled ? 'Stop Data' : 'Start Data'}
          </motion.button>
        </div>

        {/* Status Indicators */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="font-medium mb-1">Data Stream</div>
            <div className={`flex items-center justify-center gap-1 ${
              dataEnabled ? 'text-green-400' : 'text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                dataEnabled ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`} />
              {dataEnabled ? 'Active' : 'Stopped'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="font-medium mb-1">RGB LED</div>
            <div className={`flex items-center justify-center gap-1 ${
              ledEnabled ? 'text-cyan-400' : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                ledEnabled ? 'bg-cyan-400 animate-pulse' : 'bg-gray-400'
              }`} />
              {ledEnabled ? 'ON' : 'OFF'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ControlPanel;
