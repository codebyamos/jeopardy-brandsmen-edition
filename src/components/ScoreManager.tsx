
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Plus, Minus, RotateCcw, X } from 'lucide-react';
import { Player } from '../types/game';

interface ScoreManagerProps {
  players: Player[];
  onPlayersUpdate: (players: Player[]) => void;
  isVisible: boolean;
  onClose: () => void;
}

const ScoreManager: React.FC<ScoreManagerProps> = ({ 
  players, 
  onPlayersUpdate, 
  isVisible, 
  onClose 
}) => {
  const [customPoints, setCustomPoints] = useState<{ [key: number]: number }>({});

  const updateScore = (playerId: number, points: number) => {
    console.log('ScoreManager updating score:', { playerId, points, pointsType: typeof points });
    
    // Ensure both values are numbers
    const numericPoints = Number(points) || 0;
    
    onPlayersUpdate(players.map(p => {
      if (p.id === playerId) {
        const currentScore = Number(p.score) || 0;
        const newScore = currentScore + numericPoints;
        console.log('ScoreManager score calculation:', { 
          currentScore, 
          numericPoints, 
          newScore 
        });
        return { ...p, score: newScore };
      }
      return p;
    }));
  };

  const setScore = (playerId: number, score: number) => {
    console.log('ScoreManager setting score:', { playerId, score, scoreType: typeof score });
    
    // Ensure we're setting a number
    const numericScore = Number(score) || 0;
    
    onPlayersUpdate(players.map(p => 
      p.id === playerId ? { ...p, score: numericScore } : p
    ));
  };

  const resetAllScores = () => {
    onPlayersUpdate(players.map(p => ({ ...p, score: 0 })));
  };

  const handleCustomPointsChange = (playerId: number, value: string) => {
    // Use Number instead of parseInt to handle decimal values if needed
    const points = Number(value) || 0;
    console.log('Custom points changed:', { playerId, rawValue: value, parsedPoints: points });
    setCustomPoints(prev => ({ ...prev, [playerId]: points }));
  };

  const applyCustomPoints = (playerId: number) => {
    const points = customPoints[playerId] || 0;
    console.log('Applying custom points:', { playerId, points, pointsType: typeof points });
    updateScore(playerId, points);
    setCustomPoints(prev => ({ ...prev, [playerId]: 0 }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white border-2 rounded-lg w-full max-w-4xl max-h-[95vh] overflow-auto shadow-2xl" style={{ borderColor: '#2c5b69' }}>
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold" style={{color: '#2c5b69'}}>Manage Scores</h3>
            <div className="flex gap-2">
              <Button
                onClick={resetAllScores}
                className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset All
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:opacity-90"
                style={{ backgroundColor: '#2c5b69' }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {players.map((player) => (
              <div key={player.id} className="border-2 rounded-lg p-2" style={{ backgroundColor: '#f8f9fa', borderColor: '#2c5b69', minWidth: '0' }}>
                <div className="text-center mb-2">
                  <h4 className="font-semibold text-base sm:text-lg mb-1" style={{color: '#2c5b69'}}>
                    {player.name}
                  </h4>
                  <div className="text-xl sm:text-2xl font-bold text-white mb-2 p-1 rounded" style={{ backgroundColor: '#2c5b69' }}>
                    {player.score}
                  </div>
                </div>

                <div className="border-t pt-3" style={{ borderColor: '#2c5b69' }}>
                  <div className="flex flex-col gap-2 items-center">
                    <input
                      type="number"
                      value={customPoints[player.id] || ''}
                      onChange={(e) => handleCustomPointsChange(player.id, e.target.value)}
                      placeholder="Enter points"
                      className="w-full bg-white px-2 py-1 rounded text-sm border-2"
                      style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                    />
                    <Button
                      onClick={() => applyCustomPoints(player.id)}
                      size="sm"
                      className="text-white hover:opacity-90 w-full"
                      style={{ backgroundColor: '#2c5b69' }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreManager;
