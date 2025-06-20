export const SENSOR_TYPES = {
  TEMPERATURE: 'temperature',
  HUMIDITY: 'humidity',
  LUMINOSITY: 'luminosity', 
  SOUND: 'sound'
};

export const TOPICS = {
  TEMPERATURE: 'm2ccm/noa/g22315333/data/temperature',
  LUMINOSITY: 'm2ccm/noa/g22315333/data/luminosity',
  SOUND: 'm2ccm/noa/g22315333/data/sound',
  STATUS: 'm2ccm/noa/g22315333/statut',
  LED_COMMAND: 'm2ccm/noa/g22315333/command/led',
  DATA_COMMAND: 'm2ccm/noa/g22315333/command/data_transmission',
  CLASS_TEMP: 'm2ccm/+/+/data/temperature',
  // 🆕 FIXED: Correct class data topic
  CLASS_DATA: 'm2ccm/+/+/temp'
};

export const SENSOR_RANGES = {
  temperature: { min: -40, max: 85 },
  humidity: { min: 0, max: 100 },
  luminosity: { min: 0, max: 100 },
  sound: { min: 0, max: 100 }
};

export const SENSOR_COLORS = {
  temperature: '#ef4444',
  humidity: '#06b6d4',
  luminosity: '#f59e0b',
  sound: '#10b981'
};
