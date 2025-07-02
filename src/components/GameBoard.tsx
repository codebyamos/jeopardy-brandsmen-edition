
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
    <div className="bg-black border-4 border-yellow-400 rounded-lg overflow-hidden shadow-2xl">
      {/* Header row with categories */}
      <div className="grid grid-cols-5 gap-1 bg-blue-800">
        {categories.map((category, index) => (
          <div
            key={index}
            className="bg-gradient-to-b from-blue-600 to-blue-800 text-yellow-300 p-4 text-center font-bold text-lg border border-yellow-400"
          >
            {category.toUpperCase()}
          </div>
        ))}
      </div>
      
      {/* Question grid */}
      {pointValues.map((points, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-1">
          {categories.map((category, colIndex) => {
            const answered = isAnswered(category, points);
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onQuestionSelect(category, points)}
                disabled={answered}
                className={`
                  h-20 text-2xl font-bold border border-yellow-400 transition-all duration-200
                  ${answered 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-b from-blue-700 to-blue-900 text-yellow-300 hover:from-blue-600 hover:to-blue-800 hover:scale-105 cursor-pointer'
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
