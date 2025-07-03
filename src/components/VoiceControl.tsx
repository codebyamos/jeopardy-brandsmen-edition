
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
    console.log(`VoiceControl ${type}: Voice disabled, returning null`);
    return null;
  }

  // Check if THIS SPECIFIC voice control is currently playing
  const isThisVoicePlaying = isSpeaking && currentSpeech === type;
  
  console.log(`VoiceControl ${type} RENDER:`, {
    isSpeaking,
    currentSpeech,
    isThisVoicePlaying,
    type,
    willShowPlayButton: !isThisVoicePlaying,
    willShowStopButton: isThisVoicePlaying
  });

  return (
    <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
      {/* Play button - show ONLY when this voice is NOT playing */}
      {!isThisVoicePlaying && (
        <>
          {console.log(`Rendering PLAY button for ${type}`)}
          <Button
            id={`voice-play-${type}`}
            onClick={() => {
              console.log(`PLAY button clicked for ${type}`);
              onSpeak(text, type);
            }}
            variant="ghost"
            size="sm"
            className="text-white p-2"
            style={{backgroundColor: '#fa1e4e'}}
            disabled={isSpeaking && currentSpeech !== type} // Disable if another voice is playing
          >
            <Volume2 className="w-6 h-6 sm:w-8 sm:h-8" />
          </Button>
        </>
      )}
      
      {/* Stop button - show ONLY when this voice IS playing */}
      {isThisVoicePlaying && (
        <>
          {console.log(`Rendering STOP button for ${type}`)}
          <Button
            id={`voice-stop-${type}`}
            onClick={() => {
              console.log(`STOP button clicked for ${type}`);
              onStop();
            }}
            variant="ghost"
            size="sm"
            className="text-white p-2"
            style={{backgroundColor: '#666'}}
          >
            <VolumeX className="w-6 h-6 sm:w-8 sm:h-8" />
          </Button>
        </>
      )}
    </div>
  );
};

export default VoiceControl;
