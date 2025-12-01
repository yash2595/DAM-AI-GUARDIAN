import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Globe, 
  Database, 
  Clock, 
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface RealTimeWeatherStatusProps {
  isLoading: boolean;
  error: string | null;
  locationName: string;
  weatherData: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    alerts: any[];
  };
}

const RealTimeWeatherStatus: React.FC<RealTimeWeatherStatusProps> = ({
  isLoading,
  error,
  locationName,
  weatherData
}) => {
  const getApiStatus = () => {
    if (isLoading) return { status: 'loading', color: 'bg-blue-500', text: '🔄 Fetching...' };
    if (error) return { status: 'fallback', color: 'bg-yellow-500', text: '🔄 Simulation' };
    return { status: 'live', color: 'bg-green-500', text: '🌐 Live API' };
  };

  const apiStatus = getApiStatus();

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <span>Enhanced Real-Time Weather System</span>
          <Badge className={`${apiStatus.color} text-white ml-auto`}>
            {apiStatus.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
            <Globe className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">API Source</p>
              <p className="text-sm text-gray-600">
                {error ? 'Enhanced Simulation' : 'Open-Meteo Live (Free)'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
            <Clock className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Update Frequency</p>
              <p className="text-sm text-gray-600">Every 5 minutes</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
            <MapPin className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Location</p>
              <p className="text-sm text-gray-600 truncate">{locationName}</p>
            </div>
          </div>
        </div>

        {/* Real-time Data Quality Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <Thermometer className="h-4 w-4 text-red-500" />
            <div className="text-xs">
              <div className="font-medium">Temperature</div>
              <div className="text-gray-600">{weatherData.temperature.toFixed(1)}°C</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div className="text-xs">
              <div className="font-medium">Precipitation</div>
              <div className="text-gray-600">{weatherData.precipitation.toFixed(1)}mm</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <Wind className="h-4 w-4 text-green-500" />
            <div className="text-xs">
              <div className="font-medium">Wind Speed</div>
              <div className="text-gray-600">{weatherData.windSpeed.toFixed(1)}km/h</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <Eye className="h-4 w-4 text-purple-500" />
            <div className="text-xs">
              <div className="font-medium">Visibility</div>
              <div className="text-gray-600">{weatherData.visibility.toFixed(1)}km</div>
            </div>
          </div>
        </div>

        {/* Enhanced Features */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Enhanced Weather Features Active</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real-time API integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>7-day enhanced forecast</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Intelligent weather alerts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Dam-specific risk analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Enhanced precipitation tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Multi-location support (8 dams)</span>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              <strong>API Notice:</strong> Using enhanced simulation mode. {error}
            </AlertDescription>
          </Alert>
        )}
        
        {!error && !isLoading && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 text-sm">
              <strong>✅ Live Data Active:</strong> Real-time weather data from Open-Meteo API (free, accurate). Updates every 5 minutes with precise temperature and conditions.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center text-xs text-gray-500 pt-2 border-t">
          Last Update: {new Date().toLocaleString()} | 
          Weather Alerts: {weatherData.alerts.length} active | 
          Data Quality: {error ? 'Enhanced Simulation' : 'Live API Feed'}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeWeatherStatus;