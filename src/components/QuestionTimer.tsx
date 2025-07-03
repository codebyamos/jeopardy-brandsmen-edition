
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Timer, Play, Pause, Square } from 'lucide-react';
import { speakWithElevenLabs } from '../utils/textToSpeech';
import { useVoiceSettings } from '../hooks/useVoiceSettings';

interface QuestionTimerProps {
  duration: number;
  onTimeUp?: () => void;
  isVisible?: boolean;
}

const QuestionTimer: React.FC<QuestionTimerProps> = ({ duration, onTimeUp, isVisible = true }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showTimeUpAnimation, setShowTimeUpAnimation] = useState(false);
  const { settings } = useVoiceSettings();

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsFinished(false);
    setShowTimeUpAnimation(false);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onTimeUp]);

  const handleTimeUp = async () => {
    setShowTimeUpAnimation(true);
    
    // Play "Time is UP!" sound if voice is enabled
    if (settings.isVoiceEnabled) {
      try {
        await speakWithElevenLabs("Time is UP!");
      } catch (error) {
        console.error('Error playing time up sound:', error);
      }
    }
    
    // Hide animation after 3 seconds
    setTimeout(() => {
      setShowTimeUpAnimation(false);
    }, 3000);
    
    onTimeUp?.();
  };

  const startTimer = () => {
    setIsRunning(true);
    setIsFinished(false);
    setShowTimeUpAnimation(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsFinished(false);
    setShowTimeUpAnimation(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (isFinished) return 'text-red-500';
    if (timeLeft <= 10) return 'text-orange-500';
    return 'text-white';
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 border border-gray-600">
        <Timer className="w-5 h-5 text-gray-400" />
        <div className={`text-2xl font-mono font-bold ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={startTimer}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isFinished && timeLeft === 0}
            >
              <Play className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={pauseTimer}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Pause className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={resetTimer}
            size="sm"
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Time Up Animation */}
      {showTimeUpAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-bounce">
            <div className="bg-red-600 text-white text-6xl font-bold px-8 py-4 rounded-lg shadow-2xl border-4 border-red-400 animate-pulse">
              TIME'S UP!
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionTimer;
