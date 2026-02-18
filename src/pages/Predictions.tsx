import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { Brain, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const Predictions = () => {
  const riskData = [
    { name: 'Low Risk', value: 65, color: 'hsl(158 100% 50%)' },
    { name: 'Medium Risk', value: 25, color: 'hsl(45 100% 50%)' },
    { name: 'High Risk', value: 8, color: 'hsl(25 100% 50%)' },
    { name: 'Critical', value: 2, color: 'hsl(0 84% 60%)' },
  ];

  const factorsData = [
    { factor: 'Water Level', impact: 85 },
    { factor: 'Vibration', impact: 72 },
    { factor: 'Age', impact: 68 },
    { factor: 'Seismic', impact: 55 },
    { factor: 'Rainfall', impact: 48 },
    { factor: 'Maintenance', impact: 42 },
  ];

  const predictionTimeline = [
    { hour: '0h', risk: 12 },
    { hour: '6h', risk: 15 },
    { hour: '12h', risk: 18 },
    { hour: '18h', risk: 22 },
    { hour: '24h', risk: 20 },
  ];

  const accuracyData = [
    { month: 'Jan', accuracy: 92 },
    { month: 'Feb', accuracy: 93 },
    { month: 'Mar', accuracy: 91 },
    { month: 'Apr', accuracy: 94 },
    { month: 'May', accuracy: 95 },
    { month: 'Jun', accuracy: 94.8 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">AI Predictions</h1>
        <p className="text-muted-foreground">Machine learning powered risk assessment and forecasting</p>
      </div>

      {/* Model Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 border-primary/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">SVM Model</h3>
              <p className="text-xs text-muted-foreground">Anomaly Detection</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="text-foreground font-semibold">92.5%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '92.5%' }} />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-secondary/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Random Forest</h3>
              <p className="text-xs text-muted-foreground">Risk Classification</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="text-foreground font-semibold">94.8%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-secondary h-2 rounded-full" style={{ width: '94.8%' }} />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-accent/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Neural Network</h3>
              <p className="text-xs text-muted-foreground">Time Series Forecast</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="text-foreground font-semibold">89.3%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-accent h-2 rounded-full" style={{ width: '89.3%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="glass-card rounded-2xl p-6 border-primary/30">
          <h3 className="text-xl font-bold text-foreground mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => {
                  const percent = entry.percent || 0;
                  return `${entry.name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Contributing Factors */}
        <div className="glass-card rounded-2xl p-6 border-primary/30">
          <h3 className="text-xl font-bold text-foreground mb-4">Contributing Factors</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={factorsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.6)" />
              <YAxis dataKey="factor" type="category" stroke="rgba(255,255,255,0.6)" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(217 33% 10%)',
                  border: '1px solid hsl(180 100% 50%)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="impact" fill="hsl(180 100% 50%)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prediction Timeline */}
      <div className="glass-card rounded-2xl p-6 border-primary/30">
        <h3 className="text-xl font-bold text-foreground mb-4">18-24 Hour Risk Prediction</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={predictionTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(217 33% 10%)',
                border: '1px solid hsl(180 100% 50%)',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="risk"
              stroke="hsl(270 80% 65%)"
              strokeWidth={3}
              dot={{ fill: 'hsl(180 100% 50%)', r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current Assessment */}
      <div className="glass-card rounded-2xl p-6 border-secondary/30">
        <h3 className="text-xl font-bold text-foreground mb-4">Current Risk Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary">LOW</div>
                <div className="text-sm text-muted-foreground">Risk Level</div>
              </div>
            </div>
            <p className="text-muted-foreground">
              All monitored parameters are within normal ranges. No immediate action required.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Recommended Actions</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Continue routine monitoring</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Schedule quarterly maintenance check</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Update sensor calibration in 30 days</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Model Accuracy History */}
      <div className="glass-card rounded-2xl p-6 border-primary/30">
        <h3 className="text-xl font-bold text-foreground mb-4">Model Accuracy (6 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={accuracyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" domain={[85, 100] as const} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(217 33% 10%)',
                border: '1px solid hsl(180 100% 50%)',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="hsl(158 100% 50%)"
              strokeWidth={3}
              dot={{ fill: 'hsl(180 100% 50%)', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Predictions;
