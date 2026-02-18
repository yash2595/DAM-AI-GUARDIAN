import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertTriangle, CheckCircle, Info, AlertCircle, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import sendDamFailureAlert from '@/lib/alertService';
import { fetchAuthorities, saveAuthorities } from '@/lib/authorityService';

interface Alert {
  id: string;
  level: 'critical' | 'high' | 'medium' | 'low';
  dam: string;
  location: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

const Alerts = () => {
  const { t } = useLanguage();
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [authorityEmails, setAuthorityEmails] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchAuthorities()
      .then((list) => {
        if (!mounted) return;
        const val = list.join(', ');
        setAuthorityEmails(val);
        try { localStorage.setItem('hydrolake_authority_emails', val); } catch {}
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      level: 'critical',
      dam: 'Tehri Dam',
      location: 'Uttarakhand',
      type: 'Seismic Activity',
      description: 'Seismic activity detected - 0.9 Richter scale. Immediate monitoring required.',
      timestamp: '2 minutes ago',
      status: 'active',
    },
    {
      id: '2',
      level: 'high',
      dam: 'Bhakra Dam',
      location: 'Himachal Pradesh',
      type: 'Water Level',
      description: 'Water level approaching critical threshold at 85%. Prepare for potential overflow.',
      timestamp: '15 minutes ago',
      status: 'active',
    },
    {
      id: '3',
      level: 'medium',
      dam: 'Sardar Sarovar',
      location: 'Gujarat',
      type: 'Vibration',
      description: 'Unusual vibration patterns detected. Recommend structural inspection.',
      timestamp: '1 hour ago',
      status: 'acknowledged',
    },
    {
      id: '4',
      level: 'low',
      dam: 'Nagarjuna Sagar',
      location: 'Telangana',
      type: 'Maintenance',
      description: 'Scheduled maintenance due in 7 days. Sensor calibration required.',
      timestamp: '3 hours ago',
      status: 'active',
    },
    {
      id: '5',
      level: 'high',
      dam: 'Hirakud Dam',
      location: 'Odisha',
      type: 'Crack Detection',
      description: 'Minor crack expansion detected. Width increased by 0.1mm.',
      timestamp: '5 hours ago',
      status: 'acknowledged',
    },
    {
      id: '6',
      level: 'low',
      dam: 'Tehri Dam',
      location: 'Uttarakhand',
      type: 'System',
      description: 'Routine system health check completed successfully.',
      timestamp: '1 day ago',
      status: 'resolved',
    },
  ]);

  const levelConfig = {
    critical: {
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive',
      icon: AlertTriangle,
    },
    high: {
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500',
      icon: AlertCircle,
    },
    medium: {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500',
      icon: Info,
    },
    low: {
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary',
      icon: CheckCircle,
    },
  };

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, status: 'acknowledged' as const } : alert))
    );
    toast.success('Alert acknowledged');
  };

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, status: 'resolved' as const } : alert))
    );
    toast.success('Alert resolved');
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesLevel = filterLevel === 'all' || alert.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      alert.dam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLevel && matchesStatus && matchesSearch;
  });

  const notifyAuthorities = async (alert: Alert) => {
    const recipients = authorityEmails
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      toast.error('Please enter at least one authority email (comma separated)');
      return;
    }

    const subject = `ALERT: ${alert.level.toUpperCase()} - ${alert.dam}`;
    const body = `Dam: ${alert.dam}\nLocation: ${alert.location}\nType: ${alert.type}\nLevel: ${alert.level}\nStatus: ${alert.status}\nTime: ${alert.timestamp}\n\nDescription:\n${alert.description}`;

    const res = await sendDamFailureAlert({ recipients, subject, body, metadata: alert });

    if (res.ok) {
      if ((res as any).fallback) {
        toast.success('Opened mail client (mailto) to notify authorities');
      } else {
        toast.success('Authorities notified successfully');
      }
    } else {
      toast.error(`Failed to notify authorities: ${(res as any).error ?? 'unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">{t('alerts.title')}</h1>
        <p className="text-muted-foreground">{t('alerts.subtitle')}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(levelConfig).map(([level, config]) => {
          const count = alerts.filter((a) => a.level === level && a.status === 'active').length;
          const Icon = config.icon;
          return (
            <div key={level} className={`glass-card rounded-xl p-4 border-l-4 ${config.borderColor}`}>
              <div className="flex items-center gap-3">
                <Icon className={`w-6 h-6 ${config.color}`} />
                <div>
                  <div className="text-2xl font-bold text-foreground">{count}</div>
                  <div className="text-xs text-muted-foreground capitalize">{level}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-6 border-primary/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('alerts.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card"
            />
          </div>

          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-full md:w-48 glass-card">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder={t('alerts.filterByLevel')} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('alerts.allLevels')}</SelectItem>
              <SelectItem value="critical">{t('dashboard.critical')}</SelectItem>
              <SelectItem value="high">{t('alerts.high')}</SelectItem>
              <SelectItem value="medium">{t('alerts.medium')}</SelectItem>
              <SelectItem value="low">{t('alerts.low')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48 glass-card">
              <SelectValue placeholder={t('alerts.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('alerts.allStatus')}</SelectItem>
              <SelectItem value="active">{t('alerts.active')}</SelectItem>
              <SelectItem value="acknowledged">{t('alerts.acknowledged')}</SelectItem>
              <SelectItem value="resolved">{t('alerts.resolved')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Authorities emails input (comma separated) */}
        <div className="mt-4">
          <label className="text-sm text-muted-foreground block mb-2">Authorities' emails (comma separated)</label>
          <div className="flex gap-2">
            <Input
              placeholder="authority1@example.com, authority2@example.com"
              value={authorityEmails}
              onChange={(e) => {
                setAuthorityEmails(e.target.value);
                try { localStorage.setItem('hydrolake_authority_emails', e.target.value); } catch {}
              }}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const recipients = authorityEmails.split(',').map(s => s.trim()).filter(Boolean);
                if (recipients.length === 0) { toast.error('Enter at least one email'); return; }
                setSaveStatus('saving');
                const res = await saveAuthorities(recipients);
                if (res.ok) { setSaveStatus('saved'); toast.success('Authorities saved to server'); }
                else { setSaveStatus('error'); toast.error(`Save failed: ${res.error ?? 'unknown'}`); }
                setTimeout(() => setSaveStatus(null), 3000);
              }}
            >
              Save to server
            </Button>
            {saveStatus && <div className="text-sm text-muted-foreground pl-2">{saveStatus}</div>}
            <div className="hidden md:block text-sm text-muted-foreground pt-2">Enter recipients to enable Notify action</div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border-primary/30">
            <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Alerts Found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const config = levelConfig[alert.level];
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={`glass-card rounded-xl p-6 border-l-4 ${config.borderColor} ${
                  alert.status === 'resolved' ? 'opacity-60' : ''
                } animate-slide-in`}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{alert.dam}</h3>
                        <p className="text-sm text-muted-foreground">
                          {alert.location} • {alert.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.color} uppercase`}
                        >
                          {alert.level}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            alert.status === 'active'
                              ? 'bg-destructive/10 text-destructive'
                              : alert.status === 'acknowledged'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : 'bg-secondary/10 text-secondary'
                          } uppercase`}
                        >
                          {alert.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-foreground">{alert.description}</p>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <p className="text-sm text-muted-foreground">{alert.timestamp}</p>

                      {alert.status === 'active' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcknowledge(alert.id)}
                            className="glass-card"
                          >
                            Acknowledge
                          </Button>
                          <Button size="sm" onClick={() => handleResolve(alert.id)}>
                            Resolve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => notifyAuthorities(alert)}>
                            Notify Authorities
                          </Button>
                        </div>
                      )}

                      {alert.status === 'acknowledged' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleResolve(alert.id)}>
                            Mark as Resolved
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => notifyAuthorities(alert)}>
                            Notify Authorities
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Alerts;
