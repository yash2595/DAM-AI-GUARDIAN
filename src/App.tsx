import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { DamProvider } from "./contexts/DamContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/Overview";
import Monitoring from "./pages/Monitoring";
import Predictions from "./pages/Predictions";
import Alerts from "./pages/Alerts";
import Historical from "./pages/Historical";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import SmartAnalyticsDashboard from './components/SmartAnalyticsDashboard';
import IoTDashboard from './components/IoTDashboard';
import AdvancedFeatures from './pages/AdvancedFeatures';
import CommunityAlerts from './pages/CommunityAlerts';
import SocialMediaIntegration from './pages/SocialMediaIntegration';
import GISMapping from './pages/GISMapping';
import GovernmentIntegration from './pages/GovernmentIntegration';
import AIChatbot from './pages/AIChatbot';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <DamProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<Overview />} />
                <Route path="monitoring" element={<Monitoring />} />
                <Route path="predictions" element={<Predictions />} />
                <Route path="analytics" element={<SmartAnalyticsDashboard />} />
                <Route path="iot" element={<IoTDashboard />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="historical" element={<Historical />} />
                <Route path="advanced" element={<AdvancedFeatures />} />
                <Route path="community-alerts" element={<CommunityAlerts />} />
                <Route path="social-media" element={<SocialMediaIntegration />} />
                <Route path="gis-mapping" element={<GISMapping />} />
                <Route path="government" element={<GovernmentIntegration />} />
                <Route path="chatbot" element={<AIChatbot />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin" element={<Admin />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DamProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
