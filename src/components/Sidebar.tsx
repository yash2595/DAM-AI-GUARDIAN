import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Brain,
  AlertTriangle,
  History,
  User,
  Shield,
  Zap,
  TrendingUp,
  Radio,
  Users,
  Share2,
  Map,
  Building2,
  MessageCircle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Sidebar = () => {
  const { t } = useLanguage();
  
  const navItems = [
    { to: '/dashboard', label: t('nav.overview'), icon: LayoutDashboard, end: true },
    { to: '/dashboard/monitoring', label: t('nav.monitoring'), icon: Activity },
    { to: '/dashboard/predictions', label: t('nav.aiPredictions'), icon: Brain },
    { to: '/dashboard/analytics', label: t('nav.smartAnalytics'), icon: TrendingUp },
    { to: '/dashboard/iot', label: 'IoT Sensors', icon: Radio },
    { to: '/dashboard/alerts', label: t('nav.alerts'), icon: AlertTriangle },
    { to: '/dashboard/historical', label: t('nav.historical'), icon: History },
    { to: '/dashboard/advanced', label: t('nav.advancedFeatures'), icon: Zap },
    { to: '/dashboard/community-alerts', label: 'Community Alerts', icon: Users },
    { to: '/dashboard/social-media', label: 'Social Media', icon: Share2 },
    { to: '/dashboard/gis-mapping', label: 'GIS Mapping', icon: Map },
    { to: '/dashboard/government', label: 'Government', icon: Building2 },
    { to: '/dashboard/chatbot', label: 'AI Chatbot', icon: MessageCircle },
    { to: '/dashboard/admin', label: t('nav.admin'), icon: Shield },
    { to: '/dashboard/profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <aside className="w-64 glass-card border-r border-primary/30 p-4 flex-shrink-0">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/50 neon-glow'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
