import { supabase } from '@/integrations/supabase/client';

/**
 * Generates a random game code consisting of letters and numbers
 * @param length Length of the code (default: 6)
 * @returns A random game code string
 */
export const generateGameCode = (length: number = 6): string => {
  // Characters to use (excluding similar looking characters like 0/O, 1/I, etc.)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
};

/**
 * Sets or updates the game code for a game
 * @param gameId The game ID to set the code for
 * @returns The game code that was set
 */
export const setGameCode = async (gameId: string): Promise<string> => {
  try {
    // First check if this game already has a code
    const { data: existingData } = await supabase
      .from('games')
      .select('game_code')
      .eq('id', gameId)
      .single();
      
    // If it already has a non-null code, return it
    if (existingData?.game_code) {
      return existingData.game_code;
    }
    
    // Generate a unique game code
    let gameCode: string;
    let isUnique = false;
    
    while (!isUnique) {
      gameCode = generateGameCode();
      
      // Check if code already exists
      const { data } = await supabase
        .from('games')
        .select('id')
        .eq('game_code', gameCode);
        
      isUnique = !data || data.length === 0;
      
      if (isUnique) {
        // Update the game with the new code
        const { error } = await supabase
          .from('games')
          .update({ game_code: gameCode })
          .eq('id', gameId);
          
        if (error) {
          console.error('Failed to set game code:', error);
          throw error;
        }
        
        return gameCode;
      }
    }
    
    throw new Error('Failed to generate unique game code');
  } catch (error) {
    console.error('Error setting game code:', error);
    throw error;
  }
};

/**
 * Gets the game code for a specific game ID
 * @param gameId The game ID to get the code for
 * @returns The game code or null if not found
 */
export const getGameCode = async (gameId: string): Promise<string | null> => {
  try {
    const { data } = await supabase
      .from('games')
      .select('game_code')
      .eq('id', gameId)
      .single();
      
    return data?.game_code || null;
  } catch (error) {
    console.error('Error getting game code:', error);
    return null;
  }
};
