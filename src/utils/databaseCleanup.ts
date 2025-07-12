import { supabase } from '@/integrations/supabase/client';

/**
 * Cleans up duplicate players from the database
 * Keeps the most recent entry for each player name within each game
 */
export const cleanupDuplicatePlayers = async (): Promise<{ removed: number }> => {
  console.log('🧹 Starting player duplicates cleanup...');
  let removedCount = 0;

  try {
    // Step 1: Get all games
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id');

    if (gamesError) {
      throw new Error(`Failed to fetch games: ${gamesError.message}`);
    }

    // Step 2: Process each game
    for (const game of games) {
      const gameId = game.id;
      console.log(`🔍 Processing players for game ${gameId}`);

      // Get all players for this game
      const { data: allPlayers, error: playersError } = await supabase
        .from('game_players')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (playersError) {
        console.error(`Error fetching players for game ${gameId}: ${playersError.message}`);
        continue;
      }

      if (!allPlayers || allPlayers.length === 0) {
        console.log(`No players found for game ${gameId}`);
        continue;
      }

      // Keep track of player names we've seen
      const playerNameMap = new Map();
      const duplicateIds = [];

      // Find duplicates (keep the first/most recent occurrence)
      for (const player of allPlayers) {
        if (playerNameMap.has(player.player_name)) {
          duplicateIds.push(player.id);
        } else {
          playerNameMap.set(player.player_name, player);
        }
      }

      // Delete duplicates
      if (duplicateIds.length > 0) {
        console.log(`Found ${duplicateIds.length} duplicate player entries for game ${gameId}`);
        
        // Delete in batches of 100 to avoid query limitations
        for (let i = 0; i < duplicateIds.length; i += 100) {
          const batch = duplicateIds.slice(i, i + 100);
          const { error: deleteError } = await supabase
            .from('game_players')
            .delete()
            .in('id', batch);
            
          if (deleteError) {
            console.error(`Error deleting duplicate players: ${deleteError.message}`);
          } else {
            removedCount += batch.length;
          }
        }
      } else {
        console.log(`No duplicate players found for game ${gameId}`);
      }
    }

    console.log(`✅ Player cleanup complete. Removed ${removedCount} duplicate entries.`);
    return { removed: removedCount };
  } catch (error) {
    console.error('Failed to clean up duplicate players:', error);
    throw error;
  }
};

/**
 * Cleans up duplicate categories from the database
 * Keeps the most recent entry for each category name within each game
 */
export const cleanupDuplicateCategories = async (): Promise<{ removed: number }> => {
  console.log('🧹 Starting category duplicates cleanup...');
  let removedCount = 0;

  try {
    // Step 1: Get all games
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id');

    if (gamesError) {
      throw new Error(`Failed to fetch games: ${gamesError.message}`);
    }

    // Step 2: Process each game
    for (const game of games) {
      const gameId = game.id;
      console.log(`🔍 Processing categories for game ${gameId}`);

      // Get all categories for this game
      const { data: allCategories, error: categoriesError } = await supabase
        .from('game_categories')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (categoriesError) {
        console.error(`Error fetching categories for game ${gameId}: ${categoriesError.message}`);
        continue;
      }

      if (!allCategories || allCategories.length === 0) {
        console.log(`No categories found for game ${gameId}`);
        continue;
      }

      // Keep track of category names we've seen
      const categoryNameMap = new Map();
      const duplicateIds = [];

      // Find duplicates (keep the first/most recent occurrence)
      for (const category of allCategories) {
        if (categoryNameMap.has(category.category_name)) {
          duplicateIds.push(category.id);
        } else {
          categoryNameMap.set(category.category_name, category);
        }
      }

      // Delete duplicates
      if (duplicateIds.length > 0) {
        console.log(`Found ${duplicateIds.length} duplicate category entries for game ${gameId}`);
        
        // Delete in batches of 100 to avoid query limitations
        for (let i = 0; i < duplicateIds.length; i += 100) {
          const batch = duplicateIds.slice(i, i + 100);
          const { error: deleteError } = await supabase
            .from('game_categories')
            .delete()
            .in('id', batch);
            
          if (deleteError) {
            console.error(`Error deleting duplicate categories: ${deleteError.message}`);
          } else {
            removedCount += batch.length;
          }
        }
      } else {
        console.log(`No duplicate categories found for game ${gameId}`);
      }
    }

    console.log(`✅ Category cleanup complete. Removed ${removedCount} duplicate entries.`);
    return { removed: removedCount };
  } catch (error) {
    console.error('Failed to clean up duplicate categories:', error);
    throw error;
  }
};

/**
 * Cleans up duplicate questions from the database
 * Keeps the most recent entry for each question_id within each game
 */
export const cleanupDuplicateQuestions = async (): Promise<{ removed: number }> => {
  console.log('🧹 Starting question duplicates cleanup...');
  let removedCount = 0;

  try {
    // Step 1: Get all games
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id');

    if (gamesError) {
      throw new Error(`Failed to fetch games: ${gamesError.message}`);
    }

    // Step 2: Process each game
    for (const game of games) {
      const gameId = game.id;
      console.log(`🔍 Processing questions for game ${gameId}`);

      // Get all questions for this game
      const { data: allQuestions, error: questionsError } = await supabase
        .from('game_questions')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (questionsError) {
        console.error(`Error fetching questions for game ${gameId}: ${questionsError.message}`);
        continue;
      }

      if (!allQuestions || allQuestions.length === 0) {
        console.log(`No questions found for game ${gameId}`);
        continue;
      }

      // Keep track of question IDs we've seen
      const questionIdMap = new Map();
      const duplicateIds = [];

      // Find duplicates (keep the first/most recent occurrence)
      for (const question of allQuestions) {
        if (questionIdMap.has(question.question_id)) {
          duplicateIds.push(question.id);
        } else {
          questionIdMap.set(question.question_id, question);
        }
      }

      // Delete duplicates
      if (duplicateIds.length > 0) {
        console.log(`Found ${duplicateIds.length} duplicate question entries for game ${gameId}`);
        
        // Delete in batches of 100 to avoid query limitations
        for (let i = 0; i < duplicateIds.length; i += 100) {
          const batch = duplicateIds.slice(i, i + 100);
          const { error: deleteError } = await supabase
            .from('game_questions')
            .delete()
            .in('id', batch);
            
          if (deleteError) {
            console.error(`Error deleting duplicate questions: ${deleteError.message}`);
          } else {
            removedCount += batch.length;
          }
        }
      } else {
        console.log(`No duplicate questions found for game ${gameId}`);
      }
    }

    console.log(`✅ Question cleanup complete. Removed ${removedCount} duplicate entries.`);
    return { removed: removedCount };
  } catch (error) {
    console.error('Failed to clean up duplicate questions:', error);
    throw error;
  }
};

/**
 * Runs all cleanup operations to remove duplicates from the database
 */
export const cleanupAllDuplicates = async (): Promise<{
  players: number;
  categories: number;
  questions: number;
}> => {
  console.log('=== STARTING DATABASE CLEANUP PROCESS ===');
  
  try {
    const playersResult = await cleanupDuplicatePlayers();
    const categoriesResult = await cleanupDuplicateCategories();
    const questionsResult = await cleanupDuplicateQuestions();
    
    console.log('=== DATABASE CLEANUP COMPLETE ===');
    console.log(`Total duplicates removed:
    - Players: ${playersResult.removed}
    - Categories: ${categoriesResult.removed}
    - Questions: ${questionsResult.removed}
    `);
    
    return {
      players: playersResult.removed,
      categories: categoriesResult.removed,
      questions: questionsResult.removed
    };
  } catch (error) {
    console.error('Database cleanup failed:', error);
    throw error;
  }
};
