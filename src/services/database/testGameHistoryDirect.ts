// Simple test that matches the working game history functionality
import { supabase } from '@/integrations/supabase/client';

export const testGameHistoryDirectly = async () => {
  console.log('🎯 TESTING GAME HISTORY DIRECTLY (same as working code)');
  console.log('=====================================================');
  
  try {
    // This is exactly the same query that works in loadGameHistory
    console.log('Running the exact same query that works in the main app...');
    
    const { data: games, error: gamesError } = await supabase
      .from('completed_games')
      .select(`
        id,
        game_date,
        created_at,
        winner_name,
        winner_score
      `)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(5);
    
    console.log('Query result:', { games, gamesError });
    
    if (gamesError) {
      console.error('❌ Query failed:', gamesError);
      return {
        success: false,
        error: gamesError,
        message: `Query failed: ${gamesError.message || 'Unknown error'}`
      };
    }
    
    console.log('✅ Query successful!');
    console.log(`Found ${games?.length || 0} games`);
    
    if (games && games.length > 0) {
      console.log('Sample games:', games.map(g => ({
        id: g.id.substring(0, 8) + '...',
        winner: g.winner_name,
        date: g.game_date
      })));
    }
    
    return {
      success: true,
      gamesCount: games?.length || 0,
      games: games?.slice(0, 3) // Just first 3 for display
    };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return {
      success: false,
      error: error,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
