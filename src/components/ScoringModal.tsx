
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
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-sm w-full p-3 sm:p-4">
        <h3 className="text-yellow-400 text-lg sm:text-xl font-bold mb-3 text-center" style={{color: '#fa1e4e'}}>
          Award Points
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {players.map((player) => (
            <div key={player.id} className="flex justify-between items-center bg-gray-800 rounded-lg p-2">
              <span className="text-white text-sm font-medium">{player.name}</span>
              <div className="flex gap-1">
                <Button
                  onClick={() => onScorePlayer(player.id, points)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                >
                  +{points}
                </Button>
                <Button
                  onClick={() => onScorePlayer(player.id, -points)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1"
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
            className="text-white border-gray-600 hover:bg-gray-800 text-sm"
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScoringModal;
