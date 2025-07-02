
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
    onPlayersUpdate(players.map(p => 
      p.id === playerId ? { ...p, score: p.score + points } : p
    ));
  };

  const setScore = (playerId: number, score: number) => {
    onPlayersUpdate(players.map(p => 
      p.id === playerId ? { ...p, score } : p
    ));
  };

  const resetAllScores = () => {
    onPlayersUpdate(players.map(p => ({ ...p, score: 0 })));
  };

  const handleCustomPointsChange = (playerId: number, value: string) => {
    const points = parseInt(value) || 0;
    setCustomPoints(prev => ({ ...prev, [playerId]: points }));
  };

  const applyCustomPoints = (playerId: number) => {
    const points = customPoints[playerId] || 0;
    updateScore(playerId, points);
    setCustomPoints(prev => ({ ...prev, [playerId]: 0 }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[95vh] overflow-auto shadow-2xl">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold" style={{color: '#fa1e4e'}}>Manage Scores</h3>
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
                className="text-white hover:text-red-400"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {players.map((player) => (
              <div key={player.id} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-lg sm:text-xl mb-2" style={{color: '#fa1e4e'}}>
                    {player.name}
                  </h4>
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {player.score}
                  </div>
                </div>

                {/* Quick Points */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Add</div>
                    <div className="space-y-1">
                      {[100, 200, 500].map(points => (
                        <Button
                          key={points}
                          onClick={() => updateScore(player.id, points)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white w-full text-xs"
                        >
                          +{points}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Subtract</div>
                    <div className="space-y-1">
                      {[100, 200, 500].map(points => (
                        <Button
                          key={points}
                          onClick={() => updateScore(player.id, -points)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white w-full text-xs"
                        >
                          -{points}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Set to</div>
                    <div className="space-y-1">
                      {[0, 1000, 2000].map(score => (
                        <Button
                          key={score}
                          onClick={() => setScore(player.id, score)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white w-full text-xs"
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Points */}
                <div className="border-t border-gray-600 pt-3">
                  <div className="text-xs text-gray-400 mb-2">Custom Points</div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={customPoints[player.id] || ''}
                      onChange={(e) => handleCustomPointsChange(player.id, e.target.value)}
                      placeholder="Enter points"
                      className="flex-1 bg-gray-700 text-white px-2 py-1 rounded text-sm"
                    />
                    <Button
                      onClick={() => applyCustomPoints(player.id)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
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
