import React from 'react';
import { Question, Player } from '../types/game';
import { useTimerSettings } from '../hooks/useTimerSettings';
import { useQuestionModalLogic } from './QuestionModalLogic';
import QuestionModalHeader from './QuestionModalHeader';
import QuestionView from './QuestionView';
import AnswerView from './AnswerView';
import BonusPointsDisplay from './BonusPointsDisplay';
import PlayerScores from './PlayerScores';

interface QuestionModalProps {
  question: Question;
  players: Player[];
  onClose: () => void;
  onScorePlayer: (playerId: number, points: number) => void;
  answeredQuestions: Set<number>;
  setAnsweredQuestions: (answered: Set<number>) => void;
  setPlayers?: (players: Player[]) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ 
  question, 
  players, 
  onClose, 
  onScorePlayer, 
  answeredQuestions, 
  setAnsweredQuestions,
  setPlayers
}) => {
  const { settings: timerSettings } = useTimerSettings();

  const [localAnswered, setLocalAnswered] = React.useState(answeredQuestions.has(question.id));

  // Always mark as answered when opening the modal, unless toggled off
  React.useEffect(() => {
    if (!answeredQuestions.has(question.id)) {
      const next = new Set([...answeredQuestions, question.id]);
      setAnsweredQuestions(next);
      setLocalAnswered(true);
    } else {
      setLocalAnswered(true);
    }
  }, [question.id]);

  // Sync local state with parent state when parent changes (for toggle)
  React.useEffect(() => {
    setLocalAnswered(answeredQuestions.has(question.id));
  }, [answeredQuestions, question.id]);

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
      
      <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white border-2 rounded-lg w-full max-w-6xl max-h-[95vh] overflow-auto shadow-2xl" style={{ borderColor: '#2c5b69', paddingBottom: 0, padding: 0 }}>
          <div className="pt-4 sm:pt-6 lg:pt-8 pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8 relative" style={{paddingBottom: 0}}>
            <QuestionModalHeader 
              category={question.category}
              points={question.points}
              bonusPoints={question.bonusPoints}
              isTimerEnabled={isTimerEnabled}
              showTimerToggle={!showAnswer}
              onClose={handleClose}
              onTimerToggle={() => setIsTimerEnabled(!isTimerEnabled)}
              isAnswerModal={!!showAnswer}
              isAnswered={localAnswered}
              onToggleAnswered={(checked: boolean) => {
                setLocalAnswered(checked);
                // Always create a new Set to trigger React re-render
                let next;
                if (checked) {
                  next = new Set([...answeredQuestions, question.id]);
                } else {
                  next = new Set([...answeredQuestions].filter(id => id !== question.id));
                }
                setAnsweredQuestions(next);
              }}
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
          <div className="w-full flex justify-center" style={{ position: 'sticky', bottom: 0, marginBottom: '12px', zIndex: 2 }}>
            <PlayerScores 
              players={players} 
              onScoreChange={onScorePlayer}
              setPlayers={setPlayers}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionModal;
