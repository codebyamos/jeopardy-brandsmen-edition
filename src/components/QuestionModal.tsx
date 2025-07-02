
import React, { useState, useEffect } from 'react';
import { Question, Player } from '../types/game';
import { Button } from '../components/ui/button';
import { Volume2 } from 'lucide-react';
import ScoreSelector from './ScoreSelector';

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
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Auto-read the question when modal opens
    speakText(question.question);
  }, [question.question]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
    speakText(question.answer);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-yellow-400 text-xl font-semibold mb-2">
              {question.category.toUpperCase()}
            </div>
            <div className="text-yellow-400 text-3xl font-bold">
              ${question.points}
            </div>
          </div>
          
          {/* Question */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-yellow-400 text-lg font-semibold">QUESTION:</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => speakText(question.question)}
                  disabled={isSpeaking}
                  variant="outline"
                  size="sm"
                  className="bg-yellow-500 text-black hover:bg-yellow-400 border-yellow-500"
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  Read Question
                </Button>
                {isSpeaking && (
                  <Button
                    onClick={stopSpeaking}
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Stop
                  </Button>
                )}
              </div>
            </div>
            <p className="text-white text-xl leading-relaxed">
              {question.question}
            </p>
          </div>
          
          {/* Answer section */}
          {showAnswer ? (
            <>
              <div className="bg-green-900 border border-green-700 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-yellow-400 text-lg font-semibold">ANSWER:</h3>
                  <Button
                    onClick={() => speakText(question.answer)}
                    disabled={isSpeaking}
                    variant="outline"
                    size="sm"
                    className="bg-yellow-500 text-black hover:bg-yellow-400 border-yellow-500"
                  >
                    <Volume2 className="w-4 h-4 mr-1" />
                    Read Answer
                  </Button>
                </div>
                <p className="text-white text-xl font-semibold">
                  {question.answer}
                </p>
              </div>
              
              {/* Score Selector */}
              <ScoreSelector
                players={players}
                questionPoints={question.points}
                onScorePlayer={onScorePlayer}
              />
            </>
          ) : (
            <div className="text-center mb-6">
              <Button
                onClick={handleShowAnswer}
                className="bg-yellow-500 text-black hover:bg-yellow-400 text-lg px-8 py-3 font-bold"
              >
                Reveal Answer
              </Button>
            </div>
          )}
          
          {/* Close button */}
          <div className="text-center">
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-red-700 text-white hover:bg-red-600 border-red-600 text-lg px-8 py-3"
            >
              Close Question
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
