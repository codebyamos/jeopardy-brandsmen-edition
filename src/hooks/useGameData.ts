
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
    // Don't set loading for auto-saves to avoid blocking the UI
    if (isManual) {
      setIsLoading(true);
    }
    
    try {
      const today = gameDate || new Date().toISOString().split('T')[0];

      console.log('=== SAVING GAME ===');
      console.log('Players:', players?.length || 0);
      console.log('Questions:', questions?.length || 0);
      console.log('Category descriptions:', categoryDescriptions?.length || 0);
      console.log('Current game ID:', currentGameId);
      console.log('Game date:', today);
      console.log('Is manual save:', isManual);

      const gameId = await createOrFindGame(today, currentGameId);
      setCurrentGameId(gameId);
      console.log('Using game ID:', gameId);

      // Clean up unused media files when starting a new game
      if (questions && questions.length > 0 && !currentGameId) {
        await cleanupUnusedMedia(questions);
      }

      // Always save players
      await saveGamePlayers(gameId, players);
      console.log('Players saved successfully');

      // Save questions and answered questions if provided
      if (questions && questions.length > 0) {
        await saveGameQuestions(gameId, questions, answeredQuestions);
        console.log('Questions saved successfully');
      }

      // Save category descriptions if provided
      if (categoryDescriptions && categoryDescriptions.length > 0) {
        await saveGameCategories(gameId, categoryDescriptions);
        console.log('Category descriptions saved successfully');
      }

      console.log('=== GAME SAVED SUCCESSFULLY ===');
      
      // Only show toast for manual saves
      if (isManual) {
        toast({
          title: "Game Saved!",
          description: "Your game has been successfully saved to the database.",
        });
      }

      return gameId;
    } catch (error) {
      console.error('=== SAVE GAME FAILED ===');
      console.error('Error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Show more specific error messages
      let errorMessage = "Failed to save the game";
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('connection')) {
          errorMessage = "Network connection error. Please check your internet connection and try again.";
        } else if (error.message.includes('offline')) {
          errorMessage = "You appear to be offline. Please check your internet connection.";
        } else {
          errorMessage = `Save failed: ${error.message}`;
        }
      }
      
      // Show error toast for both manual and auto saves
      toast({
        title: "Save Error",
        description: errorMessage,
        variant: "destructive",
        duration: 8000, // Longer duration for network errors
      });
      
      throw error;
    } finally {
      // Always reset loading state for manual saves
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
      
      let errorMessage = "Failed to delete the game. Please try again.";
      if (error instanceof Error && (error.message.includes('network') || error.message.includes('fetch'))) {
        errorMessage = "Network error while deleting. Please check your connection and try again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentGames = async (limit = 10) => {
    setIsLoading(true);
    try {
      console.log('Hook: Starting to load recent games...');
      const games = await loadRecentGamesData(limit);
      console.log('Hook: Games loaded successfully:', games?.length || 0);
      return games;
    } catch (error) {
      console.error('Hook: Error loading games:', error);
      
      // More specific error handling for network issues
      let errorTitle = "Error";
      let errorDescription = `Failed to load games: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      if (error instanceof Error) {
        if (error.message.includes('offline') || error.message.includes('connection')) {
          errorTitle = "Connection Error";
          errorDescription = error.message;
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          errorTitle = "Network Error";
          errorDescription = "Unable to connect to the database. Please check your internet connection.";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
        duration: 8000,
      });
      return [];
    } finally {
      setIsLoading(false);
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
