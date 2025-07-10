
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Edit2, Plus, Trash2, Save, X, FolderPlus, Image, Video } from 'lucide-react';
import { Question, CategoryDescription } from '../types/game';

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
  const [tempQuestion, setTempQuestion] = useState<Partial<Question>>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempCategoryName, setTempCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const categories = Array.from(new Set(questions.map(q => q.category)));

  // Check if we're in the main view (not editing anything)
  const isMainView = !editingQuestion && !editingCategory && !showAddCategory;

  const startEdit = (question: Question) => {
    setEditingQuestion(question);
    setTempQuestion({ ...question });
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
    setTempQuestion({ ...newQuestion });
    setEditingCategory(null);
    setShowAddCategory(false);
  };

  const saveEdit = () => {
    if (editingQuestion && tempQuestion.category && tempQuestion.question && tempQuestion.answer && tempQuestion.points) {
      const existingQuestionIndex = questions.findIndex(q => q.id === editingQuestion.id);
      
      if (existingQuestionIndex === -1) {
        onQuestionsUpdate([...questions, { ...tempQuestion } as Question]);
      } else {
        const updatedQuestions = questions.map(q => 
          q.id === editingQuestion.id ? { ...q, ...tempQuestion } as Question : q
        );
        onQuestionsUpdate(updatedQuestions);
      }
      
      setEditingQuestion(null);
      setTempQuestion({});
    }
  };

  const cancelEdit = () => {
    setEditingQuestion(null);
    setTempQuestion({});
    setEditingCategory(null);
    setTempCategoryName('');
    setShowAddCategory(false);
    setNewCategoryName('');
  };

  const deleteQuestion = (id: number) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    onQuestionsUpdate(updatedQuestions);
  };

  const startEditCategory = (category: string) => {
    setEditingCategory(category);
    setTempCategoryName(category);
    setEditingQuestion(null);
    setShowAddCategory(false);
  };

  const saveEditCategory = () => {
    if (editingCategory && tempCategoryName.trim() && tempCategoryName !== editingCategory) {
      const updatedQuestions = questions.map(q => 
        q.category === editingCategory ? { ...q, category: tempCategoryName.trim() } : q
      );
      onQuestionsUpdate(updatedQuestions);

      // Update category descriptions
      const updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === editingCategory ? { ...desc, category: tempCategoryName.trim() } : desc
      );
      onCategoryDescriptionsUpdate(updatedDescriptions);
    }
    setEditingCategory(null);
    setTempCategoryName('');
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
            <div className="border rounded-lg p-4 sm:p-6 mb-4" style={{ backgroundColor: '#f8fafc', borderColor: '#2c5b69' }}>
              <h4 className="text-lg font-semibold mb-4" style={{ color: '#2c5b69' }}>Add New Category</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded text-sm sm:text-base border-2"
                  style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                  placeholder="Enter category name"
                  onKeyPress={(e) => e.key === 'Enter' && addNewCategory()}
                />
                <Button 
                  onClick={addNewCategory} 
                  className="text-white"
                  style={{ backgroundColor: '#0f766e' }}
                  disabled={!newCategoryName.trim() || categories.includes(newCategoryName.trim())}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Add
                </Button>
                <Button 
                  onClick={cancelEdit} 
                  variant="outline" 
                  className="border-2"
                  style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {editingCategory && (
            <div className="border rounded-lg p-4 sm:p-6 mb-4" style={{ backgroundColor: '#f8fafc', borderColor: '#2c5b69' }}>
              <h4 className="text-lg font-semibold mb-4" style={{ color: '#2c5b69' }}>Edit Category Name</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempCategoryName}
                  onChange={(e) => setTempCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded text-sm sm:text-base border-2"
                  style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                  placeholder="Enter category name"
                  onKeyPress={(e) => e.key === 'Enter' && saveEditCategory()}
                />
                <Button 
                  onClick={saveEditCategory} 
                  className="text-white"
                  style={{ backgroundColor: '#0f766e' }}
                  disabled={!tempCategoryName.trim()}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button 
                  onClick={cancelEdit} 
                  variant="outline" 
                  className="border-2"
                  style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {editingQuestion ? (
            <div className="border rounded-lg p-4 sm:p-6 mb-4" style={{ backgroundColor: '#f8fafc', borderColor: '#2c5b69' }}>
              <h4 className="text-lg font-semibold mb-4" style={{ color: '#2c5b69' }}>Edit Question</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>Category</label>
                  <input
                    type="text"
                    value={tempQuestion.category || ''}
                    onChange={(e) => setTempQuestion({...tempQuestion, category: e.target.value})}
                    className="w-full px-3 py-2 rounded text-sm sm:text-base border-2"
                    style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>Points</label>
                    <select
                      value={tempQuestion.points || 100}
                      onChange={(e) => setTempQuestion({...tempQuestion, points: Number(e.target.value)})}
                      className="w-full px-3 py-2 rounded text-sm sm:text-base border-2"
                      style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                    >
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={300}>300</option>
                      <option value={400}>400</option>
                      <option value={500}>500</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>Bonus Points</label>
                    <input
                      type="number"
                      value={tempQuestion.bonusPoints || 0}
                      onChange={(e) => setTempQuestion({...tempQuestion, bonusPoints: Number(e.target.value)})}
                      className="w-full px-3 py-2 rounded text-sm sm:text-base border-2"
                      style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>Question</label>
                  <textarea
                    value={tempQuestion.question || ''}
                    onChange={(e) => setTempQuestion({...tempQuestion, question: e.target.value})}
                    className="w-full px-3 py-2 rounded text-sm sm:text-base h-20 border-2"
                    style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                    placeholder="Enter the question"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>Answer</label>
                  <textarea
                    value={tempQuestion.answer || ''}
                    onChange={(e) => setTempQuestion({...tempQuestion, answer: e.target.value})}
                    className="w-full px-3 py-2 rounded text-sm sm:text-base h-20 border-2"
                    style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                    placeholder="Enter the answer (e.g., What is...?)"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>
                      <Image className="w-4 h-4 inline mr-1" />
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={tempQuestion.imageUrl || ''}
                      onChange={(e) => setTempQuestion({...tempQuestion, imageUrl: e.target.value})}
                      className="w-full px-3 py-2 rounded text-sm sm:text-base border-2"
                      style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>
                      <Video className="w-4 h-4 inline mr-1" />
                      YouTube URL (optional)
                    </label>
                    <input
                      type="url"
                      value={tempQuestion.videoUrl || ''}
                      onChange={(e) => setTempQuestion({...tempQuestion, videoUrl: e.target.value})}
                      className="w-full px-3 py-2 rounded text-sm sm:text-base border-2"
                      style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={saveEdit} 
                    className="text-white"
                    style={{ backgroundColor: '#0f766e' }}
                    disabled={!tempQuestion.category || !tempQuestion.question || !tempQuestion.answer}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                  <Button 
                    onClick={cancelEdit} 
                    variant="outline" 
                    className="border-2"
                    style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {categories.map(category => (
                <div key={category} className="border rounded-lg p-3 sm:p-4" style={{ backgroundColor: '#f8fafc', borderColor: '#2c5b69' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm sm:text-base" style={{color: '#2c5b69'}}>
                      {category}
                    </h4>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => startEditCategory(category)}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-6 w-6"
                        style={{ color: '#0f766e' }}
                        title="Edit category name"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => deleteCategory(category)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 p-1 h-6 w-6"
                        title="Delete category"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-3 min-h-[40px]">
                    {getCategoryDescription(category) || (
                      <span 
                        className="text-gray-400 italic cursor-pointer hover:bg-gray-100 p-1 rounded"
                        onClick={() => updateCategoryDescription(category, 'Add category description...')}
                      >
                        + Add description
                      </span>
                    )}
                    {getCategoryDescription(category) && (
                      <div 
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                        onClick={() => {
                          const newDesc = prompt('Edit description:', getCategoryDescription(category));
                          if (newDesc !== null) updateCategoryDescription(category, newDesc);
                        }}
                      >
                        {getCategoryDescription(category)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {[100, 200, 300, 400, 500].map(points => {
                      const question = questions.find(q => q.category === category && q.points === points);
                      return (
                        <div key={points} className="flex items-center justify-between rounded px-2 py-1" style={{ backgroundColor: '#e2e8f0' }}>
                          <span className="text-sm font-medium flex items-center gap-1" style={{ color: '#2c5b69' }}>
                            ${points}
                            {question?.bonusPoints ? (
                              <span className="text-xs bg-yellow-400 text-yellow-800 px-1 rounded">
                                +{question.bonusPoints}
                              </span>
                            ) : null}
                          </span>
                          <div className="flex gap-1">
                            {question ? (
                              <>
                                <Button
                                  onClick={() => startEdit(question)}
                                  size="sm"
                                  variant="ghost"
                                  className="p-1 h-6 w-6"
                                  style={{ color: '#0f766e' }}
                                  title={`Edit ${points} point question`}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => deleteQuestion(question.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300 p-1 h-6 w-6"
                                  title={`Delete ${points} point question`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={() => addQuestion(category, points)}
                                size="sm"
                                variant="ghost"
                                className="p-1 h-6 w-6"
                                style={{ color: '#0f766e' }}
                                title={`Add ${points} point question`}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameEditor;
