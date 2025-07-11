
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { Question, CategoryDescription } from '../types/game';
import CategoryDescriptionModal from './CategoryDescriptionModal';

interface CategoryGridProps {
  categories: string[];
  questions: Question[];
  categoryDescriptions: CategoryDescription[];
  onEditQuestion: (question: Question) => void;
  onAddQuestion: (category: string, points: number) => void;
  onDeleteQuestion: (id: number) => void;
  onEditCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onUpdateCategoryDescription: (category: string, description: string) => void;
  getCategoryDescription: (category: string) => string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  questions,
  categoryDescriptions,
  onEditQuestion,
  onAddQuestion,
  onDeleteQuestion,
  onEditCategory,
  onDeleteCategory,
  onUpdateCategoryDescription,
  getCategoryDescription
}) => {
  const [editingDescriptionCategory, setEditingDescriptionCategory] = useState<string | null>(null);

  const handleDescriptionEdit = (category: string) => {
    setEditingDescriptionCategory(category);
  };

  const handleDescriptionSave = (description: string) => {
    if (editingDescriptionCategory) {
      onUpdateCategoryDescription(editingDescriptionCategory, description);
      setEditingDescriptionCategory(null);
    }
  };

  const handleDescriptionClose = () => {
    setEditingDescriptionCategory(null);
  };

  // Create a stable sort for categories to maintain order
  const categoryOrder = Array.from(new Set(questions.map(q => q.category)));
  const allCategories = [...categoryOrder];
  categories.forEach(cat => {
    if (!allCategories.includes(cat)) {
      allCategories.push(cat);
    }
  });

  console.log('🔄 CategoryGrid render - Categories:', allCategories.length, 'Questions:', questions.length);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {allCategories.map(category => {
          const categoryQuestions = questions.filter(q => q.category === category);
          
          return (
            <div key={category} className="border rounded-lg p-3 sm:p-4" style={{ backgroundColor: '#f8fafc', borderColor: '#2c5b69' }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm sm:text-base" style={{color: '#2c5b69'}}>
                  {category}
                </h4>
                <div className="flex gap-1">
                  <Button
                    onClick={() => onEditCategory(category)}
                    size="sm"
                    variant="ghost"
                    className="p-1 h-6 w-6"
                    style={{ color: '#0f766e' }}
                    title="Edit category name"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => onDeleteCategory(category)}
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
                {getCategoryDescription(category) ? (
                  <div 
                    className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                    onClick={() => handleDescriptionEdit(category)}
                    title="Click to edit description"
                  >
                    {getCategoryDescription(category)}
                  </div>
                ) : (
                  <div
                    className="text-gray-400 italic cursor-pointer hover:bg-gray-100 p-1 rounded"
                    onClick={() => handleDescriptionEdit(category)}
                    title="Click to add description"
                  >
                    + Add description
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {[100, 200, 300, 400, 500].map(points => {
                  const question = categoryQuestions.find(q => q.points === points);
                  
                  return (
                    <div key={`${category}-${points}`} className="flex items-center justify-between rounded px-2 py-1" style={{ backgroundColor: '#e2e8f0' }}>
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
                              onClick={() => onEditQuestion(question)}
                              size="sm"
                              variant="ghost"
                              className="p-1 h-6 w-6"
                              style={{ color: '#0f766e' }}
                              title={`Edit ${points} point question`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => onDeleteQuestion(question.id)}
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
                            onClick={() => onAddQuestion(category, points)}
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
          );
        })}
      </div>

      {editingDescriptionCategory && (
        <CategoryDescriptionModal
          category={editingDescriptionCategory}
          description={getCategoryDescription(editingDescriptionCategory)}
          isVisible={true}
          onSave={handleDescriptionSave}
          onClose={handleDescriptionClose}
        />
      )}
    </>
  );
};

export default CategoryGrid;
