
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
      <DialogContent className="bg-white border-2 text-gray-800 max-w-2xl" style={{ borderColor: '#2c5b69' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#2c5b69' }}>Voice Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="voice-enabled" style={{ color: '#2c5b69' }}>
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
                <Label htmlFor="api-key" style={{ color: '#2c5b69' }}>
                  ElevenLabs API Key
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="Enter your ElevenLabs API key"
                  className="bg-white border-2 text-gray-800"
                  style={{ borderColor: '#2c5b69' }}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Get your API key from{' '}
                  <a 
                    href="https://elevenlabs.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: '#2c5b69' }}
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
              className="text-white hover:opacity-90"
              style={{ backgroundColor: '#2c5b69', borderColor: '#2c5b69' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="text-white hover:opacity-90"
              style={{ backgroundColor: '#2c5b69' }}
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
