
import React from 'react';
import { Question } from '../types/game';
import VoiceControl from './VoiceControl';

interface QuestionContentProps {
  question: Question;
  isSpeaking: boolean;
  currentSpeech: 'question' | 'answer' | null;
  onSpeak: (text: string, type: 'question' | 'answer') => void;
  onStop: () => void;
}

const QuestionContent: React.FC<QuestionContentProps> = ({
  question,
  isSpeaking,
  currentSpeech,
  onSpeak,
  onStop
}) => {
  return (
    <div className="text-center">
      {question.question && (
        <>
          <VoiceControl
            text={question.question}
            type="question"
            isSpeaking={isSpeaking}
            currentSpeech={currentSpeech}
            onSpeak={onSpeak}
            onStop={onStop}
          />
          <div className="modal-text-container">
            <p className="modal-question-text font-bold px-2 leading-relaxed" style={{ color: '#2c5b69' }}>
              {question.question}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionContent;
