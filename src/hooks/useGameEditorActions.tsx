
import { useToast } from '../hooks/use-toast';
import { useGameData } from '../hooks/useGameData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Question, CategoryDescription } from '../types/game';

interface UseGameEditorActionsProps {
  questions: Question[];
  categoryDescriptions: CategoryDescription[];
  onQuestionsUpdate: (questions: Question[]) => void;
  onCategoryDescriptionsUpdate: (descriptions: CategoryDescription[]) => void;
  setIsSaving: (saving: boolean) => void;
}

export const useGameEditorActions = ({
  questions,
  categoryDescriptions,
  onQuestionsUpdate,
  onCategoryDescriptionsUpdate,
  setIsSaving
}: UseGameEditorActionsProps) => {
  const { saveGame } = useGameData();
  const { saveToLocalStorage } = useLocalStorage();
  const { toast } = useToast();

  const saveToDatabase = async (updatedQuestions?: Question[], updatedDescriptions?: CategoryDescription[]) => {
    const questionsToSave = updatedQuestions || questions;
    const descriptionsToSave = updatedDescriptions || categoryDescriptions;
    
    try {
      console.log('☁️ GameEditor: Saving to database immediately');
      
      const players = [{ id: 1, name: 'Team 1', score: 0 }, { id: 2, name: 'Team 2', score: 0 }];
      await saveGame(
        players,
        questionsToSave,
        [],
        descriptionsToSave,
        undefined,
        false // Don't show toast for automatic saves
      );
      
      // Also save to localStorage as backup
      saveToLocalStorage(questionsToSave, descriptionsToSave);
      
      console.log('✅ GameEditor: Data saved to database and localStorage');
    } catch (error) {
      console.error('❌ GameEditor: Database save failed, but localStorage is safe:', error);
      // Still save to localStorage even if database fails
      saveToLocalStorage(questionsToSave, descriptionsToSave);
    }
  };

  const triggerDatabaseSave = async (updatedQuestions?: Question[], updatedDescriptions?: CategoryDescription[]) => {
    setIsSaving(true);
    try {
      await saveToDatabase(updatedQuestions, updatedDescriptions);
      
      toast({
        title: "Saved!",
        description: "Your changes have been saved to the database.",
      });
    } catch (error) {
      console.error('❌ GameEditor: Manual save failed:', error);
      toast({
        title: "Save Error",
        description: "Failed to save to database, but your changes are safe locally.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveQuestionEdit = async (questionData: Partial<Question>, editingQuestion: Question) => {
    if (editingQuestion && questionData.category && questionData.question && questionData.answer && questionData.points) {
      const existingQuestionIndex = questions.findIndex(q => q.id === editingQuestion.id);
      let updatedQuestions;
      
      if (existingQuestionIndex === -1) {
        updatedQuestions = [...questions, { ...questionData } as Question];
      } else {
        updatedQuestions = questions.map(q => 
          q.id === editingQuestion.id ? { ...q, ...questionData } as Question : q
        );
      }
      
      onQuestionsUpdate(updatedQuestions);
      // Save to database immediately
      await saveToDatabase(updatedQuestions);
    }
  };

  const deleteQuestion = async (id: number) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    onQuestionsUpdate(updatedQuestions);
    // Save to database immediately
    await saveToDatabase(updatedQuestions);
  };

  const saveCategoryEdit = async (oldName: string, newName: string) => {
    if (oldName && newName.trim() && newName !== oldName) {
      console.log('GameEditor: Saving category edit:', { oldName, newName });
      
      const updatedQuestions = questions.map(q => 
        q.category === oldName ? { ...q, category: newName.trim() } : q
      );

      const updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === oldName ? { ...desc, category: newName.trim() } : desc
      );
      
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      // Save to database immediately
      await saveToDatabase(updatedQuestions, updatedDescriptions);
    }
  };

  const deleteCategory = async (category: string) => {
    if (confirm(`Are you sure you want to delete the category "${category}" and all its questions?`)) {
      const updatedQuestions = questions.filter(q => q.category !== category);
      const updatedDescriptions = categoryDescriptions.filter(desc => desc.category !== category);
      
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      // Save to database immediately
      await saveToDatabase(updatedQuestions, updatedDescriptions);
    }
  };

  const addNewCategory = async (newCategoryName: string, categories: string[]) => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      const newQuestion: Question = {
        id: newId,
        category: newCategoryName.trim(),
        points: 100,
        question: 'New Question - Click edit to modify',
        answer: 'What is the answer?',
        bonusPoints: 0
      };
      
      const updatedQuestions = [...questions, newQuestion];
      onQuestionsUpdate(updatedQuestions);
      // Save to database immediately
      await saveToDatabase(updatedQuestions);
    }
  };

  const updateCategoryDescription = async (category: string, description: string) => {
    console.log('GameEditor: Updating category description:', { category, description });
    
    const existingIndex = categoryDescriptions.findIndex(desc => desc.category === category);
    let updatedDescriptions;
    
    if (existingIndex >= 0) {
      updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === category ? { ...desc, description } : desc
      );
    } else {
      updatedDescriptions = [...categoryDescriptions, { category, description }];
    }
    
    onCategoryDescriptionsUpdate(updatedDescriptions);
    // Save to database immediately
    await saveToDatabase(undefined, updatedDescriptions);
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
