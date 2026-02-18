import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Shield, Activity, Bell, Lock } from 'lucide-react';
import { toast } from 'sonner';
import DamLogo from '@/components/DamLogo';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      toast.success('Login successful! Welcome back.');
      navigate('/dashboard');
    } else {
      toast.error('Invalid email or password. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setIsLoading(true);
    const success = await login(demoEmail, demoPassword);
    
    if (success) {
      toast.success('Demo login successful!');
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Left side - Hero section */}
      <div className="hidden lg:flex lg:w-1/2 glass-card border-r border-primary/30 p-12 flex-col justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        
        <div className="relative z-10 space-y-8">
          <DamLogo size={140} showText={true} />
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              Protecting Lives Through
              <span className="gradient-text"> AI Innovation</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Real-time monitoring and predictive analytics for dam safety worldwide
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="glass-card p-4 rounded-xl border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-secondary" />
                <div className="text-3xl font-bold text-foreground">60K+</div>
              </div>
              <div className="text-sm text-muted-foreground">Dams Monitored</div>
            </div>
            
            <div className="glass-card p-4 rounded-xl border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-8 h-8 text-primary" />
                <div className="text-3xl font-bold text-foreground">94.8%</div>
              </div>
              <div className="text-sm text-muted-foreground">AI Accuracy</div>
            </div>
            
            <div className="glass-card p-4 rounded-xl border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-8 h-8 text-destructive" />
                <div className="text-3xl font-bold text-foreground">24/7</div>
              </div>
              <div className="text-sm text-muted-foreground">Alert System</div>
            </div>
            
            <div className="glass-card p-4 rounded-xl border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-8 h-8 text-accent" />
                <div className="text-3xl font-bold text-foreground">2.5M</div>
              </div>
              <div className="text-sm text-muted-foreground">Lives Protected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-8">
            <DamLogo size={100} showText={true} />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@dam.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-card"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="glass-card pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button type="button" className="text-sm text-primary hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">Or try demo accounts</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start glass-card glass-card-hover"
              onClick={() => handleDemoLogin('admin@dam.com', 'demo123')}
              disabled={isLoading}
            >
              <div className="text-left">
                <div className="font-medium">Admin Account</div>
                <div className="text-xs text-muted-foreground">Sachin Agarwal - Project Guide</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start glass-card glass-card-hover"
              onClick={() => handleDemoLogin('engineer@dam.com', 'demo123')}
              disabled={isLoading}
            >
              <div className="text-left">
                <div className="font-medium">Engineer Account</div>
                <div className="text-xs text-muted-foreground">Rajesh Kumar - Safety Engineer</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start glass-card glass-card-hover"
              onClick={() => handleDemoLogin('viewer@dam.com', 'demo123')}
              disabled={isLoading}
            >
              <div className="text-left">
                <div className="font-medium">Viewer Account</div>
                <div className="text-xs text-muted-foreground">Priya Sharma - Government Official</div>
              </div>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-primary hover:underline font-medium"
            >
              Sign up now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
