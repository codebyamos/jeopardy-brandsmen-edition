
import React, { useState, useEffect, useRef } from 'react';
import { Question, Player } from '../types/game';
import { speakWithElevenLabs, stopCurrentSpeech, initializeSpeechSystem, preloadAudio, setSpeechCompleteCallback } from '../utils/textToSpeech';
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

  // Set up speech completion callback
  useEffect(() => {
    const handleSpeechComplete = () => {
      console.log('Speech completed - resetting state');
      setIsSpeaking(false);
      setCurrentSpeech(null);
    };

    setSpeechCompleteCallback(handleSpeechComplete);
    
    return () => {
      setSpeechCompleteCallback(null);
    };
  }, []);

  const speakText = async (text: string, type: 'question' | 'answer') => {
    if (!voiceSettings.isVoiceEnabled) return;
    
    console.log(`speakText called: ${type}, currently speaking: ${isSpeaking}, current speech: ${currentSpeech}`);
    
    // Stop any current speech first
    if (isSpeaking) {
      console.log('Stopping current speech');
      stopCurrentSpeech();
      return;
    }

    // Set speaking state immediately
    console.log(`Starting speech for ${type}`);
    setIsSpeaking(true);
    setCurrentSpeech(type);
    
    try {
      await speakWithElevenLabs(text);
      console.log(`Speech completed for ${type}`);
    } catch (error) {
      console.error('Speech error:', error);
      // Reset state on error
      setIsSpeaking(false);
      setCurrentSpeech(null);
    }
  };

  const stopSpeaking = () => {
    console.log('stopSpeaking called');
    stopCurrentSpeech();
    // State will be reset by the speech completion callback
  };

  useEffect(() => {
    // Initialize speech system and preload audio, then auto-play question immediately
    const initAndPlay = async () => {
      if (!hasAutoPlayedRef.current && voiceSettings.isVoiceEnabled) {
        hasAutoPlayedRef.current = true;
        
        console.log('Initializing speech system and auto-playing question');
        
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
        console.log('Auto-playing question');
        setIsSpeaking(true);
        setCurrentSpeech('question');
        
        try {
          await speakWithElevenLabs(question.question);
          console.log('Auto-play question completed via promise resolution');
        } catch (error) {
          console.error('Auto-play speech error:', error);
          // Reset state on error
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
    console.log('Show answer clicked');
    setShowAnswer(true);
    
    if (voiceSettings.isVoiceEnabled) {
      console.log('Auto-playing answer');
      // Start speaking answer immediately
      setIsSpeaking(true);
      setCurrentSpeech('answer');
      
      try {
        await speakWithElevenLabs(question.answer);
        console.log('Auto-play answer completed via promise resolution');
      } catch (error) {
        console.error('Auto-play answer error:', error);
        // Reset state on error
        setIsSpeaking(false);
        setCurrentSpeech(null);
      }
    }
  };

  const handleClose = () => {
    console.log('Modal closing, stopping speech');
    stopSpeaking();
    onClose();
  };

  const handleTimeUp = () => {
    console.log('Time is up!');
  };

  // Debug logging for state changes
  useEffect(() => {
    console.log(`QuestionModal state updated: isSpeaking=${isSpeaking}, currentSpeech=${currentSpeech}`);
  }, [isSpeaking, currentSpeech]);

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
