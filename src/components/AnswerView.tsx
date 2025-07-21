
import React from 'react';
import { Question } from '../types/game';
import AnswerContent from './AnswerContent';
import MediaSection from './MediaSection';

interface AnswerViewProps {
  question: Question;
  isSpeaking: boolean;
  currentSpeech: 'question' | 'answer' | null;
  onSpeak: (text: string, type: 'question' | 'answer') => void;
  onStop: () => void;
}

const AnswerView: React.FC<AnswerViewProps> = ({
  question,
  isSpeaking,
  currentSpeech,
  onSpeak,
  onStop
}) => {
  return (
    <>
      {/* Desktop layout: side by side for video, stacked for mobile */}
      {(question.videoUrl && (question.mediaAssignment === 'answer' || question.mediaAssignment === 'both' || !question.mediaAssignment)) ? (
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {question.answer && (
            <div className="flex-1 order-1 lg:order-1">
              <AnswerContent
                question={question}
                isSpeaking={isSpeaking}
                currentSpeech={currentSpeech}
                onSpeak={onSpeak}
                onStop={onStop}
              />
            </div>
          )}
          <div className={`flex-1 order-2 lg:order-2 ${!question.answer ? 'w-full' : ''}`}>
            <MediaSection 
              videoUrl={question.videoUrl}
            />
          </div>
        </div>
      ) : (question.imageUrl && (question.mediaAssignment === 'answer' || question.mediaAssignment === 'both' || !question.mediaAssignment)) ? (
        <div className="flex flex-col lg:flex-row gap-6 mb-6 items-stretch">
          {question.answer && (
            <div className="flex-1 order-1 lg:order-1 flex items-center">
              <AnswerContent
                question={question}
                isSpeaking={isSpeaking}
                currentSpeech={currentSpeech}
                onSpeak={onSpeak}
                onStop={onStop}
              />
            </div>
          )}
          <div className={`flex-1 order-2 lg:order-2 ${!question.answer ? 'w-full' : ''}`}>
            <MediaSection 
              imageUrl={question.imageUrl}
            />
          </div>
        </div>
      ) : question.answer ? (
        <>
          <AnswerContent
            question={question}
            isSpeaking={isSpeaking}
            currentSpeech={currentSpeech}
            onSpeak={onSpeak}
            onStop={onStop}
          />
        </>
      ) : null}
    </>
  );
};

export default AnswerView;
