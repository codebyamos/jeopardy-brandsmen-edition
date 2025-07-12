import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '../integrations/supabase/client';

interface GameCodeEntryProps {
  onGameLoaded: () => void;
}

const GameCodeEntry: React.FC<GameCodeEntryProps> = ({ onGameLoaded }) => {
  const [gameCode, setGameCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinGame = async () => {
    if (!gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Look up the game ID using the game code
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('id')
        .eq('game_code', gameCode.toUpperCase())
        .single();

      if (gameError || !gameData) {
        setError('Invalid game code. Please try again.');
        return;
      }

      // Store the game ID in localStorage
      localStorage.setItem('currentGameId', gameData.id);
      
      // Refresh the page to load the new game
      window.location.reload();
      onGameLoaded();
    } catch (err) {
      console.error('Error joining game:', err);
      setError('Failed to join game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white/10 rounded-lg">
      <h3 className="text-lg font-bold text-white">Join Existing Game</h3>
      <div className="flex gap-2 w-full max-w-xs">
        <Input
          placeholder="Enter game code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleJoinGame();
          }}
        />
        <Button 
          onClick={handleJoinGame} 
          disabled={isLoading}
          className="bg-[#2c5b69] hover:bg-[#1a4957]"
        >
          {isLoading ? 'Joining...' : 'Join'}
        </Button>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
};

export default GameCodeEntry;
