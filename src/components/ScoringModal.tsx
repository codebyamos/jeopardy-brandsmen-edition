
import React, { useState } from 'react';
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
  const [customPoints, setCustomPoints] = useState<{ [playerId: number]: string }>({});

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

  const handleCustomPointsChange = (playerId: number, value: string) => {
    // Only allow numbers and negative sign
    if (value === '' || /^-?\d+$/.test(value)) {
      setCustomPoints(prev => ({ ...prev, [playerId]: value }));
    }
  };

  const handleCustomPointsSubmit = (playerId: number) => {
    const pointsValue = customPoints[playerId];
    if (pointsValue && pointsValue !== '') {
      const numPoints = parseInt(pointsValue, 10);
      if (!isNaN(numPoints)) {
        handleScoreClick(playerId, numPoints);
        setCustomPoints(prev => ({ ...prev, [playerId]: '' }));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white border-2 rounded-lg max-w-md w-full p-3 sm:p-4 relative" style={{ borderColor: '#2c5b69' }}>
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
        
        <div className="grid grid-cols-1 gap-3">
          {players.map((player) => (
            <div 
              key={player.id} 
              className="bg-gray-50 rounded-lg p-3 border"
              style={{ borderColor: '#2c5b69' }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium" style={{ color: '#2c5b69' }}>
                  {player.name}
                </span>
                <span className="text-sm font-bold text-gray-600">
                  Current: {player.score} pts
                </span>
              </div>
              
              {/* Quick action buttons */}
              <div className="flex gap-1 flex-wrap mb-2">
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

              {/* Custom points input */}
              <div className="flex gap-1 items-center">
                <input
                  type="text"
                  placeholder="Custom points"
                  value={customPoints[player.id] || ''}
                  onChange={(e) => handleCustomPointsChange(player.id, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomPointsSubmit(player.id);
                    }
                  }}
                  className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-400"
                  style={{ borderColor: '#2c5b69' }}
                />
                <Button
                  onClick={() => handleCustomPointsSubmit(player.id)}
                  size="sm"
                  className="text-white font-medium text-xs px-2 py-1 border-0 hover:opacity-90"
                  style={{ backgroundColor: '#2c5b69' }}
                  disabled={!customPoints[player.id] || customPoints[player.id] === ''}
                >
                  Add
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
