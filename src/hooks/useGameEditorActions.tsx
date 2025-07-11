
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
  const { saveToLocalStorage } = useLocalStorage();
  const { toast } = useToast();

  const saveToLocal = (updatedQuestions?: Question[], updatedDescriptions?: CategoryDescription[]) => {
    const questionsToSave = updatedQuestions || questions;
    const descriptionsToSave = updatedDescriptions || categoryDescriptions;
    
    // Save to localStorage for immediate local testing
    saveToLocalStorage(questionsToSave, descriptionsToSave);
    console.log('💾 GameEditor: Saved changes locally for testing');
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
      saveToLocal(updatedQuestions);
    }
  };

  const deleteQuestion = async (id: number) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    onQuestionsUpdate(updatedQuestions);
    saveToLocal(updatedQuestions);
  };

  const saveCategoryEdit = async (oldName: string, newName: string) => {
    if (oldName && newName.trim() && newName !== oldName) {
      const updatedQuestions = questions.map(q => 
        q.category === oldName ? { ...q, category: newName.trim() } : q
      );

      const updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === oldName ? { ...desc, category: newName.trim() } : desc
      );
      
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      saveToLocal(updatedQuestions, updatedDescriptions);
    }
  };

  const deleteCategory = async (category: string) => {
    if (confirm(`Are you sure you want to delete the category "${category}" and all its questions?`)) {
      const updatedQuestions = questions.filter(q => q.category !== category);
      const updatedDescriptions = categoryDescriptions.filter(desc => desc.category !== category);
      
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
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
      onQuestionsUpdate(updatedQuestions);
      saveToLocal(updatedQuestions);
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
    
    onCategoryDescriptionsUpdate(updatedDescriptions);
    saveToLocal(undefined, updatedDescriptions);
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
