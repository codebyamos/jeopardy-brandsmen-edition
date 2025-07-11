import { supabase } from '@/integrations/supabase/client';
import { Player, Question, CategoryDescription } from '@/types/game';

export const saveGamePlayers = async (gameId: string, players: Player[]) => {
  console.log('Saving players for game:', gameId, players);
  
  try {
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
    if (players && players.length > 0) {
      const gamePlayersData = players.map(player => ({
        game_id: gameId,
        player_name: player.name,
        player_score: player.score,
        avatar_url: player.avatar || null
      }));

      console.log(`💾 Inserting ${players.length} new players to database`);

      const { error: playersError } = await supabase
        .from('game_players')
        .insert(gamePlayersData);

      if (playersError) {
        console.error('Error saving players:', playersError);
        throw new Error(`Failed to save players: ${playersError.message}`);
      }
      
      console.log(`✅ Successfully inserted ${players.length} players to database`);
    } else {
      console.log('📝 No players to insert - game has 0 players');
    }

    // Verify the final count matches what we expect
    const { count: finalPlayersCount, error: finalCountError } = await supabase
      .from('game_players')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    if (!finalCountError) {
      console.log(`🔍 Database verification: Game now has ${finalPlayersCount} players (expected: ${players.length})`);
      if (finalPlayersCount !== players.length) {
        console.warn(`⚠️ Player count mismatch! Expected ${players.length}, but database has ${finalPlayersCount}`);
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
    if (questions.length > 0) {
      // Save all questions for this game
      const gameQuestionsData = questions.map(question => ({
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

      console.log(`💾 Inserting ${questions.length} new questions to database`);
      console.log('Sample question data:', gameQuestionsData.slice(0, 1)); // Log first question for verification

      const { error: questionsError } = await supabase
        .from('game_questions')
        .insert(gameQuestionsData);

      if (questionsError) {
        console.error('Error saving questions:', questionsError);
        throw new Error(`Failed to save questions: ${questionsError.message}`);
      }
      
      console.log(`✅ Successfully inserted ${questions.length} questions to database`);
    } else {
      console.log('📝 No questions to insert - game has 0 questions');
    }

    // Verify the final count matches what we expect
    const { count: finalCount, error: finalCountError } = await supabase
      .from('game_questions')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    if (!finalCountError) {
      console.log(`🔍 Database verification: Game now has ${finalCount} questions (expected: ${questions.length})`);
      if (finalCount !== questions.length) {
        console.warn(`⚠️ Question count mismatch! Expected ${questions.length}, but database has ${finalCount}`);
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
    if (categoryDescriptions && categoryDescriptions.length > 0) {
      const gameCategoriesData = categoryDescriptions.map(desc => ({
        game_id: gameId,
        category_name: desc.category,
        description: desc.description
      }));

      console.log(`💾 Inserting ${categoryDescriptions.length} new categories to database`);

      const { error: categoriesError } = await supabase
        .from('game_categories')
        .insert(gameCategoriesData);

      if (categoriesError) {
        console.error('Error saving categories:', categoriesError);
        throw new Error(`Failed to save categories: ${categoriesError.message}`);
      }
      
      console.log(`✅ Successfully inserted ${categoryDescriptions.length} categories to database`);
    } else {
      console.log('📝 No categories to insert - game has 0 category descriptions');
    }

    // Verify the final count matches what we expect
    const { count: finalCategoriesCount, error: finalCountError } = await supabase
      .from('game_categories')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    if (!finalCountError) {
      console.log(`🔍 Database verification: Game now has ${finalCategoriesCount} categories (expected: ${categoryDescriptions.length})`);
      if (finalCategoriesCount !== categoryDescriptions.length) {
        console.warn(`⚠️ Category count mismatch! Expected ${categoryDescriptions.length}, but database has ${finalCategoriesCount}`);
      }
    }
  } catch (error) {
    console.error('saveGameCategories failed:', error);
    throw error;
  }
};