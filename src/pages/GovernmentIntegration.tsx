import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Cloud, FileText, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface GovernmentAgency {
  id: string;
  name: string;
  nameHindi: string;
  type: 'disaster' | 'weather' | 'water' | 'state';
  status: 'connected' | 'pending' | 'offline';
  lastSync: Date;
}

interface ComplianceReport {
  id: string;
  title: string;
  agency: string;
  dueDate: Date;
  status: 'submitted' | 'pending' | 'overdue';
}

const GovernmentIntegration = () => {
  const { t } = useLanguage();
  
  const [agencies] = useState<GovernmentAgency[]>([
    {
      id: '1',
      name: 'National Disaster Management Authority (NDMA)',
      nameHindi: 'राष्ट्रीय आपदा प्रबंधन प्राधिकरण',
      type: 'disaster',
      status: 'connected',
      lastSync: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: '2',
      name: 'India Meteorological Department (IMD)',
      nameHindi: 'भारतीय मौसम विज्ञान विभाग',
      type: 'weather',
      status: 'connected',
      lastSync: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Central Water Commission (CWC)',
      nameHindi: 'केंद्रीय जल आयोग',
      type: 'water',
      status: 'connected',
      lastSync: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: '4',
      name: 'Uttarakhand State Disaster Management Authority',
      nameHindi: 'उत्तराखंड राज्य आपदा प्रबंधन प्राधिकरण',
      type: 'state',
      status: 'connected',
      lastSync: new Date(Date.now() - 10 * 60 * 1000)
    }
  ]);

  const [reports] = useState<ComplianceReport[]>([
    {
      id: '1',
      title: 'Monthly Safety Report',
      agency: 'NDMA',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'pending'
    },
    {
      id: '2',
      title: 'Weekly Water Level Report',
      agency: 'CWC',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'pending'
    },
    {
      id: '3',
      title: 'Emergency Preparedness Audit',
      agency: 'State DMA',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'overdue'
    }
  ]);

  const [ndmaAlerts] = useState([
    {
      id: '1',
      severity: 'high',
      message: 'Heavy rainfall expected in Uttarakhand region for next 48 hours',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      severity: 'medium',
      message: 'Increased water flow in Bhagirathi River',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
    }
  ]);

  const [imdData] = useState({
    rainfall: {
      today: 45.2,
      forecast24h: 78.5,
      forecast48h: 102.3
    },
    temperature: {
      current: 18,
      max: 22,
      min: 14
    },
    windSpeed: 15,
    humidity: 75
  });

  const syncWithAgency = async (agencyId: string) => {
    try {
      // In production, sync with actual government APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Data synced successfully!');
    } catch (error) {
      toast.error('Failed to sync data');
    }
  };

  const submitReport = async (reportId: string) => {
    try {
      // In production, submit to government portal
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Report submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const statusConfig = {
    connected: { color: 'bg-green-500/20 text-green-600 border-green-500', label: 'Connected' },
    pending: { color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500', label: 'Pending' },
    offline: { color: 'bg-red-500/20 text-red-600 border-red-500', label: 'Offline' }
  };

  const reportStatusConfig = {
    submitted: { color: 'bg-green-500/20 text-green-600', label: 'Submitted' },
    pending: { color: 'bg-yellow-500/20 text-yellow-600', label: 'Pending' },
    overdue: { color: 'bg-red-500/20 text-red-600', label: 'Overdue' }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Government Systems Integration</h1>
        <p className="text-muted-foreground">NDMA, IMD, and state authorities data sharing</p>
      </div>

      {/* Connected Agencies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agencies.map((agency) => {
          const config = statusConfig[agency.status];
          return (
            <Card key={agency.id} className="p-6 glass-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-bold">{agency.name}</h3>
                    <p className="text-sm text-muted-foreground">{agency.nameHindi}</p>
                  </div>
                </div>
                <Badge className={`${config.color} border`}>
                  {config.label}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Last sync: {formatTimeAgo(agency.lastSync)}
                </span>
                <Button
                  onClick={() => syncWithAgency(agency.id)}
                  variant="outline"
                  size="sm"
                >
                  Sync Now
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* NDMA Alerts */}
      <Card className="p-6 glass-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">🚨 NDMA Alerts</h2>
          <Badge className="bg-blue-500/20 text-blue-600">
            {ndmaAlerts.length} Active
          </Badge>
        </div>
        
        <div className="space-y-3">
          {ndmaAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'high'
                  ? 'bg-red-500/10 border-l-red-500'
                  : 'bg-yellow-500/10 border-l-yellow-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className={`w-4 h-4 ${
                      alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
                    }`} />
                    <span className={`text-xs font-medium uppercase ${
                      alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                      {alert.severity} Priority
                    </span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatTimeAgo(alert.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* IMD Weather Data */}
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-3 mb-4">
          <Cloud className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold">☁️ IMD Weather Data</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border border-border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Rainfall Today</div>
            <div className="text-2xl font-bold">{imdData.rainfall.today} mm</div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">24h Forecast</div>
            <div className="text-2xl font-bold text-orange-500">{imdData.rainfall.forecast24h} mm</div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">48h Forecast</div>
            <div className="text-2xl font-bold text-red-500">{imdData.rainfall.forecast48h} mm</div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Temperature</div>
            <div className="text-2xl font-bold">{imdData.temperature.current}°C</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <p className="text-sm">
            <strong>IMD Advisory:</strong> Heavy to very heavy rainfall expected. Dam authorities advised to maintain high alert and ensure spillway readiness.
          </p>
        </div>
      </Card>

      {/* Compliance Reports */}
      <Card className="p-6 glass-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">📄 Compliance Reports</h2>
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Report
          </Button>
        </div>

        <div className="space-y-3">
          {reports.map((report) => {
            const config = reportStatusConfig[report.status];
            const daysUntilDue = Math.ceil((report.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={report.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="w-5 h-5 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">For: {report.agency}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {report.dueDate.toLocaleDateString()} 
                        ({daysUntilDue > 0 ? `in ${daysUntilDue} days` : `${Math.abs(daysUntilDue)} days overdue`})
                      </p>
                    </div>
                  </div>
                  <Badge className={config.color}>
                    {config.label}
                  </Badge>
                </div>
                
                {report.status !== 'submitted' && (
                  <Button
                    onClick={() => submitReport(report.id)}
                    size="sm"
                    className="w-full"
                  >
                    Submit Report
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{agencies.length}</div>
              <div className="text-sm text-muted-foreground">Connected Agencies</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold">
                {agencies.filter(a => a.status === 'connected').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Connections</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">{ndmaAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-500" />
            <div>
              <div className="text-2xl font-bold">
                {reports.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Reports</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GovernmentIntegration;
