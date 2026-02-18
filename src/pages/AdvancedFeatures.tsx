import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Box, 
  Mic, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Download, 
  Bell, 
  Share2,
  ChevronRight,
  BarChart3,
  CloudSun,
  Globe
} from 'lucide-react';
import AIRiskAssessment from '@/components/AIRiskAssessment';
import DamVisualization3D from '@/components/DamVisualization3D';
import VoiceControlPanel from '@/components/VoiceControlPanel';
import SmartAnalyticsDashboard from '@/components/SmartAnalyticsDashboard';
import EnhancedWeatherDashboard from '@/components/EnhancedWeatherDashboard';
import LanguageSelector from '@/components/LanguageSelector';
import { useSimulatedSensorData } from '@/hooks/useAIRiskAssessment';
import { usePWA } from '@/hooks/usePWA';
import { useLanguage } from '@/contexts/LanguageContext';

const AdvancedFeatures: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState('ai-analysis');
  const sensorData = useSimulatedSensorData();
  const featureContentRef = React.useRef<HTMLDivElement>(null);
  const { language, availableLanguages, t } = useLanguage();
  
  const {
    isSupported,
    isInstalled,
    isOnline,
    installPrompt,
    notificationPermission,
    installApp,
    requestNotificationPermission,
    sendTestNotification,
    shareApp,
    addToHomeScreen
  } = usePWA();

  const handleFeatureClick = (featureId: string) => {
    setActiveFeature(featureId);
    // Scroll to feature content with smooth animation
    setTimeout(() => {
      featureContentRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const features = [
    {
      id: 'ai-analysis',
      title: 'AI Risk Assessment',
      description: 'Machine learning predictions for dam failure probability',
      icon: Brain,
      badge: 'AI Powered',
      badgeVariant: 'default' as const,
      isNew: true
    },
    {
      id: '3d-visualization',
      title: '3D Dam Visualization',
      description: 'Interactive 3D model with real-time data overlay',
      icon: Box,
      badge: 'Interactive',
      badgeVariant: 'secondary' as const,
      isNew: true
    },
    {
      id: 'voice-control',
      title: 'Voice Alert System',
      description: 'Speech recognition and text-to-speech announcements',
      icon: Mic,
      badge: 'Voice Enabled',
      badgeVariant: 'outline' as const,
      isNew: true
    },
    {
      id: 'pwa-features',
      title: 'Mobile App Features',
      description: 'Progressive Web App with offline support',
      icon: Smartphone,
      badge: 'PWA Ready',
      badgeVariant: 'destructive' as const,
      isNew: true
    },
    {
      id: 'smart-analytics',
      title: 'Smart Analytics',
      description: 'Advanced data analysis and predictive insights',
      icon: BarChart3,
      badge: 'AI Analytics',
      badgeVariant: 'default' as const,
      isNew: true
    },
    {
      id: 'weather-integration',
      title: 'Weather Integration',
      description: 'Real-time weather data and impact analysis',
      icon: CloudSun,
      badge: 'Weather API',
      badgeVariant: 'secondary' as const,
      isNew: true
    },
    {
      id: 'multi-language',
      title: 'Multi-Language Support',
      description: 'Interface available in 5 Indian languages',
      icon: Globe,
      badge: 'i18n Ready',
      badgeVariant: 'default' as const,
      isNew: true
    },
    {
      id: 'iot-sensors',
      title: 'IoT Sensors Network',
      description: 'Connect and manage IoT sensor devices',
      icon: Wifi,
      badge: 'Offline',
      badgeVariant: 'destructive' as const,
      isNew: false,
      isOffline: true
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Advanced Features</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover the cutting-edge technologies that make HydroLake the most advanced 
          dam monitoring system available today.
        </p>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              {isOnline ? (
                <>
                  <Wifi className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">System Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Offline Mode</span>
                </>
              )}
            </div>
            <div className="flex space-x-2">
              {!isInstalled && installPrompt && (
                <Button size="sm" onClick={installApp} variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Install App
                </Button>
              )}
              {notificationPermission !== 'granted' && (
                <Button size="sm" onClick={requestNotificationPermission} variant="outline">
                  <Bell className="h-4 w-4 mr-1" />
                  Enable Alerts
                </Button>
              )}
              <Button size="sm" onClick={shareApp} variant="outline">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <WifiOff className="h-5 w-5 text-red-600 animate-pulse" />
              <div>
                <span className="font-medium text-red-800 block">IoT Sensors Offline</span>
                <span className="text-xs text-red-600">No devices connected</span>
              </div>
            </div>
            <Badge variant="destructive" className="animate-pulse">
              Offline
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Feature Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;
          const isOffline = feature.isOffline;
          
          return (
            <Card 
              key={feature.id}
              className={`cursor-pointer transition-all duration-300 ${
                isOffline 
                  ? 'opacity-80 bg-red-50 border-red-200' 
                  : `hover:shadow-lg hover:scale-105 ${
                      isActive ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg scale-105' : 'hover:ring-1 hover:ring-blue-300'
                    }`
              }`}
              onClick={() => handleFeatureClick(feature.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Icon className={`h-6 w-6 transition-colors ${
                    isOffline ? 'text-red-500' : isActive ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={feature.badgeVariant}>{feature.badge}</Badge>
                    {feature.isNew && <Badge variant="outline" className="text-xs">NEW</Badge>}
                  </div>
                </div>
                <h3 className={`font-semibold transition-colors ${
                  isOffline ? 'text-red-700' : isActive ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-xs mt-1 ${isOffline ? 'text-red-600' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
                {isOffline && (
                  <div className="flex items-center text-red-600 text-xs mt-2 font-medium">
                    <WifiOff className="h-3 w-3 mr-1" />
                    <span>Sensors Offline</span>
                  </div>
                )}
                {!isOffline && isActive && (
                  <div className="flex items-center text-blue-600 text-xs mt-2 font-medium animate-pulse">
                    <span>Viewing Below</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </div>
                )}
                {!isOffline && !isActive && (
                  <div className="flex items-center text-gray-400 text-xs mt-2 hover:text-blue-600 transition-colors">
                    <span>Click to View</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Content */}
      <div ref={featureContentRef} className="scroll-mt-6">
        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-center text-2xl">
              {features.find(f => f.id === activeFeature)?.title || 'Feature Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activeFeature === 'ai-analysis' && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
                    <Brain className="h-6 w-6" />
                    <span>AI-Powered Risk Assessment</span>
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Our advanced machine learning model analyzes multiple data sources to predict 
                    dam failure probability with 95% confidence, providing early warning systems 
                    that can save lives and prevent disasters.
                  </p>
                </div>
                <AIRiskAssessment />
              </div>
            )}

          {activeFeature === '3d-visualization' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <Box className="h-6 w-6" />
                  <span>Interactive 3D Visualization</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Explore the dam structure in 3D with real-time data overlays. Visualize water levels, 
                  pressure points, structural stress, and temperature gradients in an intuitive 
                  interactive environment.
                </p>
              </div>
              <DamVisualization3D 
                waterLevel={sensorData.waterLevel}
                pressure={sensorData.pressure}
                temperature={sensorData.temperature}
                seepage={sensorData.seepage}
                structuralStress={sensorData.structuralStress}
              />
            </div>
          )}

          {activeFeature === 'voice-control' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <Mic className="h-6 w-6" />
                  <span>Voice Alert System</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Control the system with your voice and receive spoken alerts. The system supports 
                  multiple languages and can announce critical information during emergencies when 
                  visual monitoring isn't possible.
                </p>
              </div>
              <VoiceControlPanel />
            </div>
          )}

          {activeFeature === 'pwa-features' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <Smartphone className="h-6 w-6" />
                  <span>Progressive Web App Features</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Install HydroLake as a native app on your device. Works offline, sends push notifications, 
                  and provides a mobile-first experience for monitoring on the go.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Installation Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>App Installation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>PWA Support</span>
                      <Badge variant={isSupported ? 'default' : 'destructive'}>
                        {isSupported ? 'Supported' : 'Not Supported'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>App Installed</span>
                      <Badge variant={isInstalled ? 'default' : 'outline'}>
                        {isInstalled ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Can Install</span>
                      <Badge variant={installPrompt ? 'default' : 'outline'}>
                        {installPrompt ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {!isInstalled && installPrompt && (
                        <Button onClick={installApp} className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Install App
                        </Button>
                      )}
                      {!isInstalled && !installPrompt && (
                        <Button onClick={addToHomeScreen} variant="outline" className="w-full">
                          Add to Home Screen
                        </Button>
                      )}
                      <Button onClick={shareApp} variant="outline" className="w-full">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share App
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Push Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Permission</span>
                      <Badge variant={
                        notificationPermission === 'granted' ? 'default' : 
                        notificationPermission === 'denied' ? 'destructive' : 'outline'
                      }>
                        {notificationPermission}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {notificationPermission !== 'granted' && (
                        <Button 
                          onClick={requestNotificationPermission} 
                          className="w-full"
                        >
                          <Bell className="h-4 w-4 mr-2" />
                          Enable Notifications
                        </Button>
                      )}
                      {notificationPermission === 'granted' && (
                        <Button 
                          onClick={sendTestNotification} 
                          variant="outline" 
                          className="w-full"
                        >
                          Send Test Notification
                        </Button>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">Notification Types:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Emergency alerts</li>
                        <li>• Water level warnings</li>
                        <li>• System status updates</li>
                        <li>• Maintenance reminders</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Offline Features */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Offline Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-green-600 font-semibold">Cached Data</div>
                        <div className="text-sm text-gray-600">Historical readings and trends</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-blue-600 font-semibold">Background Sync</div>
                        <div className="text-sm text-gray-600">Automatic data synchronization</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-purple-600 font-semibold">Emergency Mode</div>
                        <div className="text-sm text-gray-600">Critical functions when offline</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeFeature === 'smart-analytics' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Smart Analytics Dashboard</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Advanced data analytics with predictive insights, seasonal patterns, and 
                  intelligent maintenance scheduling powered by machine learning algorithms.
                </p>
              </div>

              <SmartAnalyticsDashboard />
            </div>
          )}

          {activeFeature === 'weather-integration' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <CloudSun className="h-6 w-6" />
                  <span>Weather Integration System</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Real-time weather data integration with impact analysis on dam operations, 
                  rainfall predictions, and flood risk assessment.
                </p>
              </div>

              <EnhancedWeatherDashboard />
            </div>
          )}

          {activeFeature === 'multi-language' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <Globe className="h-6 w-6" />
                  <span>Multi-Language Support</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Access the dam monitoring system in your preferred language. Interface available 
                  in English, Hindi, Marathi, Telugu, and Tamil for better accessibility.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Language Selector Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5" />
                      <span>Select Language</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-6 bg-white rounded-lg border-2 border-blue-200">
                      <div className="text-sm text-gray-600 mb-4">Current Language:</div>
                      <LanguageSelector />
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Available Languages:</h4>
                      <div className="space-y-2">
                        {availableLanguages.map((lang) => (
                          <div 
                            key={lang.code}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              language === lang.code 
                                ? 'bg-blue-100 border-blue-400' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{
                                  lang.code === 'en' ? '🇬🇧' :
                                  lang.code === 'hi' ? '🇮🇳' :
                                  lang.code === 'mr' ? '🇮🇳' :
                                  lang.code === 'te' ? '🇮🇳' :
                                  lang.code === 'ta' ? '🇮🇳' : '🌐'
                                }</span>
                                <div>
                                  <div className="font-semibold">{lang.nativeName}</div>
                                  <div className="text-sm text-gray-600">{lang.name}</div>
                                </div>
                              </div>
                              {language === lang.code && (
                                <Badge variant="default">Active</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Translation Demo Card */}
                <Card className="bg-gradient-to-br from-green-50 to-teal-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>🔄</span>
                      <span>Translation Examples</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Dashboard Title</div>
                        <div className="font-semibold text-blue-600">{t('dashboard.title')}</div>
                      </div>
                      
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Water Level</div>
                        <div className="font-semibold text-green-600">{t('dashboard.waterLevel')}</div>
                      </div>
                      
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Status - Normal</div>
                        <div className="font-semibold text-emerald-600">{t('dashboard.normal')}</div>
                      </div>
                      
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Status - Warning</div>
                        <div className="font-semibold text-orange-600">{t('dashboard.warning')}</div>
                      </div>
                      
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Status - Emergency</div>
                        <div className="font-semibold text-red-600">{t('dashboard.emergency')}</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <div className="text-sm font-medium text-blue-900 mb-2">💡 Pro Tip</div>
                      <div className="text-xs text-blue-700">
                        The interface will automatically update throughout the application when you 
                        change the language. Your preference is saved in your browser.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="text-center p-6">
                  <div className="text-3xl mb-2">🌍</div>
                  <div className="font-semibold mb-1">5 Languages</div>
                  <div className="text-sm text-gray-600">
                    English, Hindi, Marathi, Telugu, Tamil
                  </div>
                </Card>
                
                <Card className="text-center p-6">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="font-semibold mb-1">Instant Switch</div>
                  <div className="text-sm text-gray-600">
                    Change language anytime without reload
                  </div>
                </Card>
                
                <Card className="text-center p-6">
                  <div className="text-3xl mb-2">💾</div>
                  <div className="font-semibold mb-1">Saved Preference</div>
                  <div className="text-sm text-gray-600">
                    Your choice is remembered across sessions
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeFeature === 'iot-sensors' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <WifiOff className="h-6 w-6 text-red-500" />
                  <span>IoT Sensors Network - Offline</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  IoT sensor devices are currently offline. Check connection and device status.
                </p>
              </div>

              {/* Offline Status Alert */}
              <Card className="bg-red-50 border-2 border-red-200">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="bg-red-100 rounded-full p-6 animate-pulse">
                      <WifiOff className="h-16 w-16 text-red-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-red-700">
                      IoT Sensors Offline
                    </h3>
                    <p className="text-red-600 max-w-lg mx-auto font-medium">
                      No IoT sensor devices are currently connected to the system.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto border border-red-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                      <Bell className="h-5 w-5 text-orange-500" />
                      <span>Troubleshooting Steps:</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <div className="bg-blue-500 rounded-full p-1 text-white text-xs font-bold w-6 h-6 flex items-center justify-center shrink-0">
                            1
                          </div>
                          <div>
                            <div className="font-medium text-sm">Check Power Supply</div>
                            <div className="text-xs text-gray-600">Ensure all IoT devices are powered on</div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="bg-green-500 rounded-full p-1 text-white text-xs font-bold w-6 h-6 flex items-center justify-center shrink-0">
                            2
                          </div>
                          <div>
                            <div className="font-medium text-sm">Verify Network Connection</div>
                            <div className="text-xs text-gray-600">Check WiFi/Ethernet connectivity</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                          <div className="bg-purple-500 rounded-full p-1 text-white text-xs font-bold w-6 h-6 flex items-center justify-center shrink-0">
                            3
                          </div>
                          <div>
                            <div className="font-medium text-sm">Restart IoT Gateway</div>
                            <div className="text-xs text-gray-600">Power cycle the main gateway device</div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                          <div className="bg-orange-500 rounded-full p-1 text-white text-xs font-bold w-6 h-6 flex items-center justify-center shrink-0">
                            4
                          </div>
                          <div>
                            <div className="font-medium text-sm">Check Sensor Status</div>
                            <div className="text-xs text-gray-600">Verify individual sensor LEDs</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expected Features When Online */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 max-w-2xl mx-auto border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Available When IoT Sensors Are Online:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="space-y-2">
                        <div className="bg-white rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
                          <Wifi className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-xs font-medium">Real-time Data</div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
                          <BarChart3 className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="text-xs font-medium">Live Analytics</div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
                          <Bell className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="text-xs font-medium">Instant Alerts</div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
                          <Smartphone className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="text-xs font-medium">Remote Monitor</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-3 pt-4">
                    <Badge variant="destructive" className="text-sm px-4 py-2">
                      <WifiOff className="h-4 w-4 mr-2" />
                      System will automatically reconnect when sensors come online
                    </Badge>
                    <div className="text-xs text-gray-500">
                      Last connection attempt: {new Date().toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 max-w-md mx-auto pt-4 border-t border-gray-200">
                    <strong>Note:</strong> The system uses simulated sensor data while IoT devices are offline. 
                    Core monitoring functions remain operational.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">AI Model</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Neural network architecture</li>
                <li>• 95% prediction accuracy</li>
                <li>• Real-time inference</li>
                <li>• Continuous learning</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">3D Rendering</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• HTML5 Canvas</li>
                <li>• Real-time 3D projection</li>
                <li>• Interactive controls</li>
                <li>• Data visualization overlays</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Voice System</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Web Speech API</li>
                <li>• Multi-language support</li>
                <li>• Voice commands</li>
                <li>• Text-to-speech alerts</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">PWA Features</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Service worker</li>
                <li>• Offline caching</li>
                <li>• Push notifications</li>
                <li>• Background sync</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Smart Analytics</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Predictive maintenance</li>
                <li>• Trend analysis</li>
                <li>• Performance optimization</li>
                <li>• Cost forecasting</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Weather API</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Real-time weather data</li>
                <li>• Flood risk assessment</li>
                <li>• Rainfall predictions</li>
                <li>• Impact analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedFeatures;