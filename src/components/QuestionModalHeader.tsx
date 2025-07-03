
import React from 'react';
import { Button } from './ui/button';
import { Timer, X } from 'lucide-react';

interface QuestionModalHeaderProps {
  category: string;
  points: number;
  isTimerEnabled: boolean;
  showTimerToggle?: boolean;
  onClose: () => void;
  onTimerToggle: () => void;
}

const QuestionModalHeader: React.FC<QuestionModalHeaderProps> = ({
  category,
  points,
  isTimerEnabled,
  showTimerToggle = true,
  onClose,
  onTimerToggle
}) => {
  return (
    <>
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-red-400 p-2 z-10"
        style={{backgroundColor: '#2c5b69', color: 'white'}}
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
      
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2" style={{color: '#2c5b69'}}>
          {category.toUpperCase()}
        </div>
        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{color: '#2c5b69'}}>
          ${points}
        </div>
      </div>

      {showTimerToggle && (
        <div className="mb-6 flex justify-center items-center gap-4">
          <Button
            onClick={onTimerToggle}
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${isTimerEnabled ? 'text-blue-400' : 'text-gray-400'}`}
          >
            <Timer className="w-4 h-4" />
            Timer {isTimerEnabled ? 'ON' : 'OFF'}
          </Button>
        </div>
      )}
    </>
  );
};

export default QuestionModalHeader;
