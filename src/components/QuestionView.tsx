
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
      <div className="flex justify-between items-start mb-2">
        {isTimerEnabled && (
          <div className="flex justify-center">
            <QuestionTimer 
              duration={timerDuration}
              onTimeUp={onTimeUp}
            />
          </div>
        )}
        <Button
          onClick={onShowAnswer}
          className="text-white hover:opacity-90 font-bold max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg text-base sm:text-lg md:text-xl px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4"
          style={{ backgroundColor: '#0f766e' }}
        >
          Reveal Answer
        </Button>
      </div>
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
      ) : question.imageUrl ? (
        <div className="flex flex-col lg:flex-row gap-6 mb-6 items-stretch">
          <div className="flex-1 order-1 lg:order-1 flex items-center">
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
              imageUrl={question.imageUrl}
            />
          </div>
        </div>
      ) : (
        <>
          <QuestionContent
            question={question}
            isSpeaking={isSpeaking}
            currentSpeech={currentSpeech}
            onSpeak={onSpeak}
            onStop={onStop}
          />
        </>
      )}
    </>
  );
};

export default QuestionView;
