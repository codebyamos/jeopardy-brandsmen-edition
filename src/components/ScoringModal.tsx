
import React from 'react';
import { Button } from './ui/button';
import { Player, Question } from '../types/game';

interface ScoringModalProps {
  players: Player[];
  answeredQuestions: Set<number>;
  questions: Question[];
  onScorePlayer: (playerId: number, points: number) => void;
  onClose: () => void;
}

const ScoringModal: React.FC<ScoringModalProps> = ({
  players,
  answeredQuestions,
  questions,
  onScorePlayer,
  onClose
}) => {
  const getLastQuestionPoints = () => {
    if (answeredQuestions.size === 0) return 0;
    const lastQuestionId = Array.from(answeredQuestions).slice(-1)[0];
    return questions.find(q => q.id === lastQuestionId)?.points || 0;
  };

  const points = getLastQuestionPoints();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-lg max-w-sm w-full p-3 sm:p-4 relative">
        {/* Close button in top right corner */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-400 p-1 rounded-sm transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-lg sm:text-xl font-bold mb-3 text-center pr-8 text-yellow-400">
          Award Points
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {players.map((player) => (
            <div 
              key={player.id} 
              className="flex justify-between items-center bg-gray-700 rounded-lg p-2"
            >
              <span className="text-sm font-medium text-white">
                {player.name}
              </span>
              <div className="flex gap-1">
                <Button
                  onClick={() => onScorePlayer(player.id, points)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs px-3 py-2 border-0"
                >
                  +{points}
                </Button>
                <Button
                  onClick={() => onScorePlayer(player.id, -points)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-3 py-2 border-0"
                >
                  -{points}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-3">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="text-sm font-medium border-gray-500 text-gray-300 hover:bg-gray-700"
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScoringModal;
