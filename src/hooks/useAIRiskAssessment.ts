import { useState, useEffect } from 'react';

// Simulated AI model for dam risk assessment
export interface RiskFactors {
  waterLevel: number;
  pressure: number;
  temperature: number;
  seepage: number;
  structuralStress: number;
  weatherCondition: 'clear' | 'rain' | 'storm' | 'snow';
  historicalPattern: number;
}

export interface RiskAssessment {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number; // 0-100
  confidence: number; // 0-100
  factors: string[];
  recommendations: string[];
  timeToAction?: string;
  estimatedDamage?: string;
}

// Simulated neural network weights (in real world, this would be trained model)
const riskWeights = {
  waterLevel: 0.25,
  pressure: 0.20,
  temperature: 0.05,
  seepage: 0.25,
  structuralStress: 0.15,
  weather: 0.10
};

const weatherMultipliers = {
  clear: 1.0,
  rain: 1.3,
  storm: 1.8,
  snow: 1.1
};

export function useAIRiskAssessment() {
  const [assessment, setAssessment] = useState<RiskAssessment>({
    riskLevel: 'LOW',
    probability: 0,
    confidence: 0,
    factors: [],
    recommendations: []
  });

  const calculateRisk = (factors: RiskFactors): RiskAssessment => {
    // Normalize factors (0-1 scale)
    const normalizedFactors = {
      waterLevel: Math.min(factors.waterLevel / 100, 1),
      pressure: Math.min(factors.pressure / 200, 1),
      temperature: Math.abs(factors.temperature - 20) / 50, // deviation from normal
      seepage: Math.min(factors.seepage / 50, 1),
      structuralStress: Math.min(factors.structuralStress / 100, 1),
    };

    // Calculate base risk score
    let riskScore = 
      normalizedFactors.waterLevel * riskWeights.waterLevel +
      normalizedFactors.pressure * riskWeights.pressure +
      normalizedFactors.temperature * riskWeights.temperature +
      normalizedFactors.seepage * riskWeights.seepage +
      normalizedFactors.structuralStress * riskWeights.structuralStress;

    // Apply weather multiplier
    riskScore *= weatherMultipliers[factors.weatherCondition];

    // Apply historical pattern learning
    riskScore += (factors.historicalPattern / 100) * 0.1;

    // Convert to percentage
    const probability = Math.min(Math.max(riskScore * 100, 0), 100);

    // Determine risk level
    let riskLevel: RiskAssessment['riskLevel'];
    if (probability < 20) riskLevel = 'LOW';
    else if (probability < 50) riskLevel = 'MEDIUM';
    else if (probability < 80) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';

    // Calculate confidence based on data quality
    const confidence = Math.min(95, 60 + (factors.historicalPattern / 100 * 35));

    // Generate risk factors
    const riskFactors = [];
    if (normalizedFactors.waterLevel > 0.7) riskFactors.push('High water level detected');
    if (normalizedFactors.pressure > 0.8) riskFactors.push('Excessive pressure on structure');
    if (normalizedFactors.seepage > 0.6) riskFactors.push('Abnormal seepage patterns');
    if (normalizedFactors.structuralStress > 0.7) riskFactors.push('High structural stress');
    if (factors.weatherCondition === 'storm') riskFactors.push('Severe weather conditions');

    // Generate recommendations
    const recommendations = [];
    if (riskLevel === 'CRITICAL') {
      recommendations.push('EVACUATE downstream areas immediately');
      recommendations.push('Close all dam gates and reduce water level');
      recommendations.push('Deploy emergency response teams');
    } else if (riskLevel === 'HIGH') {
      recommendations.push('Increase monitoring frequency to every 5 minutes');
      recommendations.push('Prepare evacuation procedures');
      recommendations.push('Reduce water discharge gradually');
    } else if (riskLevel === 'MEDIUM') {
      recommendations.push('Monitor conditions closely');
      recommendations.push('Inspect seepage areas');
      recommendations.push('Check structural integrity');
    } else {
      recommendations.push('Continue routine monitoring');
      recommendations.push('Maintain current water levels');
    }

    return {
      riskLevel,
      probability: Math.round(probability),
      confidence: Math.round(confidence),
      factors: riskFactors,
      recommendations,
      timeToAction: riskLevel === 'CRITICAL' ? '< 30 minutes' : 
                   riskLevel === 'HIGH' ? '< 2 hours' : 
                   riskLevel === 'MEDIUM' ? '< 24 hours' : undefined,
      estimatedDamage: riskLevel === 'CRITICAL' ? 'Catastrophic flooding, ₹500+ crores' :
                      riskLevel === 'HIGH' ? 'Major flooding, ₹100-500 crores' :
                      riskLevel === 'MEDIUM' ? 'Minor flooding, ₹10-100 crores' : undefined
    };
  };

  return { assessment, setAssessment, calculateRisk };
}

// Simulated real-time sensor data
export function useSimulatedSensorData() {
  const [sensorData, setSensorData] = useState<RiskFactors>({
    waterLevel: 65,
    pressure: 120,
    temperature: 22,
    seepage: 15,
    structuralStress: 35,
    weatherCondition: 'clear',
    historicalPattern: 45
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        waterLevel: prev.waterLevel + (Math.random() - 0.5) * 2,
        pressure: prev.pressure + (Math.random() - 0.5) * 5,
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        seepage: Math.max(0, prev.seepage + (Math.random() - 0.5) * 1),
        structuralStress: prev.structuralStress + (Math.random() - 0.5) * 1,
        weatherCondition: Math.random() > 0.95 ? 
          (['rain', 'storm', 'clear', 'snow'][Math.floor(Math.random() * 4)] as any) : 
          prev.weatherCondition,
        historicalPattern: Math.min(100, prev.historicalPattern + (Math.random() - 0.5) * 0.5)
      }));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return sensorData;
}