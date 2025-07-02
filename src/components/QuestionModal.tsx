
import React, { useState, useEffect } from 'react';
import { Question, Player } from '../types/game';
import { Button } from '../components/ui/button';
import { Volume2, X } from 'lucide-react';

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
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      
      // Ensure female voice with better selection
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('susan') ||
        voice.name.toLowerCase().includes('allison') ||
        voice.name.toLowerCase().includes('ava') ||
        voice.name.toLowerCase().includes('serena') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('google')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
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

  if (showAnswer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="modal-content bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 rounded-lg w-full max-w-6xl shadow-2xl">
          <div className="p-4 sm:p-6 lg:p-8 relative">
            {/* Close X button */}
            <Button
              onClick={onClose}
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
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <Button
                  onClick={() => speakText(question.answer)}
                  disabled={isSpeaking}
                  variant="ghost"
                  size="sm"
                  className="text-yellow-400 hover:text-yellow-300 p-2"
                  style={{backgroundColor: '#fa1e4e', color:'white'}}
                >
                  <Volume2 className="w-6 h-6 sm:w-8 sm:h-8" />
                </Button>
                {isSpeaking && (
                  <Button
                    onClick={stopSpeaking}
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-red-400 hover:text-red-300 p-2"
                    style={{backgroundColor: '#666'}}
                  >
                    Stop
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
            onClick={onClose}
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
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <Button
                onClick={() => speakText(question.question)}
                disabled={isSpeaking}
                variant="ghost"
                size="sm"
                className="text-yellow-400 hover:text-yellow-300 p-2"
                style={{backgroundColor: '#fa1e4e', color: 'white'}}
              >
                <Volume2 className="w-6 h-6 sm:w-8 sm:h-8" />
              </Button>
              {isSpeaking && (
                <Button
                  onClick={stopSpeaking}
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-red-400 hover:text-red-300 p-2"
                  style={{backgroundColor: '#666'}}
                >
                  Stop
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
