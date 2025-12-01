import { useState, useEffect, useMemo } from 'react';

export interface AnalyticsData {
  waterFlowTrends: WaterFlowData[];
  seasonalPatterns: SeasonalData[];
  maintenanceSchedule: MaintenanceItem[];
  performanceMetrics: PerformanceMetrics;
  predictiveInsights: PredictiveInsight[];
  efficiency: EfficiencyMetrics;
}

export interface WaterFlowData {
  timestamp: string;
  inflow: number;
  outflow: number;
  waterLevel: number;
  turbidity: number;
  ph: number;
  dissolvedOxygen: number;
}

export interface SeasonalData {
  month: string;
  averageInflow: number;
  averageOutflow: number;
  averageRainfall: number;
  peakDemand: number;
  energyGenerated: number;
}

export interface MaintenanceItem {
  id: string;
  type: 'preventive' | 'corrective' | 'inspection' | 'calibration';
  component: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: string;
  estimatedDuration: number; // hours
  cost: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  lastPerformed?: string;
  nextDue: string;
}

export interface PerformanceMetrics {
  uptime: number; // percentage
  efficiency: number; // percentage
  energyOutput: number; // MWh
  waterUtilization: number; // percentage
  maintenanceCost: number;
  totalOperationalHours: number;
  failureRate: number; // failures per 1000 hours
}

export interface PredictiveInsight {
  id: string;
  type: 'maintenance' | 'performance' | 'efficiency' | 'failure';
  component: string;
  prediction: string;
  confidence: number; // percentage
  timeframe: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
  potentialSavings?: number;
}

export interface EfficiencyMetrics {
  currentEfficiency: number;
  optimalEfficiency: number;
  energyLoss: number;
  waterLoss: number;
  costSavingsPotential: number;
  recommendations: string[];
}

// Hook for analytics data
export function useAnalyticsData() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    waterFlowTrends: [],
    seasonalPatterns: [],
    maintenanceSchedule: [],
    performanceMetrics: {
      uptime: 0,
      efficiency: 0,
      energyOutput: 0,
      waterUtilization: 0,
      maintenanceCost: 0,
      totalOperationalHours: 0,
      failureRate: 0
    },
    predictiveInsights: [],
    efficiency: {
      currentEfficiency: 0,
      optimalEfficiency: 0,
      energyLoss: 0,
      waterLoss: 0,
      costSavingsPotential: 0,
      recommendations: []
    }
  });

  useEffect(() => {
    const generateAnalyticsData = (): AnalyticsData => {
      // Generate water flow trends (last 365 days for full year view)
      const waterFlowTrends: WaterFlowData[] = [];
      const now = new Date();
      
      // Base values for realistic progression
      let currentInflow = 1000;
      let currentOutflow = 950;
      let currentWaterLevel = 65;
      
      for (let i = 365; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Create realistic progressive changes
        const seasonalFactor = Math.sin(i * 0.1) * 0.05; // Seasonal variation
        const yearlyTrend = Math.sin(i * 0.017) * 0.1; // Yearly seasonal pattern
        
        // Progressive changes with some randomness
        currentInflow += (Math.random() - 0.48) * 50 + seasonalFactor * 100 + yearlyTrend * 200;
        currentOutflow += (Math.random() - 0.48) * 40 + seasonalFactor * 80 + yearlyTrend * 150;
        currentWaterLevel += (Math.random() - 0.5) * 2 + yearlyTrend * 3;
        
        // Keep values within realistic ranges
        currentInflow = Math.max(700, Math.min(1500, currentInflow));
        currentOutflow = Math.max(650, Math.min(1400, currentOutflow));
        currentWaterLevel = Math.max(45, Math.min(85, currentWaterLevel));
        
        waterFlowTrends.push({
          timestamp: date.toISOString(),
          inflow: parseFloat(currentInflow.toFixed(1)),
          outflow: parseFloat(currentOutflow.toFixed(1)),
          waterLevel: parseFloat(currentWaterLevel.toFixed(1)),
          turbidity: parseFloat((2 + Math.random() * 3).toFixed(2)),
          ph: parseFloat((7.2 + Math.random() * 0.6).toFixed(2)),
          dissolvedOxygen: parseFloat((8 + Math.random() * 2).toFixed(2))
        });
      }

      // Generate seasonal patterns
      const seasonalPatterns: SeasonalData[] = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ].map((month, index) => ({
        month,
        averageInflow: 800 + Math.sin(index * Math.PI / 6) * 400 + Math.random() * 100,
        averageOutflow: 700 + Math.sin(index * Math.PI / 6) * 300 + Math.random() * 80,
        averageRainfall: 50 + Math.sin((index + 3) * Math.PI / 6) * 40 + Math.random() * 20,
        peakDemand: 1200 + Math.cos(index * Math.PI / 6) * 200 + Math.random() * 50,
        energyGenerated: 150 + Math.sin(index * Math.PI / 4) * 50 + Math.random() * 20
      }));

      // Generate maintenance schedule
      const maintenanceSchedule: MaintenanceItem[] = [
        {
          id: 'maint-001',
          type: 'preventive',
          component: 'Turbine Unit 1',
          description: 'Routine inspection and lubrication of turbine bearings',
          priority: 'medium',
          scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedDuration: 8,
          cost: 15000,
          status: 'pending',
          lastPerformed: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          nextDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'maint-002',
          type: 'inspection',
          component: 'Spillway Gates',
          description: 'Annual safety inspection of spillway gate mechanisms',
          priority: 'high',
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedDuration: 12,
          cost: 25000,
          status: 'pending',
          nextDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'maint-003',
          type: 'calibration',
          component: 'Water Level Sensors',
          description: 'Calibration of all water level monitoring sensors',
          priority: 'medium',
          scheduledDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedDuration: 6,
          cost: 8000,
          status: 'pending',
          nextDue: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'maint-004',
          type: 'corrective',
          component: 'Emergency Generator',
          description: 'Replace faulty control panel components',
          priority: 'urgent',
          scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedDuration: 4,
          cost: 12000,
          status: 'pending',
          nextDue: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Generate performance metrics
      const performanceMetrics: PerformanceMetrics = {
        uptime: 97.8 + Math.random() * 2,
        efficiency: 89.5 + Math.random() * 5,
        energyOutput: 2850 + Math.random() * 200,
        waterUtilization: 92.3 + Math.random() * 5,
        maintenanceCost: 125000 + Math.random() * 25000,
        totalOperationalHours: 8760 * 0.978,
        failureRate: 0.15 + Math.random() * 0.1
      };

      // Generate predictive insights
      const predictiveInsights: PredictiveInsight[] = [
        {
          id: 'insight-001',
          type: 'maintenance',
          component: 'Turbine Unit 2',
          prediction: 'Bearing replacement needed within 45 days',
          confidence: 87,
          timeframe: '30-60 days',
          impact: 'high',
          recommendedAction: 'Schedule bearing replacement during next maintenance window',
          potentialSavings: 45000
        },
        {
          id: 'insight-002',
          type: 'efficiency',
          component: 'Water Intake System',
          prediction: 'Efficiency degradation due to sediment buildup',
          confidence: 92,
          timeframe: 'Current',
          impact: 'medium',
          recommendedAction: 'Schedule intake cleaning to improve water flow',
          potentialSavings: 18000
        },
        {
          id: 'insight-003',
          type: 'performance',
          component: 'Control System',
          prediction: 'Optimal performance window during off-peak hours',
          confidence: 95,
          timeframe: 'Daily 2-6 AM',
          impact: 'low',
          recommendedAction: 'Adjust operational schedule for maximum efficiency'
        }
      ];

      // Generate efficiency metrics
      const efficiency: EfficiencyMetrics = {
        currentEfficiency: 89.5,
        optimalEfficiency: 94.2,
        energyLoss: 134, // MWh
        waterLoss: 2.3, // percentage
        costSavingsPotential: 67000,
        recommendations: [
          'Optimize turbine blade angles for current water flow conditions',
          'Implement predictive maintenance to reduce downtime',
          'Upgrade control system software for better automation',
          'Install variable frequency drives on auxiliary pumps',
          'Improve sediment management to maintain optimal water quality'
        ]
      };

  return {
    waterFlowTrends,
    seasonalPatterns,
    maintenanceSchedule,
    performanceMetrics,
    predictiveInsights,
    efficiency
  };
};

    const updateData = () => {
      setAnalyticsData(generateAnalyticsData());
    };

    updateData();
    const interval = setInterval(updateData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return analyticsData;
}

// Calculate trends and patterns
export function useAnalyticsTrends(analyticsData: AnalyticsData) {
  const [trends, setTrends] = useState({
    waterLevelTrend: 'stable' as 'increasing' | 'decreasing' | 'stable',
    efficiencyTrend: 'improving' as 'improving' | 'declining' | 'stable',
    maintenanceTrend: 'on_schedule' as 'ahead' | 'on_schedule' | 'behind',
    costTrend: 'stable' as 'increasing' | 'decreasing' | 'stable',
    recommendations: [] as string[]
  });

  useEffect(() => {
    if (analyticsData.waterFlowTrends.length > 0) {
      // Analyze water level trend
      const recent = analyticsData.waterFlowTrends.slice(-7);
      const earlier = analyticsData.waterFlowTrends.slice(-14, -7);
      const recentAvg = recent.reduce((sum, d) => sum + d.waterLevel, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, d) => sum + d.waterLevel, 0) / earlier.length;
      
      const waterLevelTrend = recentAvg > earlierAvg + 2 ? 'increasing' :
                            recentAvg < earlierAvg - 2 ? 'decreasing' : 'stable';

      // Analyze efficiency trend
      const efficiencyTrend = analyticsData.performanceMetrics.efficiency > 90 ? 'improving' :
                            analyticsData.performanceMetrics.efficiency < 85 ? 'declining' : 'stable';

      // Analyze maintenance trend
      const urgentTasks = analyticsData.maintenanceSchedule.filter(m => m.priority === 'urgent').length;
      const overdueTasks = analyticsData.maintenanceSchedule.filter(m => m.status === 'overdue').length;
      
      const maintenanceTrend = overdueTasks > 0 ? 'behind' :
                             urgentTasks === 0 ? 'ahead' : 'on_schedule';

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (waterLevelTrend === 'increasing') {
        recommendations.push('Monitor spillway capacity - water levels trending upward');
      }
      if (efficiencyTrend === 'declining') {
        recommendations.push('Review operational parameters to improve efficiency');
      }
      if (maintenanceTrend === 'behind') {
        recommendations.push('Prioritize overdue maintenance tasks to prevent failures');
      }
      if (analyticsData.performanceMetrics.failureRate > 0.2) {
        recommendations.push('Investigate root causes of equipment failures');
      }

      setTrends({
        waterLevelTrend,
        efficiencyTrend,
        maintenanceTrend,
        costTrend: 'stable',
        recommendations
      });
    }
  }, [analyticsData]);

  return trends;
}
