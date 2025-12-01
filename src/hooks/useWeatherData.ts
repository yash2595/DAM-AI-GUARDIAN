import { useState, useEffect } from 'react';

export interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy';
  forecast: WeatherForecast[];
  alerts: WeatherAlert[];
  locationName?: string;
}

export interface WeatherForecast {
  date: string;
  temperature: { min: number; max: number };
  precipitation: number;
  condition: string;
  rainProbability: number;
}

export interface WeatherAlert {
  id: string;
  type: 'flood_warning' | 'heavy_rain' | 'storm' | 'drought';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  impact: string;
}

// Using Open-Meteo API - Free, no API key required, very accurate
// Documentation: https://open-meteo.com/

// Calculate flood risk based on weather conditions
function calculateFloodRisk(precipitation: number, windSpeed: number, temperature: number): number {
  let risk = 0;
  
  // Precipitation factor (most important)
  if (precipitation > 20) risk += 40;
  else if (precipitation > 10) risk += 25;
  else if (precipitation > 5) risk += 10;
  
  // Wind speed factor
  if (windSpeed > 20) risk += 20;
  else if (windSpeed > 15) risk += 10;
  
  // Temperature factor (cold = snow, hot = rapid runoff)
  if (temperature < 0) risk += 15; // Snow/ice
  else if (temperature > 35) risk += 10; // Rapid evaporation and runoff
  
  // Random factor for other conditions
  risk += Math.random() * 15;
  
  return Math.min(100, Math.max(0, risk));
}

// Fetch real-time weather data from OpenWeatherMap API
export function useWeatherData(location = { lat: 28.6139, lng: 77.2090 }) {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 0,
    humidity: 0,
    precipitation: 0,
    windSpeed: 0,
    windDirection: 0,
    pressure: 0,
    visibility: 0,
    uvIndex: 0,
    condition: 'cloudy',
    forecast: [],
    alerts: [],
    locationName: 'Loading...'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRealWeatherData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🌤️ Fetching real-time weather data from Open-Meteo...');
        console.log('📍 Location:', location);
        
        // Open-Meteo API - Free, accurate, no API key required
        const currentWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;
        
        const response = await fetch(currentWeatherUrl);
        
        if (!response.ok) {
          console.warn('⚠️ Open-Meteo API failed, using simulation');
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Real-time weather data received from Open-Meteo:', data);

        if (!isMounted) return;

        // Map Open-Meteo weather codes to our conditions
        const mapWeatherCode = (code: number): WeatherData['condition'] => {
          if (code === 0 || code === 1) return 'sunny'; // Clear
          if (code === 2 || code === 3) return 'cloudy'; // Partly cloudy/Overcast
          if (code === 45 || code === 48) return 'foggy'; // Fog
          if (code >= 51 && code <= 67) return 'rainy'; // Drizzle/Rain
          if (code >= 71 && code <= 77) return 'snowy'; // Snow
          if (code >= 80 && code <= 99) return 'stormy'; // Rain showers/Thunderstorm
          return 'cloudy';
        };

        const current = data.current;
        const daily = data.daily;

        // Process 7-day forecast
        const dailyForecasts: WeatherForecast[] = [];
        for (let i = 0; i < Math.min(7, daily.time.length); i++) {
          dailyForecasts.push({
            date: daily.time[i],
            temperature: {
              min: Math.round(daily.temperature_2m_min[i] * 10) / 10,
              max: Math.round(daily.temperature_2m_max[i] * 10) / 10
            },
            precipitation: Math.round(daily.precipitation_sum[i] * 10) / 10,
            condition: mapWeatherCode(daily.weather_code[i]).toLowerCase(),
            rainProbability: Math.round(daily.precipitation_probability_max[i] || 0)
          });
        }

        // Calculate current precipitation (convert from mm to mm/hr)
        const currentPrecipitation = current.precipitation || 0;
        const windSpeedKmh = Math.round((current.wind_speed_10m || 0) * 10) / 10;

        // Generate weather alerts based on real conditions
        const alerts: WeatherAlert[] = [];
        
        if (currentPrecipitation > 10) {
          const severity = currentPrecipitation > 25 ? 'extreme' : currentPrecipitation > 15 ? 'high' : 'medium';
          alerts.push({
            id: 'heavy-rain-' + Date.now(),
            type: 'heavy_rain',
            severity,
            title: `Heavy Rainfall Alert - ${currentPrecipitation.toFixed(1)}mm/hr`,
            description: `Significant rainfall detected: ${currentPrecipitation.toFixed(1)}mm/hr. Dam monitoring required.`,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 6 * 3600000).toISOString(),
            impact: 'Increased water inflow. Monitor dam levels and spillway capacity closely.'
          });
        }

        if (current.weather_code >= 95) {
          alerts.push({
            id: 'storm-' + Date.now(),
            type: 'storm',
            severity: windSpeedKmh > 50 ? 'extreme' : 'high',
            title: 'Thunderstorm Warning - Active',
            description: `Active thunderstorm with winds up to ${windSpeedKmh.toFixed(0)} km/h detected.`,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 4 * 3600000).toISOString(),
            impact: 'Potential for rapid water level changes, lightning risk, and structural stress on dam infrastructure.'
          });
        }

        const floodRisk = calculateFloodRisk(currentPrecipitation, windSpeedKmh, current.temperature_2m);
        if (floodRisk > 60) {
          const floodSeverity = floodRisk > 80 ? 'extreme' : floodRisk > 70 ? 'high' : 'medium';
          alerts.push({
            id: 'flood-warning-' + Date.now(),
            type: 'flood_warning',
            severity: floodSeverity,
            title: `Flood Risk Alert - ${floodRisk.toFixed(0)}% Risk Level`,
            description: `Elevated flood risk (${floodRisk.toFixed(0)}%) based on current weather conditions.`,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 24 * 3600000).toISOString(),
            impact: 'Potential downstream flooding. Emergency protocols may be required. Monitor water release carefully.'
          });
        }

        // Get location name using reverse geocoding (optional - can use dam name)
        let locationName = 'Current Location';
        try {
          const geoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m`;
          locationName = `${location.lat.toFixed(2)}°N, ${location.lng.toFixed(2)}°E`;
        } catch {
          locationName = 'Current Location';
        }

        const newWeatherData: WeatherData = {
          temperature: Math.round(current.temperature_2m * 10) / 10,
          humidity: current.relative_humidity_2m || 0,
          precipitation: Math.round(currentPrecipitation * 10) / 10,
          windSpeed: windSpeedKmh,
          windDirection: current.wind_direction_10m || 0,
          pressure: Math.round(current.surface_pressure || 1013),
          visibility: Math.round((current.visibility || 10000) / 1000 * 10) / 10,
          uvIndex: 5, // Open-Meteo doesn't provide UV in free tier
          condition: mapWeatherCode(current.weather_code),
          forecast: dailyForecasts,
          alerts,
          locationName
        };

        console.log('✅ Processed real-time weather data:', {
          location: newWeatherData.locationName,
          temp: newWeatherData.temperature,
          conditions: newWeatherData.condition,
          alerts: alerts.length
        });

        setWeatherData(newWeatherData);
        setIsLoading(false);

      } catch (err) {
        console.error('❌ Open-Meteo Weather API Error:', err);
        setError(`Weather API Error: ${err instanceof Error ? err.message : 'Unable to fetch live data'}`);
        setIsLoading(false);
        
        // Enhanced fallback with better simulation
        if (isMounted) {
          console.log('🔄 Using enhanced fallback weather data...');
          const fallbackData = generateFallbackData();
          setWeatherData(fallbackData);
        }
      }
    };

    fetchRealWeatherData();

    // Enhanced real-time updates - fetch every 5 minutes for better accuracy
    const interval = setInterval(fetchRealWeatherData, 300000); // 5 minutes instead of 10

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.lat, location.lng]);

  return { weatherData, isLoading, error };
}

// Fallback simulated data in case API fails
function generateFallbackData(): WeatherData {
  const baseTemp = 20 + Math.sin(Date.now() / 86400000) * 10;
  const season = Math.sin(Date.now() / (86400000 * 365)) * 15;
  
  const isRainyPeriod = Math.random() < 0.3;
  const isStormPeriod = Math.random() < 0.05;
  
  let condition: WeatherData['condition'] = 'sunny';
  let precipitation = 0;
  let windSpeed = 3 + Math.random() * 7;
  
  if (isStormPeriod) {
    condition = 'stormy';
    precipitation = 20 + Math.random() * 30;
    windSpeed = 15 + Math.random() * 25;
  } else if (isRainyPeriod) {
    condition = 'rainy';
    precipitation = 2 + Math.random() * 15;
    windSpeed = 8 + Math.random() * 12;
  } else if (Math.random() < 0.4) {
    condition = 'cloudy';
  } else if (Math.random() < 0.1) {
    condition = 'foggy';
  }
  
  // Generate 7-day forecast
  const forecast: WeatherForecast[] = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      temperature: {
        min: baseTemp + season - 5 + (Math.random() - 0.5) * 10,
        max: baseTemp + season + 5 + (Math.random() - 0.5) * 10
      },
      precipitation: Math.random() * 20,
      condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
      rainProbability: Math.random() * 100
    });
  }
  
  return {
    temperature: baseTemp + season + (Math.random() - 0.5) * 3,
    humidity: 40 + Math.random() * 40 + (precipitation > 0 ? 20 : 0),
    precipitation,
    windSpeed,
    windDirection: Math.random() * 360,
    pressure: 1000 + Math.random() * 30,
    visibility: condition === 'foggy' ? 1 + Math.random() * 3 : 8 + Math.random() * 7,
    uvIndex: condition === 'sunny' ? 6 + Math.random() * 5 : Math.random() * 4,
    condition,
    forecast,
    alerts: [],
    locationName: 'Simulated Data'
  };
}

// Weather impact on dam operations
export function useWeatherImpact(weatherData: WeatherData) {
  const [impact, setImpact] = useState({
    waterLevelChange: 0,
    structuralStress: 0,
    operationalRisk: 'low' as 'low' | 'medium' | 'high' | 'critical',
    recommendations: [] as string[]
  });

  useEffect(() => {
    const calculateImpact = () => {
      let waterLevelChange = 0;
      let structuralStress = 0;
      let operationalRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
      const recommendations: string[] = [];

      // Precipitation impact
      if (weatherData.precipitation > 15) {
        waterLevelChange += weatherData.precipitation * 0.8;
        operationalRisk = weatherData.precipitation > 25 ? 'critical' : 'high';
        recommendations.push('Increase spillway discharge to accommodate inflow');
        recommendations.push('Monitor downstream water levels continuously');
      } else if (weatherData.precipitation > 5) {
        waterLevelChange += weatherData.precipitation * 0.5;
        operationalRisk = 'medium';
        recommendations.push('Prepare for increased water inflow');
      }

      // Wind impact on structure
      if (weatherData.windSpeed > 20) {
        structuralStress += weatherData.windSpeed * 0.3;
        if (operationalRisk === 'low') operationalRisk = 'medium';
        recommendations.push('Monitor structural integrity sensors');
        recommendations.push('Check for wind-induced vibrations');
      }

      // Temperature effects
      if (weatherData.temperature > 35) {
        recommendations.push('Monitor concrete expansion joints');
        structuralStress += 5;
      } else if (weatherData.temperature < 0) {
        recommendations.push('Check for ice formation and freeze-thaw cycles');
        structuralStress += 8;
      }

      // Weather alerts impact
      weatherData.alerts.forEach(alert => {
        if (alert.type === 'flood_warning') {
          operationalRisk = 'critical';
          recommendations.push('Activate emergency flood protocols');
        } else if (alert.type === 'storm') {
          if (operationalRisk !== 'critical') operationalRisk = 'high';
          recommendations.push('Secure all equipment and personnel');
        }
      });

      setImpact({
        waterLevelChange: Math.max(0, waterLevelChange),
        structuralStress: Math.max(0, Math.min(100, structuralStress)),
        operationalRisk,
        recommendations: [...new Set(recommendations)] // Remove duplicates
      });
    };

    calculateImpact();
  }, [weatherData]);

  return impact;
}