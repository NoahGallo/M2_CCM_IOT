import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

const SensorChart = ({ title, data, color = '#3b82f6', unit = '', isOnline = true }) => {
  const chartData = useMemo(() => {
    return data.slice(-30).map((point, index) => ({
      time: index,
      value: point.value,
      timestamp: new Date(point.timestamp).toLocaleTimeString(),
      fullTimestamp: point.timestamp
    }));
  }, [data]);

  const stats = useMemo(() => {
    if (data.length === 0) return { average: 0, trend: 0, min: 0, max: 0 };
    
    const values = data.map(p => p.value);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calculate trend (last 5 vs previous 5)
    const recent = values.slice(-5);
    const previous = values.slice(-10, -5);
    const recentAvg = recent.length ? recent.reduce((s, v) => s + v, 0) / recent.length : 0;
    const previousAvg = previous.length ? previous.reduce((s, v) => s + v, 0) / previous.length : 0;
    const trend = recentAvg - previousAvg;
    
    return { average, trend, min, max };
  }, [data]);

  const getTrendIcon = () => {
    if (Math.abs(stats.trend) < 0.1) return '→';
    return stats.trend > 0 ? '↗' : '↘';
  };

  const getTrendColor = () => {
    if (Math.abs(stats.trend) < 0.1) return 'text-gray-400';
    return stats.trend > 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <motion.div 
      className={`glass-effect rounded-xl p-6 text-white relative overflow-hidden ${
        isOnline ? '' : 'opacity-75'
      }`}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full animated-gradient rounded-xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">{title} History</h3>
            <div className="text-sm opacity-75 flex items-center gap-2">
              <span>Avg: {stats.average.toFixed(1)}{unit}</span>
              <span className={`flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()} {Math.abs(stats.trend).toFixed(1)}
              </span>
            </div>
          </div>
          <div className="text-right text-sm opacity-75">
            <div>Min: {stats.min.toFixed(1)}{unit}</div>
            <div>Max: {stats.max.toFixed(1)}{unit}</div>
          </div>
        </div>
        
        <div className="h-48 mb-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
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
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: `1px solid ${color}`,
                    borderRadius: '12px',
                    color: 'white',
                    boxShadow: `0 0 20px ${color}40`
                  }}
                  labelFormatter={(value, payload) => 
                    payload?.[0]?.payload?.timestamp || ''
                  }
                  formatter={(value) => [`${value.toFixed(2)}${unit}`, title]}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color}
                  strokeWidth={3}
                  fill={`url(#gradient-${title})`}
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    fill: color,
                    stroke: 'white',
                    strokeWidth: 2,
                    style: { filter: `drop-shadow(0 0 10px ${color})` }
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-white/50">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Waiting for data...
              </motion.div>
            </div>
          )}
        </div>

        {/* Data points summary */}
        <div className="flex justify-between items-center text-xs opacity-60">
          <span>{chartData.length} data points</span>
          <span>Last: {chartData.length > 0 ? chartData[chartData.length - 1]?.timestamp : '--'}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SensorChart;
