import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Users, User, Clock } from 'lucide-react';

const ClassStudentsChart = ({ studentData, isOnline = true }) => {
  // Generate colors for different students
  const studentColors = [
    '#ef4444', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', 
    '#ec4899', '#f97316', '#84cc16', '#06b6d4', '#f59e0b'
  ];

  // 🔧 FIXED: Proper data structure for Recharts multiple lines
  const chartData = useMemo(() => {
    const students = Object.values(studentData);
    if (students.length === 0) return [];

    // Find the maximum number of data points across all students
    const maxLength = Math.max(...students.map(s => s.history?.length || 0));
    
    // Create unified data structure for Recharts
    const data = [];
    for (let i = 0; i < Math.min(maxLength, 20); i++) {
      const point = { 
        time: i,
        timestamp: new Date().toLocaleTimeString() // Default timestamp
      };
      
      // Add each student's temperature at this time point
      students.forEach(student => {
        if (student.history && student.history[i]) {
          point[student.name] = student.history[i].value;
          point.timestamp = new Date(student.history[i].timestamp).toLocaleTimeString();
        } else {
          // Important: Set to null for missing data points
          point[student.name] = null;
        }
      });
      
      // Only add the point if at least one student has data
      const hasData = students.some(student => point[student.name] !== null);
      if (hasData) {
        data.push(point);
      }
    }
    
    return data;
  }, [studentData]);

  const students = Object.values(studentData);
  const activeStudents = students.filter(s => Date.now() - s.lastUpdate < 30000);

  const getStudentColor = (index) => studentColors[index % studentColors.length];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-black/90 border border-cyan-500/50 rounded-lg p-3 backdrop-blur-sm">
        <p className="text-cyan-300 text-sm font-medium mb-2">
          Time: {payload[0]?.payload?.timestamp}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-white text-sm" style={{ color: entry.color }}>
            {entry.dataKey}: {entry.value?.toFixed(1)}°C
          </p>
        ))}
      </div>
    );
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4 max-h-20 overflow-y-auto">
        {payload?.map((entry, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/80 text-sm font-medium">
              {entry.value}
            </span>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      className={`glass-effect rounded-xl p-6 text-white relative overflow-hidden ${
        isOnline ? '' : 'opacity-75'
      }`}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full animated-gradient rounded-xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Users className="w-7 h-7 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold">Class Students Temperature</h3>
            <p className="text-sm text-white/60">Individual student tracking</p>
          </div>
        </div>

        {/* Student Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              {students.length}
            </div>
            <div className="text-xs opacity-75">Total Students</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-cyan-400">
              {activeStudents.length}
            </div>
            <div className="text-xs opacity-75">Currently Active</div>
          </div>

          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-400">
              {chartData.length}
            </div>
            <div className="text-xs opacity-75">Data Points</div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-64 mb-4">
          {chartData.length > 0 && students.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                
                {/* 🔧 FIXED: Render lines for each student using their name as dataKey */}
                {students.map((student, index) => (
                  <Line
                    key={student.name}
                    type="monotone"
                    dataKey={student.name}
                    stroke={getStudentColor(index)}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                    activeDot={{
                      r: 4,
                      fill: getStudentColor(index),
                      stroke: 'white',
                      strokeWidth: 2
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-white/50">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-center"
              >
                <Users className="w-8 h-8 mx-auto mb-2" />
                <div>Waiting for student data...</div>
                <div className="text-xs mt-1">Students need to publish to /temp topic</div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Active Students List */}
        {activeStudents.length > 0 && (
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-sm font-medium mb-3 opacity-75 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recently Active Students
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {activeStudents.map((student, index) => (
                <motion.div
                  key={student.name}
                  className="flex items-center gap-2 text-xs p-2 bg-black/20 rounded"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <User className="w-3 h-3" style={{ color: getStudentColor(index) }} />
                  <span className="font-medium">{student.name}</span>
                  <span className="text-white/60">
                    {/* 🔧 FIXED: Proper temperature display */}
                    {(student.latest || 0).toFixed(1)}°C
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-xs opacity-60 mt-4">
          <span>Updated: {new Date().toLocaleTimeString()}</span>
          <span>Format: m2ccm/+/+/temp</span>
        </div>

        {/* 🆕 DEBUG: Show data structure */}
        {process.env.NODE_ENV === 'development' && chartData.length > 0 && (
          <div className="mt-2 text-xs opacity-40">
            Debug: {Object.keys(chartData[0]).filter(k => k !== 'time' && k !== 'timestamp').join(', ')}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClassStudentsChart;
