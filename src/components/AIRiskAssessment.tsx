import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, AlertTriangle, Shield, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { useAIRiskAssessment, useSimulatedSensorData } from '@/hooks/useAIRiskAssessment';

const AIRiskAssessment: React.FC = () => {
  const { assessment, calculateRisk } = useAIRiskAssessment();
  const sensorData = useSimulatedSensorData();

  useEffect(() => {
    const newAssessment = calculateRisk(sensorData);
    // Only update if assessment changed to prevent infinite re-renders
    if (JSON.stringify(newAssessment) !== JSON.stringify(assessment)) {
      // setAssessment(newAssessment);
    }
  }, [sensorData]);

  // Recalculate on every render for real-time updates
  const currentAssessment = calculateRisk(sensorData);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'LOW': return 'default';
      case 'MEDIUM': return 'secondary';
      case 'HIGH': return 'destructive';
      case 'CRITICAL': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Risk Assessment Card */}
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-1 ${getRiskColor(currentAssessment.riskLevel)}`} />
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <CardTitle>AI Risk Assessment</CardTitle>
          </div>
          <Badge variant={getRiskBadgeVariant(currentAssessment.riskLevel)} className="ml-auto">
            {currentAssessment.riskLevel}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Failure Probability</span>
              </div>
              <div className="space-y-2">
                <Progress value={currentAssessment.probability} className="h-3" />
                <p className="text-2xl font-bold">{currentAssessment.probability}%</p>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Confidence Level</span>
              </div>
              <div className="space-y-2">
                <Progress value={currentAssessment.confidence} className="h-3" />
                <p className="text-2xl font-bold">{currentAssessment.confidence}%</p>
              </div>
            </div>
          </div>

          {currentAssessment.timeToAction && (
            <Alert className="mb-4">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Time to Action:</strong> {currentAssessment.timeToAction}
                {currentAssessment.estimatedDamage && (
                  <span className="ml-4">
                    <strong>Potential Damage:</strong> {currentAssessment.estimatedDamage}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Identified Risk Factors</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentAssessment.factors.length > 0 ? (
            <ul className="space-y-2">
              {currentAssessment.factors.map((factor, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                  <span className="text-sm">{factor}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-600 text-sm">No significant risk factors detected</p>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {currentAssessment.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                  index === 0 ? 'bg-red-500' : 
                  index === 1 ? 'bg-orange-500' : 
                  'bg-yellow-500'
                }`} />
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Real-time Sensor Data */}
      <Card>
        <CardHeader>
          <CardTitle>Live Sensor Readings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Water Level</p>
              <p className="text-lg font-semibold">{sensorData.waterLevel.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Pressure</p>
              <p className="text-lg font-semibold">{sensorData.pressure.toFixed(1)} kPa</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Temperature</p>
              <p className="text-lg font-semibold">{sensorData.temperature.toFixed(1)}°C</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Seepage</p>
              <p className="text-lg font-semibold">{sensorData.seepage.toFixed(1)} L/min</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Stress</p>
              <p className="text-lg font-semibold">{sensorData.structuralStress.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Weather</p>
              <p className="text-lg font-semibold capitalize">{sensorData.weatherCondition}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIRiskAssessment;