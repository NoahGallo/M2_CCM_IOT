import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, TrendingUp } from 'lucide-react';

const AllSensorsChart = ({ sensorData, isOnline = true }) => {
  const { temperature, humidity, luminosity, sound } = sensorData;

  const chartData = useMemo(() => {
    const maxLength = Math.max(
      temperature.history.length,
      humidity.history.length,
      luminosity.history.length,
      sound.history.length
    );

    const data = [];
    for (let i = 0; i < Math.min(maxLength, 50); i++) {
      const point = {
        time: i,
        timestamp: new Date().toLocaleTimeString()
      };

      // Add data if available
      if (temperature.history[i]) {
        point.temperature = temperature.history[i].value;
        point.timestamp = new Date(temperature.history[i].timestamp).toLocaleTimeString();
      }
      if (humidity.history[i]) {
        point.humidity = humidity.history[i].value;
      }
      if (luminosity.history[i]) {
        point.luminosity = luminosity.history[i].value;
      }
      if (sound.history[i]) {
        point.sound = sound.history[i].value;
      }

      data.push(point);
    }

    return data.slice(-30); // Show last 30 points
  }, [temperature.history, humidity.history, luminosity.history, sound.history]);

  const sensors = [
    { key: 'temperature', name: 'Temperature', color: '#ef4444', unit: '°C' },
    { key: 'humidity', name: 'Humidity', color: '#06b6d4', unit: '%' },
    { key: 'luminosity', name: 'Light', color: '#f59e0b', unit: '%' },
    { key: 'sound', name: 'Sound', color: '#10b981', unit: '%' }
  ];

  const stats = useMemo(() => {
    return sensors.map(sensor => {
      const data = sensorData[sensor.key];
      const values = data.history.map(p => p.value);
      
      if (values.length === 0) return { ...sensor, avg: 0, trend: 0 };
      
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      // Calculate trend
      const recent = values.slice(-5);
      const previous = values.slice(-10, -5);
      const recentAvg = recent.length ? recent.reduce((s, v) => s + v, 0) / recent.length : 0;
      const previousAvg = previous.length ? previous.reduce((s, v) => s + v, 0) / previous.length : 0;
      const trend = recentAvg - previousAvg;
      
      return { ...sensor, avg, trend };
    });
  }, [sensorData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-black/90 border border-cyan-500/50 rounded-lg p-3 backdrop-blur-sm">
        <p className="text-cyan-300 text-sm font-medium mb-2">
          Time: {payload[0]?.payload?.timestamp}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-white text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toFixed(1)}{sensors.find(s => s.key === entry.dataKey)?.unit}
          </p>
        ))}
      </div>
    );
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
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
      {/* Background effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full animated-gradient rounded-xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Activity className="w-7 h-7 text-cyan-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold">All Sensors Overview</h3>
            <p className="text-sm text-white/60">Real-time sensor data correlation</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map((sensor) => (
            <motion.div
              key={sensor.key}
              className="bg-black/20 rounded-lg p-3 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xs font-medium text-white/60 mb-1">
                {sensor.name}
              </div>
              <div 
                className="text-lg font-bold mb-1"
                style={{ color: sensor.color }}
              >
                {sensor.avg.toFixed(1)}{sensor.unit}
              </div>
              <div className={`text-xs flex items-center justify-center gap-1 ${
                Math.abs(sensor.trend) < 0.1 ? 'text-gray-400' :
                sensor.trend > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp 
                  className={`w-3 h-3 ${sensor.trend < 0 ? 'rotate-180' : ''}`}
                />
                {Math.abs(sensor.trend).toFixed(1)}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Chart */}
        <div className="h-64 mb-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                
                {sensors.map((sensor) => (
                  <Line
                    key={sensor.key}
                    type="monotone"
                    dataKey={sensor.key}
                    stroke={sensor.color}
                    strokeWidth={2}
                    dot={false}
                    name={sensor.name}
                    connectNulls={false}
                    activeDot={{
                      r: 4,
                      fill: sensor.color,
                      stroke: 'white',
                      strokeWidth: 2,
                      style: { filter: `drop-shadow(0 0 8px ${sensor.color})` }
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
                <Activity className="w-8 h-8 mx-auto mb-2" />
                <div>Collecting sensor data...</div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Data points summary */}
        <div className="flex justify-between items-center text-xs opacity-60">
          <span>{chartData.length} synchronized data points</span>
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AllSensorsChart;
