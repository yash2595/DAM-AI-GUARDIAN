import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDam } from '@/contexts/DamContext';
import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import DamLogo from './DamLogo';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const { selectedDam, setSelectedDam, dams } = useDam();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Generate user initials and color based on name
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

  return (
    <header className="glass-card border-b border-primary/30 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <DamLogo size={40} showText={false} />
          
          <Select value={selectedDam} onValueChange={setSelectedDam}>
            <SelectTrigger className="w-64 glass-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dams.map((dam) => (
                <SelectItem key={dam.value} value={dam.value}>
                  {dam.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Notification Bell */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3">
                <div
                  className={`w-10 h-10 rounded-full ${getAvatarColor(
                    currentUser?.name || ''
                  )} flex items-center justify-center font-semibold text-sm`}
                >
                  {getInitials(currentUser?.name || 'User')}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium">{currentUser?.name}</div>
                  <div className="text-xs text-muted-foreground">{currentUser?.role}</div>
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card">
              <DropdownMenuLabel>{t('common.settings')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                <User className="w-4 h-4 mr-2" />
                {t('nav.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                <Settings className="w-4 h-4 mr-2" />
                {t('common.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                {t('common.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
