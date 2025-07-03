
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useVoiceSettings } from '../hooks/useVoiceSettings';
import { useVoiceTest } from '../hooks/useVoiceTest';
import { initializeSpeechSystem } from '../utils/textToSpeech';
import VoiceSelectionList from './VoiceSelectionList';

interface VoiceSettingsProps {
  isVisible: boolean;
  onClose: () => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ isVisible, onClose }) => {
  const { settings, saveSettings, isLoading } = useVoiceSettings();
  const { isPlaying, testVoice } = useVoiceTest();
  
  const [localApiKey, setLocalApiKey] = useState('');
  const [localSelectedVoice, setLocalSelectedVoice] = useState('');
  const [localVoiceEnabled, setLocalVoiceEnabled] = useState(true);

  useEffect(() => {
    if (isVisible) {
      setLocalApiKey(settings.apiKey);
      setLocalSelectedVoice(settings.selectedVoice);
      setLocalVoiceEnabled(settings.isVoiceEnabled);
    }
  }, [isVisible, settings]);

  const handleSaveSettings = async () => {
    const success = await saveSettings({
      apiKey: localApiKey,
      selectedVoice: localSelectedVoice,
      isVoiceEnabled: localVoiceEnabled
    });
    
    if (success) {
      await initializeSpeechSystem();
      onClose();
    }
  };

  const handleVoiceTest = (voiceId: string) => {
    testVoice(voiceId, localApiKey);
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">Voice Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="voice-enabled" className="text-white">
              Enable Voice Features
            </Label>
            <Switch
              id="voice-enabled"
              checked={localVoiceEnabled}
              onCheckedChange={setLocalVoiceEnabled}
            />
          </div>

          {localVoiceEnabled && (
            <>
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

              <VoiceSelectionList
                selectedVoice={localSelectedVoice}
                apiKey={localApiKey}
                isPlaying={isPlaying}
                onVoiceSelect={setLocalSelectedVoice}
                onVoiceTest={handleVoiceTest}
              />
            </>
          )}

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
              disabled={isLoading}
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
