import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import KPICard from '@/components/KPICard';
import SensorCard from '@/components/SensorCard';
import {
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  Users,
  Layers,
  Droplets,
  Zap,
  Gauge,
  Thermometer,
  CloudRain,
  Radio,
  Ruler,
  Compass,
} from 'lucide-react';

const Overview = () => {
  const { t } = useLanguage();
  const [sensorData, setSensorData] = useState({
    waterLevel: 78.5,
    vibration: 2.3,
    pressure: 4.5,
    temperature: 28,
    rainfall: 12,
    seismic: 0.8,
    crackWidth: 0.3,
    tilt: 0.02,
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData({
        waterLevel: 75 + Math.random() * 10,
        vibration: 2 + Math.random() * 2,
        pressure: 4 + Math.random() * 1,
        temperature: 25 + Math.random() * 5,
        rainfall: Math.random() * 20,
        seismic: Math.random() * 1,
        crackWidth: 0.2 + Math.random() * 0.2,
        tilt: 0.01 + Math.random() * 0.02,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const generateTrend = () => Array.from({ length: 12 }, () => 60 + Math.random() * 40);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          icon={Shield}
          value={60000}
          label={t('dashboard.totalDamsMonitored')}
          suffix="+"
          trend={`+5.2% ${t('dashboard.fromLastMonth')}`}
          trendUp={true}
          iconColor="text-primary"
        />
        <KPICard
          icon={AlertTriangle}
          value={12}
          label={t('dashboard.criticalAlerts')}
          trend={`-8% ${t('dashboard.thisWeek')}`}
          trendUp={false}
          iconColor="text-destructive"
        />
        <KPICard
          icon={Activity}
          value={450000}
          label={t('dashboard.activeSensors')}
          suffix="+"
          trend={`+12% ${t('dashboard.operational')}`}
          trendUp={true}
          iconColor="text-secondary"
        />
        <KPICard
          icon={TrendingUp}
          value={94.8}
          label={t('dashboard.aiAccuracy')}
          suffix="%"
          trend={`+2.3% ${t('dashboard.improved')}`}
          trendUp={true}
          iconColor="text-accent"
        />
        <KPICard
          icon={Users}
          value={2500000}
          label={t('dashboard.livesProtected')}
          suffix="+"
          trend={`+15% ${t('dashboard.coverage')}`}
          trendUp={true}
          iconColor="text-yellow-500"
        />
        <KPICard
          icon={Layers}
          value={45000}
          label={t('dashboard.agingDams')}
          suffix="+"
          trend={t('dashboard.requiresMonitoring')}
          trendUp={false}
          iconColor="text-orange-500"
        />
      </div>

      {/* Live Sensor Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">{t('dashboard.liveSensorMonitoring')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SensorCard
            icon={Droplets}
            label={t('dashboard.waterLevel')}
            value={sensorData.waterLevel}
            unit="%"
            status={sensorData.waterLevel > 85 ? 'warning' : 'normal'}
            trend={generateTrend()}
          />
          <SensorCard
            icon={Zap}
            label={t('dashboard.vibrations')}
            value={sensorData.vibration}
            unit="mm/s"
            status={sensorData.vibration > 3 ? 'warning' : 'normal'}
            trend={generateTrend()}
          />
          <SensorCard
            icon={Gauge}
            label={t('dashboard.pressure')}
            value={sensorData.pressure}
            unit="MPa"
            status={sensorData.pressure > 4.8 ? 'warning' : 'normal'}
            trend={generateTrend()}
          />
          <SensorCard
            icon={Thermometer}
            label={t('dashboard.temperature')}
            value={sensorData.temperature}
            unit="°C"
            status="normal"
            trend={generateTrend()}
          />
          <SensorCard
            icon={CloudRain}
            label={t('dashboard.rainfall')}
            value={sensorData.rainfall}
            unit="mm/h"
            status={sensorData.rainfall > 15 ? 'warning' : 'normal'}
            trend={generateTrend()}
          />
          <SensorCard
            icon={Radio}
            label={t('dashboard.seismic')}
            value={sensorData.seismic}
            unit="Richter"
            status={sensorData.seismic > 0.9 ? 'critical' : 'normal'}
            trend={generateTrend()}
          />
          <SensorCard
            icon={Ruler}
            label={t('dashboard.crackWidth')}
            value={sensorData.crackWidth}
            unit="mm"
            status={sensorData.crackWidth > 0.35 ? 'warning' : 'normal'}
            trend={generateTrend()}
          />
          <SensorCard
            icon={Compass}
            label={t('dashboard.tilt')}
            value={sensorData.tilt}
            unit="°"
            status={sensorData.tilt > 0.025 ? 'warning' : 'normal'}
            trend={generateTrend()}
          />
        </div>
      </div>

      {/* Recent Alerts Panel */}
      <div className="glass-card rounded-2xl p-6 border-primary/30">
        <h2 className="text-2xl font-bold text-foreground mb-4">{t('dashboard.recentAlerts')}</h2>
        <div className="space-y-3">
          {[
            {
              level: 'critical',
              dam: 'Tehri Dam',
              message: 'Seismic activity detected - 0.9 Richter',
              time: '2 minutes ago',
            },
            {
              level: 'warning',
              dam: 'Bhakra Dam',
              message: 'Water level approaching 85%',
              time: '15 minutes ago',
            },
            {
              level: 'info',
              dam: 'Sardar Sarovar',
              message: 'Routine maintenance completed',
              time: '1 hour ago',
            },
          ].map((alert, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 p-4 rounded-lg glass-card border-l-4 ${
                alert.level === 'critical'
                  ? 'border-destructive'
                  : alert.level === 'warning'
                  ? 'border-yellow-500'
                  : 'border-primary'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 flex-shrink-0 ${
                  alert.level === 'critical'
                    ? 'text-destructive'
                    : alert.level === 'warning'
                    ? 'text-yellow-500'
                    : 'text-primary'
                }`}
              />
              <div className="flex-1">
                <div className="font-medium text-foreground">{alert.dam}</div>
                <div className="text-sm text-muted-foreground">{alert.message}</div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">{alert.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
