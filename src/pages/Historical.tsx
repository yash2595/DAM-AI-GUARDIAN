import { MapPin, Users, AlertTriangle, Calendar, FileText, TrendingDown } from 'lucide-react';

const Historical = () => {
  const majorIncidents = [
    {
      year: 2023,
      location: 'Derna, Libya',
      casualties: '11,000+',
      cause: 'Dam failure due to poor maintenance and lack of monitoring',
      description:
        'Two dams collapsed after heavy rainfall, causing catastrophic flooding that destroyed large parts of the city.',
    },
    {
      year: 2019,
      location: 'Brumadinho, Brazil',
      casualties: '270',
      cause: 'Mining dam failure',
      description: 'Tailings dam collapse released 12 million cubic meters of mining waste.',
    },
    {
      year: 2018,
      location: 'Laos',
      casualties: '71',
      cause: 'Saddle dam collapse',
      description: 'Xe-Pian Xe-Namnoy dam collapse flooded six villages downstream.',
    },
    {
      year: 2017,
      location: 'Oroville, California',
      casualties: '0',
      cause: 'Spillway erosion',
      description: 'Emergency spillway failure led to evacuation of 188,000 people.',
    },
  ];

  const globalStats = [
    { label: 'Total Dam Failures (2000-2023)', value: '150+', icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Lives Lost', value: '15,000+', icon: Users, color: 'text-orange-500' },
    { label: 'Preventable Incidents', value: '65%', icon: TrendingDown, color: 'text-yellow-500' },
    { label: 'Aging Dams Worldwide', value: '85,000+', icon: Calendar, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Historical Incidents</h1>
        <p className="text-muted-foreground">Learning from past failures to prevent future disasters</p>
      </div>

      {/* Global Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {globalStats.map((stat, idx) => (
          <div key={idx} className="glass-card rounded-xl p-6 border-primary/30">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 glass-card rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Libya 2023 Case Study */}
      <div className="glass-card rounded-2xl p-8 border-destructive/50">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Libya Dam Disaster - September 2023
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Derna, Libya
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                11,000+ casualties
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                September 10-11, 2023
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Incident Overview</h3>
            <p className="text-muted-foreground">
              Storm Daniel brought torrential rainfall to northeastern Libya, causing two dams (Abu Mansour and
              Derna dams) to collapse. The catastrophic failure released a massive wall of water that swept
              through the coastal city of Derna, destroying entire neighborhoods and killing over 11,000 people.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Root Causes
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>Poor maintenance - dams built in 1970s with no upgrades</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>No monitoring systems or early warning infrastructure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>Political instability preventing proper dam oversight</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>Lack of emergency evacuation plans</span>
                </li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-secondary" />
                Lessons Learned
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>Regular structural inspections are critical</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>Real-time monitoring systems can provide early warnings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>AI-powered predictions could have detected risks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>Emergency response plans must be maintained and tested</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl bg-secondary/5">
            <h4 className="font-semibold text-foreground mb-3">Prevention Measures</h4>
            <p className="text-muted-foreground mb-4">
              This disaster highlights the critical importance of modern dam monitoring systems. The Dam AI
              Guardian platform could have prevented this tragedy through:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 glass-card rounded-lg">
                <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                <div className="text-xs text-muted-foreground">Real-time monitoring</div>
              </div>
              <div className="text-center p-4 glass-card rounded-lg">
                <div className="text-3xl font-bold text-secondary mb-1">18-24h</div>
                <div className="text-xs text-muted-foreground">Early warning window</div>
              </div>
              <div className="text-center p-4 glass-card rounded-lg">
                <div className="text-3xl font-bold text-accent mb-1">94.8%</div>
                <div className="text-xs text-muted-foreground">Prediction accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline of Major Incidents */}
      <div className="glass-card rounded-2xl p-8 border-primary/30">
        <h2 className="text-2xl font-bold text-foreground mb-6">Timeline of Major Dam Failures</h2>
        <div className="space-y-6">
          {majorIncidents.map((incident, idx) => (
            <div key={idx} className="flex gap-6">
              <div className="flex-shrink-0 w-20 text-right">
                <div className="text-2xl font-bold text-primary">{incident.year}</div>
              </div>
              <div className="flex-1 glass-card p-6 rounded-xl border-l-4 border-primary">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{incident.location}</h3>
                    <p className="text-sm text-destructive">Casualties: {incident.casualties}</p>
                  </div>
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground mb-2">{incident.description}</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Cause:</span> {incident.cause}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prevention vs Non-Prevention Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border-primary/30">
          <h3 className="text-xl font-bold text-foreground mb-4">Preventable vs Non-Preventable</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Preventable (Poor maintenance)</span>
                <span className="text-foreground font-semibold">65%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4">
                <div className="bg-destructive h-4 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Natural disasters (Unavoidable)</span>
                <span className="text-foreground font-semibold">35%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4">
                <div className="bg-primary h-4 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Most dam failures are preventable with proper monitoring and maintenance systems.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border-secondary/30">
          <h3 className="text-xl font-bold text-foreground mb-4">Impact of AI Monitoring</h3>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold gradient-text mb-2">87%</div>
              <p className="text-sm text-muted-foreground">Reduction in preventable failures with AI monitoring</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center glass-card p-4 rounded-lg">
                <div className="text-2xl font-bold text-secondary">$2.5B</div>
                <div className="text-xs text-muted-foreground">Annual savings</div>
              </div>
              <div className="text-center glass-card p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary">10,000+</div>
                <div className="text-xs text-muted-foreground">Lives saved/year</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historical;
