
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

      console.log('Saving game with players:', players);
      console.log('Saving questions:', questions?.length || 0);
      console.log('Saving category descriptions:', categoryDescriptions?.length || 0);
      console.log('Current game ID:', currentGameId);
      console.log('Game date:', today);

      const gameId = await createOrFindGame(today, currentGameId);
      setCurrentGameId(gameId);

      // Clean up unused media files when starting a new game
      if (questions && questions.length > 0 && !currentGameId) {
        await cleanupUnusedMedia(questions);
      }

      await saveGamePlayers(gameId, players);

      // Save questions and answered questions if provided
      if (questions && questions.length > 0) {
        await saveGameQuestions(gameId, questions, answeredQuestions);
      }

      // Save category descriptions if provided
      if (categoryDescriptions && categoryDescriptions.length > 0) {
        await saveGameCategories(gameId, categoryDescriptions);
      }

      console.log('Game saved successfully to database');
      
      // Only show toast for manual saves
      if (isManual) {
        toast({
          title: "Game Saved!",
          description: "Your game has been successfully saved to the database.",
        });
      }

      return gameId;
    } catch (error) {
      console.error('Error saving game:', error);
      if (isManual) {
        toast({
          title: "Error",
          description: "Failed to save the game. Please try again.",
          variant: "destructive",
        });
      }
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
    setIsLoading(true);
    try {
      return await loadRecentGamesData(limit);
    } catch (error) {
      console.error('Error loading games:', error);
      
      // More specific error handling
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network connection error - unable to reach database');
        toast({
          title: "Connection Error",
          description: "Unable to connect to the database. Please check your internet connection.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load games. Please try again.",
          variant: "destructive",
        });
      }
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
