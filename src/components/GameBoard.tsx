
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

  return (
    <div className="flex justify-center">
      <div className="border-2 rounded-lg overflow-hidden shadow-2xl bg-white bg-opacity-95 max-w-7xl w-full" style={{ borderColor: '#2c5b69' }}>
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
              {/* Category description - display only */}
              <div className="mt-1">
                {getCategoryDescription(category) && (
                  <div className="text-xs text-gray-200 italic">
                    {getCategoryDescription(category)}
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
              
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => onQuestionSelect(category, points)}
                  className="h-12 sm:h-16 lg:h-20 text-base sm:text-xl lg:text-2xl font-bold transition-all duration-200 border-r border-white last:border-r-0 hover:opacity-80"
                  style={{
                    backgroundColor: answered ? '#2c5b69' : 'white',
                    color: answered ? 'white' : '#2c5b69'
                  }}
                >
                  {answered ? '✓' : `$${points}`}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
