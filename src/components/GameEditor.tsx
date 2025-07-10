import React, { useState } from 'react';
import { Button } from './ui/button';
import { Edit2, Plus, Trash2, Save, X, FolderPlus } from 'lucide-react';
import { Question, CategoryDescription } from '../types/game';
import QuestionEditForm from './QuestionEditForm';
import CategoryEditForm from './CategoryEditForm';
import CategoryGrid from './CategoryGrid';
import { useGameData } from '../hooks/useGameData';
import { useToast } from '../hooks/use-toast';

interface GameEditorProps {
  questions: Question[];
  categoryDescriptions: CategoryDescription[];
  onQuestionsUpdate: (questions: Question[]) => void;
  onCategoryDescriptionsUpdate: (descriptions: CategoryDescription[]) => void;
  isVisible: boolean;
  onClose: () => void;
}

const GameEditor: React.FC<GameEditorProps> = ({ 
  questions, 
  categoryDescriptions,
  onQuestionsUpdate, 
  onCategoryDescriptionsUpdate,
  isVisible, 
  onClose 
}) => {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { saveGame } = useGameData();
  const { toast } = useToast();

  const categories = Array.from(new Set(questions.map(q => q.category)));

  // Check if we're in the main view (not editing anything)
  const isMainView = !editingQuestion && !editingCategory && !showAddCategory;

  const triggerAutoSave = async (updatedQuestions?: Question[], updatedDescriptions?: CategoryDescription[]) => {
    if (isSaving) return; // Prevent concurrent saves
    
    setIsSaving(true);
    try {
      console.log('GameEditor: Starting auto-save with:', {
        questionsCount: updatedQuestions?.length || questions.length,
        descriptionsCount: updatedDescriptions?.length || categoryDescriptions.length
      });
      
      // Use empty players array since we're only saving content changes
      const players = [{ id: 1, name: 'Team 1', score: 0 }, { id: 2, name: 'Team 2', score: 0 }];
      await saveGame(
        players,
        updatedQuestions || questions,
        [],
        updatedDescriptions || categoryDescriptions,
        undefined,
        false // Auto-save, not manual
      );
      
      console.log('GameEditor: Auto-save completed successfully');
      toast({
        title: "Saved",
        description: "Changes saved successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error('GameEditor: Auto-save failed:', error);
      toast({
        title: "Save Error",
        description: `Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (question: Question) => {
    setEditingQuestion(question);
    setEditingCategory(null);
    setShowAddCategory(false);
  };

  const addQuestion = (category: string, points: number) => {
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    const newQuestion: Question = {
      id: newId,
      category,
      points,
      question: '',
      answer: '',
      bonusPoints: 0,
      imageUrl: '',
      videoUrl: ''
    };
    
    setEditingQuestion(newQuestion);
    setEditingCategory(null);
    setShowAddCategory(false);
  };

  const saveQuestionEdit = async (questionData: Partial<Question>) => {
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
      setEditingQuestion(null);
      
      // Auto-save after question edit
      await triggerAutoSave(updatedQuestions);
    }
  };

  const cancelEdit = () => {
    setEditingQuestion(null);
    setEditingCategory(null);
    setShowAddCategory(false);
    setNewCategoryName('');
  };

  const deleteQuestion = async (id: number) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    
    // Update state immediately
    onQuestionsUpdate(updatedQuestions);
    
    // Auto-save after question delete
    await triggerAutoSave(updatedQuestions);
  };

  const startEditCategory = (category: string) => {
    setEditingCategory(category);
    setEditingQuestion(null);
    setShowAddCategory(false);
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
      
      // Auto-save after category edit
      await triggerAutoSave(updatedQuestions, updatedDescriptions);
    }
    setEditingCategory(null);
  };

  const deleteCategory = async (category: string) => {
    if (confirm(`Are you sure you want to delete the category "${category}" and all its questions?`)) {
      const updatedQuestions = questions.filter(q => q.category !== category);
      const updatedDescriptions = categoryDescriptions.filter(desc => desc.category !== category);
      
      // Update state immediately
      onQuestionsUpdate(updatedQuestions);
      onCategoryDescriptionsUpdate(updatedDescriptions);
      
      // Auto-save after category delete
      await triggerAutoSave(updatedQuestions, updatedDescriptions);
    }
  };

  const addNewCategory = async () => {
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
      setShowAddCategory(false);
      setNewCategoryName('');
      
      // Auto-save after adding new category
      await triggerAutoSave(updatedQuestions);
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
    
    // Auto-save after description update
    await triggerAutoSave(undefined, updatedDescriptions);
  };

  const getCategoryDescription = (category: string) => {
    return categoryDescriptions.find(desc => desc.category === category)?.description || '';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white border-2 rounded-lg w-full max-w-7xl max-h-[95vh] overflow-auto shadow-2xl" style={{ borderColor: '#2c5b69' }}>
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-bold" style={{color: '#2c5b69'}}>Edit Game Content</h3>
              {isSaving && (
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  Saving...
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {isMainView && (
                <Button
                  onClick={() => setShowAddCategory(true)}
                  size="sm"
                  className="text-white"
                  style={{ backgroundColor: '#0f766e' }}
                  disabled={isSaving}
                >
                  <FolderPlus className="w-4 h-4 mr-1" />
                  Add Category
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:text-red-400"
                style={{ backgroundColor: '#2c5b69' }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {showAddCategory && (
            <CategoryEditForm
              isNew={true}
              categoryName={newCategoryName}
              onCategoryNameChange={setNewCategoryName}
              onSave={addNewCategory}
              onCancel={cancelEdit}
              categories={categories}
            />
          )}

          {editingCategory && (
            <CategoryEditForm
              isNew={false}
              categoryName={editingCategory}
              onSave={(newName) => saveCategoryEdit(editingCategory, newName)}
              onCancel={cancelEdit}
              categories={categories}
            />
          )}

          {editingQuestion ? (
            <QuestionEditForm
              question={editingQuestion}
              onSave={saveQuestionEdit}
              onCancel={cancelEdit}
            />
          ) : (
            <CategoryGrid
              categories={categories}
              questions={questions}
              categoryDescriptions={categoryDescriptions}
              onEditQuestion={startEdit}
              onAddQuestion={addQuestion}
              onDeleteQuestion={deleteQuestion}
              onEditCategory={startEditCategory}
              onDeleteCategory={deleteCategory}
              onUpdateCategoryDescription={updateCategoryDescription}
              getCategoryDescription={getCategoryDescription}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GameEditor;
