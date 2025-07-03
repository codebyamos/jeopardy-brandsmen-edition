
import React, { useState, useEffect, useRef } from 'react';
import { Question, Player } from '../types/game';
import { Button } from '../components/ui/button';
import { speakWithElevenLabs, stopCurrentSpeech, initializeSpeechSystem, preloadAudio } from '../utils/textToSpeech';
import ModalHeader from './ModalHeader';
import QuestionContent from './QuestionContent';
import AnswerContent from './AnswerContent';

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
  const [currentSpeech, setCurrentSpeech] = useState<'question' | 'answer' | null>(null);
  const hasAutoPlayedRef = useRef(false);

  const speakText = async (text: string, type: 'question' | 'answer') => {
    // Stop any current speech first
    stopCurrentSpeech();
    
    if (isSpeaking && currentSpeech === type) {
      setIsSpeaking(false);
      setCurrentSpeech(null);
      return;
    }

    // Set speaking state immediately
    setIsSpeaking(true);
    setCurrentSpeech(type);
    
    try {
      await speakWithElevenLabs(text);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
      setCurrentSpeech(null);
    }
  };

  const stopSpeaking = () => {
    stopCurrentSpeech();
    setIsSpeaking(false);
    setCurrentSpeech(null);
  };

  useEffect(() => {
    // Initialize speech system and preload audio, then auto-play question immediately
    const initAndPlay = async () => {
      if (!hasAutoPlayedRef.current) {
        hasAutoPlayedRef.current = true;
        
        // Initialize speech system
        await initializeSpeechSystem();
        
        // Preload both question and answer audio
        preloadAudio(question.question);
        preloadAudio(question.answer);
        
        // Start speaking question immediately
        setIsSpeaking(true);
        setCurrentSpeech('question');
        
        try {
          await speakWithElevenLabs(question.question);
        } catch (error) {
          console.error('Speech error:', error);
        } finally {
          setIsSpeaking(false);
          setCurrentSpeech(null);
        }
      }
    };

    initAndPlay();
    
    return () => {
      // Clean up any ongoing speech when component unmounts
      stopCurrentSpeech();
    };
  }, [question.question, question.answer]);

  const handleShowAnswer = async () => {
    setShowAnswer(true);
    
    // Start speaking answer immediately
    setIsSpeaking(true);
    setCurrentSpeech('answer');
    
    try {
      await speakWithElevenLabs(question.answer);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
      setCurrentSpeech(null);
    }
  };

  const handleClose = () => {
    stopSpeaking();
    onClose();
  };

  if (showAnswer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="modal-content bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 rounded-lg w-full max-w-6xl shadow-2xl">
          <div className="p-4 sm:p-6 lg:p-8 relative">
            <ModalHeader 
              category={question.category}
              points={question.points}
              onClose={handleClose}
            />
            <AnswerContent
              question={question}
              isSpeaking={isSpeaking}
              currentSpeech={currentSpeech}
              onSpeak={speakText}
              onStop={stopSpeaking}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="modal-content bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 rounded-lg w-full max-w-6xl shadow-2xl">
        <div className="p-4 sm:p-6 lg:p-8 relative">
          <ModalHeader 
            category={question.category}
            points={question.points}
            onClose={handleClose}
          />
          <QuestionContent
            question={question}
            isSpeaking={isSpeaking}
            currentSpeech={currentSpeech}
            onSpeak={speakText}
            onStop={stopSpeaking}
          />
          
          <div className="mt-4 sm:mt-6 text-center">
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
  );
};

export default QuestionModal;
