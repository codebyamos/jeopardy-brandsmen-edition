
import { useToast } from '../hooks/use-toast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Question, CategoryDescription } from '../types/game';

interface UseGameEditorActionsProps {
  questions: Question[];
  categoryDescriptions: CategoryDescription[];
  onQuestionsUpdate: (questions: Question[]) => void;
  onCategoryDescriptionsUpdate: (descriptions: CategoryDescription[]) => void;
  setIsSaving: (saving: boolean) => void;
  answeredQuestions?: Set<number>;
  setAnsweredQuestions?: (answered: Set<number>) => void;
}

export const useGameEditorActions = ({
  questions,
  categoryDescriptions,
  onQuestionsUpdate,
  onCategoryDescriptionsUpdate,
  setIsSaving,
  answeredQuestions,
  setAnsweredQuestions
}: UseGameEditorActionsProps) => {
  const { forceSaveToLocal } = useLocalStorage();
  const { toast } = useToast();

  const saveToLocal = (updatedQuestions?: Question[], updatedDescriptions?: CategoryDescription[]) => {
    const questionsToSave = updatedQuestions || questions;
    const descriptionsToSave = updatedDescriptions || categoryDescriptions;
    
    setTimeout(() => {
      // We don't manage players in this hook, so we're not passing them
      forceSaveToLocal(questionsToSave, descriptionsToSave);
      console.log('💾 GameEditor: Changes saved locally');
    }, 0);
  };

  const saveQuestionEdit = (questionData: Partial<Question>, editingQuestion: Question) => {
    console.log('🔧 saveQuestionEdit called with:', { questionData, editingQuestion });
    
    if (editingQuestion && questionData.category && questionData.question && questionData.answer && questionData.points) {
      const existingQuestionIndex = questions.findIndex(q => q.id === editingQuestion.id);
      let updatedQuestions: Question[];
      
      if (existingQuestionIndex === -1) {
        // Adding new question
        updatedQuestions = [...questions, { ...questionData } as Question];
        console.log('➕ Adding new question. New array length:', updatedQuestions.length);
      } else {
        // Updating existing question - ensure we create a new array with new objects
        updatedQuestions = questions.map(q => 
          q.id === editingQuestion.id ? { ...editingQuestion, ...questionData } : { ...q }
        );
        console.log('✏️ Updating existing question. Array length:', updatedQuestions.length);
      }
      
      console.log('🚀 Calling onQuestionsUpdate with updated questions');
      onQuestionsUpdate(updatedQuestions);
      saveToLocal(updatedQuestions);
      console.log('✅ Question edit completed');
    } else {
      console.log('❌ Invalid question data:', { questionData, editingQuestion });
    }
  };

  const deleteQuestion = (id: number) => {
    console.log('🗑️ deleteQuestion called for ID:', id);
    
    const updatedQuestions = questions.filter(q => q.id !== id);
    console.log('🚀 Calling onQuestionsUpdate after delete. New length:', updatedQuestions.length);
    
    // Also remove the question from answered questions if it was answered
    if (answeredQuestions && setAnsweredQuestions && answeredQuestions.has(id)) {
      const updatedAnsweredQuestions = new Set(answeredQuestions);
      updatedAnsweredQuestions.delete(id);
      setAnsweredQuestions(updatedAnsweredQuestions);
      console.log('🚮 Removed question from answered questions:', id);
    }
    
    onQuestionsUpdate(updatedQuestions);
    saveToLocal(updatedQuestions);
    console.log('✅ Question deleted');
  };

  const saveCategoryEdit = (oldName: string, newName: string) => {
    console.log('🔧 saveCategoryEdit called:', { oldName, newName });
    
    if (oldName && newName.trim() && newName !== oldName) {
      // Create completely new arrays with new object references
      const updatedQuestions = questions.map(q => 
        q.category === oldName ? { ...q, category: newName.trim() } : { ...q }
      );

      // First check if we already have the new category name in the descriptions
      const existingNewCategoryIndex = categoryDescriptions.findIndex(
        desc => desc.category.toLowerCase() === newName.trim().toLowerCase()
      );
      
      // Get the description for the old category
      const oldCategoryDesc = categoryDescriptions.find(
        desc => desc.category === oldName
      )?.description || '';
      
      let updatedDescriptions;
      
      if (existingNewCategoryIndex >= 0) {
        // If the new category name already exists, update its description with the old one
        // and remove the old category entry
        updatedDescriptions = categoryDescriptions.filter(desc => desc.category !== oldName);
        
        // Only update the description if the old one had content
        if (oldCategoryDesc) {
          updatedDescriptions = updatedDescriptions.map(desc => 
            desc.category.toLowerCase() === newName.trim().toLowerCase() 
              ? { ...desc, description: oldCategoryDesc } 
              : desc
          );
        }
      } else {
        // Normal rename - just update the category name
        updatedDescriptions = categoryDescriptions.map(desc =>
          desc.category === oldName ? { ...desc, category: newName.trim() } : { ...desc }
        );
      }
      
      console.log('🚀 Calling state updates for category rename');
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      
      saveToLocal(updatedQuestions, updatedDescriptions);
      console.log('✅ Category renamed from', oldName, 'to', newName);
    }
  };

  const deleteCategory = async (category: string) => {
    console.log('🔧 deleteCategory called for:', category);
    
    if (confirm(`Are you sure you want to delete the category "${category}" and all its questions?`)) {
      setIsSaving(true);
      
      try {
        // Update local state
        const updatedQuestions = questions.filter(q => q.category !== category);
        const updatedDescriptions = categoryDescriptions.filter(desc => desc.category !== category);
        
        console.log('🚀 Calling state updates for category deletion');
        onQuestionsUpdate(updatedQuestions);
        onCategoryDescriptionsUpdate(updatedDescriptions);
        
        // Save to local storage
        saveToLocal(updatedQuestions, updatedDescriptions);
        console.log('✅ Category deleted locally');
        
        // Show toast indicating deletion in progress
        toast({
          title: "Deleting Category...",
          description: "Removing category and its questions from database",
          duration: 3000,
        });
        
        // Import the database deletion function
        const { deleteCategoryFromDatabase, createOrFindGame } = await import('@/services/gameService');
        
        // First get the current game ID
        const { useGameData } = await import('@/hooks/useGameData');
        // We need to get the current game ID from somewhere
        // Try to find from localStorage first
        let gameId = localStorage.getItem('currentGameId');
        
        if (!gameId) {
          // If no game ID in localStorage, create a new game
          const today = new Date().toISOString().split('T')[0];
          gameId = await createOrFindGame(today, null);
          localStorage.setItem('currentGameId', gameId);
        }
        
        if (gameId) {
          // Directly delete from database
          const result = await deleteCategoryFromDatabase(gameId, category);
          
          if (result.success) {
            toast({
              title: "Category Deleted",
              description: `Category "${category}" and ${result.deletedQuestions} questions have been removed from the database`,
              duration: 5000,
            });
          } else {
            throw new Error("Failed to delete from database");
          }
        } else {
          throw new Error("Could not determine game ID");
        }
      } catch (error) {
        console.error('Error during category deletion:', error);
        toast({
          title: "Delete Error",
          description: "Category deleted locally but not in database. Please save your game.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const addNewCategory = (newCategoryName: string, categories: string[]) => {
    console.log('🔧 addNewCategory called:', newCategoryName);
    
    // Case-insensitive check for duplicates
    const isDuplicate = categories.some(
      cat => cat.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    
    if (newCategoryName.trim() && !isDuplicate) {
      // Find the highest existing ID and add 1 to ensure uniqueness
      const existingIds = questions.map(q => q.id);
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
      const newId = maxId + 1;
      
      const newQuestion: Question = {
        id: newId,
        category: newCategoryName.trim(),
        points: 100,
        question: 'New Question - Click edit to modify',
        answer: 'What is the answer?',
        bonusPoints: 0
      };
      
      const updatedQuestions = [...questions, newQuestion];
      
      // Also add an entry in category descriptions
      const categoryEntry = categoryDescriptions.find(
        desc => desc.category.toLowerCase() === newCategoryName.trim().toLowerCase()
      );
      
      let updatedDescriptions = [...categoryDescriptions];
      
      if (!categoryEntry) {
        updatedDescriptions = [
          ...categoryDescriptions,
          { category: newCategoryName.trim(), description: '' }
        ];
      }
      
      console.log('🚀 Calling onQuestionsUpdate for new category. New length:', updatedQuestions.length);
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      
      saveToLocal(updatedQuestions, updatedDescriptions);
      console.log('✅ New category added');
    }
  };

  const updateCategoryDescription = (category: string, description: string) => {
    console.log('🔧 updateCategoryDescription called:', { category, description });
    
    // Do a case-insensitive search to ensure we're finding the correct category
    const existingIndex = categoryDescriptions.findIndex(
      desc => desc.category.toLowerCase() === category.toLowerCase()
    );
    
    let updatedDescriptions: CategoryDescription[];
    
    if (existingIndex >= 0) {
      updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category.toLowerCase() === category.toLowerCase() 
          ? { ...desc, description } 
          : { ...desc }
      );
      console.log(`✅ Updating existing category description for "${category}"`);
    } else {
      updatedDescriptions = [...categoryDescriptions, { category, description }];
      console.log(`✅ Adding new category description for "${category}"`);
    }
    
    console.log('🚀 Calling onCategoryDescriptionsUpdate. New length:', updatedDescriptions.length);
    onCategoryDescriptionsUpdate(updatedDescriptions);
    
    // Force an immediate local save to ensure persistence
    saveToLocal(undefined, updatedDescriptions);
    console.log('✅ Category description updated and saved locally');
  };

  const triggerDatabaseSave = async () => {
    toast({
      title: "Use Save Game Button",
      description: "Please use the main 'Save Game' button to save to the database.",
    });
  };

  return {
    triggerDatabaseSave,
    saveQuestionEdit,
    deleteQuestion,
    saveCategoryEdit,
    deleteCategory,
    addNewCategory,
    updateCategoryDescription
  };
};
