import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

// Type definitions for Speech Recognition API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface VoiceAlertOptions {
  enabled: boolean;
  language: string;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  rate: number;
  pitch: number;
}

export function useVoiceAlerts() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [options, setOptions] = useState<VoiceAlertOptions>({
    enabled: true,
    language: 'en-US',
    voice: null,
    volume: 1,
    rate: 1,
    pitch: 1
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);

  useEffect(() => {
    // Check for browser support
    const speechSupported = 'speechSynthesis' in window;
    const recognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    setIsSupported(speechSupported && recognitionSupported);

    if (speechSupported) {
      synthRef.current = window.speechSynthesis;
      
      // Load voices
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        setAvailableVoices(voices);
        
        // Set default voice (prefer English)
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en') && voice.name.includes('female')
        ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
        
        if (englishVoice) {
          setOptions(prev => ({ ...prev, voice: englishVoice }));
        }
      };

      loadVoices();
      synthRef.current.onvoiceschanged = loadVoices;
    }

    if (recognitionSupported) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = options.language;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speak = (text: string, priority: 'low' | 'medium' | 'high' | 'emergency' = 'medium') => {
    if (!isSupported || !options.enabled || !synthRef.current) {
      console.warn('Voice alerts not available');
      return;
    }

    try {
      // For emergency, cancel everything and speak immediately
      if (priority === 'emergency') {
        synthRef.current.cancel();
        utteranceQueueRef.current = [];
      }

      // Check if already speaking and not emergency
      if (synthRef.current.speaking && priority !== 'emergency') {
        console.log('Speech in progress, queueing message');
        // Queue the message
        const utterance = createUtterance(text, priority);
        utteranceQueueRef.current.push(utterance);
        return;
      }

      const utterance = createUtterance(text, priority);
      
      // Speak immediately
      synthRef.current.speak(utterance);
      setIsSpeaking(true);

    } catch (error) {
      console.error('Voice alert error:', error);
      toast.error('Voice alert failed. Please check browser settings.');
    }
  };

  const createUtterance = (text: string, priority: 'low' | 'medium' | 'high' | 'emergency') => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice options
    if (options.voice) {
      utterance.voice = options.voice;
    }
    utterance.volume = options.volume;
    utterance.rate = priority === 'emergency' ? Math.max(0.8, options.rate - 0.2) : options.rate;
    utterance.pitch = priority === 'emergency' ? Math.min(2, options.pitch + 0.2) : options.pitch;
    utterance.lang = options.language;
    
    // Add event listeners
    utterance.onstart = () => {
      console.log('Voice alert started:', text.substring(0, 50));
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('Voice alert completed');
      setIsSpeaking(false);
      
      // Process queue
      if (utteranceQueueRef.current.length > 0 && synthRef.current) {
        const nextUtterance = utteranceQueueRef.current.shift();
        if (nextUtterance) {
          setTimeout(() => {
            synthRef.current?.speak(nextUtterance);
          }, 100); // Small delay between messages
        }
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Voice alert error:', event.error);
      setIsSpeaking(false);
      
      // Handle specific errors
      if (event.error === 'interrupted') {
        console.log('Speech was interrupted, this is normal for emergency alerts');
      } else if (event.error === 'canceled') {
        console.log('Speech was canceled');
      } else {
        toast.error(`Voice alert issue: ${event.error}`, {
          description: 'The system is still operational'
        });
      }
      
      // Continue with queue even if error
      if (utteranceQueueRef.current.length > 0 && synthRef.current && event.error !== 'interrupted') {
        const nextUtterance = utteranceQueueRef.current.shift();
        if (nextUtterance) {
          setTimeout(() => {
            synthRef.current?.speak(nextUtterance);
          }, 100);
        }
      }
    };

    utterance.onpause = () => {
      console.log('Voice alert paused');
    };

    utterance.onresume = () => {
      console.log('Voice alert resumed');
    };

    return utterance;
  };

  const startListening = () => {
    if (!isSupported || !recognitionRef.current || isListening) return;

    recognitionRef.current.start();
    setIsListening(true);

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      
      // Voice commands
      if (transcript.includes('emergency') || transcript.includes('alert')) {
        handleVoiceCommand('emergency');
      } else if (transcript.includes('status')) {
        handleVoiceCommand('status');
      } else if (transcript.includes('stop') || transcript.includes('silence')) {
        handleVoiceCommand('stop');
      } else if (transcript.includes('test')) {
        handleVoiceCommand('test');
      } else if (transcript.includes('water level')) {
        handleVoiceCommand('water-level');
      } else if (transcript.includes('pressure')) {
        handleVoiceCommand('pressure');
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error('Voice recognition failed: ' + event.error);
    };
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      utteranceQueueRef.current = [];
      setIsSpeaking(false);
    }
  };

  const pauseSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.pause();
    }
  };

  const resumeSpeaking = () => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
    }
  };

  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case 'emergency':
        speak('Emergency alert activated. Notifying all authorities immediately.', 'emergency');
        // Trigger emergency alert
        window.dispatchEvent(new CustomEvent('voice-emergency-alert'));
        break;
        
      case 'status':
        speak('Dam monitoring system is operational. Water level normal, pressure within limits.', 'medium');
        break;
        
      case 'stop':
        stopSpeaking();
        speak('Voice alerts silenced.', 'low');
        break;
        
      case 'test':
        speak('Voice alert system test. This is a test message.', 'medium');
        break;
        
      case 'water-level':
        speak('Current water level is 65 percent of maximum capacity.', 'medium');
        break;
        
      case 'pressure':
        speak('Current pressure reading is 120 kilopascals, within normal range.', 'medium');
        break;
        
      default:
        speak('Command not recognized. Available commands: emergency, status, stop, test, water level, pressure.', 'low');
    }
  };

  // Pre-defined alert messages
  const alertMessages = {
    damFailure: 'CRITICAL ALERT: Dam failure imminent. Evacuate downstream areas immediately. This is not a drill.',
    highWaterLevel: 'WARNING: Water level has exceeded safe limits. Immediate action required.',
    structuralIssue: 'ALERT: Structural integrity compromised. Emergency inspection needed.',
    seepageDetected: 'WARNING: Abnormal seepage detected. Monitor closely.',
    systemOnline: 'Dam monitoring system is now online and operational.',
    systemOffline: 'ATTENTION: Monitoring system offline. Manual inspection required.',
    testAlert: 'This is a test of the emergency voice alert system. Dam monitoring is operational.',
    emergencyResponse: 'Emergency response team has been notified. Estimated arrival time: 15 minutes.',
    allClear: 'All clear. Dam conditions have returned to normal parameters.'
  };

  const announceAlert = (alertType: keyof typeof alertMessages, priority: 'low' | 'medium' | 'high' | 'emergency' = 'medium') => {
    const message = alertMessages[alertType];
    if (message) {
      speak(message, priority);
    }
  };

  const updateOptions = (newOptions: Partial<VoiceAlertOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  };

  return {
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
    updateOptions,
    alertMessages
  };
}