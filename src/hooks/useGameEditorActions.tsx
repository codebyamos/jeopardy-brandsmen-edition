
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

  const saveQuestionEdit = (questionData: Partial<Question>, editingQuestion: Question) => {
    if (editingQuestion && questionData.category && questionData.question && questionData.answer && questionData.points) {
      const existingQuestionIndex = questions.findIndex(q => q.id === editingQuestion.id);
      let updatedQuestions;
      
      if (existingQuestionIndex === -1) {
        updatedQuestions = [...questions, { ...questionData } as Question];
        console.log('➕ Adding new question:', questionData);
      } else {
        updatedQuestions = questions.map(q => 
          q.id === editingQuestion.id ? { ...q, ...questionData } as Question : q
        );
        console.log('✏️ Updating existing question:', questionData);
      }
      
      // Update UI state IMMEDIATELY and SYNCHRONOUSLY
      console.log('🔄 Updating UI state immediately with questions:', updatedQuestions.length);
      onQuestionsUpdate(updatedQuestions);
      
      // Then save to local storage
      setTimeout(() => {
        saveToLocal(updatedQuestions);
        console.log('✅ Question saved and UI updated:', questionData);
      }, 0);
    }
  };

  const deleteQuestion = (id: number) => {
    console.log('🗑️ Deleting question:', id);
    const updatedQuestions = questions.filter(q => q.id !== id);
    
    // Update UI state IMMEDIATELY and SYNCHRONOUSLY
    console.log('🔄 Updating UI state immediately, remaining questions:', updatedQuestions.length);
    onQuestionsUpdate(updatedQuestions);
    
    // Then save to local storage
    setTimeout(() => {
      saveToLocal(updatedQuestions);
      console.log('✅ Question deleted and UI updated:', id);
    }, 0);
  };

  const saveCategoryEdit = (oldName: string, newName: string) => {
    if (oldName && newName.trim() && newName !== oldName) {
      console.log('✏️ Renaming category:', { oldName, newName });
      
      const updatedQuestions = questions.map(q => 
        q.category === oldName ? { ...q, category: newName.trim() } : q
      );

      const updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === oldName ? { ...desc, category: newName.trim() } : desc
      );
      
      // Update UI state IMMEDIATELY and SYNCHRONOUSLY
      console.log('🔄 Updating UI state immediately for category rename');
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      
      // Then save to local storage
      setTimeout(() => {
        saveToLocal(updatedQuestions, updatedDescriptions);
        console.log('✅ Category renamed and UI updated:', { oldName, newName });
      }, 0);
    }
  };

  const deleteCategory = (category: string) => {
    if (confirm(`Are you sure you want to delete the category "${category}" and all its questions?`)) {
      console.log('🗑️ Deleting category:', category);
      
      const updatedQuestions = questions.filter(q => q.category !== category);
      const updatedDescriptions = categoryDescriptions.filter(desc => desc.category !== category);
      
      // Update UI state IMMEDIATELY and SYNCHRONOUSLY
      console.log('🔄 Updating UI state immediately for category deletion');
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      
      // Then save to local storage
      setTimeout(() => {
        saveToLocal(updatedQuestions, updatedDescriptions);
        console.log('✅ Category deleted and UI updated:', category);
      }, 0);
    }
  };

  const addNewCategory = (newCategoryName: string, categories: string[]) => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      console.log('➕ Adding new category:', newCategoryName);
      
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
      
      // Update UI state IMMEDIATELY and SYNCHRONOUSLY
      console.log('🔄 Updating UI state immediately for new category');
      onQuestionsUpdate(updatedQuestions);
      
      // Then save to local storage
      setTimeout(() => {
        saveToLocal(updatedQuestions);
        console.log('✅ New category added and UI updated:', newCategoryName);
      }, 0);
    }
  };

  const updateCategoryDescription = (category: string, description: string) => {
    console.log('✏️ Updating category description:', { category, description });
    
    const existingIndex = categoryDescriptions.findIndex(desc => desc.category === category);
    let updatedDescriptions;
    
    if (existingIndex >= 0) {
      updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === category ? { ...desc, description } : desc
      );
    } else {
      updatedDescriptions = [...categoryDescriptions, { category, description }];
    }
    
    // Update UI state IMMEDIATELY and SYNCHRONOUSLY
    console.log('🔄 Updating UI state immediately for category description');
    onCategoryDescriptionsUpdate(updatedDescriptions);
    
    // Then save to local storage
    setTimeout(() => {
      saveToLocal(undefined, updatedDescriptions);
      console.log('✅ Category description updated and UI updated:', { category, description });
    }, 0);
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
