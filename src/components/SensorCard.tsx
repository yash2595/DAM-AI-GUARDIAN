import { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend?: number[];
}

const SensorCard = ({
  icon: Icon,
  label,
  value,
  unit,
  status,
  trend = [],
}: SensorCardProps) => {
  const statusColors = {
    normal: 'text-secondary',
    warning: 'text-yellow-500',
    critical: 'text-destructive',
  };

  const statusLabels = {
    normal: 'Normal Range',
    warning: 'Attention Needed',
    critical: 'Critical Alert',
  };

  return (
    <div className="glass-card glass-card-hover rounded-xl p-5 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${statusColors[status]}`} />
          <span className="text-foreground font-medium">{label}</span>
        </div>
        <div
          className={`w-2 h-2 rounded-full ${
            status === 'normal' ? 'bg-secondary' : status === 'warning' ? 'bg-yellow-500' : 'bg-destructive'
          } animate-pulse`}
        />
      </div>

      <div className="text-3xl font-bold text-foreground mb-1">
        {value.toFixed(1)}
        <span className="text-lg text-muted-foreground ml-1">{unit}</span>
      </div>

      {trend.length > 0 && (
        <div className="mt-3 h-12 flex items-end gap-1">
          {trend.map((val, idx) => (
            <div
              key={idx}
              className="flex-1 bg-primary/30 rounded-sm transition-all"
              style={{ height: `${(val / Math.max(...trend)) * 100}%` }}
            />
          ))}
        </div>
      )}

      <div className={`mt-2 text-xs ${statusColors[status]} flex items-center gap-1`}>
        <span>●</span>
        <span>{statusLabels[status]}</span>
      </div>
    </div>
  );
};

export default SensorCard;
