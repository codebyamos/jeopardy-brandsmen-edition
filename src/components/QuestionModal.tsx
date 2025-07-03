
import React, { useState, useEffect, useRef } from 'react';
import { Question, Player } from '../types/game';
import { Button } from '../components/ui/button';
import { speakWithElevenLabs, stopCurrentSpeech, initializeSpeechSystem, preloadAudio } from '../utils/textToSpeech';
import { useVoiceSettings } from '../hooks/useVoiceSettings';
import { useTimerSettings } from '../hooks/useTimerSettings';
import ModalHeader from './ModalHeader';
import QuestionContent from './QuestionContent';
import AnswerContent from './AnswerContent';
import QuestionTimer from './QuestionTimer';
import { Timer } from 'lucide-react';

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
  const [isTimerEnabled, setIsTimerEnabled] = useState(false);
  const hasAutoPlayedRef = useRef(false);
  
  const { settings: voiceSettings } = useVoiceSettings();
  const { settings: timerSettings } = useTimerSettings();

  const speakText = async (text: string, type: 'question' | 'answer') => {
    if (!voiceSettings.isVoiceEnabled) return;
    
    // Stop any current speech first
    if (isSpeaking) {
      stopCurrentSpeech();
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
      if (!hasAutoPlayedRef.current && voiceSettings.isVoiceEnabled) {
        hasAutoPlayedRef.current = true;
        
        // Initialize speech system
        await initializeSpeechSystem();
        
        // Preload both question and answer audio in parallel
        const preloadPromises = [
          preloadAudio(question.question),
          preloadAudio(question.answer)
        ];
        
        // Start preloading but don't wait for it to complete
        Promise.all(preloadPromises).catch(error => {
          console.log('Preloading failed, will generate on demand:', error);
        });
        
        // Start speaking question immediately without waiting for preloading
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
  }, [question.question, question.answer, voiceSettings.isVoiceEnabled]);

  const handleShowAnswer = async () => {
    setShowAnswer(true);
    
    if (voiceSettings.isVoiceEnabled) {
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
    }
  };

  const handleClose = () => {
    stopSpeaking();
    onClose();
  };

  const handleTimeUp = () => {
    console.log('Time is up!');
    // You could add additional logic here like automatically showing the answer
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
          
          {/* Timer Toggle and Timer */}
          <div className="mb-6 flex justify-center items-center gap-4">
            <Button
              onClick={() => setIsTimerEnabled(!isTimerEnabled)}
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${isTimerEnabled ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <Timer className="w-4 h-4" />
              Timer {isTimerEnabled ? 'ON' : 'OFF'}
            </Button>
            
            {isTimerEnabled && (
              <QuestionTimer 
                duration={timerSettings.timerDuration}
                onTimeUp={handleTimeUp}
              />
            )}
          </div>
          
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
