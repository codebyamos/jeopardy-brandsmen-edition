
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Edit2, Plus, Trash2, Save, X, FolderPlus } from 'lucide-react';
import { Question, CategoryDescription } from '../types/game';
import QuestionEditForm from './QuestionEditForm';
import CategoryEditForm from './CategoryEditForm';
import CategoryGrid from './CategoryGrid';

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

  const categories = Array.from(new Set(questions.map(q => q.category)));

  // Check if we're in the main view (not editing anything)
  const isMainView = !editingQuestion && !editingCategory && !showAddCategory;

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

  const saveQuestionEdit = (questionData: Partial<Question>) => {
    if (editingQuestion && questionData.category && questionData.question && questionData.answer && questionData.points) {
      const existingQuestionIndex = questions.findIndex(q => q.id === editingQuestion.id);
      
      if (existingQuestionIndex === -1) {
        onQuestionsUpdate([...questions, { ...questionData } as Question]);
      } else {
        const updatedQuestions = questions.map(q => 
          q.id === editingQuestion.id ? { ...q, ...questionData } as Question : q
        );
        onQuestionsUpdate(updatedQuestions);
      }
      
      setEditingQuestion(null);
    }
  };

  const cancelEdit = () => {
    setEditingQuestion(null);
    setEditingCategory(null);
    setShowAddCategory(false);
    setNewCategoryName('');
  };

  const deleteQuestion = (id: number) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    onQuestionsUpdate(updatedQuestions);
  };

  const startEditCategory = (category: string) => {
    setEditingCategory(category);
    setEditingQuestion(null);
    setShowAddCategory(false);
  };

  const saveCategoryEdit = (oldName: string, newName: string) => {
    if (oldName && newName.trim() && newName !== oldName) {
      const updatedQuestions = questions.map(q => 
        q.category === oldName ? { ...q, category: newName.trim() } : q
      );
      onQuestionsUpdate(updatedQuestions);

      // Update category descriptions
      const updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === oldName ? { ...desc, category: newName.trim() } : desc
      );
      onCategoryDescriptionsUpdate(updatedDescriptions);
    }
    setEditingCategory(null);
  };

  const deleteCategory = (category: string) => {
    if (confirm(`Are you sure you want to delete the category "${category}" and all its questions?`)) {
      const updatedQuestions = questions.filter(q => q.category !== category);
      onQuestionsUpdate(updatedQuestions);
      
      const updatedDescriptions = categoryDescriptions.filter(desc => desc.category !== category);
      onCategoryDescriptionsUpdate(updatedDescriptions);
    }
  };

  const addNewCategory = () => {
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
      onQuestionsUpdate([...questions, newQuestion]);
      setShowAddCategory(false);
      setNewCategoryName('');
    }
  };

  const updateCategoryDescription = (category: string, description: string) => {
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
            <h3 className="text-xl sm:text-2xl font-bold" style={{color: '#2c5b69'}}>Edit Game Content</h3>
            <div className="flex gap-2">
              {isMainView && (
                <Button
                  onClick={() => setShowAddCategory(true)}
                  size="sm"
                  className="text-white"
                  style={{ backgroundColor: '#0f766e' }}
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
