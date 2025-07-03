
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

export const useGameData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const { toast } = useToast();

  const saveGame = async (players: Player[], gameDate?: string) => {
    setIsLoading(true);
    try {
      const today = gameDate || new Date().toISOString().split('T')[0];
      let gameId = currentGameId;

      // If currentGameId is set, check if it still exists in the database
      if (gameId) {
        const { data: existingGame } = await supabase
          .from('games')
          .select('id')
          .eq('id', gameId)
          .single();

        // If the game doesn't exist, reset the currentGameId
        if (!existingGame) {
          gameId = null;
          setCurrentGameId(null);
        }
      }

      // Check if there's already a game for today (if we don't have a valid gameId)
      if (!gameId) {
        const { data: existingGame } = await supabase
          .from('games')
          .select('id')
          .eq('game_date', today)
          .single();

        if (existingGame) {
          gameId = existingGame.id;
          setCurrentGameId(gameId);
        }
      }

      // Create a new game if none exists for today
      if (!gameId) {
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .insert([{ game_date: today }])
          .select()
          .single();

        if (gameError) throw gameError;
        gameId = gameData.id;
        setCurrentGameId(gameId);
      }

      // Delete existing players for this game
      await supabase
        .from('game_players')
        .delete()
        .eq('game_id', gameId);

      // Save all players for this game
      const gamePlayersData = players.map(player => ({
        game_id: gameId,
        player_name: player.name,
        player_score: player.score,
        avatar_url: player.avatar || null
      }));

      const { error: playersError } = await supabase
        .from('game_players')
        .insert(gamePlayersData);

      if (playersError) throw playersError;

      console.log('Game saved successfully to database');
      toast({
        title: "Game Saved!",
        description: "Your game has been successfully saved to the database.",
      });

      return gameId;
    } catch (error) {
      console.error('Error saving game:', error);
      toast({
        title: "Error",
        description: "Failed to save the game. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGame = async (gameId: string) => {
    setIsLoading(true);
    try {
      // Delete game players first (due to foreign key constraint)
      const { error: playersError } = await supabase
        .from('game_players')
        .delete()
        .eq('game_id', gameId);

      if (playersError) throw playersError;

      // Delete the game
      const { error: gameError } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (gameError) throw gameError;

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
      console.log('Attempting to load recent games from database...');
      
      const { data: games, error } = await supabase
        .from('games')
        .select(`
          id,
          game_date,
          created_at,
          game_players (
            id,
            player_name,
            player_score,
            avatar_url
          )
        `)
        .order('game_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully loaded games:', games?.length || 0);
      return games || [];
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
    isLoading
  };
};
