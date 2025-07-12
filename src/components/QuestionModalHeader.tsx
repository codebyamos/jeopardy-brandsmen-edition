
import React from 'react';
import { Button } from './ui/button';
import { X, Timer, TimerOff } from 'lucide-react';
import { Switch } from './ui/switch';

interface QuestionModalHeaderProps {
  isAnswerModal?: boolean;
  isAnswered?: boolean;
  onToggleAnswered?: (checked: boolean) => void;
  category: string;
  points: number;
  bonusPoints?: number;
  isTimerEnabled: boolean;
  showTimerToggle: boolean;
  onClose: () => void;
  onTimerToggle: () => void;
}

const QuestionModalHeader: React.FC<QuestionModalHeaderProps> = ({
  category,
  points,
  bonusPoints,
  isTimerEnabled,
  showTimerToggle,
  onClose,
  onTimerToggle,
  isAnswerModal,
  isAnswered,
  onToggleAnswered
}) => {
  React.useEffect(() => {
    if (isAnswerModal) {
      console.log('[QuestionModalHeader] Switch checked value:', isAnswered);
    }
  }, [isAnswered, isAnswerModal]);
  React.useEffect(() => {
    if (isAnswerModal) {
      console.log('[QuestionModalHeader] Switch checked value:', isAnswered);
    }
  }, [isAnswered, isAnswerModal]);
  return (
    <div className="flex justify-between items-center mb-4 sm:mb-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#2c5b69' }}>
          {category}
        </h2>
        <div className="flex items-center gap-2">
          <p className="text-base sm:text-lg font-semibold" style={{ color: '#0f766e' }}>
            ${points}
          </p>
          {bonusPoints && bonusPoints > 0 && (
            <span className="bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-sm font-bold">
              +{bonusPoints} Bonus!
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2 items-center">
        {showTimerToggle && (
          <Button
            onClick={onTimerToggle}
            variant="outline"
            size="sm"
            className="border-2 hover:opacity-80"
            style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
          >
            {isTimerEnabled ? <TimerOff className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
          </Button>
        )}
        {isAnswerModal && (
          <div className="flex items-center gap-2">
            <Switch
              checked={!!isAnswered}
              onCheckedChange={onToggleAnswered}
            />
            <span className="text-xs font-medium" style={{ color: '#2c5b69' }}>
              {isAnswered ? 'Mark as Played' : 'Mark as Unplayed'}
            </span>
          </div>
        )}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-white hover:text-red-400"
          style={{ backgroundColor: '#2c5b69' }}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionModalHeader;
