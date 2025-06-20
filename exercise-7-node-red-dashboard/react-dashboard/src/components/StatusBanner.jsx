import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const StatusBanner = ({ 
  isConnected, 
  deviceStatus, 
  overallStatus, 
  systemHealth,
  connectionStatus 
}) => {
  const getStatusConfig = () => {
    if (overallStatus === 'healthy') {
      return {
        icon: CheckCircle,
        text: '🟢 SYSTEM ONLINE',
        bgClass: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
        glowClass: 'glow-green',
        textClass: 'text-green-300'
      };
    } else {
      return {
        icon: AlertTriangle,
        text: '🟡 SYSTEM WARNING',
        bgClass: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
        glowClass: 'glow-yellow',
        textClass: 'text-yellow-300'
      };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div 
      className={`glass-effect rounded-xl p-6 mb-6 bg-gradient-to-r ${statusConfig.bgClass} border-2 relative overflow-hidden ${
        overallStatus === 'healthy' ? statusConfig.glowClass : ''
      }`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full animated-gradient"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: overallStatus === 'healthy' ? [0, 5, -5, 0] : 0
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <StatusIcon className={`w-8 h-8 ${statusConfig.textClass}`} />
            </motion.div>
            
            <div>
              <div className={`text-xl font-bold ${statusConfig.textClass}`}>
                {statusConfig.text}
              </div>
              <div className="text-white/70 text-sm">
                {connectionStatus}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* MQTT Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              <div className="text-sm">
                <div className="font-medium">MQTT</div>
                <div className={isConnected ? 'text-green-400' : 'text-red-400'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>

            {/* Device Status */}
            <div className="flex items-center gap-2">
              <Activity className={`w-5 h-5 ${
                deviceStatus === 'online' ? 'text-green-400' : 'text-red-400'
              }`} />
              <div className="text-sm">
                <div className="font-medium">Device</div>
                <div className={deviceStatus === 'online' ? 'text-green-400' : 'text-red-400'}>
                  {deviceStatus === 'online' ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed system health */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs opacity-60 mb-1">MQTT Connection</div>
            <div className={`text-sm font-medium ${
              systemHealth.mqttConnected ? 'text-green-400' : 'text-red-400'
            }`}>
              {systemHealth.mqttConnected ? '✓' : '✗'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs opacity-60 mb-1">Device Online</div>
            <div className={`text-sm font-medium ${
              systemHealth.deviceOnline ? 'text-green-400' : 'text-red-400'
            }`}>
              {systemHealth.deviceOnline ? '✓' : '✗'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs opacity-60 mb-1">Data Streaming</div>
            <div className={`text-sm font-medium ${
              systemHealth.dataFlowing ? 'text-green-400' : 'text-red-400'
            }`}>
              {systemHealth.dataFlowing ? '✓' : '✗'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs opacity-60 mb-1">Class Data</div>
            <div className={`text-sm font-medium ${
              systemHealth.classDataAvailable ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {systemHealth.classDataAvailable ? '✓' : '○'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusBanner;
