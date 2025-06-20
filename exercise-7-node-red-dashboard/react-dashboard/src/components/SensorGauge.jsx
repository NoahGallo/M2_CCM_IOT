import React from 'react';
import { motion } from 'framer-motion';

const SensorGauge = ({ 
  title, 
  value, 
  unit, 
  min, 
  max, 
  color = '#06b6d4',
  icon: Icon,
  maxValue = 100,
  isOnline = true
}) => {
  const percentage = Math.min((Math.abs(value) / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getGlowClass = () => {
    if (!isOnline) return '';
    if (color.includes('#ef4444')) return 'glow-red';
    if (color.includes('#f59e0b')) return 'glow-yellow';
    if (color.includes('#06b6d4')) return 'glow-cyan';
    if (color.includes('#10b981')) return 'glow-green';
    return 'glow-blue';
  };

  return (
    <motion.div 
      className={`glass-effect rounded-xl p-6 text-white relative overflow-hidden ${isOnline ? 'hover:scale-105' : 'opacity-75'}`}
      initial={{ scale: 0, opacity: 0, rotateY: -180 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ 
        duration: 0.8, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ y: -5 }}
    >
      {/* Background animated gradient */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full animated-gradient rounded-xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white/90">{title}</h3>
          {Icon && (
            <motion.div
              animate={{ rotate: isOnline ? [0, 10, -10, 0] : 0 }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Icon className="w-6 h-6" style={{ color: isOnline ? color : '#6b7280' }} />
            </motion.div>
          )}
        </div>
        
        <div className="relative w-36 h-36 mx-auto mb-6">
          <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke={isOnline ? color : '#6b7280'}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={isOnline ? getGlowClass() : ''}
              style={{
                filter: isOnline ? `drop-shadow(0 0 10px ${color}40)` : 'none'
              }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              className="text-3xl font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              {value.toFixed(1)}
            </motion.span>
            <span className="text-sm opacity-75 mt-1">{unit}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm opacity-75">
          <div className="text-center">
            <div className="font-medium">Min</div>
            <div className="text-cyan-300">
              {min === Infinity ? '--' : min.toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Max</div>
            <div className="text-orange-300">
              {max === -Infinity ? '--' : max.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-4 flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`}></div>
          <span className="text-xs opacity-60">
            {isOnline ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default SensorGauge;
