import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, Phone, Users, AlertTriangle, Send, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { communityAlertsService } from '@/services/apiService';

interface Community {
  id: string;
  name: string;
  distance: number; // km from dam
  population: number;
  contact: string;
  whatsapp: string;
  status: 'safe' | 'alert' | 'evacuate';
}

const CommunityAlerts = () => {
  const { t } = useLanguage();
  
  const [communities, setCommunities] = useState<Community[]>([
    {
      id: '1',
      name: 'Tehri Town',
      distance: 2.5,
      population: 15000,
      contact: '+91-8000824196',
      whatsapp: '+91-8000824196',
      status: 'safe'
    },
    {
      id: '2',
      name: 'New Tehri',
      distance: 5.0,
      population: 25000,
      contact: '+91-8000824196',
      whatsapp: '+91-8000824196',
      status: 'safe'
    },
    {
      id: '3',
      name: 'Rishikesh',
      distance: 15.0,
      population: 100000,
      contact: '+91-8000824196',
      whatsapp: '+91-8000824196',
      status: 'alert'
    },
    {
      id: '4',
      name: 'Devprayag',
      distance: 8.0,
      population: 8000,
      contact: '+91-8000824196',
      whatsapp: '+91-8000824196',
      status: 'safe'
    }
  ]);

  const [alertMessage, setAlertMessage] = useState('');
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);

  const statusConfig = {
    safe: {
      label: 'Safe',
      color: 'text-green-600',
      bg: 'bg-green-500/20',
      border: 'border-green-500'
    },
    alert: {
      label: 'Alert',
      color: 'text-yellow-600',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500'
    },
    evacuate: {
      label: 'Evacuate',
      color: 'text-red-600',
      bg: 'bg-red-500/20',
      border: 'border-red-500'
    }
  };

  const sendSMSAlert = async () => {
    if (selectedCommunities.length === 0) {
      toast.error('Please select at least one community');
      return;
    }

    if (!alertMessage.trim()) {
      toast.error('Please enter an alert message');
      return;
    }

    try {
      const selectedData = communities.filter(c => selectedCommunities.includes(c.id));
      const recipients = selectedData.map(c => c.contact);
      
      const result = await communityAlertsService.sendSMS(recipients, alertMessage, selectedData);
      
      if (result.demoMode) {
        toast.info(result.message || `SMS sent in demo mode. Check backend console for details.`, {
          description: result.setupInstructions?.step1 || 'Configure Twilio credentials for real SMS'
        });
      } else {
        toast.success(result.message || `Real SMS sent to ${selectedCommunities.length} communities!`, {
          description: `${result.results?.filter((r: any) => r.status === 'sent').length} messages delivered successfully`
        });
      }
      
      setAlertMessage('');
      setSelectedCommunities([]);
    } catch (error: any) {
      console.error('SMS Error:', error);
      toast.error(error.response?.data?.error || 'Failed to send SMS alert');
    }
  };

  const sendWhatsAppAlert = async () => {
    if (selectedCommunities.length === 0) {
      toast.error('Please select at least one community');
      return;
    }

    if (!alertMessage.trim()) {
      toast.error('Please enter an alert message');
      return;
    }

    try {
      const selectedData = communities.filter(c => selectedCommunities.includes(c.id));
      const recipients = selectedData.map(c => c.whatsapp);
      
      const result = await communityAlertsService.sendWhatsApp(recipients, alertMessage, selectedData);
      
      if (result.demoMode) {
        toast.info(result.message || `WhatsApp sent in demo mode. Check backend console for details.`, {
          description: result.setupInstructions?.step1 || 'Configure WhatsApp API credentials for real messages'
        });
      } else {
        toast.success(result.message || `Real WhatsApp sent to ${selectedCommunities.length} communities!`, {
          description: `${result.results?.filter((r: any) => r.status === 'sent').length} messages delivered successfully`
        });
      }
      
      setAlertMessage('');
      setSelectedCommunities([]);
    } catch (error: any) {
      console.error('WhatsApp Error:', error);
      toast.error(error.response?.data?.error || 'Failed to send WhatsApp alert');
    }
  };

  const sendEmergencyBroadcast = async () => {
    if (!alertMessage.trim()) {
      toast.error('Please enter an emergency message');
      return;
    }

    try {
      const result = await communityAlertsService.sendBroadcast(alertMessage, communities);
      
      toast.success(result.message || 'Emergency broadcast sent to all communities via SMS & WhatsApp!');
      setAlertMessage('');
      setSelectedCommunities([]);
    } catch (error: any) {
      console.error('Broadcast Error:', error);
      toast.error(error.response?.data?.error || 'Failed to send emergency broadcast');
    }
  };

  const toggleCommunity = (id: string) => {
    setSelectedCommunities(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedCommunities(communities.map(c => c.id));
  };

  const deselectAll = () => {
    setSelectedCommunities([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Community Alert System</h1>
        <p className="text-muted-foreground">Send emergency alerts to nearby villages via SMS & WhatsApp</p>
      </div>

      {/* Demo Mode Banner */}
      <Card className="p-4 bg-blue-50 border-2 border-blue-300">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 mb-1">📱 Real SMS/WhatsApp Integration Ready!</h3>
            <p className="text-sm text-blue-800 mb-2">
              This system supports REAL SMS and WhatsApp messaging. Configure API credentials to start sending real messages.
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>✅ Installed:</strong> Twilio (SMS) and Green API (WhatsApp) packages</p>
              <p><strong>⚙️ Status:</strong> Auto-detects credentials - uses real APIs when configured, demo mode otherwise</p>
              <p><strong>📖 Setup Guide:</strong> See <code>backend/SMS_WHATSAPP_SETUP.md</code> for complete setup instructions</p>
              <p><strong>🆓 Free Credits:</strong> Twilio $15 trial (~2000 SMS), Green API 1000 WhatsApp/month</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{communities.length}</div>
              <div className="text-sm text-muted-foreground">Communities</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold">
                {communities.reduce((sum, c) => sum + c.population, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Population</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">
                {communities.filter(c => c.status === 'alert').length}
              </div>
              <div className="text-sm text-muted-foreground">On Alert</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-purple-500" />
            <div>
              <div className="text-2xl font-bold">
                {Math.min(...communities.map(c => c.distance)).toFixed(1)} km
              </div>
              <div className="text-sm text-muted-foreground">Nearest Community</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Alert Composer */}
      <Card className="p-6 glass-card">
        <h2 className="text-xl font-bold mb-4">📱 Send Alert</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Alert Message (Hindi/English)</label>
            <Textarea
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              placeholder="⚠️ आपातकालीन सूचना / Emergency Alert&#10;&#10;बांध की स्थिति में बदलाव हुआ है। कृपया सतर्क रहें।&#10;Dam condition has changed. Please stay alert.&#10;&#10;समय: {time}&#10;गंभीरता: उच्च&#10;&#10;अधिक जानकारी के लिए: 8000824196"
              className="min-h-[150px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={selectAll} variant="outline" size="sm">
              Select All
            </Button>
            <Button onClick={deselectAll} variant="outline" size="sm">
              Deselect All
            </Button>
            <div className="flex-1"></div>
            <span className="text-sm text-muted-foreground self-center">
              {selectedCommunities.length} selected
            </span>
          </div>

          <div className="flex gap-3">
            <Button onClick={sendSMSAlert} className="flex-1 gap-2" variant="default">
              <Phone className="w-4 h-4" />
              Send SMS
            </Button>
            <Button onClick={sendWhatsAppAlert} className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
              <MessageSquare className="w-4 h-4" />
              Send WhatsApp
            </Button>
            <Button onClick={sendEmergencyBroadcast} className="flex-1 gap-2 bg-red-600 hover:bg-red-700">
              <AlertTriangle className="w-4 h-4" />
              Emergency Broadcast
            </Button>
          </div>
        </div>
      </Card>

      {/* Communities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communities.map((community) => {
          const config = statusConfig[community.status];
          const isSelected = selectedCommunities.includes(community.id);

          return (
            <Card
              key={community.id}
              className={`p-4 glass-card cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              } hover:shadow-lg`}
              onClick={() => toggleCommunity(community.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold">{community.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} ${config.border} border`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {community.distance} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {community.population.toLocaleString()}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="w-5 h-5 rounded"
                />
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span className="font-mono">{community.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-mono">{community.whatsapp}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Templates */}
      <Card className="p-6 glass-card">
        <h2 className="text-xl font-bold mb-4">📝 Quick Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={() => setAlertMessage('⚠️ जल स्तर सामान्य से अधिक है। कृपया सतर्क रहें। / Water level above normal. Please stay alert.')}
            variant="outline"
            className="justify-start h-auto py-3 px-4"
          >
            <div className="text-left">
              <div className="font-semibold">Water Level Alert</div>
              <div className="text-xs text-muted-foreground">High water level warning</div>
            </div>
          </Button>

          <Button
            onClick={() => setAlertMessage('🚨 आपातकालीन स्थिति! तुरंत सुरक्षित स्थान पर जाएं। / EMERGENCY! Move to safe location immediately.')}
            variant="outline"
            className="justify-start h-auto py-3 px-4"
          >
            <div className="text-left">
              <div className="font-semibold">Emergency Evacuation</div>
              <div className="text-xs text-muted-foreground">Critical situation alert</div>
            </div>
          </Button>

          <Button
            onClick={() => setAlertMessage('✅ स्थिति सामान्य है। चिंता की कोई बात नहीं। / Situation normal. No cause for concern.')}
            variant="outline"
            className="justify-start h-auto py-3 px-4"
          >
            <div className="text-left">
              <div className="font-semibold">All Clear</div>
              <div className="text-xs text-muted-foreground">Situation normal message</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CommunityAlerts;
