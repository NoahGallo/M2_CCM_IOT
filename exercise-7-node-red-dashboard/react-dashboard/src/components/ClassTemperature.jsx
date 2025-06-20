import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Minus, User } from 'lucide-react';

const ClassTemperature = ({ classAverage = 0, classStats = {}, studentData = {} }) => {
  const students = Object.values(studentData || {});
  const activeStudents = students.filter(s => Date.now() - s.lastUpdate < 30000);

  // 🔧 SAFE: Ensure classStats has default values
  const safeClassStats = {
    temperature: 0,
    studentCount: 0,
    ...classStats
  };

  // 🔧 SAFE: Ensure classAverage is a number
  const safeClassAverage = typeof classAverage === 'number' && !isNaN(classAverage) ? classAverage : 0;
  const displayAverage = safeClassStats.temperature > 0 ? safeClassStats.temperature : safeClassAverage;

  const getTrendInfo = () => {
    if (students.length === 0) return { trend: 'stable', icon: Minus, change: 0 };
    
    // Calculate trend from recent class average changes
    const recentTemps = students.map(s => s.latest || 0).filter(t => t > 0);
    if (recentTemps.length === 0) return { trend: 'stable', icon: Minus, change: 0 };
    
    const averageTemp = recentTemps.reduce((sum, val) => sum + val, 0) / recentTemps.length;
    
    // Simple trend based on current vs previous
    const change = averageTemp - displayAverage;
    
    if (Math.abs(change) < 0.5) return { trend: 'stable', icon: Minus, change: 0 };
    return change > 0 
      ? { trend: 'up', icon: TrendingUp, change }
      : { trend: 'down', icon: TrendingDown, change };
  };

  const trendInfo = getTrendInfo();
  const TrendIcon = trendInfo.icon;

  return (
    <motion.div 
      className="glass-effect rounded-xl p-6 text-white relative overflow-hidden"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Background effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full animated-gradient rounded-xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Users className="w-7 h-7 text-blue-400" />
          </motion.div>
          <h3 className="text-xl font-semibold">Class Data Monitor</h3>
        </div>
        
        <div className="text-center mb-6">
          <motion.div 
            className="text-5xl font-bold text-blue-300 mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {/* 🔧 SAFE: Always ensure we have a valid number */}
            {displayAverage.toFixed(1)}°C
          </motion.div>
          
          <div className="flex items-center justify-center gap-2 text-lg">
            <span className="text-white/80">Class Average</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`flex items-center gap-1 ${
                trendInfo.trend === 'up' ? 'text-red-400' :
                trendInfo.trend === 'down' ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              <TrendIcon className="w-5 h-5" />
              {Math.abs(trendInfo.change) > 0.1 && (
                <span className="text-sm">
                  {trendInfo.change > 0 ? '+' : ''}{trendInfo.change.toFixed(1)}°C
                </span>
              )}
            </motion.div>
          </div>
        </div>

        {/* Enhanced Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {students.length}
            </div>
            <div className="text-sm opacity-75">Total Students</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {activeStudents.length}
            </div>
            <div className="text-sm opacity-75">Currently Active</div>
          </div>
        </div>

        {/* Class Statistics Grid - Only show if we have class data */}
        {safeClassStats.studentCount > 0 && (
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-red-400">
                {/* 🔧 SAFE: Always ensure valid number */}
                {(safeClassStats.temperature || 0).toFixed(1)}°C
              </div>
              <div className="text-xs opacity-75">Class Average from {safeClassStats.studentCount} students</div>
            </div>
          </div>
        )}

        {/* Recent students preview */}
        {activeStudents.length > 0 && (
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-sm font-medium mb-2 opacity-75">Recent Student Data</div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {activeStudents.slice(0, 5).map((student, index) => (
                <motion.div
                  key={student.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center text-xs"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 opacity-60" />
                    <span className="font-medium">{student.name}</span>
                  </div>
                  <span className="text-blue-300">
                    {/* 🔧 SAFE: Ensure student.latest is valid */}
                    {(student.latest || 0).toFixed(1)}°C
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {students.length === 0 && (
          <div className="text-center py-8 text-white/50">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users className="w-8 h-8 mx-auto mb-2" />
              <div>Waiting for class data...</div>
              <div className="text-xs mt-1">Format: m2ccm/+/+/temp</div>
            </motion.div>
          </div>
        )}

        {/* 🆕 DEBUG: Show current data status */}
        {students.length > 0 && (
          <div className="mt-4 text-xs opacity-50 text-center">
            Tracking {students.length} students, {activeStudents.length} active
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClassTemperature;
