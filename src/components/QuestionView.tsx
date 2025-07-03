
import React from 'react';
import { Question } from '../types/game';
import { Button } from './ui/button';
import QuestionContent from './QuestionContent';
import QuestionTimer from './QuestionTimer';

interface QuestionViewProps {
  question: Question;
  isSpeaking: boolean;
  currentSpeech: 'question' | 'answer' | null;
  isTimerEnabled: boolean;
  timerDuration: number;
  onSpeak: (text: string, type: 'question' | 'answer') => void;
  onStop: () => void;
  onShowAnswer: () => void;
  onTimeUp: () => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  isSpeaking,
  currentSpeech,
  isTimerEnabled,
  timerDuration,
  onSpeak,
  onStop,
  onShowAnswer,
  onTimeUp
}) => {
  return (
    <>
      {isTimerEnabled && (
        <div className="flex justify-center mb-4">
          <QuestionTimer 
            duration={timerDuration}
            onTimeUp={onTimeUp}
          />
        </div>
      )}
      
      <QuestionContent
        question={question}
        isSpeaking={isSpeaking}
        currentSpeech={currentSpeech}
        onSpeak={onSpeak}
        onStop={onStop}
      />
      
      <div className="mt-4 sm:mt-6 text-center">
        <Button
          onClick={onShowAnswer}
          className="bg-yellow-500 text-black hover:bg-yellow-400 text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 font-bold"
          style={{backgroundColor: '#fa1e4e'}}
        >
          Reveal Answer
        </Button>
      </div>
    </>
  );
};

export default QuestionView;
