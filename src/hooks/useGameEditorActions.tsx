
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
      let updatedQuestions: Question[];
      
      if (existingQuestionIndex === -1) {
        // Create completely new array for new question
        updatedQuestions = [...questions, { ...questionData } as Question];
        console.log('➕ Adding new question:', questionData);
      } else {
        // Create completely new array with updated question
        updatedQuestions = questions.map(q => 
          q.id === editingQuestion.id ? { ...q, ...questionData } as Question : q
        );
        console.log('✏️ Updating existing question:', questionData);
      }
      
      // Update UI state IMMEDIATELY and SYNCHRONOUSLY
      console.log('🔄 Calling onQuestionsUpdate with:', updatedQuestions.length, 'questions');
      onQuestionsUpdate([...updatedQuestions]); // Force new array reference
      
      // Then save to local storage asynchronously
      setTimeout(() => {
        saveToLocal(updatedQuestions);
        console.log('✅ Question saved to localStorage:', questionData);
      }, 0);
    }
  };

  const deleteQuestion = (id: number) => {
    console.log('🗑️ Deleting question:', id);
    // Create completely new array without the deleted question
    const updatedQuestions = questions.filter(q => q.id !== id);
    
    // Update UI state IMMEDIATELY and SYNCHRONOUSLY
    console.log('🔄 Calling onQuestionsUpdate with:', updatedQuestions.length, 'questions after delete');
    onQuestionsUpdate([...updatedQuestions]); // Force new array reference
    
    // Then save to local storage asynchronously
    setTimeout(() => {
      saveToLocal(updatedQuestions);
      console.log('✅ Question deleted from localStorage:', id);
    }, 0);
  };

  const saveCategoryEdit = (oldName: string, newName: string) => {
    if (oldName && newName.trim() && newName !== oldName) {
      console.log('✏️ Renaming category:', { oldName, newName });
      
      // Create completely new arrays with updated category names
      const updatedQuestions = questions.map(q => 
        q.category === oldName ? { ...q, category: newName.trim() } : q
      );

      const updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === oldName ? { ...desc, category: newName.trim() } : desc
      );
      
      // Update UI state IMMEDIATELY and SYNCHRONOUSLY
      console.log('🔄 Calling updates for category rename');
      onQuestionsUpdate([...updatedQuestions]); // Force new array reference
      onCategoryDescriptionsUpdate([...updatedDescriptions]); // Force new array reference
      
      // Then save to local storage asynchronously
      setTimeout(() => {
        saveToLocal(updatedQuestions, updatedDescriptions);
        console.log('✅ Category renamed in localStorage:', { oldName, newName });
      }, 0);
    }
  };

  const deleteCategory = (category: string) => {
    if (confirm(`Are you sure you want to delete the category "${category}" and all its questions?`)) {
      console.log('🗑️ Deleting category:', category);
      
      // Create completely new arrays without the deleted category
      const updatedQuestions = questions.filter(q => q.category !== category);
      const updatedDescriptions = categoryDescriptions.filter(desc => desc.category !== category);
      
      // Update UI state IMMEDIATELY and SYNCHRONOUSLY
      console.log('🔄 Calling updates for category deletion');
      onQuestionsUpdate([...updatedQuestions]); // Force new array reference
      onCategoryDescriptionsUpdate([...updatedDescriptions]); // Force new array reference
      
      // Then save to local storage asynchronously
      setTimeout(() => {
        saveToLocal(updatedQuestions, updatedDescriptions);
        console.log('✅ Category deleted from localStorage:', category);
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
      
      // Create completely new array with the new question
      const updatedQuestions = [...questions, newQuestion];
      
      // Update UI state IMMEDIATELY and SYNCHRONOUSLY
      console.log('🔄 Calling onQuestionsUpdate for new category with:', updatedQuestions.length, 'questions');
      onQuestionsUpdate([...updatedQuestions]); // Force new array reference
      
      // Then save to local storage asynchronously
      setTimeout(() => {
        saveToLocal(updatedQuestions);
        console.log('✅ New category added to localStorage:', newCategoryName);
      }, 0);
    }
  };

  const updateCategoryDescription = (category: string, description: string) => {
    console.log('✏️ Updating category description:', { category, description });
    
    const existingIndex = categoryDescriptions.findIndex(desc => desc.category === category);
    let updatedDescriptions: CategoryDescription[];
    
    if (existingIndex >= 0) {
      // Create completely new array with updated description
      updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === category ? { ...desc, description } : desc
      );
    } else {
      // Create completely new array with new description
      updatedDescriptions = [...categoryDescriptions, { category, description }];
    }
    
    // Update UI state IMMEDIATELY and SYNCHRONOUSLY
    console.log('🔄 Calling onCategoryDescriptionsUpdate with:', updatedDescriptions.length, 'descriptions');
    onCategoryDescriptionsUpdate([...updatedDescriptions]); // Force new array reference
    
    // Then save to local storage asynchronously
    setTimeout(() => {
      saveToLocal(undefined, updatedDescriptions);
      console.log('✅ Category description updated in localStorage:', { category, description });
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
