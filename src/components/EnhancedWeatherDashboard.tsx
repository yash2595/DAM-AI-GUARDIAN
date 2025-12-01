import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Cloud, 
  Droplets, 
  Wind, 
  Thermometer, 
  Eye, 
  Sun, 
  AlertTriangle,
  Activity,
  MapPin,
  CheckCircle,
  Globe,
  Clock
} from 'lucide-react';
import { useWeatherData, useWeatherImpact } from '@/hooks/useWeatherData';

// Dam locations with coordinates
const damLocations = [
  { id: 'tehri', name: 'Tehri Dam, Uttarakhand', lat: 30.3753, lng: 78.4804, state: 'Uttarakhand' },
  { id: 'bhakra', name: 'Bhakra Dam, Himachal Pradesh', lat: 31.4096, lng: 76.4366, state: 'Himachal Pradesh' },
  { id: 'sardar', name: 'Sardar Sarovar Dam, Gujarat', lat: 21.8333, lng: 73.7500, state: 'Gujarat' },
  { id: 'hirakud', name: 'Hirakud Dam, Odisha', lat: 21.5333, lng: 83.8667, state: 'Odisha' },
  { id: 'nagarjuna', name: 'Nagarjuna Sagar Dam, Telangana', lat: 16.5667, lng: 79.3000, state: 'Telangana' },
  { id: 'krishnaraja', name: 'KRS Dam, Karnataka', lat: 12.4167, lng: 76.5667, state: 'Karnataka' },
  { id: 'mettur', name: 'Mettur Dam, Tamil Nadu', lat: 11.7833, lng: 77.8000, state: 'Tamil Nadu' },
  { id: 'gandhi', name: 'Gandhi Sagar Dam, Madhya Pradesh', lat: 24.6950, lng: 75.5550, state: 'Madhya Pradesh' }
];

const EnhancedWeatherDashboard: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState(damLocations[0]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { weatherData, isLoading, error } = useWeatherData({ 
    lat: selectedLocation.lat, 
    lng: selectedLocation.lng 
  });
  const weatherImpact = useWeatherImpact(weatherData);

  const handleLocationChange = (locationId: string) => {
    const location = damLocations.find(loc => loc.id === locationId);
    if (location) setSelectedLocation(location);
  };

  const handleRefresh = () => {
    console.log('🔄 Manual weather refresh triggered');
    setRefreshKey(prev => prev + 1);
    window.location.reload(); // Force complete refresh to clear any caching
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rainy': return <Droplets className="h-6 w-6 text-blue-500" />;
      case 'stormy': return <Wind className="h-6 w-6 text-purple-500" />;
      case 'snowy': return <Cloud className="h-6 w-6 text-blue-300" />;
      case 'foggy': return <Eye className="h-6 w-6 text-gray-400" />;
      default: return <Sun className="h-6 w-6" />;
    }
  };

  const getApiStatus = () => {
    if (isLoading) return { status: 'loading', color: 'bg-blue-500', text: '🔄 Fetching Real-Time Data...' };
    if (error) return { status: 'fallback', color: 'bg-yellow-500', text: '🔄 Enhanced Simulation Mode' };
    return { status: 'live', color: 'bg-green-500', text: '🌐 Live Weather API Connected' };
  };

  const apiStatus = getApiStatus();

  return (
    <div className="space-y-6">
      {/* Enhanced API Status Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span>🌤️ Enhanced Real-Time Weather System</span>
            </div>
            <Badge className={`${apiStatus.color} text-white`}>
              {apiStatus.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">API Source</p>
                <p className="text-xs text-gray-600">{error ? 'Enhanced Simulation' : 'Open-Meteo Live (Free)'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Update Rate</p>
                <p className="text-xs text-gray-600">Every 5 minutes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Data Quality</p>
                <p className="text-xs text-gray-600">{error ? 'Simulated' : 'Real-Time'}</p>
              </div>
            </div>
          </div>
          
          {!error && !isLoading && (
            <Alert className="bg-green-50 border-green-200 mt-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 text-sm">
                <strong>✅ Live Weather API Active!</strong> Real-time data from Open-Meteo (free, no API key required) with 5-minute updates and accurate forecasts.
                <div className="mt-2 text-xs font-mono bg-white p-2 rounded border border-green-200">
                  API: https://api.open-meteo.com/v1/forecast?latitude={selectedLocation.lat}&longitude={selectedLocation.lng}
                  <br />
                  Last Updated: {new Date().toLocaleString()}
                  <br />
                  Temperature: {weatherData.temperature.toFixed(1)}°C (Real-time)
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="bg-yellow-50 border-yellow-200 mt-4">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700 text-sm">
                <strong>⚠️ API Fallback Active:</strong> Using enhanced simulation mode with realistic weather patterns.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Location Selector */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Selected Dam Location</p>
                <p className="font-semibold text-gray-900">{selectedLocation.name}</p>
                <p className="text-xs text-gray-500">
                  📍 {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lng.toFixed(4)}°E
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={selectedLocation.id} onValueChange={handleLocationChange}>
                <SelectTrigger className="w-full md:w-80 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {damLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span>{location.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                title="Refresh weather data"
              >
                <Activity className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Weather Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getConditionIcon(weatherData.condition)}
              <span>Real-Time Weather Conditions</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                📍 {weatherData.locationName || selectedLocation.name}
              </Badge>
              <Badge variant="outline" className="text-xs">
                🕐 Updated: {new Date().toLocaleTimeString()}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border">
              <Thermometer className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-800">
                {weatherData.temperature.toFixed(1)}°C
              </p>
              <p className="text-sm text-blue-600">Temperature</p>
              <p className="text-xs text-gray-500">Humidity: {weatherData.humidity}%</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border">
              <Droplets className="h-8 w-8 mx-auto text-cyan-600 mb-2" />
              <p className="text-2xl font-bold text-cyan-800">
                {weatherData.precipitation.toFixed(1)}mm/hr
              </p>
              <p className="text-sm text-cyan-600">Precipitation</p>
              <p className="text-xs text-gray-500">Enhanced Tracking</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border">
              <Wind className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-800">
                {weatherData.windSpeed.toFixed(1)} km/h
              </p>
              <p className="text-sm text-green-600">Wind Speed</p>
              <p className="text-xs text-gray-500">Direction: {weatherData.windDirection}°</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border">
              <Eye className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-purple-800">
                {weatherData.visibility.toFixed(1)} km
              </p>
              <p className="text-sm text-purple-600">Visibility</p>
              <p className="text-xs text-gray-500">Pressure: {weatherData.pressure} hPa</p>
            </div>
          </div>

          {/* Additional Real-Time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">UV Index</span>
                <span className="font-bold">{weatherData.uvIndex.toFixed(1)}</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Weather Condition</span>
                <span className="font-bold capitalize">{weatherData.condition}</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Alerts</span>
                <Badge variant={weatherData.alerts.length > 0 ? "destructive" : "secondary"}>
                  {weatherData.alerts.length}
                </Badge>
              </div>
            </div>
          </div>

          {/* Weather Alerts */}
          {weatherData.alerts.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>Active Weather Alerts ({weatherData.alerts.length})</span>
              </h3>
              {weatherData.alerts.map((alert, index) => (
                <Alert key={index} className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-orange-800">{alert.title}</p>
                        <p className="text-orange-700 text-sm mt-1">{alert.description}</p>
                        <p className="text-orange-600 text-xs mt-2">{alert.impact}</p>
                      </div>
                      <Badge variant="outline" className="text-orange-700 border-orange-300">
                        {alert.severity}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* 7-Day Enhanced Forecast */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4">📅 7-Day Enhanced Forecast</h3>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded border">
                  <p className="text-xs font-medium text-gray-600">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-sm font-bold mt-1">
                    {day.temperature.max.toFixed(0)}°/{day.temperature.min.toFixed(0)}°
                  </p>
                  <p className="text-xs text-blue-600 mt-1">{day.precipitation.toFixed(1)}mm</p>
                  <p className="text-xs text-gray-500 capitalize">{day.condition}</p>
                  <p className="text-xs text-green-600">{day.rainProbability}% rain</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dam Impact Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>🏗️ Dam Operations Weather Impact Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border">
              <h4 className="font-medium text-blue-800">Water Level Change</h4>
              <p className="text-2xl font-bold text-blue-900">
                {weatherImpact.waterLevelChange > 0 ? '+' : ''}{weatherImpact.waterLevelChange.toFixed(1)}m
              </p>
              <p className="text-sm text-blue-600">Expected change in 24h</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border">
              <h4 className="font-medium text-orange-800">Structural Stress</h4>
              <p className="text-2xl font-bold text-orange-900">
                {weatherImpact.structuralStress.toFixed(1)}%
              </p>
              <p className="text-sm text-orange-600">Stress level increase</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border">
              <h4 className="font-medium text-red-800">Operational Risk</h4>
              <p className="text-2xl font-bold text-red-900 capitalize">
                {weatherImpact.operationalRisk}
              </p>
              <p className="text-sm text-red-600">Current risk level</p>
            </div>
          </div>

          {weatherImpact.recommendations.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-800 mb-3">🎯 Operational Recommendations:</h4>
              <ul className="space-y-2">
                {weatherImpact.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedWeatherDashboard;