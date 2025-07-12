import { supabase } from '@/integrations/supabase/client';
import { Player, Question, CategoryDescription } from '@/types/game';

export const saveGamePlayers = async (gameId: string, players: Player[]) => {
  console.log('Saving players for game:', gameId, players);
  
  try {
    // Deduplicate players before saving
    const uniquePlayerMap = new Map();
    players.forEach(player => {
      uniquePlayerMap.set(player.name, player);
    });
    const uniquePlayers = Array.from(uniquePlayerMap.values());
    console.log(`⚙️ Deduplicated players: ${players.length} → ${uniquePlayers.length}`);
    
    // Get count of existing players to verify cleanup
    const { count: existingPlayersCount, error: countError } = await supabase
      .from('game_players')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    if (countError) {
      console.error('Error counting existing players:', countError);
    } else {
      console.log(`🗑️ Found ${existingPlayersCount} existing players to delete for game ${gameId}`);
    }

    // Delete existing players for this game (complete cleanup)
    const { error: deletePlayersError } = await supabase
      .from('game_players')
      .delete()
      .eq('game_id', gameId);

    if (deletePlayersError) {
      console.error('Error deleting existing players:', deletePlayersError);
      throw new Error(`Failed to delete existing players: ${deletePlayersError.message}`);
    }

    console.log(`✅ Successfully deleted ${existingPlayersCount || 'all'} existing players from database`);

    // Only insert if we have players to save
    if (uniquePlayers && uniquePlayers.length > 0) {
    const gamePlayersData = uniquePlayers.map(player => {
      console.log(`🖼️ SAVE: Player ${player.name} avatar:`, player.avatar ? `${player.avatar.substring(0, 50)}...` : 'null');
      return {
        game_id: gameId,
        player_name: player.name,
        player_score: player.score,
        avatar_url: player.avatar || null
      };
    });

      console.log(`💾 Inserting ${uniquePlayers.length} unique players to database`);

      const { error: playersError } = await supabase
        .from('game_players')
        .insert(gamePlayersData);

      if (playersError) {
        console.error('Error saving players:', playersError);
        throw new Error(`Failed to save players: ${playersError.message}`);
      }
      
      console.log(`✅ Successfully inserted ${uniquePlayers.length} players to database`);
    } else {
      console.log('📝 No players to insert - game has 0 players');
    }

    // Verify the final count matches what we expect
    const { count: finalPlayersCount, error: finalCountError } = await supabase
      .from('game_players')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    if (!finalCountError) {
      console.log(`🔍 Database verification: Game now has ${finalPlayersCount} players (expected: ${uniquePlayers.length})`);
      if (finalPlayersCount !== uniquePlayers.length) {
        console.warn(`⚠️ Player count mismatch! Expected ${uniquePlayers.length}, but database has ${finalPlayersCount}`);
      }
    }
  } catch (error) {
    console.error('saveGamePlayers failed:', error);
    throw error;
  }
};

export const saveGameQuestions = async (gameId: string, questions: Question[], answeredQuestions?: number[]) => {
  console.log('Saving questions for game:', gameId, 'Questions count:', questions.length);
  
  try {
    // Deduplicate questions by ID before saving
    const uniqueQuestionMap = new Map();
    questions.forEach(question => {
      uniqueQuestionMap.set(question.id, question);
    });
    const uniqueQuestions = Array.from(uniqueQuestionMap.values());
    console.log(`⚙️ Deduplicated questions: ${questions.length} → ${uniqueQuestions.length}`);
    
    // First, get count of existing questions to verify deletion
    const { count: existingCount, error: countError } = await supabase
      .from('game_questions')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    if (countError) {
      console.error('Error counting existing questions:', countError);
    } else {
      console.log(`🗑️ Found ${existingCount} existing questions to delete for game ${gameId}`);
    }

    // Delete existing questions for this game
    const { error: deleteQuestionsError } = await supabase
      .from('game_questions')
      .delete()
      .eq('game_id', gameId);

    if (deleteQuestionsError) {
      console.error('Error deleting existing questions:', deleteQuestionsError);
      throw new Error(`Failed to delete existing questions: ${deleteQuestionsError.message}`);
    }

    console.log(`✅ Successfully deleted ${existingCount || 'all'} existing questions from database`);

    // Only insert if we have questions to save
    if (uniqueQuestions.length > 0) {
      // Save all questions for this game
      const gameQuestionsData = uniqueQuestions.map(question => ({
        game_id: gameId,
        question_id: question.id,
        category: question.category,
        points: question.points,
        question: question.question,
        answer: question.answer,
        bonus_points: question.bonusPoints || 0,
        image_url: question.imageUrl || null,
        video_url: question.videoUrl || null,
        is_answered: answeredQuestions?.includes(question.id) || false
      }));

      console.log(`💾 Inserting ${uniqueQuestions.length} unique questions to database`);
      console.log('Sample question data:', gameQuestionsData.slice(0, 1)); // Log first question for verification

      const { error: questionsError } = await supabase
        .from('game_questions')
        .insert(gameQuestionsData);

      if (questionsError) {
        console.error('Error saving questions:', questionsError);
        throw new Error(`Failed to save questions: ${questionsError.message}`);
      }
      
      console.log(`✅ Successfully inserted ${uniqueQuestions.length} questions to database`);
    } else {
      console.log('📝 No questions to insert - game has 0 questions');
    }

    // Verify the final count matches what we expect
    const { count: finalCount, error: finalCountError } = await supabase
      .from('game_questions')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    if (!finalCountError) {
      console.log(`🔍 Database verification: Game now has ${finalCount} questions (expected: ${uniqueQuestions.length})`);
      if (finalCount !== uniqueQuestions.length) {
        console.warn(`⚠️ Question count mismatch! Expected ${uniqueQuestions.length}, but database has ${finalCount}`);
      }
    }
    
  } catch (error) {
    console.error('saveGameQuestions failed:', error);
    throw error;
  }
};

export const saveGameCategories = async (gameId: string, categoryDescriptions: CategoryDescription[]) => {
  console.log('Saving categories for game:', gameId, categoryDescriptions);
  
  try {
    // Deduplicate category descriptions before saving
    const uniqueCategoryMap = new Map();
    categoryDescriptions.forEach(cat => {
      uniqueCategoryMap.set(cat.category, cat);
    });
    const uniqueCategories = Array.from(uniqueCategoryMap.values());
    console.log(`⚙️ Deduplicated categories: ${categoryDescriptions.length} → ${uniqueCategories.length}`);
    
    // Get count of existing categories to verify cleanup
    const { count: existingCategoriesCount, error: countError } = await supabase
      .from('game_categories')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    if (countError) {
      console.error('Error counting existing categories:', countError);
    } else {
      console.log(`🗑️ Found ${existingCategoriesCount} existing categories to delete for game ${gameId}`);
    }

    // Delete existing category descriptions for this game (complete cleanup)
    const { error: deleteCategoriesError } = await supabase
      .from('game_categories')
      .delete()
      .eq('game_id', gameId);

    if (deleteCategoriesError) {
      console.error('Error deleting existing categories:', deleteCategoriesError);
      throw new Error(`Failed to delete existing categories: ${deleteCategoriesError.message}`);
    }

    console.log(`✅ Successfully deleted ${existingCategoriesCount || 'all'} existing categories from database`);

    // Only insert if we have category descriptions to save
    if (uniqueCategories && uniqueCategories.length > 0) {
      const gameCategoriesData = uniqueCategories.map(desc => ({
        game_id: gameId,
        category_name: desc.category,
        description: desc.description
      }));

      console.log(`💾 Inserting ${uniqueCategories.length} unique categories to database`);

      const { error: categoriesError } = await supabase
        .from('game_categories')
        .insert(gameCategoriesData);

      if (categoriesError) {
        console.error('Error saving categories:', categoriesError);
        throw new Error(`Failed to save categories: ${categoriesError.message}`);
      }
      
      console.log(`✅ Successfully inserted ${uniqueCategories.length} categories to database`);
    } else {
      console.log('📝 No categories to insert - game has 0 category descriptions');
    }

    // Verify the final count matches what we expect
    const { count: finalCategoriesCount, error: finalCountError } = await supabase
      .from('game_categories')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    if (!finalCountError) {
      console.log(`🔍 Database verification: Game now has ${finalCategoriesCount} categories (expected: ${uniqueCategories.length})`);
      if (finalCategoriesCount !== uniqueCategories.length) {
        console.warn(`⚠️ Category count mismatch! Expected ${uniqueCategories.length}, but database has ${finalCategoriesCount}`);
      }
    }
  } catch (error) {
    console.error('saveGameCategories failed:', error);
    throw error;
  }
};