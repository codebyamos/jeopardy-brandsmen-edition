
import { useToast } from '../hooks/use-toast';
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
  const { forceSaveToLocal } = useLocalStorage();
  const { toast } = useToast();

  const saveToLocal = (updatedQuestions?: Question[], updatedDescriptions?: CategoryDescription[]) => {
    const questionsToSave = updatedQuestions || questions;
    const descriptionsToSave = updatedDescriptions || categoryDescriptions;
    
    // Force save to localStorage immediately
    forceSaveToLocal(questionsToSave, descriptionsToSave);
    console.log('💾 GameEditor: Changes saved locally immediately');
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
      
      // Update state first - this will trigger UI update
      onQuestionsUpdate(updatedQuestions);
      
      // Then save to local immediately
      saveToLocal(updatedQuestions);
      
      console.log('✅ Question saved and UI updated:', questionData);
    }
  };

  const deleteQuestion = async (id: number) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    
    // Update state first - this will trigger UI update
    onQuestionsUpdate(updatedQuestions);
    
    // Then save to local immediately
    saveToLocal(updatedQuestions);
    
    console.log('✅ Question deleted and UI updated:', id);
  };

  const saveCategoryEdit = async (oldName: string, newName: string) => {
    if (oldName && newName.trim() && newName !== oldName) {
      const updatedQuestions = questions.map(q => 
        q.category === oldName ? { ...q, category: newName.trim() } : q
      );

      const updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === oldName ? { ...desc, category: newName.trim() } : desc
      );
      
      // Update state first - this will trigger UI update
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      
      // Then save to local immediately
      saveToLocal(updatedQuestions, updatedDescriptions);
      
      console.log('✅ Category renamed and UI updated:', { oldName, newName });
    }
  };

  const deleteCategory = async (category: string) => {
    if (confirm(`Are you sure you want to delete the category "${category}" and all its questions?`)) {
      const updatedQuestions = questions.filter(q => q.category !== category);
      const updatedDescriptions = categoryDescriptions.filter(desc => desc.category !== category);
      
      // Update state first - this will trigger UI update
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      
      // Then save to local immediately
      saveToLocal(updatedQuestions, updatedDescriptions);
      
      console.log('✅ Category deleted and UI updated:', category);
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
      
      // Update state first - this will trigger UI update
      onQuestionsUpdate(updatedQuestions);
      
      // Then save to local immediately
      saveToLocal(updatedQuestions);
      
      console.log('✅ New category added and UI updated:', newCategoryName);
    }
  };

  const updateCategoryDescription = async (category: string, description: string) => {
    const existingIndex = categoryDescriptions.findIndex(desc => desc.category === category);
    let updatedDescriptions;
    
    if (existingIndex >= 0) {
      updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === category ? { ...desc, description } : desc
      );
    } else {
      updatedDescriptions = [...categoryDescriptions, { category, description }];
    }
    
    // Update state first - this will trigger UI update
    onCategoryDescriptionsUpdate(updatedDescriptions);
    
    // Then save to local immediately
    saveToLocal(undefined, updatedDescriptions);
    
    console.log('✅ Category description updated and UI updated:', { category, description });
  };

  // Placeholder for manual save - not used in editor anymore
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
