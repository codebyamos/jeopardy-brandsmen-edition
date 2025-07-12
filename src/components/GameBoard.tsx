
import React, { useState } from 'react';
import { Question, CategoryDescription } from '../types/game';
import CategoryDescriptionModal from './CategoryDescriptionModal';
import CategoryDescriptionIcon from './CategoryDescriptionIcon';
import '../styles/category-desc.css';

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
  React.useEffect(() => {
    console.log('[GameBoard] answeredQuestions:', Array.from(answeredQuestions));
  }, [answeredQuestions]);

  const getQuestion = (category: string, points: number) => {
    return questions.find(q => q.category === category && q.points === points);
  };

  const isAnswered = (category: string, points: number) => {
    const question = getQuestion(category, points);
    return question && answeredQuestions.has(question.id);
  };

  const getCategoryDescription = (category: string) => {
    return categoryDescriptions.find(
      desc => desc.category.toLowerCase() === category.toLowerCase()
    )?.description || '';
  };

  const [descModal, setDescModal] = useState<{ category: string; description: string } | null>(null);

  return (
    <div className="flex justify-center">
      <div className="border-2 rounded-lg overflow-hidden shadow-2xl bg-white bg-opacity-95 max-w-7xl w-full" style={{ borderColor: '#2c5b69' }}>
        {/* Header row with categories */}
        <div className="grid grid-cols-5 gap-px" style={{ backgroundColor: '#2c5b69' }}>
          {categories.map((category, index) => {
            const desc = getCategoryDescription(category);
            const isLong = desc.length > 145;
            const shortDesc = isLong ? desc.slice(0, 145) + '...' : desc;
            return (
              <div
                key={index}
                className="text-white p-2 sm:p-3 lg:p-4 text-center font-bold text-xs sm:text-sm lg:text-lg border-b-2 border-white"
                style={{ backgroundColor: '#2c5b69' }}
              >
                <div className="break-words category-name-container">
                  <span style={{ display: 'block' }}>{category.toUpperCase()}</span>
                </div>
                {/* Category description - display only */}
                <div className="mt-1 flex items-center justify-center">
                  {desc && (
                    <div className={`text-xs text-gray-200 italic categories-about flex flex-col items-center gameboard-desc-container ${isLong ? 'has-long-desc' : ''}`}>
                                    <span className="gameboard-desc-text w-full" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                        {isLong ? `${desc.slice(0, 145)}...` : desc}
                                    </span>
                                    <div className="mt-1 gameboard-desc-icon">
                                        <CategoryDescriptionIcon onClick={() => setDescModal({ category, description: desc })} />
                                    </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Question grid */}
        {pointValues.map((points, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-px" style={{ backgroundColor: '#2c5b69' }}>
            {categories.map((category, colIndex) => {
              const question = getQuestion(category, points);
              const answered = question ? answeredQuestions.has(question.id) : false;
              console.log('[GameBoard Button] category:', category, 'points:', points, 'questionId:', question?.id, 'answered:', answered);
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
      {/* Category Description Modal - always read-only on the game board */}
      {descModal && (
        <CategoryDescriptionModal
          category={descModal.category}
          description={descModal.description}
          isVisible={true}
          onClose={() => setDescModal(null)}
          readOnly={true}
        />
      )}
    </div>
  );
};

export default GameBoard;
