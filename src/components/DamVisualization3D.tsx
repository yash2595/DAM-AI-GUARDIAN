import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Droplets, 
  Thermometer, 
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';

interface DamVisualizationProps {
  waterLevel?: number;
  pressure?: number;
  temperature?: number;
  seepage?: number;
  structuralStress?: number;
}

const DamVisualization3D: React.FC<DamVisualizationProps> = ({
  waterLevel = 65,
  pressure = 120,
  temperature = 22,
  seepage = 15,
  structuralStress = 35
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showWater, setShowWater] = useState(true);
  const [showStress, setShowStress] = useState(true);
  const [showPressure, setShowPressure] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      drawDam3D(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rotation, zoom, showWater, showStress, showPressure, waterLevel, pressure, structuralStress]);

  const drawDam3D = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    // Apply transformations
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);

    // 3D projection helpers
    const project3D = (x: number, y: number, z: number) => {
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);

      // Rotate around Y axis
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate around X axis
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Simple perspective projection
      const perspective = 300;
      const scale = perspective / (perspective + z2);
      
      return {
        x: x1 * scale,
        y: y2 * scale,
        z: z2
      };
    };

    // Dam structure dimensions
    const damWidth = 150;
    const damHeight = 100;
    const damDepth = 20;

    // Draw dam structure (trapezoidal shape)
    const drawDamStructure = () => {
      ctx.strokeStyle = '#4A5568';
      ctx.fillStyle = '#2D3748';
      ctx.lineWidth = 2;

      // Front face of dam
      const front = [
        project3D(-damWidth/2, -damHeight/2, damDepth/2),
        project3D(damWidth/3, -damHeight/2, damDepth/2),
        project3D(damWidth/4, damHeight/2, damDepth/2),
        project3D(-damWidth/3, damHeight/2, damDepth/2)
      ];

      ctx.beginPath();
      ctx.moveTo(front[0].x, front[0].y);
      front.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Top face
      const top = [
        project3D(-damWidth/2, -damHeight/2, damDepth/2),
        project3D(damWidth/3, -damHeight/2, damDepth/2),
        project3D(damWidth/3, -damHeight/2, -damDepth/2),
        project3D(-damWidth/2, -damHeight/2, -damDepth/2)
      ];

      ctx.fillStyle = '#4A5568';
      ctx.beginPath();
      ctx.moveTo(top[0].x, top[0].y);
      top.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // Draw water
    const drawWater = () => {
      if (!showWater) return;

      const waterHeight = (waterLevel / 100) * (damHeight - 10);
      const waterY = damHeight/2 - waterHeight;

      // Water surface with wave animation
      const time = Date.now() * 0.003;
      ctx.fillStyle = `rgba(59, 130, 246, ${0.6 + Math.sin(time) * 0.1})`;
      ctx.strokeStyle = '#3B82F6';

      // Water body
      const water = [
        project3D(-damWidth/2 + 10, waterY, damDepth/2 - 5),
        project3D(damWidth/3 - 10, waterY, damDepth/2 - 5),
        project3D(damWidth/4 - 5, damHeight/2 - 5, damDepth/2 - 5),
        project3D(-damWidth/3 + 5, damHeight/2 - 5, damDepth/2 - 5)
      ];

      ctx.beginPath();
      ctx.moveTo(water[0].x, water[0].y);
      water.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fill();

      // Add ripple effects
      for (let i = 0; i < 3; i++) {
        const rippleRadius = 20 + i * 15 + Math.sin(time + i) * 5;
        const center = project3D(0, waterY + Math.sin(time + i * 2) * 2, 0);
        
        ctx.beginPath();
        ctx.arc(center.x, center.y, rippleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 - i * 0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // Draw pressure indicators
    const drawPressureIndicators = () => {
      if (!showPressure) return;

      const pressureIntensity = pressure / 200;
      const numIndicators = Math.floor(pressureIntensity * 10);

      for (let i = 0; i < numIndicators; i++) {
        const y = -damHeight/2 + (i / numIndicators) * damHeight;
        const intensity = 1 - (i / numIndicators);
        const size = 3 + intensity * 5;

        const point = project3D(damWidth/3 + 5, y, 0);
        
        ctx.fillStyle = `rgb(${255 * intensity}, ${100 * (1-intensity)}, 0)`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Pressure arrows
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(point.x + 15 * intensity, point.y);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(point.x + 15 * intensity, point.y);
        ctx.lineTo(point.x + 10 * intensity, point.y - 3);
        ctx.lineTo(point.x + 10 * intensity, point.y + 3);
        ctx.closePath();
        ctx.fill();
      }
    };

    // Draw structural stress visualization
    const drawStressVisualization = () => {
      if (!showStress) return;

      const stressLevel = structuralStress / 100;
      
      // Stress color map
      const getStressColor = (stress: number) => {
        if (stress < 0.3) return `rgba(0, 255, 0, ${stress})`;
        if (stress < 0.6) return `rgba(255, 255, 0, ${stress})`;
        if (stress < 0.8) return `rgba(255, 165, 0, ${stress})`;
        return `rgba(255, 0, 0, ${stress})`;
      };

      // Draw stress heat map on dam surface
      const gridSize = 10;
      for (let i = -damWidth/2; i < damWidth/3; i += gridSize) {
        for (let j = -damHeight/2; j < damHeight/2; j += gridSize) {
          const localStress = stressLevel * (0.5 + 0.5 * Math.sin((i + j) * 0.1 + Date.now() * 0.001));
          const point = project3D(i, j, damDepth/2 + 1);
          
          ctx.fillStyle = getStressColor(localStress);
          ctx.fillRect(point.x - gridSize/4, point.y - gridSize/4, gridSize/2, gridSize/2);
        }
      }
    };

    // Draw temperature gradients
    const drawTemperatureGradient = () => {
      const tempVariation = (temperature - 20) / 20; // Normalized temperature variation
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, -damHeight/2, 0, damHeight/2);
      if (temperature > 25) {
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0.2)');
      } else if (temperature < 15) {
        gradient.addColorStop(0, 'rgba(0, 100, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 200, 255, 0.2)');
      }
      
      if (Math.abs(tempVariation) > 0.2) {
        ctx.fillStyle = gradient;
        ctx.fillRect(-damWidth/2, -damHeight/2, damWidth, damHeight);
      }
    };

    // Draw all elements
    drawDamStructure();
    drawTemperatureGradient();
    drawWater();
    drawPressureIndicators();
    drawStressVisualization();

    // Draw coordinate system
    const axisLength = 50;
    const origin = project3D(0, 0, 0);
    
    // X axis (red)
    const xAxis = project3D(axisLength, 0, 0);
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(xAxis.x, xAxis.y);
    ctx.stroke();
    
    // Y axis (green)
    const yAxis = project3D(0, -axisLength, 0);
    ctx.strokeStyle = '#00FF00';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yAxis.x, yAxis.y);
    ctx.stroke();
    
    // Z axis (blue)
    const zAxis = project3D(0, 0, axisLength);
    ctx.strokeStyle = '#0000FF';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zAxis.x, zAxis.y);
    ctx.stroke();

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMouse.x;
      const deltaY = e.clientY - lastMouse.y;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.01,
        y: prev.y + deltaX * 0.01
      }));
      
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setLastMouse({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - lastMouse.x;
      const deltaY = e.touches[0].clientY - lastMouse.y;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.01,
        y: prev.y + deltaX * 0.01
      }));
      
      setLastMouse({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Interactive 3D Dam Visualization</span>
          <div className="flex space-x-2">
            <Badge variant="outline">{`${waterLevel.toFixed(1)}% Water`}</Badge>
            <Badge variant="outline">{`${pressure.toFixed(0)} kPa`}</Badge>
            <Badge variant="outline">{`${structuralStress.toFixed(1)}% Stress`}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={resetView}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setZoom(Math.min(3, zoom + 0.2))}
          >
            <ZoomIn className="w-4 h-4 mr-1" />
            Zoom In
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
          >
            <ZoomOut className="w-4 h-4 mr-1" />
            Zoom Out
          </Button>
          <Button 
            variant={showWater ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowWater(!showWater)}
          >
            <Droplets className="w-4 h-4 mr-1" />
            Water
          </Button>
          <Button 
            variant={showPressure ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowPressure(!showPressure)}
          >
            <Activity className="w-4 h-4 mr-1" />
            Pressure
          </Button>
          <Button 
            variant={showStress ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowStress(!showStress)}
          >
            <Thermometer className="w-4 h-4 mr-1" />
            Stress
          </Button>
        </div>

        {/* 3D Canvas */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-auto cursor-move active:cursor-grabbing"
            style={{ touchAction: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          
          {/* Legend */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white p-3 rounded text-sm">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Water Level: {waterLevel.toFixed(1)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>High Pressure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Medium Stress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Low Stress</span>
              </div>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded text-xs space-y-1">
            <div className="font-semibold text-sm mb-1">🎮 Controls:</div>
            <div>🖱️ <strong>Drag</strong> to rotate</div>
            <div>🖱️ <strong>Mouse wheel</strong> to zoom</div>
            <div>📱 <strong>Touch drag</strong> on mobile</div>
            <div>🔘 Use buttons to zoom in/out</div>
          </div>
        </div>

        {/* Zoom Control Slider */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Zoom Level: {zoom.toFixed(1)}x</label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Slider
            value={[zoom]}
            onValueChange={([value]) => setZoom(value)}
            min={0.5}
            max={3}
            step={0.1}
            className="mt-2"
          />
        </div>

        {/* Rotation Control Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-blue-900">Rotation X:</span>
              <span className="ml-2 text-blue-700">{(rotation.x * 57.3).toFixed(0)}°</span>
            </div>
            <div>
              <span className="font-semibold text-blue-900">Rotation Y:</span>
              <span className="ml-2 text-blue-700">{(rotation.y * 57.3).toFixed(0)}°</span>
            </div>
            <div>
              <span className="font-semibold text-blue-900">Zoom:</span>
              <span className="ml-2 text-blue-700">{(zoom * 100).toFixed(0)}%</span>
            </div>
            <div>
              <span className="font-semibold text-blue-900">Mode:</span>
              <span className="ml-2 text-blue-700">{isDragging ? '🔄 Rotating' : '👆 Ready'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DamVisualization3D;