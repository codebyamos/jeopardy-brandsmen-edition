
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Volume2, Play, Square } from 'lucide-react';
import { useVoiceSettings } from '../hooks/useVoiceSettings';
import { initializeSpeechSystem } from '../utils/textToSpeech';

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
  const { settings, saveSettings, isLoading } = useVoiceSettings();
  const [localApiKey, setLocalApiKey] = useState('');
  const [localSelectedVoice, setLocalSelectedVoice] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isVisible) {
      setLocalApiKey(settings.apiKey);
      setLocalSelectedVoice(settings.selectedVoice);
    }
  }, [isVisible, settings]);

  const handleSaveSettings = async () => {
    const success = await saveSettings({
      apiKey: localApiKey,
      selectedVoice: localSelectedVoice
    });
    
    if (success) {
      // Re-initialize speech system with new settings
      await initializeSpeechSystem();
      onClose();
    }
  };

  const testVoice = async (voiceId: string) => {
    if (!localApiKey) {
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
          'xi-api-key': localApiKey
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
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
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
                    localSelectedVoice === voice.id 
                      ? 'border-yellow-400 bg-yellow-400/10' 
                      : 'border-gray-600 bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => setLocalSelectedVoice(voice.id)}
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
              onClick={handleSaveSettings}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
              disabled={!localSelectedVoice || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSettings;
