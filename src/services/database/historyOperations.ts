// Importing the supabase client and types
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/game';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Interface for completed games data
 */
export interface CompletedGamePlayer {
  id: string;
  player_name: string;
  player_score: number;
  avatar_url: string | null;
}

export interface CompletedGame {
  id: string;
  game_date: string;
  created_at: string;
  winner_name: string;
  winner_score: number;
  players: CompletedGamePlayer[];
}

/**
 * Saves the current game state to completed games history
 */
export const saveGameToHistory = async (players: Player[], gameDate = new Date()): Promise<string | null> => {
  try {
    if (!players || players.length === 0) {
      console.log('No players to save to completed games history');
      return null;
    }

    console.log('Saving completed game with players:', players);
    // Find the winner (player with highest score)
    const winner = [...players].sort((a, b) => b.score - a.score)[0];
    console.log('Winner determined as:', winner.name, 'with score:', winner.score);

    // Create a new completed game record
    const now = new Date();
    const timestamp = now.getTime(); // Numeric timestamp for easy comparison
    const uniqueId = `game_${timestamp}_${Math.floor(Math.random() * 1000)}`; // Unique identifier

    // Try with the unique_game_id column first
    const insertData = {
      game_date: gameDate.toISOString().split('T')[0],
      winner_name: winner.name,
      winner_score: winner.score,
      created_at: now.toISOString(),
      unique_game_id: uniqueId
    };
    console.log('🎯 SAVE GAME TO HISTORY: Attempting insert with unique_game_id:', insertData);
    const result = await supabase
      .from('completed_games')
      .insert(insertData)
      .select('id')
      .single();

    if (!result.error && result.data) {
      const gameId = result.data.id;
      console.log('✅ SAVE GAME TO HISTORY: Created completed game record with ID:', gameId);
      await savePlayersForGame(gameId, players);
      return gameId;
    }

    // If error indicates column doesn't exist, try without it
    if (result.error && (result.error.code === 'PGRST204' || result.error.message.includes('unique_game_id'))) {
      console.warn('unique_game_id column does not exist, trying basic insert. Error:', result.error);
      const basicInsertData = {
        game_date: gameDate.toISOString().split('T')[0],
        winner_name: winner.name,
        winner_score: winner.score,
        created_at: now.toISOString()
      };
      console.log('Attempting basic insert:', basicInsertData);
      const basicResult = await supabase
        .from('completed_games')
        .insert(basicInsertData)
        .select('id')
        .single();

      if (!basicResult.error && basicResult.data) {
        const gameId = basicResult.data.id;
        console.log('Created completed game record with ID (basic):', gameId);
        await savePlayersForGame(gameId, players);
        return gameId;
      } else {
        console.error('Error in basic insert:', basicResult.error);
        alert('Failed to save game to history: ' + (basicResult.error?.message || 'Unknown error'));
        return null;
      }
    } else {
      // Some other error occurred
      console.error('Error saving completed game:', result.error);
      alert('Failed to save game to history: ' + (result.error?.message || 'Unknown error'));
      return null;
    }
  } catch (error) {
    console.error('Failed to save game to history:', error);
    alert('Failed to save game to history: ' + (error instanceof Error ? error.message : String(error)));
    return null;
  }
};

// Helper function to save players for a game
async function savePlayersForGame(gameId: string, players: Player[]): Promise<void> {
  for (const player of players) {
    // Convert score to a number to ensure it's saved correctly
    const playerScore = Number(player.score) || 0;
    
    console.log('Saving player to completed game:', player.name, 'with score:', playerScore, 
                '(original value type:', typeof player.score, ', value:', player.score, ')');
    
    const { data: playerData, error: playerError } = await supabase
      .from('completed_game_players')
      .insert({
        game_id: gameId,
        player_name: player.name,
        player_score: playerScore,
        avatar_url: player.avatar || null
      })
      .select()
      .single();

    if (playerError) {
      console.error('Error saving player to completed game:', playerError);
      console.log('Error details:', {
        message: playerError.message,
        details: playerError.details,
        hint: playerError.hint,
        code: playerError.code
      });
    } else {
      console.log('Player saved successfully:', playerData);
    }
  }
}

/**
 * Load game history records
 * This uses direct table operations instead of RPC functions
 */
export const loadGameHistory = async (limit = 20) => {
  try {
    console.log('Loading game history records, limit:', limit);
    
    try {
      console.log('Loading from completed_games table directly');
      
      // Optional connection test - not critical for functionality
      console.log('🔍 Testing database connection (optional)...');
      try {
        const { data: connCheck, error: connError } = await supabase.from('games').select('id').limit(1);
        if (connError) {
          console.log('ℹ️ Connection test had issues, but proceeding with main query');
        } else {
          console.log('✅ Connection test successful');
        }
      } catch (connErr) {
        console.log('ℹ️ Connection test failed, but proceeding with main query');
      }
      
      // First, check if completed_games table exists and get the completed games
      console.log('🔍 Loading games with explicit ordering by created_at and id');
      const { data: games, error: gamesError } = await supabase
        .from('completed_games')
        .select(`
          id,
          game_date,
          created_at,
          winner_name,
          winner_score
        `)
        // Order by created_at (which should exist on all records)
        .order('created_at', { ascending: false })
        // Finally by ID to ensure complete uniqueness
        .order('id', { ascending: false })
        .limit(limit);
      
      // Log detailed information about the response
      console.log('📊 DB response details:', {
        success: !gamesError,
        errorMessage: gamesError?.message,
        errorCode: gamesError?.code,
        recordsCount: games?.length || 0
      });

      if (gamesError) {
        console.error('❌ Error loading completed games:', gamesError);
        
        // If the table doesn't exist, return empty array instead of crashing
        if (gamesError.code === 'PGRST106' || gamesError.message.includes('does not exist')) {
          console.log('ℹ️ completed_games table does not exist - returning empty history');
          return [];
        }
        
        return [];
      }

      if (!games || games.length === 0) {
        console.log('No completed games found');
        return [];
      }

      console.log(`Found ${games.length} completed games`);
      
      // Now, for each game, load its players
      const historyWithPlayers = await Promise.all(
        games.map(async (game) => {
          console.log(`Loading players for game ${game.id}`);
          
          const { data: players, error: playersError } = await supabase
            .from('completed_game_players')
            .select(`
              id,
              player_name,
              player_score,
              avatar_url
            `)
            .eq('game_id', game.id);

          if (playersError) {
            console.error(`Error loading players for game ${game.id}:`, playersError);
          }
          
          console.log(`Found ${players?.length || 0} players for game ${game.id}`);
          if (players && players.length > 0) {
            console.log('Sample player data:', players[0]);
          }

          // Create the record with the correct field name for the component
          const gameRecord = {
            id: game.id,
            game_date: game.game_date,
            created_at: game.created_at,
            winner_name: game.winner_name || '',
            winner_score: game.winner_score || 0,
            game_history_players: players || [] // This is the field name expected by the component
          };
          
          console.log(`Created game history record for ${game.id} with ${gameRecord.game_history_players.length} players`);
          return gameRecord;
        })
      );
      
      console.log('Processed history data with players:', historyWithPlayers.length, 'games');
      return historyWithPlayers;
    } catch (dbError) {
      console.error('Database error loading history:', dbError);
      if (dbError instanceof Error) {
        console.log('Error details:', dbError.message);
      }
      return [];
    }
  } catch (error) {
    console.error('Failed to load game history:', error);
    if (error instanceof Error) {
      console.log('Error details:', error.message);
    }
    return [];
  }
};

/**
 * Delete a game history record
 */
export const deleteGameHistory = async (historyId: string): Promise<void> => {
  try {
    console.log('Deleting game history record:', historyId);
    
    // First delete the players to avoid any issues if cascade isn't working
    try {
      const { error: playersError } = await supabase
        .from('completed_game_players')
        .delete()
        .eq('game_id', historyId);
      
      if (playersError) {
        console.error('Error deleting game history players:', playersError);
        // Continue trying to delete the game anyway
      } else {
        console.log('Successfully deleted history players');
      }
    } catch (playerDeleteError) {
      console.error('Error during player deletion:', playerDeleteError);
      // Continue with game deletion regardless
    }
    
    // Now delete the game record
    const { error } = await supabase
      .from('completed_games')
      .delete()
      .eq('id', historyId);
    
    if (error) {
      console.error('Error deleting game history:', error);
      console.log('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('Successfully deleted history record');
  } catch (error) {
    console.error('Failed to delete game history:', error);
    if (error instanceof Error) {
      console.log('Error message:', error.message);
    }
    throw error;
  }
};
