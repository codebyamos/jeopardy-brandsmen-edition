
import React, { useState, useEffect } from 'react';
import { Question, Player } from '../types/game';
import { Button } from '../components/ui/button';
import { Volume2, X, VolumeX } from 'lucide-react';
import { speakWithElevenLabs } from '../utils/textToSpeech';

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
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  const speakText = async (text: string) => {
    if (isSpeaking) {
      // Stop current speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      await speakWithElevenLabs(text);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    // Auto-read the question when modal opens with a slight delay
    if (!hasAutoPlayed) {
      const timer = setTimeout(() => {
        speakText(question.question);
        setHasAutoPlayed(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [question.question, hasAutoPlayed]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
    // Small delay before reading answer to ensure UI has updated
    setTimeout(() => {
      speakText(question.answer);
    }, 200);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleClose = () => {
    // Stop any ongoing speech when closing
    stopSpeaking();
    onClose();
  };

  if (showAnswer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="modal-content bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 rounded-lg w-full max-w-6xl shadow-2xl">
          <div className="p-4 sm:p-6 lg:p-8 relative">
            {/* Close X button */}
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-red-400 p-2 z-10"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6 lg:mb-8">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2" style={{color: '#fa1e4e'}}>
                {question.category.toUpperCase()}
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{color: '#fa1e4e'}}>
                ${question.points}
              </div>
            </div>
            
            {/* Answer */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
                <Button
                  onClick={() => speakText(question.answer)}
                  variant="ghost"
                  size="sm"
                  className="text-white p-2"
                  style={{backgroundColor: '#fa1e4e'}}
                  disabled={isSpeaking}
                >
                  <Volume2 className="w-6 h-6 sm:w-8 sm:h-8" />
                </Button>
                {isSpeaking && (
                  <Button
                    onClick={stopSpeaking}
                    variant="ghost"
                    size="sm"
                    className="text-white p-2"
                    style={{backgroundColor: '#666'}}
                  >
                    <VolumeX className="w-6 h-6 sm:w-8 sm:h-8" />
                  </Button>
                )}
              </div>
              <div className="modal-text-container">
                <p className="modal-answer-text text-white font-bold px-2">
                  {question.answer}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="modal-content bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 rounded-lg w-full max-w-6xl shadow-2xl">
        <div className="p-4 sm:p-6 lg:p-8 relative">
          {/* Close X button */}
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-red-400 p-2 z-10"
            style={{backgroundColor: '#fa1e4e', color: 'white'}}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2" style={{color: '#fa1e4e'}}>
              {question.category.toUpperCase()}
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{color: '#fa1e4e'}}>
              ${question.points}
            </div>
          </div>
          
          {/* Question */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <Button
                onClick={() => speakText(question.question)}
                variant="ghost"
                size="sm"
                className="text-white p-2"
                style={{backgroundColor: '#fa1e4e'}}
                disabled={isSpeaking}
              >
                <Volume2 className="w-6 h-6 sm:w-8 sm:h-8" />
              </Button>
              {isSpeaking && (
                <Button
                  onClick={stopSpeaking}
                  variant="ghost"
                  size="sm"
                  className="text-white p-2"
                  style={{backgroundColor: '#666'}}
                >
                  <VolumeX className="w-6 h-6 sm:w-8 sm:h-8" />
                </Button>
              )}
            </div>
            <div className="modal-text-container">
              <p className="modal-question-text text-white font-bold px-2">
                {question.question}
              </p>
            </div>
            
            <div className="mt-4 sm:mt-6">
              <Button
                onClick={handleShowAnswer}
                className="bg-yellow-500 text-black hover:bg-yellow-400 text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 font-bold"
                style={{backgroundColor: '#fa1e4e'}}
              >
                Reveal Answer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
