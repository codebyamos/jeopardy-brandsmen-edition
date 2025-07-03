
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Timer, Play, Pause, Square } from 'lucide-react';

interface QuestionTimerProps {
  duration: number;
  onTimeUp?: () => void;
}

const QuestionTimer: React.FC<QuestionTimerProps> = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onTimeUp]);

  const startTimer = () => {
    setIsRunning(true);
    setIsFinished(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsFinished(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (isFinished) return 'text-red-500';
    if (timeLeft <= 10) return 'text-yellow-500';
    return 'text-white';
  };

  return (
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
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
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
  );
};

export default QuestionTimer;
