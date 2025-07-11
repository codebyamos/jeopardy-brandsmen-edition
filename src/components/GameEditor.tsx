
import React from 'react';
import { Question, CategoryDescription } from '../types/game';
import QuestionEditForm from './QuestionEditForm';
import CategoryEditForm from './CategoryEditForm';
import CategoryGrid from './CategoryGrid';
import GameEditorHeader from './GameEditorHeader';
import { useGameEditorState } from '../hooks/useGameEditorState';
import { useGameEditorActions } from '../hooks/useGameEditorActions';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePeriodicSave } from '../hooks/usePeriodicSave';

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
  const {
    editingQuestion,
    setEditingQuestion,
    editingCategory,
    setEditingCategory,
    showAddCategory,
    setShowAddCategory,
    newCategoryName,
    setNewCategoryName,
    isSaving,
    setIsSaving,
    isMainView,
    resetEditingState
  } = useGameEditorState();

  const { hasUnsavedChanges, clearLocalStorage } = useLocalStorage();

  const {
    triggerDatabaseSave,
    saveQuestionEdit,
    deleteQuestion,
    saveCategoryEdit,
    deleteCategory,
    addNewCategory,
    updateCategoryDescription
  } = useGameEditorActions({
    questions,
    categoryDescriptions,
    onQuestionsUpdate,
    onCategoryDescriptionsUpdate,
    setIsSaving
  });

  // Set up periodic saves every 15 minutes
  usePeriodicSave({
    questions,
    categoryDescriptions,
    onSave: triggerDatabaseSave,
    onClearLocal: clearLocalStorage,
    intervalMinutes: 15,
    enabled: hasUnsavedChanges
  });

  const categories = Array.from(new Set(questions.map(q => q.category)));

  const startEdit = (question: Question) => {
    console.log('🔧 Starting to edit question:', question.id);
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
    
    console.log('➕ Adding new question for category:', category, 'points:', points);
    setEditingQuestion(newQuestion);
    setEditingCategory(null);
    setShowAddCategory(false);
  };

  const handleSaveQuestionEdit = async (questionData: Partial<Question>) => {
    console.log('💾 Saving question edit:', questionData);
    if (editingQuestion) {
      await saveQuestionEdit(questionData, editingQuestion);
      setEditingQuestion(null);
      console.log('✅ Question edit completed and form closed');
    }
  };

  const handleAddCategory = () => {
    console.log('➕ Starting to add new category');
    setShowAddCategory(true);
    setEditingQuestion(null);
    setEditingCategory(null);
  };

  const handleAddNewCategory = async () => {
    console.log('💾 Adding new category:', newCategoryName);
    await addNewCategory(newCategoryName, categories);
    setShowAddCategory(false);
    setNewCategoryName('');
    console.log('✅ New category added and form closed');
  };

  const startEditCategory = (category: string) => {
    console.log('🔧 Starting to edit category:', category);
    setEditingCategory(category);
    setEditingQuestion(null);
    setShowAddCategory(false);
  };

  const handleSaveCategoryEdit = async (newName: string) => {
    console.log('💾 Saving category edit:', { old: editingCategory, new: newName });
    if (editingCategory) {
      await saveCategoryEdit(editingCategory, newName);
      setEditingCategory(null);
      console.log('✅ Category edit completed and form closed');
    }
  };

  const handleManualSave = async () => {
    try {
      await triggerDatabaseSave();
    } catch (error) {
      console.error('Manual save failed:', error);
    }
  };

  const getCategoryDescription = (category: string) => {
    return categoryDescriptions.find(desc => desc.category === category)?.description || '';
  };

  if (!isVisible) return null;

  console.log('🔄 GameEditor render - Questions:', questions.length, 'Categories:', categoryDescriptions.length);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white border-2 rounded-lg w-full max-w-7xl max-h-[95vh] overflow-auto shadow-2xl" style={{ borderColor: '#2c5b69' }}>
        <div className="p-4 sm:p-6">
          <GameEditorHeader
            isSaving={isSaving}
            isMainView={isMainView}
            hasUnsavedChanges={hasUnsavedChanges}
            onAddCategory={handleAddCategory}
            onManualSave={handleManualSave}
            onClose={onClose}
          />

          {showAddCategory && (
            <CategoryEditForm
              isNew={true}
              categoryName={newCategoryName}
              onCategoryNameChange={setNewCategoryName}
              onSave={handleAddNewCategory}
              onCancel={resetEditingState}
              categories={categories}
            />
          )}

          {editingCategory && (
            <CategoryEditForm
              isNew={false}
              categoryName={editingCategory}
              onSave={handleSaveCategoryEdit}
              onCancel={resetEditingState}
              categories={categories}
            />
          )}

          {editingQuestion ? (
            <QuestionEditForm
              question={editingQuestion}
              onSave={handleSaveQuestionEdit}
              onCancel={resetEditingState}
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
