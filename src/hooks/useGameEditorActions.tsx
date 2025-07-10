
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

  const saveToLocal = (updatedQuestions?: Question[], updatedDescriptions?: CategoryDescription[]) => {
    const questionsToSave = updatedQuestions || questions;
    const descriptionsToSave = updatedDescriptions || categoryDescriptions;
    saveToLocalStorage(questionsToSave, descriptionsToSave);
  };

  const triggerDatabaseSave = async (updatedQuestions?: Question[], updatedDescriptions?: CategoryDescription[]) => {
    setIsSaving(true);
    try {
      console.log('GameEditor: Starting database save');
      
      // Use empty players array since we're only saving content changes
      const players = [{ id: 1, name: 'Team 1', score: 0 }, { id: 2, name: 'Team 2', score: 0 }];
      await saveGame(
        players,
        updatedQuestions || questions,
        [],
        updatedDescriptions || categoryDescriptions,
        undefined,
        true // Manual save
      );
      
      console.log('GameEditor: Database save completed successfully');
    } catch (error) {
      console.error('GameEditor: Database save failed:', error);
      throw error;
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
      
      // Update state immediately
      onQuestionsUpdate(updatedQuestions);
      
      // Save to local storage only
      saveToLocal(updatedQuestions);
    }
  };

  const deleteQuestion = async (id: number) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    
    // Update state immediately
    onQuestionsUpdate(updatedQuestions);
    
    // Save to local storage only
    saveToLocal(updatedQuestions);
  };

  const saveCategoryEdit = async (oldName: string, newName: string) => {
    if (oldName && newName.trim() && newName !== oldName) {
      console.log('GameEditor: Saving category edit:', { oldName, newName });
      
      const updatedQuestions = questions.map(q => 
        q.category === oldName ? { ...q, category: newName.trim() } : q
      );

      // Update category descriptions
      const updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === oldName ? { ...desc, category: newName.trim() } : desc
      );
      
      // Update state immediately
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      
      // Save to local storage only
      saveToLocal(updatedQuestions, updatedDescriptions);
    }
  };

  const deleteCategory = async (category: string) => {
    if (confirm(`Are you sure you want to delete the category "${category}" and all its questions?`)) {
      const updatedQuestions = questions.filter(q => q.category !== category);
      const updatedDescriptions = categoryDescriptions.filter(desc => desc.category !== category);
      
      // Update state immediately
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      
      // Save to local storage only
      saveToLocal(updatedQuestions, updatedDescriptions);
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
      
      // Update state immediately
      onQuestionsUpdate(updatedQuestions);
      
      // Save to local storage only
      saveToLocal(updatedQuestions);
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
    
    // Update state immediately
    onCategoryDescriptionsUpdate(updatedDescriptions);
    
    // Save to local storage only
    saveToLocal(undefined, updatedDescriptions);
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
