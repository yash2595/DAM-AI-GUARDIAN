import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Mail, Building, Phone, Shield, Bell, Clock } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    organization: currentUser?.organization || '',
    phone: currentUser?.phone || '',
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: false,
    weeklyReports: true,
  });

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      organization: currentUser?.organization || '',
      phone: currentUser?.phone || '',
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-primary',
      'bg-secondary',
      'bg-accent',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-orange-500',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const lastLogin = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      {/* Profile Header */}
      <div className="glass-card rounded-2xl p-8 border-primary/30">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div
            className={`w-32 h-32 rounded-full ${getAvatarColor(
              currentUser?.name || ''
            )} flex items-center justify-center text-5xl font-bold`}
          >
            {getInitials(currentUser?.name || 'User')}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-foreground mb-2">{currentUser?.name}</h2>
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center md:justify-start text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{currentUser?.email}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>{currentUser?.role}</span>
              </div>
              {currentUser?.organization && (
                <div className="flex items-center gap-2 justify-center md:justify-start text-muted-foreground">
                  <Building className="w-4 h-4" />
                  <span>{currentUser?.organization}</span>
                </div>
              )}
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <div>
                <div className="font-medium text-foreground">Last Login</div>
                <div className="text-xs">{lastLogin}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="glass-card rounded-2xl p-8 border-primary/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">User Information</h3>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="glass-card">
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="pl-10 glass-card"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="pl-10 glass-card"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                disabled={!isEditing}
                className="pl-10 glass-card"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="pl-10 glass-card"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass-card rounded-2xl p-8 border-primary/30">
        <h3 className="text-xl font-bold text-foreground mb-6">Notification Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <Label htmlFor="emailNotif" className="font-medium text-foreground">
                  Email Notifications
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Receive email alerts for critical events</p>
            </div>
            <Switch
              id="emailNotif"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-secondary" />
                <Label htmlFor="smsAlerts" className="font-medium text-foreground">
                  SMS Alerts
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Get SMS for high-priority alerts</p>
            </div>
            <Switch
              id="smsAlerts"
              checked={settings.smsAlerts}
              onCheckedChange={(checked) => setSettings({ ...settings, smsAlerts: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                <Label htmlFor="weeklyReports" className="font-medium text-foreground">
                  Weekly Reports
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Receive weekly performance summaries</p>
            </div>
            <Switch
              id="weeklyReports"
              checked={settings.weeklyReports}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, weeklyReports: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="glass-card rounded-2xl p-8 border-primary/30">
        <h3 className="text-xl font-bold text-foreground mb-6">Security</h3>
        <div className="space-y-4">
          <Button variant="outline" className="glass-card">
            Change Password
          </Button>
          <p className="text-sm text-muted-foreground">
            Update your password regularly to keep your account secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
