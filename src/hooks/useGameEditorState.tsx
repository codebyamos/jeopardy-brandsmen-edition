
import { useState } from 'react';
import { Question } from '../types/game';

export const useGameEditorState = () => {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Check if we're in the main view (not editing anything)
  const isMainView = !editingQuestion && !editingCategory && !showAddCategory;

  const resetEditingState = () => {
    setEditingQuestion(null);
    setEditingCategory(null);
    setShowAddCategory(false);
    setNewCategoryName('');
  };

  return {
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
  };
};
