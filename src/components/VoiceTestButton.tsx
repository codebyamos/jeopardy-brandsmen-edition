
import React from 'react';
import { Button } from './ui/button';
import { Play, Square } from 'lucide-react';

interface VoiceTestButtonProps {
  voiceId: string;
  apiKey: string;
  isPlaying: boolean;
  onTest: (voiceId: string) => void;
}

const VoiceTestButton: React.FC<VoiceTestButtonProps> = ({
  voiceId,
  apiKey,
  isPlaying,
  onTest
}) => {
  const handleTest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!apiKey) {
      alert('Please enter your ElevenLabs API key first');
      return;
    }
    onTest(voiceId);
  };

  return (
    <Button
      onClick={handleTest}
      variant="ghost"
      size="sm"
      className="text-blue-400 hover:text-blue-300"
      disabled={isPlaying}
    >
      {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
    </Button>
  );
};

export default VoiceTestButton;
