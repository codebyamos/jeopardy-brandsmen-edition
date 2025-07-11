import { useState } from 'react';
import { Player, Question, CategoryDescription } from '@/types/game';
import { useToast } from '@/hooks/use-toast';
import { cleanupUnusedMedia } from '@/utils/mediaCleanup';
import { 
  createOrFindGame, 
  saveGamePlayers, 
  saveGameQuestions, 
  saveGameCategories,
  deleteGameData,
  loadRecentGamesData
} from '@/services/gameService';

export const useGameData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const { toast } = useToast();

  const saveGame = async (
    players: Player[], 
    questions?: Question[], 
    answeredQuestions?: number[], 
    categoryDescriptions?: CategoryDescription[],
    gameDate?: string, 
    isManual: boolean = false
  ) => {
    // Only set loading for manual saves to show user feedback
    if (isManual) {
      setIsLoading(true);
    }
    
    try {
      const today = gameDate || new Date().toISOString().split('T')[0];

      console.log('=== SAVING TO DATABASE ===');
      console.log('Players:', players?.length || 0);
      console.log('Questions:', questions?.length || 0);
      console.log('Category descriptions:', categoryDescriptions?.length || 0);
      console.log('Current game ID:', currentGameId);
      console.log('Game date:', today);
      console.log('Is manual save:', isManual);

      const gameId = await createOrFindGame(today, currentGameId);
      setCurrentGameId(gameId);

      // Clean up unused media files when starting a new game
      if (questions && questions.length > 0 && !currentGameId) {
        await cleanupUnusedMedia(questions);
      }

      // Always save players to database
      await saveGamePlayers(gameId, players);
      console.log('✅ Players saved to database');

      // Save questions and answered questions if provided
      if (questions && questions.length > 0) {
        await saveGameQuestions(gameId, questions, answeredQuestions);
        console.log('✅ Questions saved to database');
      }

      // Save category descriptions if provided
      if (categoryDescriptions && categoryDescriptions.length > 0) {
        await saveGameCategories(gameId, categoryDescriptions);
        console.log('✅ Category descriptions saved to database');
      }

      console.log('=== DATABASE SAVE COMPLETED SUCCESSFULLY ===');
      
      // Only show toast for manual saves - no notifications for automatic saves
      if (isManual) {
        toast({
          title: "Game Saved!",
          description: "Your game has been successfully saved to the database.",
        });
      }

      return gameId;
    } catch (error) {
      console.error('=== DATABASE SAVE FAILED ===');
      console.error('Error details:', error);
      
      // Only show error toasts for manual saves or critical errors
      if (isManual) {
        let errorMessage = "Failed to save to database";
        
        if (error instanceof Error) {
          if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('connection')) {
            errorMessage = "Network connection error. Please check your internet connection and try again.";
          } else if (error.message.includes('offline')) {
            errorMessage = "You appear to be offline. Please check your internet connection.";
          } else {
            errorMessage = `Database save failed: ${error.message}`;
          }
        }
        
        toast({
          title: "Save Error",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
      }
      
      throw error;
    } finally {
      if (isManual) {
        setIsLoading(false);
      }
    }
  };

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
    saveGame,
    deleteGame,
    loadRecentGames,
    resetCurrentGame,
    currentGameId,
    isLoading,
    cleanupUnusedMedia
  };
};
