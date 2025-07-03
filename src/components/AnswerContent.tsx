
import React from 'react';
import { Question } from '../types/game';
import VoiceControl from './VoiceControl';

interface AnswerContentProps {
  question: Question;
  isSpeaking: boolean;
  currentSpeech: 'question' | 'answer' | null;
  onSpeak: (text: string, type: 'question' | 'answer') => void;
  onStop: () => void;
}

const AnswerContent: React.FC<AnswerContentProps> = ({
  question,
  isSpeaking,
  currentSpeech,
  onSpeak,
  onStop
}) => {
  return (
    <div className="text-center">
      <VoiceControl
        text={question.answer}
        type="answer"
        isSpeaking={isSpeaking}
        currentSpeech={currentSpeech}
        onSpeak={onSpeak}
        onStop={onStop}
      />
      <div className="modal-text-container">
        <p className="modal-answer-text text-white font-bold px-2">
          {question.answer}
        </p>
      </div>
    </div>
  );
};

export default AnswerContent;
