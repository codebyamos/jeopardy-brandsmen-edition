
import React from 'react';
import { Question } from '../types/game';

interface GameBoardProps {
  categories: string[];
  pointValues: number[];
  questions: Question[];
  answeredQuestions: Set<number>;
  onQuestionSelect: (category: string, points: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  categories,
  pointValues,
  questions,
  answeredQuestions,
  onQuestionSelect
}) => {
  const getQuestion = (category: string, points: number) => {
    return questions.find(q => q.category === category && q.points === points);
  };

  const isAnswered = (category: string, points: number) => {
    const question = getQuestion(category, points);
    return question && answeredQuestions.has(question.id);
  };

  return (
    <div className="bg-gray-900 border-2 border-gray-700 rounded-lg overflow-hidden shadow-2xl">
      {/* Header row with categories */}
      <div className="grid grid-cols-5 gap-px bg-gray-800" style={{ background: '#fa1e4e' }}>
        {categories.map((category, index) => (
          <div
            key={index}
            className="category-header bg-gradient-to-b from-gray-800 to-gray-900 text-yellow-400 p-2 sm:p-3 lg:p-4 text-center font-bold text-xs sm:text-sm lg:text-lg border-b border-gray-700"
          >
            <div className="break-words">
              {category.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
      
      {/* Question grid */}
      {pointValues.map((points, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-px bg-gray-800">
          {categories.map((category, colIndex) => {
            const answered = isAnswered(category, points);
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onQuestionSelect(category, points)}
                disabled={answered}
                className={`
                  questions-item h-12 sm:h-16 lg:h-20 text-base sm:text-xl lg:text-2xl font-bold transition-all duration-200 border-r border-gray-700 last:border-r-0
                  ${answered 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-b from-blue-800 to-blue-900 text-yellow-400 hover:from-blue-700 hover:to-blue-800 hover:scale-105 cursor-pointer shadow-lg'
                  }
                `}
              >
                {answered ? '✓' : `$${points}`}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
