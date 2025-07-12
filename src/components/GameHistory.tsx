import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Calendar, Trophy, User, Trash2 } from 'lucide-react';
import { loadGameHistory, deleteGameHistory } from '../services/gameService';

interface GameHistoryProps {
  isVisible: boolean;
  onClose: () => void;
}

interface GameHistoryPlayer {
  id: string;
  player_name: string;
  player_score: number;
  avatar_url: string | null;
}

interface GameHistoryRecord {
  id: string;
  game_date: string;
  created_at: string;
  winner_name: string;
  winner_score: number;
  unique_game_id?: string;
  game_history_players: GameHistoryPlayer[];
}

const GameHistory: React.FC<GameHistoryProps> = ({ isVisible, onClose }) => {
  const [games, setGames] = useState<GameHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadGames();
    }
  }, [isVisible]);

  const loadGames = async () => {
    setIsLoading(true);
    try {
      console.log('GameHistory: Loading game history records...');
      const historyRecords = await loadGameHistory(20);
      console.log('GameHistory: Loaded history records:', historyRecords);
      
      // Check if we have valid records with the expected structure
      if (historyRecords && historyRecords.length > 0) {
        console.log('GameHistory: First record:', historyRecords[0]);
        if (historyRecords[0].game_history_players) {
          console.log('GameHistory: First record has players:', historyRecords[0].game_history_players);
        } else {
          console.warn('GameHistory: Missing game_history_players field in first record!');
          // Try to recover by adding an empty array if the field is missing
          historyRecords.forEach(record => {
            if (!record.game_history_players) {
              console.warn(`GameHistory: Adding empty players array to record ${record.id}`);
              record.game_history_players = [];
            }
          });
        }
        
        // Confirm that we have unique game IDs to ensure no duplicate filtering
        const gameIds = historyRecords.map(game => game.id);
        const uniqueGameIds = [...new Set(gameIds)];
        console.log(`GameHistory: Found ${gameIds.length} games with ${uniqueGameIds.length} unique IDs`);
        
        if (gameIds.length !== uniqueGameIds.length) {
          console.warn('GameHistory: Duplicate game IDs detected, this should not happen!');
        }
        
        // Log out game dates and winners for debugging
        console.log('GameHistory: Games summary:', historyRecords.map(game => ({
          id: game.id,
          date: game.game_date,
          winner: game.winner_name,
          playerCount: game.game_history_players?.length || 0
        })));
      } else {
        console.log('GameHistory: No history records found or empty array returned');
      }
      
      setGames(historyRecords || []);
    } catch (error) {
      console.error('GameHistory: Failed to load game history:', error);
      if (error instanceof Error) {
        console.error('GameHistory: Error details:', error.message);
      }
      // Show the error message in the UI by setting an empty array
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (window.confirm('Are you sure you want to delete this game history record?')) {
      try {
        await deleteGameHistory(gameId);
        await loadGames(); // Reload the games list
      } catch (error) {
        console.error('Failed to delete game history:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white border-2 rounded-lg w-full max-w-6xl max-h-[95vh] overflow-auto shadow-2xl" style={{ borderColor: '#2c5b69' }}>
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#2c5b69' }}>
              Game History <span className="text-sm text-gray-500">({games.length} games)</span>
            </h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:opacity-90"
              style={{ backgroundColor: '#2c5b69' }}
            >
              <X className="w-5 h-5" />
            </Button>          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div style={{ color: '#2c5b69' }}>Loading games...</div>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600">No games saved yet</div>
              <div className="text-sm text-gray-500 mt-2">
                Try playing a game and clicking "Start New Game" to save game history
              </div>
              <pre className="text-xs mt-4">
                Debug info: {JSON.stringify({ gamesArray: games }, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <div key={game.id} className="bg-gray-50 border-2 rounded-lg p-4" style={{ borderColor: '#2c5b69' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="flex flex-col gap-1 mb-2 sm:mb-0">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="font-medium" style={{ color: '#2c5b69' }}>
                          {formatDate(game.game_date)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {game.winner_name && (
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-600 font-medium">
                            Winner: {game.winner_name} ({game.winner_score} pts)
                          </span>
                        </div>
                      )}
                      <Button
                        onClick={() => handleDeleteGame(game.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {game.game_history_players && game.game_history_players.length > 0 ? (
                      game.game_history_players
                        .sort((a, b) => b.player_score - a.player_score)
                        .map((player) => (
                          <div key={player.id} className="bg-white rounded-lg p-3 border" style={{ borderColor: '#2c5b69' }}>
                            <div className="flex items-center gap-2 mb-2">
                              {player.avatar_url ? (
                                <img 
                                  src={player.avatar_url} 
                                  alt={`${player.player_name} avatar`}
                                  className="w-6 h-6 rounded-full object-cover border"
                                  style={{ borderColor: '#2c5b69' }}
                                />
                              ) : (
                                <User className="w-6 h-6 text-gray-600" />
                              )}
                              <span className="font-medium text-sm" style={{ color: '#2c5b69' }}>
                                {player.player_name}
                              </span>
                            </div>                        <div className="text-center">
                          <span className="text-lg font-bold" style={{ color: '#2c5b69' }}>
                            {Number(player.player_score) || 0}
                          </span>
                          <span className="text-gray-600 text-sm ml-1">pts</span>
                        </div>
                          </div>
                        ))
                    ) : (
                      <div className="col-span-full text-center py-3 bg-gray-100 rounded-lg">
                        <div className="text-sm text-gray-500">No player data available for this game</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameHistory;
