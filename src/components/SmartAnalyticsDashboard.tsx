import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Settings,
  DollarSign,
  Zap,
  Droplets,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Brain
} from 'lucide-react';
import { useAnalyticsData, useAnalyticsTrends } from '@/hooks/useAnalyticsData';

const SmartAnalyticsDashboard: React.FC = () => {
  const analyticsData = useAnalyticsData();
  const trends = useAnalyticsTrends(analyticsData);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    const daysMap: { [key: string]: number } = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const days = daysMap[selectedTimeRange] || 30;
    const totalData = analyticsData.waterFlowTrends.length;
    const startIndex = Math.max(0, totalData - days);
    
    return {
      ...analyticsData,
      waterFlowTrends: analyticsData.waterFlowTrends.slice(startIndex)
    };
  }, [analyticsData, selectedTimeRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Analytics Dashboard</h1>
          <p className="text-gray-600">Advanced insights and predictive analytics for optimal dam operations</p>
        </div>
        <div className="flex space-x-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsData.performanceMetrics.uptime.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={analyticsData.performanceMetrics.uptime} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analyticsData.performanceMetrics.efficiency.toFixed(1)}%
                </p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(trends.efficiencyTrend)}
                  <span className="text-xs ml-1 capitalize">{trends.efficiencyTrend}</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Energy Output</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(analyticsData.performanceMetrics.energyOutput / 1000).toFixed(1)}GWh
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Water Utilization</p>
                <p className="text-2xl font-bold text-cyan-600">
                  {analyticsData.performanceMetrics.waterUtilization.toFixed(1)}%
                </p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(trends.waterLevelTrend)}
                  <span className="text-xs ml-1 capitalize">{trends.waterLevelTrend}</span>
                </div>
              </div>
              <div className="p-3 bg-cyan-50 rounded-full">
                <Droplets className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Flow Trends</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Analysis</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="predictions">AI Insights</TabsTrigger>
        </TabsList>

        {/* Water Flow Trends */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Water Flow Trends - Last {selectedTimeRange === '7d' ? '7 Days' : selectedTimeRange === '30d' ? '30 Days' : selectedTimeRange === '90d' ? '90 Days' : '1 Year'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={filteredData.waterFlowTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis label={{ value: 'm³/s', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-IN', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      });
                    }}
                    formatter={(value: any, name) => [
                      `${value.toFixed(1)} m³/s`, 
                      name === 'inflow' ? 'Inflow' : 'Outflow'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="inflow" 
                    stroke="#0088FE" 
                    strokeWidth={2}
                    dot={false}
                    name="inflow" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="outflow" 
                    stroke="#00C49F" 
                    strokeWidth={2}
                    dot={false}
                    name="outflow" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Water Level Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={filteredData.waterFlowTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis label={{ value: 'meters', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        });
                      }}
                      formatter={(value: any) => [`${value.toFixed(1)} m`, 'Water Level']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="waterLevel" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Water Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">pH Level</span>
                    <span className="font-semibold">
                      {filteredData.waterFlowTrends[filteredData.waterFlowTrends.length - 1]?.ph.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Turbidity</span>
                    <span className="font-semibold">
                      {filteredData.waterFlowTrends[filteredData.waterFlowTrends.length - 1]?.turbidity.toFixed(1)} NTU
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dissolved Oxygen</span>
                    <span className="font-semibold">
                      {filteredData.waterFlowTrends[filteredData.waterFlowTrends.length - 1]?.dissolvedOxygen.toFixed(1)} mg/L
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Seasonal Analysis */}
        <TabsContent value="seasonal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Patterns Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.seasonalPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="averageInflow" fill="#0088FE" name="Average Inflow" />
                  <Bar dataKey="averageOutflow" fill="#00C49F" name="Average Outflow" />
                  <Bar dataKey="averageRainfall" fill="#FFBB28" name="Rainfall" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Energy Generation by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.seasonalPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="energyGenerated" stroke="#FF8042" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Demand Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.seasonalPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="peakDemand" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance Schedule */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Maintenance Schedule</span>
                <Badge variant="outline">
                  {analyticsData.maintenanceSchedule.filter(m => m.status === 'pending').length} Pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.maintenanceSchedule.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.priority)}`} />
                      <div>
                        <h4 className="font-semibold">{item.component}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Scheduled: {new Date(item.scheduledDate).toLocaleDateString()} | 
                          Duration: {item.estimatedDuration}h | 
                          Cost: ₹{item.cost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.status === 'overdue' ? 'destructive' : 'outline'}>
                        {item.priority.toUpperCase()}
                      </Badge>
                      <p className={`text-sm mt-1 ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Cost Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Preventive', value: 45, color: '#0088FE' },
                        { name: 'Corrective', value: 30, color: '#00C49F' },
                        { name: 'Inspection', value: 15, color: '#FFBB28' },
                        { name: 'Calibration', value: 10, color: '#FF8042' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Annual Maintenance Cost</span>
                  <span className="font-semibold">
                    ₹{analyticsData.performanceMetrics.maintenanceCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Failure Rate</span>
                  <span className="font-semibold">
                    {analyticsData.performanceMetrics.failureRate.toFixed(2)}/1000h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Operational Hours</span>
                  <span className="font-semibold">
                    {analyticsData.performanceMetrics.totalOperationalHours.toFixed(0)}h
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {getTrendIcon(trends.maintenanceTrend)}
                    <span className="text-sm font-medium capitalize">
                      Maintenance Status: {trends.maintenanceTrend.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Efficiency Analysis */}
        <TabsContent value="efficiency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Efficiency Analysis & Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Current Efficiency</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {analyticsData.efficiency.currentEfficiency.toFixed(1)}%
                  </p>
                  <Progress value={analyticsData.efficiency.currentEfficiency} className="mt-3" />
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Optimal Efficiency</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {analyticsData.efficiency.optimalEfficiency.toFixed(1)}%
                  </p>
                  <Progress value={analyticsData.efficiency.optimalEfficiency} className="mt-3" />
                </div>
                
                <div className="text-center p-6 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Improvement Potential</h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {(analyticsData.efficiency.optimalEfficiency - analyticsData.efficiency.currentEfficiency).toFixed(1)}%
                  </p>
                  <p className="text-sm text-orange-600 mt-2">
                    ₹{analyticsData.efficiency.costSavingsPotential.toLocaleString()} potential savings
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-3">Efficiency Recommendations</h4>
                <ul className="space-y-2">
                  {analyticsData.efficiency.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start text-sm text-yellow-700">
                      <CheckCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Predictions */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI-Powered Predictive Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.predictiveInsights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{insight.type.toUpperCase()}</Badge>
                          <Badge variant={insight.impact === 'critical' ? 'destructive' : 'secondary'}>
                            {insight.impact.toUpperCase()} IMPACT
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {insight.confidence}% confidence
                          </span>
                        </div>
                        <h4 className="font-semibold">{insight.component}</h4>
                        <p className="text-sm text-gray-600 mb-2">{insight.prediction}</p>
                        <p className="text-sm text-blue-600">
                          <strong>Recommended Action:</strong> {insight.recommendedAction}
                        </p>
                        {insight.potentialSavings && (
                          <p className="text-sm text-green-600 mt-1">
                            <DollarSign className="h-3 w-3 inline mr-1" />
                            Potential Savings: ₹{insight.potentialSavings.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{insight.timeframe}</p>
                        <Progress value={insight.confidence} className="w-16 h-2 mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Recommendations */}
      {trends.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>System Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded border border-orange-200">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-orange-800">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartAnalyticsDashboard;