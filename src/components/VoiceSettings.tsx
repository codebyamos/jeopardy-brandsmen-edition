
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Volume2, Play, Square } from 'lucide-react';

interface VoiceSettingsProps {
  isVisible: boolean;
  onClose: () => void;
}

const ELEVENLABS_VOICES = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', description: 'Clear, professional female voice' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Warm, friendly female voice' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', description: 'Calm, soothing female voice' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', description: 'Energetic, clear female voice' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', description: 'Natural, conversational female voice' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', description: 'Elegant, refined female voice' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Young, vibrant female voice' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Professional male voice' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Friendly male voice' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Clear, articulate male voice' }
];

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ isVisible, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load saved settings
    const savedApiKey = localStorage.getItem('elevenlabs_api_key');
    const savedVoice = localStorage.getItem('selected_voice');
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedVoice) setSelectedVoice(savedVoice);
  }, []);

  const saveSettings = () => {
    localStorage.setItem('elevenlabs_api_key', apiKey);
    localStorage.setItem('selected_voice', selectedVoice);
    onClose();
  };

  const testVoice = async (voiceId: string) => {
    if (!apiKey) {
      alert('Please enter your ElevenLabs API key first');
      return;
    }

    if (isPlaying) {
      stopAudio();
      return;
    }

    try {
      setIsPlaying(true);
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: "Hello! This is a test of how I sound reading a Jeopardy question.",
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setCurrentAudio(audio);
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('Error testing voice:', error);
      alert('Error testing voice. Please check your API key.');
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">Voice Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="api-key" className="text-white">
              ElevenLabs API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your ElevenLabs API key"
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-sm text-gray-400 mt-1">
              Get your API key from{' '}
              <a 
                href="https://elevenlabs.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                elevenlabs.io
              </a>
            </p>
          </div>

          <div>
            <Label className="text-white mb-2 block">Select Voice</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {ELEVENLABS_VOICES.map((voice) => (
                <div 
                  key={voice.id} 
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedVoice === voice.id 
                      ? 'border-yellow-400 bg-yellow-400/10' 
                      : 'border-gray-600 bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedVoice(voice.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{voice.name}</div>
                      <div className="text-sm text-gray-400">{voice.description}</div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        testVoice(voice.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300"
                      disabled={isPlaying}
                    >
                      {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={saveSettings}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
              disabled={!selectedVoice}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSettings;
