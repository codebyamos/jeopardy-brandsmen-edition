
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
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      utterance.volume = 1;
      
      // Set to female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('eva') ||
        voice.name.toLowerCase().includes('samantha')
      );
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
      <div style={{color: '#fa1e4e'}} className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div style={{color: '#fa1e4e'}} className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl">
          <div className="p-8 relative">
            {/* Close X button */}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:text-red-400 p-2"
            >
              <X className="w-6 h-6" />
            </Button>
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-yellow-400 text-2xl font-semibold mb-2" style={{color: '#fa1e4e'}}>
                {question.category.toUpperCase()}
              </div>
              <div className="text-yellow-400 text-4xl font-bold" style={{color: '#fa1e4e'}}>
                ${question.points}
              </div>
            </div>
            
            {/* Answer */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <Button
                  onClick={() => speakText(question.answer)}
                  disabled={isSpeaking}
                  variant="ghost"
                  size="sm"
                  className="text-yellow-400 hover:text-yellow-300 p-2"
                  style={{backgroundColor: '#fa1e4e', color:'white'}}
                >
                  <Volume2 className="w-8 h-8" />
                </Button>
              </div>
              <p className="text-white text-4xl font-bold leading-relaxed mb-8">
                {question.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{color: '#fa1e4e'}} className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div style={{color: '#fa1e4e'}} className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="p-8 relative">
          {/* Close X button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:text-red-400 p-2"
            style={{backgroundColor: '#fa1e4e', color: 'white'}}
          >
            <X className="w-6 h-6" />
          </Button>
          
          {/* Header */}
          <div style={{color: '#fa1e4e'}} className="text-center mb-8">
            <div style={{color: '#fa1e4e'}} className="text-yellow-400 text-2xl font-semibold mb-2">
              {question.category.toUpperCase()}
            </div>
            <div style={{color: '#fa1e4e'}} className="text-yellow-400 text-4xl font-bold">
              ${question.points}
            </div>
          </div>
          
          {/* Question */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Button
                onClick={() => speakText(question.question)}
                disabled={isSpeaking}
                variant="ghost"
                size="sm"
                className="text-yellow-400 hover:text-yellow-300 p-2"
                style={{backgroundColor: '#fa1e4e', color: 'white'}}
              >
                <Volume2 className="w-8 h-8" />
              </Button>
            </div>
            <p className="text-white text-6xl font-bold leading-relaxed mb-8">
              {question.question}
            </p>
            
            <Button
              onClick={handleShowAnswer}
              className="bg-yellow-500 text-black hover:bg-yellow-400 text-xl px-8 py-4 font-bold"
              style={{backgroundColor: '#fa1e4e'}}
            >
              Reveal Answer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
