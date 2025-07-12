import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/game';

/**
 * Loads players for a specific game ID
 * This function can be used to synchronize players between devices
 */
export const loadGamePlayers = async (gameId: string): Promise<Player[]> => {
  if (!gameId) {
    console.error('Cannot load players: No game ID provided');
    return [];
  }
  
  try {
    console.log('👤 Loading players for game ID:', gameId);
    
    const { data: playersData, error: playersError } = await supabase
      .from('game_players')
      .select('player_name, player_score, avatar_url')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });
      
    if (playersError) {
      console.error('Failed to load players:', playersError);
      return [];
    }
    
    if (!playersData || playersData.length === 0) {
      console.log('No players found for game ID:', gameId);
      return [];
    }
    
    // Deduplicate by player name
    const uniquePlayers = Array.from(new Map(
      playersData.map(p => [p.player_name, p])
    ).values());
    
    const loadedPlayers = uniquePlayers.map((player, index) => ({
      id: index + 1,
      name: player.player_name,
      score: player.player_score,
      avatar: player.avatar_url || undefined
    }));
    
    console.log('✅ Loaded players:', loadedPlayers.length);
    return loadedPlayers;
  } catch (error) {
    console.error('Error loading players:', error);
    return [];
  }
};

/**
 * Forces a reload of players from the database
 * Can be called when a player might have been updated on another device
 */
export const refreshPlayers = async (
  gameId: string, 
  setPlayers: (players: Player[]) => void
): Promise<void> => {
  if (!gameId) {
    console.warn('Cannot refresh players: No game ID provided');
    return;
  }
  
  try {
    const players = await loadGamePlayers(gameId);
    
    if (players.length > 0) {
      setPlayers(players);
      console.log('✅ Players refreshed from database');
    }
  } catch (error) {
    console.error('Error refreshing players:', error);
  }
};
