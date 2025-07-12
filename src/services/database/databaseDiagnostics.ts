// This is a diagnostic file to help debug database issues
import { supabase } from '@/integrations/supabase/client';

/**
 * Debug function to check what tables exist in the database
 */
export const checkDatabaseTables = async () => {
  try {
    console.log('Checking database tables...');
    
    // Check both of our main tables
    const completedGamesCheck = await checkCompletedGames();
    const completedGamePlayersCheck = await checkCompletedGamePlayers();
    
    const tables = [];
    if (completedGamesCheck.exists) tables.push('completed_games');
    if (completedGamePlayersCheck.exists) tables.push('completed_game_players');
    
    return {
      success: true,
      message: 'Checked critical tables',
      tables,
      results: {
        completedGames: completedGamesCheck,
        completedGamePlayers: completedGamePlayersCheck
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error checking tables',
      error: error instanceof Error ? { message: error.message } : { message: 'Unknown error' }
    };
  }
};

/**
 * Check if completed_games table exists
 */
const checkCompletedGames = async () => {
  try {
    const { data, error, count } = await supabase
      .from('completed_games')
      .select('*', { count: 'exact', head: true });
    
    return {
      name: 'completed_games',
      exists: !error,
      count: count || 0,
      error: error ? {
        message: error.message,
        code: error.code
      } : null
    };
  } catch (e) {
    return {
      name: 'completed_games',
      exists: false,
      error: e instanceof Error ? { message: e.message } : { message: 'Unknown error' }
    };
  }
};

/**
 * Check if completed_game_players table exists
 */
const checkCompletedGamePlayers = async () => {
  try {
    const { data, error, count } = await supabase
      .from('completed_game_players')
      .select('*', { count: 'exact', head: true });
    
    return {
      name: 'completed_game_players',
      exists: !error,
      count: count || 0,
      error: error ? {
        message: error.message,
        code: error.code
      } : null
    };
  } catch (e) {
    return {
      name: 'completed_game_players',
      exists: false,
      error: e instanceof Error ? { message: e.message } : { message: 'Unknown error' }
    };
  }
};

/**
 * Debug function to check the completed_games table structure
 */
export const checkTableStructure = async () => {
  try {
    console.log('Checking structure of completed_games table');
    
    // Try to select a single row just to get column info
    const { data, error } = await supabase
      .from('completed_games')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing completed_games table:', error);
      return { 
        success: false, 
        message: 'Error accessing completed_games table', 
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    // Get column names from the data
    const columns = data && data.length > 0 
      ? Object.keys(data[0]) 
      : [];
    
    // Check for players too
    const { data: playersData, error: playersError } = await supabase
      .from('completed_game_players')
      .select('*')
      .limit(1);
    
    const playerColumns = playersData && playersData.length > 0
      ? Object.keys(playersData[0])
      : [];
    
    return { 
      success: true, 
      message: 'Retrieved structure of history tables',
      completedGames: {
        columns,
        rowCount: data?.length || 0,
        sample: data
      },
      completedGamePlayers: {
        columns: playerColumns,
        rowCount: playersData?.length || 0,
        sample: playersData,
        error: playersError ? {
          message: playersError.message,
          code: playersError.code
        } : null
      }
    };
  } catch (error) {
    console.error('Unexpected error checking table structure:', error);
    return { 
      success: false, 
      message: 'Unexpected error checking table structure', 
      error: error instanceof Error ? { message: error.message } : { message: 'Unknown error' }
    };
  }
};

/**
 * Try direct insertion into the game history table for debugging
 */
export const testInsertHistory = async () => {
  try {
    console.log('Testing direct insertion into completed_games');
    
    // Use a random suffix to make the test player name unique
    const randomSuffix = Math.floor(Math.random() * 1000);
    const testPlayerName = `TEST_PLAYER_${randomSuffix}`;
    
    // Insert a test record with a unique timestamp
    const now = new Date();
    const { data: insertData, error: insertError } = await supabase
      .from('completed_games')
      .insert({
        game_date: now.toISOString().split('T')[0],
        winner_name: testPlayerName,
        winner_score: 999,
        created_at: now.toISOString(), // Ensure unique timestamp
        unique_game_id: `game_${now.getTime()}_${Math.floor(Math.random() * 1000)}` // Use unique_game_id instead
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting test record:', insertError);
      return { 
        success: false, 
        message: 'Failed to insert test record', 
        error: {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details
        }
      };
    }
    
    console.log('Successfully inserted test record:', insertData);
    
    // Now try to insert a player
    const { data: playerData, error: playerError } = await supabase
      .from('completed_game_players')
      .insert({
        game_id: insertData.id,
        player_name: testPlayerName,
        player_score: 999,
        avatar_url: null
      })
      .select()
      .single();
    
    if (playerError) {
      console.error('Error inserting test player:', playerError);
      return { 
        success: true, 
        message: 'Inserted game but failed to insert player', 
        gameData: insertData,
        playerError: {
          message: playerError.message,
          code: playerError.code,
          details: playerError.details
        }
      };
    }
    
    console.log('Successfully inserted test player:', playerData);
    
    return { 
      success: true, 
      message: 'Successfully inserted test records',
      gameData: insertData,
      playerData
    };
  } catch (error) {
    console.error('Unexpected error in test insertion:', error);
    return { 
      success: false, 
      message: 'Unexpected error in test insertion', 
      error: error instanceof Error ? { message: error.message } : { message: 'Unknown error' }
    };
  }
};

/**
 * Test function to insert multiple games with the same winner name
 * This helps diagnose issues with duplicate player names
 */
export const testMultipleGamesSameWinner = async () => {
  try {
    console.log('Testing insertion of multiple games with same winner');
    
    // Use a fixed test name so we can see if duplication works
    const testPlayerName = 'DUPLICATE_WINNER';
    const results = [];
    
    // Insert 3 games with the same winner name
    for (let i = 0; i < 3; i++) {
      // Add a small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const now = new Date();
      const { data: gameData, error: gameError } = await supabase
        .from('completed_games')
        .insert({
          game_date: now.toISOString().split('T')[0],
          winner_name: testPlayerName,
          winner_score: 100 * (i + 1), // Different scores: 100, 200, 300
          created_at: now.toISOString(),
          unique_game_id: `game_${now.getTime()}_${Math.floor(Math.random() * 1000)}` // Use unique_game_id instead of game_timestamp
        })
        .select()
        .single();
        
      if (gameError) {
        console.error(`Error inserting test game ${i + 1}:`, gameError);
        return {
          success: false,
          message: `Failed to insert test game ${i + 1}`,
          error: gameError
        };
      }
      
      // Insert 2 players for each game
      const { data: playerData, error: playerError } = await supabase
        .from('completed_game_players')
        .insert([
          {
            game_id: gameData.id,
            player_name: testPlayerName,
            player_score: 100 * (i + 1),
            avatar_url: null
          },
          {
            game_id: gameData.id,
            player_name: `Player_${i + 1}`,
            player_score: 50 * (i + 1),
            avatar_url: null
          }
        ])
        .select();
        
      if (playerError) {
        console.error(`Error inserting players for game ${i + 1}:`, playerError);
      }
      
      results.push({
        game: gameData,
        players: playerData || []
      });
    }
    
    return {
      success: true,
      message: `Successfully inserted ${results.length} test games with same winner`,
      results
    };
  } catch (error) {
    console.error('Error in multiple games test:', error);
    return {
      success: false,
      message: 'Error in multiple games test',
      error: error instanceof Error ? { message: error.message } : { message: 'Unknown error' }
    };
  }
};
