import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteGameData, loadRecentGamesData } from '@/services/gameService';

export const useGameManagement = (currentGameId: string | null, setCurrentGameId: (id: string | null) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const deleteGame = async (gameId: string) => {
    setIsLoading(true);
    try {
      await deleteGameData(gameId);

      // Reset current game ID if it was the deleted game
      if (currentGameId === gameId) {
        setCurrentGameId(null);
      }

      toast({
        title: "Game Deleted!",
        description: "The game has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting game:', error);
      
      toast({
        title: "Error",
        description: "Failed to delete the game. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentGames = async (limit = 10) => {
    // Don't show loading for background data loads
    try {
      console.log('Loading recent games from database...');
      const games = await loadRecentGamesData(limit);
      console.log('Games loaded successfully from database:', games?.length || 0);
      return games;
    } catch (error) {
      console.error('Error loading games from database:', error);
      
      // Only show error toast for critical failures
      toast({
        title: "Database Connection Error",
        description: "Unable to load games from database. Using local data.",
        variant: "destructive",
        duration: 3000,
      });
      return [];
    }
  };

  const resetCurrentGame = () => {
    setCurrentGameId(null);
  };

  return {
    deleteGame,
    loadRecentGames,
    resetCurrentGame,
    isLoading
  };
};