import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDam } from '@/contexts/DamContext';
import { Map, Navigation, AlertTriangle, Home, Route, MapPin, Layers } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map updates
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 11); // Reset zoom to 11 when changing dams
    setTimeout(() => map.invalidateSize(), 100);
  }, [center, map]);
  
  return null;
}

// Component to render map layers reactively
function MapLayers({ 
  showFloodZones, 
  showEvacuationRoutes, 
  showSafeLocations,
  floodZones,
  evacuationRoutes,
  safeLocations,
  riskColors,
  routeColors
}: any) {
  const map = useMap();
  
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [showFloodZones, showEvacuationRoutes, showSafeLocations, map]);
  
  return (
    <>
      {/* Flood Zones */}
      {showFloodZones && floodZones.map((zone: any) => (
        <Circle
          key={zone.id}
          center={zone.center}
          radius={zone.radius}
          pathOptions={{
            color: riskColors[zone.risk],
            fillColor: riskColors[zone.risk],
            fillOpacity: 0.15,
            weight: 2
          }}
        >
          <Popup>
            <div>
              <strong>{zone.name}</strong>
              <p className="text-sm">Risk Level: <span style={{ color: riskColors[zone.risk] }}>{zone.risk.toUpperCase()}</span></p>
              <p className="text-sm">Radius: {(zone.radius / 1000).toFixed(1)} km</p>
              <p className="text-sm">Population: {zone.population.toLocaleString()}</p>
            </div>
          </Popup>
        </Circle>
      ))}

      {/* Evacuation Routes */}
      {showEvacuationRoutes && evacuationRoutes.map((route: any) => (
        <Polyline
          key={route.id}
          positions={route.coordinates}
          pathOptions={{
            color: routeColors[route.status],
            weight: 4,
            opacity: 0.8,
            dashArray: route.status === 'blocked' ? '10, 10' : undefined
          }}
        >
          <Popup>
            <div>
              <strong>{route.name}</strong>
              <p className="text-sm">Status: <span style={{ color: routeColors[route.status] }}>{route.status.toUpperCase()}</span></p>
              <p className="text-sm">Capacity: {route.capacity.toLocaleString()} people</p>
            </div>
          </Popup>
        </Polyline>
      ))}

      {/* Safe Locations */}
      {showSafeLocations && safeLocations.map((location: any, idx: number) => (
        <Marker 
          key={idx} 
          position={location.position}
          icon={L.icon({
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxMiIgZmlsbD0iIzIyYzU1ZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIi8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+4pyFPC90ZXh0Pjwvc3ZnPg==',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })}
        >
          <Popup>
            <div>
              <strong>✅ {location.name}</strong>
              <p className="text-sm">Capacity: {location.capacity.toLocaleString()}</p>
              <p className="text-xs text-gray-600">
                {location.position[0].toFixed(4)}, {location.position[1].toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

interface FloodZone {
  id: string;
  name: string;
  center: [number, number];
  radius: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  population: number;
}

interface EvacuationRoute {
  id: string;
  name: string;
  coordinates: [number, number][];
  capacity: number;
  status: 'clear' | 'congested' | 'blocked';
}

const GISMapping = () => {
  const { t } = useLanguage();
  const { selectedDam, getDamLocation, getDamLabel } = useDam();
  
  // Get current dam location
  const damLocation = getDamLocation(selectedDam);
  const damName = getDamLabel(selectedDam);
  
  const [showFloodZones, setShowFloodZones] = useState(true);
  const [showEvacuationRoutes, setShowEvacuationRoutes] = useState(true);
  const [showSafeLocations, setShowSafeLocations] = useState(true);

  // Generate flood zones based on dam location - recalculates when selectedDam changes
  const floodZones = useMemo<FloodZone[]>(() => [
    {
      id: '1',
      name: 'Immediate Risk Zone',
      center: damLocation,
      radius: 5000, // 5km
      risk: 'critical',
      population: 15000
    },
    {
      id: '2',
      name: 'High Risk Zone',
      center: damLocation,
      radius: 10000, // 10km
      risk: 'high',
      population: 45000
    },
    {
      id: '3',
      name: 'Moderate Risk Zone',
      center: damLocation,
      radius: 20000, // 20km
      risk: 'medium',
      population: 120000
    }
  ], [damLocation]);

  // Generate evacuation routes based on dam location - recalculates when selectedDam changes
  const evacuationRoutes = useMemo<EvacuationRoute[]>(() => [
    {
      id: '1',
      name: 'Route A - North Exit',
      coordinates: [
        damLocation,
        [damLocation[0] + 0.02, damLocation[1] + 0.02] as [number, number],
        [damLocation[0] + 0.04, damLocation[1] + 0.04] as [number, number],
        [damLocation[0] + 0.07, damLocation[1] + 0.07] as [number, number]
      ],
      capacity: 5000,
      status: 'clear'
    },
    {
      id: '2',
      name: 'Route B - East Exit',
      coordinates: [
        damLocation,
        [damLocation[0] + 0.01, damLocation[1] + 0.02] as [number, number],
        [damLocation[0] + 0.02, damLocation[1] + 0.05] as [number, number],
        [damLocation[0] + 0.03, damLocation[1] + 0.08] as [number, number]
      ],
      capacity: 3000,
      status: 'clear'
    }
  ], [damLocation]);

  // Generate safe locations based on dam location - recalculates when selectedDam changes
  const safeLocations = useMemo(() => [
    { name: 'Relief Camp 1', position: [damLocation[0] + 0.07, damLocation[1] + 0.07] as [number, number], capacity: 10000 },
    { name: 'Relief Camp 2', position: [damLocation[0] + 0.03, damLocation[1] + 0.08] as [number, number], capacity: 5000 },
    { name: 'Hospital', position: [damLocation[0] + 0.04, damLocation[1] + 0.04] as [number, number], capacity: 500 }
  ], [damLocation]);

  const riskColors = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444'
  };

  const routeColors = {
    clear: '#22c55e',
    congested: '#eab308',
    blocked: '#ef4444'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">GIS Mapping Integration</h1>
        <p className="text-muted-foreground">Interactive maps with flood zones & evacuation routes</p>
      </div>

      {/* Map View */}
      <Card className="p-6 glass-card">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-bold">🗺️ Interactive Map</h2>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                toast.success('Map refreshed!');
              }}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Recenter
            </Button>
            <Button 
              variant={showFloodZones ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowFloodZones(!showFloodZones)}
            >
              <Layers className="w-4 h-4 mr-2" />
              Flood Zones
            </Button>
            <Button 
              variant={showEvacuationRoutes ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowEvacuationRoutes(!showEvacuationRoutes)}
            >
              <Route className="w-4 h-4 mr-2" />
              Routes
            </Button>
            <Button 
              variant={showSafeLocations ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowSafeLocations(!showSafeLocations)}
            >
              <Home className="w-4 h-4 mr-2" />
              Safe Zones
            </Button>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-border" style={{ height: '600px' }}>
          <MapContainer
            key={selectedDam}
            center={damLocation} 
            zoom={11} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Dam Location Marker */}
            <Marker position={damLocation}>
              <Popup>
                <div className="text-center">
                  <strong>🏗️ {damName}</strong>
                  <p className="text-sm">Main Dam Structure</p>
                  <p className="text-xs text-gray-600">
                    {damLocation[0].toFixed(4)}, {damLocation[1].toFixed(4)}
                  </p>
                </div>
              </Popup>
              <Tooltip permanent direction="top">{damName.split(',')[0]}</Tooltip>
            </Marker>

            {/* Reactive Map Layers Component */}
            <MapLayers 
              showFloodZones={showFloodZones}
              showEvacuationRoutes={showEvacuationRoutes}
              showSafeLocations={showSafeLocations}
              floodZones={floodZones}
              evacuationRoutes={evacuationRoutes}
              safeLocations={safeLocations}
              riskColors={riskColors}
              routeColors={routeColors}
            />
            
            <MapUpdater center={damLocation} />
          </MapContainer>
        </div>
        
        {/* Map Legend */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h3 className="text-sm font-bold mb-2">Map Legend:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: riskColors.critical }}></div>
              <span>Critical Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: riskColors.high }}></div>
              <span>High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: riskColors.medium }}></div>
              <span>Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Safe Location</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Flood Zones Info */}
      <Card className="p-6 glass-card">
        <h2 className="text-xl font-bold mb-4">🌊 Flood Risk Zones</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {floodZones.map((zone) => (
            <div
              key={zone.id}
              className="p-4 border border-border rounded-lg"
              style={{ borderLeftWidth: '4px', borderLeftColor: riskColors[zone.risk] }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold">{zone.name}</h3>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: riskColors[zone.risk] + '20',
                    color: riskColors[zone.risk]
                  }}
                >
                  {zone.risk.toUpperCase()}
                </span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>📏 Radius: {(zone.radius / 1000).toFixed(1)} km</p>
                <p>👥 Population: {zone.population.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Evacuation Routes */}
      <Card className="p-6 glass-card">
        <h2 className="text-xl font-bold mb-4">🚗 Evacuation Routes</h2>
        <div className="space-y-4">
          {evacuationRoutes.map((route) => (
            <div key={route.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Route className="w-5 h-5" style={{ color: routeColors[route.status] }} />
                  <div>
                    <h3 className="font-bold">{route.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Capacity: {route.capacity.toLocaleString()} people
                    </p>
                  </div>
                </div>
                <span
                  className="text-xs px-3 py-1 rounded font-medium"
                  style={{
                    backgroundColor: routeColors[route.status] + '20',
                    color: routeColors[route.status]
                  }}
                >
                  {route.status.toUpperCase()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Share Route
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Safe Locations */}
      <Card className="p-6 glass-card">
        <h2 className="text-xl font-bold mb-4">✅ Safe Locations & Relief Camps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeLocations.map((location, idx) => (
            <div key={idx} className="p-4 border border-border rounded-lg border-l-4 border-l-green-500">
              <div className="flex items-start gap-3 mb-3">
                <Home className="w-5 h-5 text-green-500 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{location.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    📍 {location.position[0].toFixed(4)}, {location.position[1].toFixed(4)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">👥 {location.capacity.toLocaleString()}</span>
                <Button variant="ghost" size="sm">
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <div className="text-2xl font-bold">
                {floodZones.reduce((sum, z) => sum + z.population, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">At Risk Population</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <Route className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold">{evacuationRoutes.length}</div>
              <div className="text-sm text-muted-foreground">Evacuation Routes</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{safeLocations.length}</div>
              <div className="text-sm text-muted-foreground">Relief Camps</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-purple-500" />
            <div>
              <div className="text-2xl font-bold">
                {safeLocations.reduce((sum, l) => sum + l.capacity, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Capacity</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GISMapping;
