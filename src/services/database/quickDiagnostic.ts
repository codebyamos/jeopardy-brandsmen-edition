// Simple database diagnostic tool
import { supabase } from '@/integrations/supabase/client';

export const quickDatabaseCheck = async () => {
  console.log('🔍 QUICK DATABASE DIAGNOSTIC');
  console.log('==========================');
  
  const results = {
    connection: false,
    tables: {
      games: false,
      completed_games: false,
      completed_game_players: false
    },
    errors: [] as string[],
    details: {} as any
  };
  
  try {
    // Test basic connection using same method as working code
    console.log('1. Testing basic connection...');
    const { data: basicTest, error: basicError } = await supabase.from('games').select('id').limit(1);
    console.log('Basic test result:', { data: basicTest, error: basicError });
    
    if (basicError) {
      console.error('❌ Basic connection failed:', basicError);
      results.errors.push(`Basic connection: ${basicError.message || basicError.details || 'Unknown error'}`);
      results.details.games = basicError;
    } else {
      console.log('✅ Basic connection successful');
      results.connection = true;
      results.tables.games = true;
    }
    
    // Test completed_games table using same method as working code
    console.log('2. Testing completed_games table...');
    const { data: cgTest, error: cgError } = await supabase.from('completed_games').select('id').limit(1);
    console.log('Completed games test result:', { data: cgTest, error: cgError });
    
    if (cgError) {
      console.error('❌ completed_games table issue:', cgError);
      results.errors.push(`completed_games: ${cgError.message || cgError.details || 'Unknown error'}`);
      results.details.completed_games = cgError;
    } else {
      console.log('✅ completed_games table accessible');
      results.tables.completed_games = true;
    }
    
    // Test completed_game_players table using same method as working code
    console.log('3. Testing completed_game_players table...');
    const { data: cgpTest, error: cgpError } = await supabase.from('completed_game_players').select('id').limit(1);
    console.log('Completed game players test result:', { data: cgpTest, error: cgpError });
    
    if (cgpError) {
      console.error('❌ completed_game_players table issue:', cgpError);
      results.errors.push(`completed_game_players: ${cgpError.message || cgpError.details || 'Unknown error'}`);
      results.details.completed_game_players = cgpError;
    } else {
      console.log('✅ completed_game_players table accessible');
      results.tables.completed_game_players = true;
    }
    
    // Test a simple select to see if data loading works
    if (results.tables.completed_games) {
      console.log('4. Testing data loading from completed_games...');
      const { data: gameData, error: gameError } = await supabase
        .from('completed_games')
        .select('id, winner_name, game_date')
        .limit(3);
      
      if (gameError) {
        console.error('❌ Data loading failed:', gameError);
        results.errors.push(`Data loading: ${gameError.message}`);
      } else {
        console.log('✅ Data loading successful. Sample games:', gameData);
        results.details.sampleData = gameData;
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error during diagnostic:', error);
    results.errors.push(`Unexpected: ${error instanceof Error ? error.message : String(error)}`);
    results.details.unexpectedError = error;
  }
  
  console.log('📊 DIAGNOSTIC RESULTS:', results);
  console.log('==========================');
  
  return results;
};

export default quickDatabaseCheck;
