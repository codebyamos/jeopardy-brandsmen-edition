
import React from 'react';
import { Label } from './ui/label';
import VoiceTestButton from './VoiceTestButton';
import { ELEVENLABS_VOICES } from '../constants/voiceOptions';

interface VoiceSelectionListProps {
  selectedVoice: string;
  apiKey: string;
  isPlaying: boolean;
  onVoiceSelect: (voiceId: string) => void;
  onVoiceTest: (voiceId: string) => void;
}

const VoiceSelectionList: React.FC<VoiceSelectionListProps> = ({
  selectedVoice,
  apiKey,
  isPlaying,
  onVoiceSelect,
  onVoiceTest
}) => {
  return (
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
            onClick={() => onVoiceSelect(voice.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">{voice.name}</div>
                <div className="text-sm text-gray-400">{voice.description}</div>
              </div>
              <VoiceTestButton
                voiceId={voice.id}
                apiKey={apiKey}
                isPlaying={isPlaying}
                onTest={onVoiceTest}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceSelectionList;
