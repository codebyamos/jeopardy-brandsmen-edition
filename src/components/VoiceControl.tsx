
import React from 'react';
import { Button } from './ui/button';
import { VolumeX } from 'lucide-react';

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
      {!isSpeaking && (
        <Button
          onClick={() => onSpeak(text, type)}
          variant="ghost"
          size="sm"
          className="text-white p-2"
          style={{backgroundColor: '#fa1e4e'}}
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </Button>
      )}
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
