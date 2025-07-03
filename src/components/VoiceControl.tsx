
import React from 'react';
import { Button } from './ui/button';
import { Volume2, VolumeX } from 'lucide-react';

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
  const isCurrentlyPlaying = isSpeaking && currentSpeech === type;

  return (
    <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
      <Button
        onClick={() => onSpeak(text, type)}
        variant="ghost"
        size="sm"
        className="text-white p-2"
        style={{backgroundColor: '#fa1e4e'}}
        disabled={isCurrentlyPlaying}
      >
        <Volume2 className="w-6 h-6 sm:w-8 sm:h-8" />
      </Button>
      {isCurrentlyPlaying && (
        <Button
          onClick={onStop}
          variant="ghost"
          size="sm"
          className="text-white p-2"
          style={{backgroundColor: '#666'}}
        >
          <VolumeX className="w-6 h-6 sm:w-8 sm:h-8" />
        </Button>
      )}
    </div>
  );
};

export default VoiceControl;
