import { useState, useEffect, useRef, useCallback } from 'react';
import { TOPICS, SENSOR_RANGES } from '../types';

export const useMQTT = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [sensorData, setSensorData] = useState({
    temperature: { 
      value: 0, 
      humidity: 0, 
      timestamp: 0, 
      min: Infinity, 
      max: -Infinity, 
      history: [],
      lastUpdate: 0
    },
    humidity: {
      value: 0,
      timestamp: 0,
      min: Infinity,
      max: -Infinity,
      history: [],
      lastUpdate: 0
    },
    luminosity: { 
      value: 0, 
      raw: 0, 
      timestamp: 0, 
      min: Infinity, 
      max: -Infinity, 
      history: [],
      lastUpdate: 0
    },
    sound: { 
      value: 0, 
      raw: 0, 
      timestamp: 0, 
      min: Infinity, 
      max: -Infinity, 
      history: [],
      lastUpdate: 0
    }
  });
  const [deviceStatus, setDeviceStatus] = useState('offline');
  const [classTemperatures, setClassTemperatures] = useState([]);
  const [classAverage, setClassAverage] = useState(0);
  // 🆕 SIMPLIFIED: Only track class temperature data
  const [studentTemperatures, setStudentTemperatures] = useState({});
  const [classStats, setClassStats] = useState({
    temperature: 0,
    studentCount: 0
  });

  const wsRef = useRef(null);
  const lastMessageTime = useRef({});
  const reconnectTimeoutRef = useRef(null);
  
  const FLOOD_PROTECTION_MS = 100;
  const MAX_HISTORY_POINTS = 50;
  const MAX_CLASS_TEMPS = 100;
  const MAX_STUDENT_HISTORY = 30;

  const isValidSensorData = useCallback((topic, data) => {
    if (!data || typeof data.value !== 'number' || isNaN(data.value)) {
      console.warn(`Invalid data format for ${topic}:`, data);
      return false;
    }
    
    const sensorType = getSensorType(topic);
    if (!sensorType || !SENSOR_RANGES[sensorType]) return false;
    
    const { min, max } = SENSOR_RANGES[sensorType];
    const isInRange = data.value >= min && data.value <= max;
    
    if (!isInRange) {
      console.warn(`Out of range data for ${topic}: ${data.value} (expected ${min}-${max})`);
    }
    
    return isInRange;
  }, []);

  // 🆕 SIMPLIFIED: Only validate temperature from class data
  const isValidClassTemperature = useCallback((temp) => {
    const tempNum = typeof temp === 'string' ? parseFloat(temp) : temp;
    return typeof tempNum === 'number' && !isNaN(tempNum) && tempNum >= -40 && tempNum <= 85;
  }, []);

  const getStudentName = useCallback((topic) => {
    const parts = topic.split('/');
    if (parts.length >= 3) {
      return parts[1]; // student name
    }
    return 'Unknown';
  }, []);

  const getSensorType = useCallback((topic) => {
    if (topic.includes('temperature')) return 'temperature';
    if (topic.includes('luminosity')) return 'luminosity';
    if (topic.includes('sound')) return 'sound';
    return null;
  }, []);

  const calculateAverage = useCallback((history) => {
    if (!history || history.length === 0) return 0;
    const sum = history.reduce((acc, point) => acc + point.value, 0);
    return sum / history.length;
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log('🔄 Connecting to Next.js Backend WebSocket...');
    setConnectionStatus('Connecting to Next.js Backend...');

    const ws = new WebSocket('ws://localhost:3001/api/mqtt-ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🚀 Connected to Next.js Backend!');
      setIsConnected(true);
      setConnectionStatus('Connected via Next.js Backend');
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connection') {
          console.log('📡 Backend connection status:', data);
          return;
        }

        if (data.type === 'mqtt-message') {
          const { topic, message } = data;
          const now = Date.now();
          
          if (lastMessageTime.current[topic] && 
              now - lastMessageTime.current[topic] < FLOOD_PROTECTION_MS) {
            return;
          }
          lastMessageTime.current[topic] = now;

          console.log(`📥 MQTT via Backend: ${topic}`);

          if (topic === TOPICS.STATUS) {
            setDeviceStatus(message);
            return;
          }

          // 🆕 FIXED: Handle class temperature data from /temp topics
          if (topic.includes('/temp') && !topic.includes('/data/')) {
            try {
              const classDataPayload = JSON.parse(message);
              
              // Extract only temperature
              const tempValue = classDataPayload.temp;
              if (!isValidClassTemperature(tempValue)) {
                console.warn(`Invalid class temperature from ${topic}:`, tempValue);
                return;
              }

              const studentName = getStudentName(topic);
              const tempNum = typeof tempValue === 'string' ? parseFloat(tempValue) : tempValue;
              
              console.log(`📊 Class temperature from ${studentName}: ${tempNum}°C`);

              // Track individual student temperatures
              setStudentTemperatures(prev => {
                const studentHistory = prev[studentName]?.history || [];
                const newHistory = [...studentHistory, {
                  value: tempNum,
                  timestamp: now
                }].slice(-MAX_STUDENT_HISTORY);

                return {
                  ...prev,
                  [studentName]: {
                    name: studentName,
                    latest: tempNum,
                    history: newHistory,
                    lastUpdate: now
                  }
                };
              });

              // Update class temperature list (for compatibility)
              setClassTemperatures(prev => {
                const newTemps = [...prev, {
                  value: tempNum,
                  timestamp: now,
                  source: topic,
                  student: studentName
                }].slice(-MAX_CLASS_TEMPS);
                
                const avg = newTemps.reduce((sum, temp) => sum + temp.value, 0) / newTemps.length;
                setClassAverage(avg);
                
                const uniqueStudents = new Set(newTemps.map(t => t.student));
                setClassStats({
                  temperature: avg,
                  studentCount: uniqueStudents.size
                });

                console.log(`📊 Class average updated: ${avg.toFixed(1)}°C from ${uniqueStudents.size} students`);
                
                return newTemps;
              });
              
              return;
            } catch (parseError) {
              console.error('❌ Error parsing class temperature data:', parseError);
              return;
            }
          }

          // 🚀 RESTORED: Original individual sensor data processing (UNTOUCHED)
          try {
            const sensorData = JSON.parse(message);
            
            if (!isValidSensorData(topic, sensorData)) {
              return;
            }

            const sensorType = getSensorType(topic);
            if (!sensorType) return;

            setSensorData(prev => {
              const current = prev[sensorType];
              const newHistory = [...current.history, { 
                value: sensorData.value, 
                timestamp: now 
              }].slice(-MAX_HISTORY_POINTS);

              const newData = {
                ...sensorData,
                min: Math.min(current.min, sensorData.value),
                max: Math.max(current.max, sensorData.value),
                history: newHistory,
                lastUpdate: now,
                average: calculateAverage(newHistory)
              };

              // 🚀 RESTORED: Humidity extraction from temperature topic
              if (sensorType === 'temperature' && sensorData.humidity !== undefined) {
                const humidityValue = sensorData.humidity;
                const currentHumidity = prev.humidity;
                const humidityHistory = [...currentHumidity.history, {
                  value: humidityValue,
                  timestamp: now
                }].slice(-MAX_HISTORY_POINTS);

                const humidityData = {
                  value: humidityValue,
                  timestamp: now,
                  min: Math.min(currentHumidity.min, humidityValue),
                  max: Math.max(currentHumidity.max, humidityValue),
                  history: humidityHistory,
                  lastUpdate: now,
                  average: calculateAverage(humidityHistory)
                };

                return {
                  ...prev,
                  [sensorType]: newData,
                  humidity: humidityData
                };
              }

              return {
                ...prev,
                [sensorType]: newData
              };
            });

          } catch (parseError) {
            console.error('❌ Error parsing sensor data:', parseError);
          }
        }
      } catch (error) {
        console.error('❌ WebSocket message error:', error);
      }
    };

    ws.onclose = () => {
      console.log('🔌 Disconnected from Next.js Backend');
      setIsConnected(false);
      setConnectionStatus('Disconnected - Reconnecting...');
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Attempting to reconnect...');
        connectWebSocket();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('Connection error');
    };

  }, [isValidSensorData, isValidClassTemperature, getSensorType, getStudentName, calculateAverage]);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const sendCommand = useCallback((topic, message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log(`📤 Sending command: ${topic} = ${message}`);
      wsRef.current.send(JSON.stringify({ topic, message }));
    } else {
      console.warn('❌ Cannot send command: WebSocket not connected');
    }
  }, []);

  const toggleLED = useCallback((state) => {
    if (state === "on") {
      console.log('💡 Turning LED ON via Next.js Backend...');
      sendCommand(TOPICS.LED_COMMAND, 'on');
    } else if (state === "off") {
      console.log('💡 Turning LED OFF via Next.js Backend...');
      sendCommand(TOPICS.LED_COMMAND, 'off');
    } else {
      console.log('💡 Toggling LED via Next.js Backend...');
      sendCommand(TOPICS.LED_COMMAND, 'enable');
      setTimeout(() => {
        sendCommand(TOPICS.LED_COMMAND, 'disable');
      }, 2000);
    }
  }, [sendCommand]);

  const toggleDataTransmission = useCallback((enabled) => {
    console.log(`📡 ${enabled ? 'Enabling' : 'Disabling'} data transmission via Next.js Backend...`);
    sendCommand(TOPICS.DATA_COMMAND, enabled ? 'enable' : 'disable');
  }, [sendCommand]);

  const systemHealth = {
    mqttConnected: isConnected,
    deviceOnline: deviceStatus === 'online',
    dataFlowing: Object.values(sensorData).some(sensor => 
      Date.now() - sensor.lastUpdate < 5000
    ),
    classDataAvailable: Object.keys(studentTemperatures).length > 0
  };

  const overallStatus = systemHealth.mqttConnected && 
                       systemHealth.deviceOnline && 
                       systemHealth.dataFlowing ? 'healthy' : 'warning';

  return {
    isConnected,
    connectionStatus: `${connectionStatus} (Next.js Backend)`,
    deviceStatus,
    overallStatus,
    systemHealth,
    sensorData,
    classAverage,
    classTemperatures,
    classStats,
    studentData: studentTemperatures, // Renamed for clarity
    toggleLED,
    toggleDataTransmission,
    lastMessageTimes: {}
  };
};
