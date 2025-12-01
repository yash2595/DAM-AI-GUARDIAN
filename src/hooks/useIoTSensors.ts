import { useState, useEffect, useCallback } from 'react';

export interface IoTSensor {
  id: string;
  name: string;
  type: 'water_level' | 'flow_rate' | 'pressure' | 'temperature' | 'turbidity' | 'seismic' | 'rainfall';
  location: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastReading: number;
  unit: string;
  timestamp: Date;
  battery: number;
  signalStrength: number;
}

export interface IoTDataStream {
  sensorId: string;
  value: number;
  timestamp: Date;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

// Simulated MQTT-like real-time sensor data
export const useIoTSensors = () => {
  const [sensors, setSensors] = useState<IoTSensor[]>([
    {
      id: 'WL-001',
      name: 'Main Reservoir Water Level',
      type: 'water_level',
      location: 'Reservoir Center',
      status: 'offline',
      lastReading: 45.2,
      unit: 'm',
      timestamp: new Date(),
      battery: 95,
      signalStrength: 0
    },
    {
      id: 'FR-001',
      name: 'Inlet Flow Rate Sensor',
      type: 'flow_rate',
      location: 'Main Inlet',
      status: 'offline',
      lastReading: 1250.5,
      unit: 'm³/s',
      timestamp: new Date(),
      battery: 88,
      signalStrength: 0
    },
    {
      id: 'PR-001',
      name: 'Dam Wall Pressure Sensor',
      type: 'pressure',
      location: 'Dam Wall - Section A',
      status: 'offline',
      lastReading: 850.3,
      unit: 'kPa',
      timestamp: new Date(),
      battery: 92,
      signalStrength: 0
    },
    {
      id: 'PR-002',
      name: 'Dam Wall Pressure Sensor',
      type: 'pressure',
      location: 'Dam Wall - Section B',
      status: 'offline',
      lastReading: 845.7,
      unit: 'kPa',
      timestamp: new Date(),
      battery: 85,
      signalStrength: 0
    },
    {
      id: 'TM-001',
      name: 'Water Temperature Sensor',
      type: 'temperature',
      location: 'Reservoir Outlet',
      status: 'offline',
      lastReading: 18.5,
      unit: '°C',
      timestamp: new Date(),
      battery: 78,
      signalStrength: 0
    },
    {
      id: 'TB-001',
      name: 'Water Turbidity Sensor',
      type: 'turbidity',
      location: 'Inlet Zone',
      status: 'offline',
      lastReading: 12.3,
      unit: 'NTU',
      timestamp: new Date(),
      battery: 91,
      signalStrength: 0
    },
    {
      id: 'SM-001',
      name: 'Seismic Activity Monitor',
      type: 'seismic',
      location: 'Dam Foundation',
      status: 'offline',
      lastReading: 0.02,
      unit: 'g',
      timestamp: new Date(),
      battery: 96,
      signalStrength: 0
    },
    {
      id: 'RF-001',
      name: 'Rainfall Gauge',
      type: 'rainfall',
      location: 'Weather Station',
      status: 'offline',
      lastReading: 0,
      unit: 'mm/h',
      timestamp: new Date(),
      battery: 89,
      signalStrength: 0
    },
    {
      id: 'FR-002',
      name: 'Outlet Flow Rate Sensor',
      type: 'flow_rate',
      location: 'Main Outlet',
      status: 'online',
      lastReading: 980.2,
      unit: 'm³/s',
      timestamp: new Date(),
      battery: 82,
      signalStrength: 87
    },
    {
      id: 'WL-002',
      name: 'Downstream Water Level',
      type: 'water_level',
      location: 'Downstream 1km',
      status: 'maintenance',
      lastReading: 12.8,
      unit: 'm',
      timestamp: new Date(),
      battery: 45,
      signalStrength: 65
    }
  ]);

  const [dataStreams, setDataStreams] = useState<IoTDataStream[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  // Simulate sensor data variation
  const generateSensorValue = (sensor: IoTSensor): number => {
    const variance = sensor.lastReading * 0.02; // 2% variance
    const change = (Math.random() - 0.5) * variance;
    
    let newValue = sensor.lastReading + change;
    
    // Apply sensor-specific logic
    switch (sensor.type) {
      case 'water_level':
        newValue = Math.max(0, Math.min(60, newValue)); // 0-60m range
        break;
      case 'flow_rate':
        newValue = Math.max(0, Math.min(2000, newValue)); // 0-2000 m³/s
        break;
      case 'pressure':
        newValue = Math.max(0, Math.min(1200, newValue)); // 0-1200 kPa
        break;
      case 'temperature':
        newValue = Math.max(5, Math.min(35, newValue)); // 5-35°C
        break;
      case 'turbidity':
        newValue = Math.max(0, Math.min(100, newValue)); // 0-100 NTU
        break;
      case 'seismic':
        newValue = Math.max(0, Math.min(1, newValue)); // 0-1g
        break;
      case 'rainfall':
        // Rainfall can vary more dramatically
        if (Math.random() > 0.95) {
          newValue = Math.random() * 50; // Sudden rainfall
        } else {
          newValue = Math.max(0, newValue * 0.95); // Gradual decrease
        }
        break;
    }
    
    return newValue;
  };

  // Simulate MQTT connection and data streaming
  useEffect(() => {
    setIsConnected(false); // IoT sensors are offline
    
    // Disabled: No data updates when sensors are offline
    /*
    const interval = setInterval(() => {
      setSensors(prevSensors => 
        prevSensors.map(sensor => {
          if (sensor.status === 'offline') return sensor;
          
          const newReading = generateSensorValue(sensor);
          
          // Simulate occasional sensor issues
          if (Math.random() > 0.998) {
            return {
              ...sensor,
              status: 'error' as const,
              lastReading: newReading
            };
          }
          
          // Simulate battery drain
          const batteryDrain = Math.random() * 0.01;
          
          return {
            ...sensor,
            lastReading: newReading,
            timestamp: new Date(),
            battery: Math.max(0, sensor.battery - batteryDrain),
            signalStrength: Math.max(60, Math.min(100, sensor.signalStrength + (Math.random() - 0.5) * 2))
          };
        })
      );
      
      setMessageCount(prev => prev + sensors.filter(s => s.status === 'online').length);
    }, 2000); // Update every 2 seconds

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
    */
  }, []);

  // Generate data stream for charts
  useEffect(() => {
    // Disabled: No data stream when sensors are offline
    /*
    const interval = setInterval(() => {
      sensors.forEach(sensor => {
        if (sensor.status === 'online') {
          const quality = 
            sensor.signalStrength > 90 ? 'excellent' :
            sensor.signalStrength > 75 ? 'good' :
            sensor.signalStrength > 60 ? 'fair' : 'poor';
          
          const dataPoint: IoTDataStream = {
            sensorId: sensor.id,
            value: sensor.lastReading,
            timestamp: new Date(),
            quality
          };
          
          setDataStreams(prev => {
            const updated = [...prev, dataPoint];
            // Keep only last 100 data points per sensor
            return updated.slice(-1000);
          });
        }
      });
    }, 5000); // Store data point every 5 seconds

    return () => clearInterval(interval);
    */
  }, [sensors]);

  const getSensorById = useCallback((id: string) => {
    return sensors.find(s => s.id === id);
  }, [sensors]);

  const getSensorsByType = useCallback((type: IoTSensor['type']) => {
    return sensors.filter(s => s.type === type);
  }, [sensors]);

  const getDataStream = useCallback((sensorId: string, minutes: number = 10) => {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return dataStreams
      .filter(d => d.sensorId === sensorId && d.timestamp >= cutoffTime)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [dataStreams]);

  const resetSensorStatus = useCallback((sensorId: string) => {
    setSensors(prev =>
      prev.map(s => s.id === sensorId ? { ...s, status: 'online' as const } : s)
    );
  }, []);

  const getHealthStatus = useCallback(() => {
    const online = sensors.filter(s => s.status === 'online').length;
    const total = sensors.length;
    const percentage = (online / total) * 100;
    
    return {
      online,
      offline: sensors.filter(s => s.status === 'offline').length,
      maintenance: sensors.filter(s => s.status === 'maintenance').length,
      error: sensors.filter(s => s.status === 'error').length,
      total,
      healthPercentage: percentage,
      status: percentage >= 90 ? 'healthy' : percentage >= 75 ? 'warning' : 'critical'
    };
  }, [sensors]);

  return {
    sensors,
    dataStreams,
    isConnected,
    messageCount,
    getSensorById,
    getSensorsByType,
    getDataStream,
    resetSensorStatus,
    getHealthStatus
  };
};
