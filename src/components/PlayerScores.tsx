
import React, { useState } from 'react';
import { Player } from '../types/game';
import { RefreshCw } from 'lucide-react';
import { refreshPlayers } from '../services/gameService';

interface PlayerScoresProps {
  players: Player[];
  onScoreChange?: (playerId: string | number, points: number) => void;
  setPlayers?: (players: Player[]) => void;  // Add to allow updating players
}

const PlayerScores: React.FC<PlayerScoresProps> = ({ players, onScoreChange, setPlayers }) => {
  const [editingScores, setEditingScores] = useState<Record<string | number, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleInputChange = (playerId: string | number, value: string) => {
    setEditingScores(prev => ({ ...prev, [playerId]: value }));
  };

  const handleInputBlurOrEnter = (playerId: string | number) => {
    const value = editingScores[playerId];
    if (value !== undefined) {
      // Convert to number or use 0 as fallback
      const numericValue = Number(value) || 0;
      console.log('PlayerScores input confirmed:', { 
        playerId, 
        rawValue: value, 
        numericValue, 
        valueType: typeof numericValue 
      });
      
      if (onScoreChange) {
        onScoreChange(playerId, numericValue);
      }
      setEditingScores(prev => ({ ...prev, [playerId]: undefined }));
    }
  };

  // Function to refresh players from database
  const handleRefreshPlayers = async () => {
    if (!setPlayers) return;
    
    setIsRefreshing(true);
    try {
      const gameId = localStorage.getItem('currentGameId');
      if (gameId) {
        await refreshPlayers(gameId, setPlayers);
      }
    } catch (error) {
      console.error('Failed to refresh players:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div id="score-players" className="mb-4 flex flex-col items-center w-full">      
      <div className="flex flex-wrap justify-center w-full max-w-full px-2" style={{ gap: 'clamp(0.25rem, 1vw, 1rem)' }}>
        {players.map((player) => (
          <div key={player.id} className="bg-white text-black rounded-lg border-2 border-gray-200 flex-shrink-0 w-[calc(25%-0.25rem)] sm:w-[calc(20%-0.4rem)] md:w-[calc(16.666%-0.5rem)] lg:w-auto lg:flex-shrink-0 lg:min-w-[100px] lg:max-w-[125px]">
            <div className="flex items-center justify-center px-2 sm:px-3 md:px-4 lg:px-4 py-1 sm:py-2 md:py-3 lg:py-3">
              <div className="flex-1 text-center">
                {/* Name with Avatar */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 lg:gap-2 mb-1 sm:mb-2 lg:mb-2">
                  {player.avatar && (
                    <img 
                      src={player.avatar} 
                      alt={`${player.name} avatar`}
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-6 lg:h-6 rounded-full object-cover border border-gray-300 flex-shrink-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('🖼️ DISPLAY: Player score avatar failed to load for:', player.name);
                        console.error('🖼️ DISPLAY: Avatar URL was:', player.avatar ? `${player.avatar.substring(0, 50)}...` : 'null');
                        // Try reloading without cache
                        if (!target.src.includes('&refresh=')) {
                          target.src = player.avatar + '&refresh=' + Date.now();
                        } else {
                          // If still fails, hide the avatar
                          target.style.display = 'none';
                        }
                      }}
                    />
                  )}
                  <div className="font-bold text-sm sm:text-base md:text-base lg:text-lg text-gray-800">{player.name}</div>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="-?[0-9]*"
                  value={editingScores[player.id] ?? (typeof player.score === 'number' ? player.score.toString() : '0')}
                  onChange={e => handleInputChange(player.id, e.target.value)}
                  onBlur={() => handleInputBlurOrEnter(player.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleInputBlurOrEnter(player.id);
                    }
                  }}
                  className="rounded px-1 sm:px-2 py-1 font-bold text-white text-center text-sm sm:text-base md:text-base lg:text-base"
                  style={{ backgroundColor: '#2c5b69', width: 'clamp(3rem,8vw,5rem)' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayerScores;
