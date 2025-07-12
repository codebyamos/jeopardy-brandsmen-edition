import { supabase } from '@/integrations/supabase/client';
import { Question, CategoryDescription } from '@/types/game';

/**
 * Directly deletes a category and all its questions from a game in the database
 * @param gameId The game ID
 * @param categoryName The name of the category to delete
 */
export const deleteCategoryFromDatabase = async (
  gameId: string, 
  categoryName: string
): Promise<{ success: boolean, deletedQuestions: number }> => {
  console.log(`🗑️ Deleting category "${categoryName}" from game ${gameId} in database`);
  
  try {
    // First, retrieve all current questions for the game
    const { data: allQuestions, error: questionsFetchError } = await supabase
      .from('game_questions')
      .select('*')
      .eq('game_id', gameId);
      
    if (questionsFetchError) {
      console.error('Error fetching questions for deletion:', questionsFetchError);
      throw new Error(`Failed to fetch questions: ${questionsFetchError.message}`);
    }
    
    // Filter to get only questions from the category being deleted
    const categoryQuestions = allQuestions?.filter(q => 
      q.category.toLowerCase() === categoryName.toLowerCase()
    ) || [];
    
    const categoryQuestionIds = categoryQuestions.map(q => q.id);
    
    console.log(`Found ${categoryQuestions.length} questions to delete for category "${categoryName}"`);
    
    if (categoryQuestionIds.length > 0) {
      // Delete all questions for this category
      const { error: deleteQuestionsError } = await supabase
        .from('game_questions')
        .delete()
        .in('id', categoryQuestionIds);
        
      if (deleteQuestionsError) {
        console.error('Error deleting questions for category:', deleteQuestionsError);
        throw new Error(`Failed to delete questions: ${deleteQuestionsError.message}`);
      }
      
      console.log(`✅ Successfully deleted ${categoryQuestionIds.length} questions for category "${categoryName}"`);
    }
    
    // Now delete the category itself from game_categories
    const { error: deleteCategoryError } = await supabase
      .from('game_categories')
      .delete()
      .eq('game_id', gameId)
      .eq('category_name', categoryName);
      
    if (deleteCategoryError) {
      console.error('Error deleting category:', deleteCategoryError);
      throw new Error(`Failed to delete category: ${deleteCategoryError.message}`);
    }
    
    console.log(`✅ Successfully deleted category "${categoryName}" from database`);
    
    return { 
      success: true, 
      deletedQuestions: categoryQuestionIds.length 
    };
    
  } catch (error) {
    console.error('Delete category operation failed:', error);
    return { 
      success: false, 
      deletedQuestions: 0 
    };
  }
};
