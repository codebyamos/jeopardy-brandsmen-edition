import React, { useState, useEffect, useRef } from 'react';
import { Question, Player } from '../types/game';
import { speakWithElevenLabs, stopCurrentSpeech, initializeSpeechSystem, preloadAudio } from '../utils/textToSpeech';
import { useVoiceSettings } from '../hooks/useVoiceSettings';
import { useTimerSettings } from '../hooks/useTimerSettings';
import QuestionModalHeader from './QuestionModalHeader';
import QuestionView from './QuestionView';
import AnswerView from './AnswerView';

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
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="modal-content bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 rounded-lg w-full max-w-6xl shadow-2xl">
        <div className="p-4 sm:p-6 lg:p-8 relative">
          <QuestionModalHeader 
            category={question.category}
            points={question.points}
            isTimerEnabled={isTimerEnabled}
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
  );
};

export default QuestionModal;
