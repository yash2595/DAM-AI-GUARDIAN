import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { useVoiceAlerts } from '@/hooks/useVoiceAlerts';

const VoiceControlPanel: React.FC = () => {
  const {
    isSupported,
    isListening,
    isSpeaking,
    options,
    availableVoices,
    speak,
    startListening,
    stopListening,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    announceAlert,
    updateOptions
  } = useVoiceAlerts();

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Listen for emergency alerts from other components
    const handleEmergencyAlert = () => {
      announceAlert('damFailure', 'emergency');
    };

    window.addEventListener('voice-emergency-alert', handleEmergencyAlert);
    
    return () => {
      window.removeEventListener('voice-emergency-alert', handleEmergencyAlert);
    };
  }, [announceAlert]);

  const testVoiceAlert = (type: 'low' | 'medium' | 'high' | 'emergency') => {
    const messages = {
      low: 'This is a low priority voice alert test.',
      medium: 'This is a medium priority voice alert test.',
      high: 'This is a high priority voice alert test.',
      emergency: 'EMERGENCY: This is a critical emergency alert test!'
    };
    
    speak(messages[type], type);
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <VolumeX className="h-5 w-5 text-red-500" />
            <span>Voice Alerts Not Supported</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your browser doesn't support voice alerts. Please use a modern browser like Chrome, Firefox, or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5" />
              <span>Voice Alert System</span>
              {options.enabled && <Badge variant="outline" className="bg-green-50">Active</Badge>}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Voice Alerts Enabled</label>
            <Switch
              checked={options.enabled}
              onCheckedChange={(enabled) => updateOptions({ enabled })}
            />
          </div>

          {/* Speaking Status Indicator */}
          {isSpeaking && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-green-600 animate-pulse" />
                <span className="text-sm text-green-800 font-medium">Speaking...</span>
              </div>
            </div>
          )}

          {/* Voice Commands */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={isListening ? "destructive" : "default"}
              onClick={isListening ? stopListening : startListening}
              className="w-full"
              disabled={!options.enabled}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Commands
                </>
              )}
            </Button>
            
            <Button
              variant={isSpeaking ? "destructive" : "outline"}
              onClick={isSpeaking ? stopSpeaking : () => announceAlert('testAlert', 'medium')}
              disabled={!options.enabled}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-4 w-4 mr-2" />
                  Stop Speaking
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Test Voice
                </>
              )}
            </Button>
          </div>

          {isListening && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Mic className="h-4 w-4 text-blue-600 animate-pulse" />
                <span className="text-sm text-blue-800">Listening for voice commands...</span>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Say: "emergency", "status", "stop", "test", "water level", or "pressure"
              </p>
            </div>
          )}

          {/* Quick Alert Buttons */}
          <div>
            <label className="text-sm font-medium mb-2 block">Quick Alert Tests</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testVoiceAlert('low')}
                disabled={!options.enabled}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                Low Priority
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testVoiceAlert('medium')}
                disabled={!options.enabled}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Medium Priority
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testVoiceAlert('high')}
                disabled={!options.enabled}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                High Priority
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testVoiceAlert('emergency')}
                disabled={!options.enabled}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Emergency
              </Button>
            </div>
          </div>

          {/* Pre-defined Announcements */}
          <div>
            <label className="text-sm font-medium mb-2 block">System Announcements</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => announceAlert('systemOnline', 'low')}
                disabled={!options.enabled}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                System Online
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => announceAlert('allClear', 'medium')}
                disabled={!options.enabled}
              >
                All Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => announceAlert('highWaterLevel', 'high')}
                disabled={!options.enabled}
              >
                High Water Level
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => announceAlert('emergencyResponse', 'emergency')}
                disabled={!options.enabled}
              >
                Emergency Response
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Voice Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Voice</label>
              <Select
                value={options.voice?.name || ''}
                onValueChange={(value) => {
                  const voice = availableVoices.find(v => v.name === value);
                  updateOptions({ voice: voice || null });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((voice, index) => (
                    <SelectItem key={index} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Volume Control */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Volume: {Math.round(options.volume * 100)}%
              </label>
              <Slider
                value={[options.volume]}
                onValueChange={([volume]) => updateOptions({ volume })}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Speech Rate Control */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Speech Rate: {options.rate.toFixed(1)}x
              </label>
              <Slider
                value={[options.rate]}
                onValueChange={([rate]) => updateOptions({ rate })}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Pitch Control */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Pitch: {options.pitch.toFixed(1)}
              </label>
              <Slider
                value={[options.pitch]}
                onValueChange={([pitch]) => updateOptions({ pitch })}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Language Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select
                value={options.language}
                onValueChange={(language) => updateOptions({ language })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="hi-IN">हिन्दी (Hindi)</SelectItem>
                  <SelectItem value="es-ES">Español (Spanish)</SelectItem>
                  <SelectItem value="fr-FR">Français (French)</SelectItem>
                  <SelectItem value="de-DE">Deutsch (German)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Commands Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Available Voice Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>"emergency"</span>
              <span className="text-red-600">Trigger emergency alert</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>"status"</span>
              <span className="text-blue-600">System status report</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>"water level"</span>
              <span className="text-green-600">Current water level</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>"pressure"</span>
              <span className="text-orange-600">Pressure readings</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>"stop"</span>
              <span className="text-gray-600">Silence alerts</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>"test"</span>
              <span className="text-purple-600">Test voice system</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceControlPanel;