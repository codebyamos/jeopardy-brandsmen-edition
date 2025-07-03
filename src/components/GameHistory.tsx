
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Calendar, Trophy, User, Trash2 } from 'lucide-react';
import { useGameData } from '../hooks/useGameData';

interface GameHistoryProps {
  isVisible: boolean;
  onClose: () => void;
}

interface SavedGame {
  id: string;
  game_date: string;
  created_at: string;
  game_players: Array<{
    id: string;
    player_name: string;
    player_score: number;
    avatar_url: string | null;
  }>;
}

const GameHistory: React.FC<GameHistoryProps> = ({ isVisible, onClose }) => {
  const [games, setGames] = useState<SavedGame[]>([]);
  const { loadRecentGames, deleteGame, isLoading } = useGameData();

  useEffect(() => {
    if (isVisible) {
      loadGames();
    }
  }, [isVisible]);

  const loadGames = async () => {
    try {
      const recentGames = await loadRecentGames(20);
      setGames(recentGames);
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteGame(gameId);
        await loadGames(); // Reload the games list
      } catch (error) {
        console.error('Failed to delete game:', error);
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

  const getWinner = (players: SavedGame['game_players']) => {
    if (players.length === 0) return null;
    return players.reduce((winner, player) => 
      player.player_score > winner.player_score ? player : winner
    );
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white border-2 rounded-lg w-full max-w-6xl max-h-[95vh] overflow-auto shadow-2xl" style={{ borderColor: '#2c5b69' }}>
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#2c5b69' }}>
              Game History
            </h3>
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

          {isLoading ? (
            <div className="text-center py-8">
              <div style={{ color: '#2c5b69' }}>Loading games...</div>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600">No games saved yet</div>
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((game) => {
                const winner = getWinner(game.game_players);
                return (
                  <div key={game.id} className="bg-gray-50 border-2 rounded-lg p-4" style={{ borderColor: '#2c5b69' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-0">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="font-medium" style={{ color: '#2c5b69' }}>
                          {formatDate(game.game_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        {winner && (
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="text-yellow-600 font-medium">
                              Winner: {winner.player_name} ({winner.player_score} pts)
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
                      {game.game_players
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
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-bold" style={{ color: '#2c5b69' }}>
                              {player.player_score}
                            </span>
                            <span className="text-gray-600 text-sm ml-1">pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameHistory;
