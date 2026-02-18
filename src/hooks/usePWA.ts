import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [isSupported, setIsSupported] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check PWA support
    setIsSupported('serviceWorker' in navigator);

    // Check if app is installed
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      toast.success('App installed successfully!');
    });

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // DISABLED: Service worker registration causing loading issues
    // Will be re-enabled after fixing cache issues
    /*
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast.info('App update available. Refresh to update.');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
    */

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        toast.success('Installing app...');
        return true;
      } else {
        toast.info('Installation cancelled');
        return false;
      }
    } catch (error) {
      console.error('Installation failed:', error);
      toast.error('Installation failed');
      return false;
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled');
        
        // Subscribe to push notifications
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'your-vapid-public-key' // Replace with actual VAPID key
          });
          
          // Send subscription to server
          console.log('Push subscription:', subscription);
        }
        
        return true;
      } else {
        toast.error('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      toast.error('Failed to enable notifications');
      return false;
    }
  };

  const sendTestNotification = () => {
    if (notificationPermission !== 'granted') {
      toast.error('Notifications not enabled');
      return;
    }

    new Notification('HydroLake Test', {
      body: 'This is a test notification from the dam monitoring system.',
      icon: '/icons/icon-192x192.png',
      tag: 'test-notification'
    });
  };

  const shareApp = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: 'HydroLake Dam Monitoring',
          text: 'Advanced AI-powered dam monitoring system',
          url: window.location.origin
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard manually
      try {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.origin;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Link copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const addToHomeScreen = () => {
    if (installPrompt) {
      installApp();
    } else if (!isInstalled) {
      // Show instructions for manual installation
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        toast.info('Tap the share button and select "Add to Home Screen"', {
          duration: 5000
        });
      } else if (isAndroid) {
        toast.info('Tap the menu button and select "Add to Home Screen"', {
          duration: 5000
        });
      } else {
        toast.info('Use your browser\'s "Install App" or "Add to Home Screen" option', {
          duration: 5000
        });
      }
    }
  };

  const enableOfflineMode = () => {
    if ('serviceWorker' in navigator) {
      // Cache critical data for offline use
      cacheOfflineData();
      toast.success('Offline mode enabled');
    } else {
      toast.error('Offline mode not supported');
    }
  };

  const cacheOfflineData = async () => {
    try {
      const cache = await caches.open('hydrolake-offline-data');
      
      // Cache critical API responses
      const criticalUrls = [
        '/api/dam-status',
        '/api/sensor-readings',
        '/api/authorities'
      ];
      
      await Promise.all(
        criticalUrls.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response.clone());
            }
          } catch (error) {
            console.log(`Failed to cache ${url}:`, error);
          }
        })
      );
    } catch (error) {
      console.error('Failed to cache offline data:', error);
    }
  };

  return {
    isSupported,
    isInstalled,
    isOnline,
    installPrompt: !!installPrompt,
    notificationPermission,
    installApp,
    requestNotificationPermission,
    sendTestNotification,
    shareApp,
    addToHomeScreen,
    enableOfflineMode
  };
}