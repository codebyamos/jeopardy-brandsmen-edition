
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

export const useGameData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveGame = async (players: Player[], gameDate?: string) => {
    setIsLoading(true);
    try {
      // Create a new game record
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert([{ 
          game_date: gameDate || new Date().toISOString().split('T')[0] 
        }])
        .select()
        .single();

      if (gameError) throw gameError;

      // Save all players for this game
      const gamePlayersData = players.map(player => ({
        game_id: gameData.id,
        player_name: player.name,
        player_score: player.score,
        avatar_url: player.avatar || null
      }));

      const { error: playersError } = await supabase
        .from('game_players')
        .insert(gamePlayersData);

      if (playersError) throw playersError;

      toast({
        title: "Game Saved!",
        description: "Your game has been successfully saved to the database.",
      });

      return gameData.id;
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

  const loadRecentGames = async (limit = 10) => {
    setIsLoading(true);
    try {
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

      if (error) throw error;

      return games || [];
    } catch (error) {
      console.error('Error loading games:', error);
      toast({
        title: "Error",
        description: "Failed to load games. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveGame,
    loadRecentGames,
    isLoading
  };
};
