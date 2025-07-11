
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
    
    setTimeout(() => {
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
        // Updating existing question
        updatedQuestions = questions.map(q => 
          q.id === editingQuestion.id ? { ...q, ...questionData } as Question : q
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
    
    onQuestionsUpdate(updatedQuestions);
    saveToLocal(updatedQuestions);
    console.log('✅ Question deleted');
  };

  const saveCategoryEdit = (oldName: string, newName: string) => {
    console.log('🔧 saveCategoryEdit called:', { oldName, newName });
    
    if (oldName && newName.trim() && newName !== oldName) {
      const updatedQuestions = questions.map(q => 
        q.category === oldName ? { ...q, category: newName.trim() } : q
      );

      const updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === oldName ? { ...desc, category: newName.trim() } : desc
      );
      
      console.log('🚀 Calling state updates for category rename');
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      
      saveToLocal(updatedQuestions, updatedDescriptions);
      console.log('✅ Category renamed');
    }
  };

  const deleteCategory = (category: string) => {
    console.log('🔧 deleteCategory called for:', category);
    
    if (confirm(`Are you sure you want to delete the category "${category}" and all its questions?`)) {
      const updatedQuestions = questions.filter(q => q.category !== category);
      const updatedDescriptions = categoryDescriptions.filter(desc => desc.category !== category);
      
      console.log('🚀 Calling state updates for category deletion');
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      
      saveToLocal(updatedQuestions, updatedDescriptions);
      console.log('✅ Category deleted');
    }
  };

  const addNewCategory = (newCategoryName: string, categories: string[]) => {
    console.log('🔧 addNewCategory called:', newCategoryName);
    
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
      
      console.log('🚀 Calling onQuestionsUpdate for new category. New length:', updatedQuestions.length);
      onQuestionsUpdate(updatedQuestions);
      
      saveToLocal(updatedQuestions);
      console.log('✅ New category added');
    }
  };

  const updateCategoryDescription = (category: string, description: string) => {
    console.log('🔧 updateCategoryDescription called:', { category, description });
    
    const existingIndex = categoryDescriptions.findIndex(desc => desc.category === category);
    let updatedDescriptions: CategoryDescription[];
    
    if (existingIndex >= 0) {
      updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === category ? { ...desc, description } : desc
      );
    } else {
      updatedDescriptions = [...categoryDescriptions, { category, description }];
    }
    
    console.log('🚀 Calling onCategoryDescriptionsUpdate. New length:', updatedDescriptions.length);
    onCategoryDescriptionsUpdate(updatedDescriptions);
    
    saveToLocal(undefined, updatedDescriptions);
    console.log('✅ Category description updated');
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
