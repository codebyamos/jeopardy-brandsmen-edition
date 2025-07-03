
import React from 'react';
import { Question } from '../types/game';
import AnswerContent from './AnswerContent';

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
    <AnswerContent
      question={question}
      isSpeaking={isSpeaking}
      currentSpeech={currentSpeech}
      onSpeak={onSpeak}
      onStop={onStop}
    />
  );
};

export default AnswerView;
