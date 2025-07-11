
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
  answeredQuestions: Set<number>;
  setAnsweredQuestions: (answered: Set<number>) => void;
  isVisible: boolean;
  onClose: () => void;
}

const GameEditor: React.FC<GameEditorProps> = ({ 
  questions, 
  categoryDescriptions,
  onQuestionsUpdate, 
  onCategoryDescriptionsUpdate,
  answeredQuestions,
  setAnsweredQuestions,
  isVisible, 
  onClose 
}) => {
  console.log('🔄 GameEditor render - Questions length:', questions.length, 'Categories length:', categoryDescriptions.length, 'questions array:', questions.slice(0, 3));

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
    setIsSaving,
    answeredQuestions,
    setAnsweredQuestions
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

  const categories = categoryDescriptions.map(desc => desc.category);

  const startEdit = (question: Question) => {
    console.log('🔧 Starting to edit question:', question.id);
    setEditingQuestion(question);
    setEditingCategory(null);
    setShowAddCategory(false);
  };

  const addQuestion = (category: string, points: number) => {
    // Find the highest existing ID and add 1 to ensure uniqueness
    const existingIds = questions.map(q => q.id);
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const newId = maxId + 1;
    
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

  const handleSaveQuestionEdit = (questionData: Partial<Question>) => {
    console.log('💾 GameEditor: handleSaveQuestionEdit called with:', questionData);
    console.log('💾 GameEditor: Current editing question:', editingQuestion);
    console.log('💾 GameEditor: Current questions array before save:', questions.slice(0, 3));
    if (editingQuestion) {
      saveQuestionEdit(questionData, editingQuestion);
      setEditingQuestion(null);
      console.log('✅ GameEditor: Question edit form closed');
    }
  };

  const handleDeleteQuestion = (id: number) => {
    console.log('🗑️ GameEditor: handleDeleteQuestion called for ID:', id);
    deleteQuestion(id);
  };

  const handleAddCategory = () => {
    console.log('➕ GameEditor: handleAddCategory called');
    setShowAddCategory(true);
    setEditingQuestion(null);
    setEditingCategory(null);
  };

  const handleAddNewCategory = () => {
    console.log('💾 GameEditor: handleAddNewCategory called with name:', newCategoryName);
    addNewCategory(newCategoryName, categories);
    setShowAddCategory(false);
    setNewCategoryName('');
    console.log('✅ GameEditor: New category form closed');
  };

  const startEditCategory = (category: string) => {
    console.log('🔧 GameEditor: startEditCategory called for:', category);
    setEditingCategory(category);
    setEditingQuestion(null);
    setShowAddCategory(false);
  };

  const handleSaveCategoryEdit = (newName: string) => {
    console.log('💾 GameEditor: handleSaveCategoryEdit called:', { old: editingCategory, new: newName });
    console.log('💾 GameEditor: Current questions before category edit:', questions.slice(0, 3));
    if (editingCategory) {
      saveCategoryEdit(editingCategory, newName);
      setEditingCategory(null);
      console.log('✅ GameEditor: Category edit form closed');
    }
  };

  const handleDeleteCategory = (category: string) => {
    console.log('🗑️ GameEditor: handleDeleteCategory called for:', category);
    deleteCategory(category);
  };

  const handleUpdateCategoryDescription = (category: string, description: string) => {
    console.log('💾 GameEditor: handleUpdateCategoryDescription called:', { category, description });
    updateCategoryDescription(category, description);
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
              key="add-category"
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
              key={`edit-category-${editingCategory}`}
              isNew={false}
              categoryName={editingCategory}
              onSave={handleSaveCategoryEdit}
              onCancel={resetEditingState}
              categories={categories}
            />
          )}

          {editingQuestion ? (
            <QuestionEditForm
              key={`edit-question-${editingQuestion.id}`}
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
              onDeleteQuestion={handleDeleteQuestion}
              onEditCategory={startEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onUpdateCategoryDescription={handleUpdateCategoryDescription}
              getCategoryDescription={getCategoryDescription}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GameEditor;
