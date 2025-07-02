
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Edit2, Plus, Trash2, Save, X } from 'lucide-react';
import { Question } from '../types/game';

interface GameEditorProps {
  questions: Question[];
  onQuestionsUpdate: (questions: Question[]) => void;
  isVisible: boolean;
  onClose: () => void;
}

const GameEditor: React.FC<GameEditorProps> = ({ 
  questions, 
  onQuestionsUpdate, 
  isVisible, 
  onClose 
}) => {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [tempQuestion, setTempQuestion] = useState<Partial<Question>>({});

  const categories = Array.from(new Set(questions.map(q => q.category)));

  const startEdit = (question: Question) => {
    setEditingQuestion(question);
    setTempQuestion({ ...question });
  };

  const saveEdit = () => {
    if (editingQuestion && tempQuestion.category && tempQuestion.question && tempQuestion.answer) {
      const updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id ? { ...editingQuestion, ...tempQuestion } : q
      );
      onQuestionsUpdate(updatedQuestions);
      setEditingQuestion(null);
      setTempQuestion({});
    }
  };

  const addQuestion = (category: string, points: number) => {
    const newQuestion: Question = {
      id: Date.now(),
      category,
      points,
      question: 'New Question',
      answer: 'What is the answer?'
    };
    onQuestionsUpdate([...questions, newQuestion]);
  };

  const deleteQuestion = (id: number) => {
    onQuestionsUpdate(questions.filter(q => q.id !== id));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-7xl max-h-[95vh] overflow-auto shadow-2xl">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold" style={{color: '#fa1e4e'}}>Edit Game Content</h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:text-red-400"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {editingQuestion ? (
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4">
              <h4 className="text-lg font-semibold text-white mb-4">Edit Question</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Category</label>
                  <input
                    type="text"
                    value={tempQuestion.category || ''}
                    onChange={(e) => setTempQuestion({...tempQuestion, category: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Points</label>
                  <select
                    value={tempQuestion.points || 100}
                    onChange={(e) => setTempQuestion({...tempQuestion, points: Number(e.target.value)})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm sm:text-base"
                  >
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={300}>300</option>
                    <option value={400}>400</option>
                    <option value={500}>500</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Question</label>
                  <textarea
                    value={tempQuestion.question || ''}
                    onChange={(e) => setTempQuestion({...tempQuestion, question: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm sm:text-base h-20"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Answer</label>
                  <textarea
                    value={tempQuestion.answer || ''}
                    onChange={(e) => setTempQuestion({...tempQuestion, answer: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm sm:text-base h-20"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveEdit} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button onClick={() => setEditingQuestion(null)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {categories.map(category => (
                <div key={category} className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <h4 className="text-white font-semibold mb-3 text-sm sm:text-base" style={{color: '#fa1e4e'}}>
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {[100, 200, 300, 400, 500].map(points => {
                      const question = questions.find(q => q.category === category && q.points === points);
                      return (
                        <div key={points} className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">${points}</span>
                          <div className="flex gap-1">
                            {question ? (
                              <>
                                <Button
                                  onClick={() => startEdit(question)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-gray-400 hover:text-white p-1"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => deleteQuestion(question.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={() => addQuestion(category, points)}
                                size="sm"
                                variant="ghost"
                                className="text-green-400 hover:text-green-300 p-1"
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
