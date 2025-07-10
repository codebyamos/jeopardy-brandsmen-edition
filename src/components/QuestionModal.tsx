
import React from 'react';
import { Question, Player } from '../types/game';
import { useTimerSettings } from '../hooks/useTimerSettings';
import { useQuestionModalLogic } from './QuestionModalLogic';
import QuestionModalHeader from './QuestionModalHeader';
import QuestionView from './QuestionView';
import AnswerView from './AnswerView';
import BonusPointsDisplay from './BonusPointsDisplay';

interface QuestionModalProps {
  question: Question;
  players: Player[];
  onClose: () => void;
  onScorePlayer: (playerId: number, points: number) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ 
  question, 
  players, 
  onClose, 
  onScorePlayer 
}) => {
  const { settings: timerSettings } = useTimerSettings();
  
  const {
    showAnswer,
    isSpeaking,
    currentSpeech,
    isTimerEnabled,
    showBonusPoints,
    setIsTimerEnabled,
    speakText,
    stopSpeaking,
    handleShowAnswer,
    handleTimeUp
  } = useQuestionModalLogic({ question });

  const handleClose = () => {
    console.log('Modal closing, stopping speech');
    stopSpeaking();
    onClose();
  };

  return (
    <>
      <BonusPointsDisplay 
        bonusPoints={question.bonusPoints || 0} 
        isVisible={showBonusPoints} 
      />
      
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white border-2 rounded-lg w-full max-w-6xl max-h-[95vh] overflow-auto shadow-2xl" style={{ borderColor: '#2c5b69' }}>
          <div className="p-4 sm:p-6 lg:p-8 relative">
            <QuestionModalHeader 
              category={question.category}
              points={question.points}
              bonusPoints={question.bonusPoints}
              isTimerEnabled={isTimerEnabled}
              showTimerToggle={!showAnswer}
              onClose={handleClose}
              onTimerToggle={() => setIsTimerEnabled(!isTimerEnabled)}
            />
            
            {showAnswer ? (
              <AnswerView
                question={question}
                isSpeaking={isSpeaking}
                currentSpeech={currentSpeech}
                onSpeak={speakText}
                onStop={stopSpeaking}
              />
            ) : (
              <QuestionView
                question={question}
                isSpeaking={isSpeaking}
                currentSpeech={currentSpeech}
                isTimerEnabled={isTimerEnabled}
                timerDuration={timerSettings.timerDuration}
                onSpeak={speakText}
                onStop={stopSpeaking}
                onShowAnswer={handleShowAnswer}
                onTimeUp={handleTimeUp}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionModal;
