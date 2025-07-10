
import React, { useState } from 'react';
import { Question, CategoryDescription } from '../types/game';
import CategoryDescriptionModal from './CategoryDescriptionModal';

interface GameBoardProps {
  categories: string[];
  pointValues: number[];
  questions: Question[];
  answeredQuestions: Set<number>;
  categoryDescriptions: CategoryDescription[];
  onQuestionSelect: (category: string, points: number) => void;
  onCategoryDescriptionUpdate: (category: string, description: string) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  categories,
  pointValues,
  questions,
  answeredQuestions,
  categoryDescriptions,
  onQuestionSelect,
  onCategoryDescriptionUpdate
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const getQuestion = (category: string, points: number) => {
    return questions.find(q => q.category === category && q.points === points);
  };

  const isAnswered = (category: string, points: number) => {
    const question = getQuestion(category, points);
    return question && answeredQuestions.has(question.id);
  };

  const getCategoryDescription = (category: string) => {
    return categoryDescriptions.find(desc => desc.category === category)?.description || '';
  };

  const handleDescriptionSave = (category: string, description: string) => {
    onCategoryDescriptionUpdate(category, description);
  };

  return (
    <>
      <div className="flex justify-center">
        <div className="border-2 rounded-lg overflow-hidden shadow-2xl bg-white bg-opacity-95 max-w-4xl w-full" style={{ borderColor: '#2c5b69' }}>
          {/* Header row with categories */}
          <div className="grid grid-cols-5 gap-px" style={{ backgroundColor: '#2c5b69' }}>
            {categories.map((category, index) => (
              <div
                key={index}
                className="text-white p-2 sm:p-3 lg:p-4 text-center font-bold text-xs sm:text-sm lg:text-lg border-b-2 border-white"
                style={{ backgroundColor: '#2c5b69' }}
              >
                <div className="break-words">
                  {category.toUpperCase()}
                </div>
                {/* Category description */}
                <div className="mt-1">
                  {getCategoryDescription(category) ? (
                    <div
                      className="text-xs text-gray-200 italic cursor-pointer hover:text-white transition-colors"
                      onClick={() => setEditingCategory(category)}
                      title="Click to edit description"
                    >
                      {getCategoryDescription(category)}
                    </div>
                  ) : (
                    <div
                      className="text-xs text-gray-300 italic cursor-pointer hover:text-white transition-colors"
                      onClick={() => setEditingCategory(category)}
                      title="Click to add description"
                    >
                      + Add description
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Question grid */}
          {pointValues.map((points, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-5 gap-px" style={{ backgroundColor: '#2c5b69' }}>
              {categories.map((category, colIndex) => {
                const answered = isAnswered(category, points);
                const question = getQuestion(category, points);
                const hasBonus = question?.bonusPoints && question.bonusPoints > 0;
                
                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => onQuestionSelect(category, points)}
                    className="h-12 sm:h-16 lg:h-20 text-base sm:text-xl lg:text-2xl font-bold transition-all duration-200 border-r border-white last:border-r-0 hover:opacity-80 relative"
                    style={{
                      backgroundColor: answered ? '#2c5b69' : 'white',
                      color: answered ? 'white' : '#2c5b69'
                    }}
                  >
                    {answered ? '✓' : `$${points}`}
                    {hasBonus && !answered && (
                      <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-800 text-xs px-1 rounded-full font-bold">
                        +{question.bonusPoints}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <CategoryDescriptionModal
        category={editingCategory || ''}
        description={getCategoryDescription(editingCategory || '')}
        isVisible={!!editingCategory}
        onSave={(description) => handleDescriptionSave(editingCategory!, description)}
        onClose={() => setEditingCategory(null)}
      />
    </>
  );
};

export default GameBoard;
