
import React from 'react';
import { Question } from '../types/game';
import { Button } from './ui/button';
import QuestionContent from './QuestionContent';
import QuestionTimer from './QuestionTimer';
import MediaSection from './MediaSection';

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
      
      {/* Desktop layout: side by side for video, stacked for mobile */}
      {question.videoUrl ? (
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-1 order-1 lg:order-1">
            <QuestionContent
              question={question}
              isSpeaking={isSpeaking}
              currentSpeech={currentSpeech}
              onSpeak={onSpeak}
              onStop={onStop}
            />
          </div>
          <div className="flex-1 order-2 lg:order-2">
            <MediaSection 
              videoUrl={question.videoUrl}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Question first */}
          <QuestionContent
            question={question}
            isSpeaking={isSpeaking}
            currentSpeech={currentSpeech}
            onSpeak={onSpeak}
            onStop={onStop}
          />
          
          {/* Then image if exists */}
          {question.imageUrl && (
            <div className="mb-4">
              <MediaSection 
                imageUrl={question.imageUrl}
              />
            </div>
          )}
        </>
      )}
      
      <div className="mt-4 sm:mt-6 text-center">
        <Button
          onClick={onShowAnswer}
          className="text-white hover:opacity-90 text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 font-bold"
          style={{ backgroundColor: '#0f766e' }}
        >
          Reveal Answer
        </Button>
      </div>
    </>
  );
};

export default QuestionView;
