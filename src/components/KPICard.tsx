import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface KPICardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  suffix?: string;
  trend?: string;
  trendUp?: boolean;
  iconColor?: string;
}

const KPICard = ({
  icon: Icon,
  value,
  label,
  suffix = '',
  trend,
  trendUp = true,
  iconColor = 'text-primary',
}: KPICardProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="relative overflow-hidden glass-card glass-card-hover rounded-2xl p-6 transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="w-14 h-14 glass-card rounded-xl flex items-center justify-center mb-4">
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>

        <div className="text-4xl font-bold text-foreground mb-2">
          {displayValue.toLocaleString()}
          {suffix}
        </div>

        <div className="text-sm text-muted-foreground mb-3">{label}</div>

        {trend && (
          <div
            className={`text-sm flex items-center gap-1 ${
              trendUp ? 'text-secondary' : 'text-destructive'
            }`}
          >
            <span>{trendUp ? '↑' : '↓'}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
