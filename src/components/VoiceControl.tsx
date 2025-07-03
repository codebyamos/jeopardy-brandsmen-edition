
import React from 'react';
import { Button } from './ui/button';
import { VolumeX, Volume2 } from 'lucide-react';
import { useVoiceSettings } from '../hooks/useVoiceSettings';

interface VoiceControlProps {
  text: string;
  type: 'question' | 'answer';
  isSpeaking: boolean;
  currentSpeech: 'question' | 'answer' | null;
  onSpeak: (text: string, type: 'question' | 'answer') => void;
  onStop: () => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({
  text,
  type,
  isSpeaking,
  currentSpeech,
  onSpeak,
  onStop
}) => {
  const { settings } = useVoiceSettings();
  
  // Don't show any buttons if voice is disabled
  if (!settings.isVoiceEnabled) {
    return null;
  }

  // Check if THIS SPECIFIC voice control is currently playing
  const isThisVoicePlaying = isSpeaking && currentSpeech === type;
  
  console.log(`VoiceControl ${type}:`, {
    isSpeaking,
    currentSpeech,
    isThisVoicePlaying,
    type
  });

  return (
    <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
      {isThisVoicePlaying ? (
        // Show ONLY stop button when THIS voice is playing
        <Button
          id={`voice-stop-${type}`}
          onClick={onStop}
          variant="ghost"
          size="sm"
          className="text-white p-2"
          style={{backgroundColor: '#666'}}
        >
          <VolumeX className="w-6 h-6 sm:w-8 sm:h-8" />
        </Button>
      ) : (
        // Show ONLY play button when THIS voice is NOT playing
        <Button
          id={`voice-play-${type}`}
          onClick={() => onSpeak(text, type)}
          variant="ghost"
          size="sm"
          className="text-white p-2"
          style={{backgroundColor: '#fa1e4e'}}
          disabled={isSpeaking && currentSpeech !== type} // Disable if another voice is playing
        >
          <Volume2 className="w-6 h-6 sm:w-8 sm:h-8" />
        </Button>
      )}
    </div>
  );
};

export default VoiceControl;
