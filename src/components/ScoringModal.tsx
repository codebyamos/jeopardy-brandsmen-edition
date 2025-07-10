
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

  const getLastQuestionBonusPoints = () => {
    if (answeredQuestions.size === 0) return 0;
    const lastQuestionId = Array.from(answeredQuestions).slice(-1)[0];
    return questions.find(q => q.id === lastQuestionId)?.bonusPoints || 0;
  };

  const points = getLastQuestionPoints();
  const bonusPoints = getLastQuestionBonusPoints();

  const handleScoreClick = (playerId: number, scorePoints: number) => {
    onScorePlayer(playerId, scorePoints);
    // Don't close the modal automatically - let users continue scoring
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white border-2 rounded-lg max-w-sm w-full p-3 sm:p-4 relative" style={{ borderColor: '#2c5b69' }}>
        {/* Close button in top right corner */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 p-1 rounded-sm transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-lg sm:text-xl font-bold mb-3 text-center pr-8 text-white" style={{ backgroundColor: '#2c5b69', padding: '8px', borderRadius: '4px' }}>
          Award Points
        </h3>
        
        <div className="grid grid-cols-1 gap-2">
          {players.map((player) => (
            <div 
              key={player.id} 
              className="flex justify-between items-center bg-gray-50 rounded-lg p-2 border"
              style={{ borderColor: '#2c5b69' }}
            >
              <span className="text-sm font-medium" style={{ color: '#2c5b69' }}>
                {player.name}
              </span>
              <div className="flex gap-1 flex-wrap">
                <Button
                  onClick={() => handleScoreClick(player.id, points)}
                  size="sm"
                  className="text-white font-medium text-xs px-3 py-2 border-0 hover:opacity-90"
                  style={{ backgroundColor: '#2c5b69' }}
                >
                  +{points}
                </Button>
                <Button
                  onClick={() => handleScoreClick(player.id, -points)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-3 py-2 border-0"
                >
                  -{points}
                </Button>
                {bonusPoints > 0 && (
                  <>
                    <Button
                      onClick={() => handleScoreClick(player.id, bonusPoints)}
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-xs px-2 py-2 border-0"
                      title="Bonus Points"
                    >
                      +{bonusPoints}🎉
                    </Button>
                    <Button
                      onClick={() => handleScoreClick(player.id, -bonusPoints)}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs px-2 py-2 border-0"
                      title="Remove Bonus Points"
                    >
                      -{bonusPoints}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-3">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="text-sm font-medium text-white hover:opacity-90"
            style={{ backgroundColor: '#2c5b69', borderColor: '#2c5b69' }}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScoringModal;
