
import { useState, useEffect, useRef } from 'react';
import { Question } from '../types/game';
import { speakWithElevenLabs, stopCurrentSpeech, initializeSpeechSystem, preloadAudio, setSpeechCompleteCallback } from '../utils/textToSpeech';
import { useVoiceSettings } from '../hooks/useVoiceSettings';

interface QuestionModalLogicProps {
  question: Question;
}

export const useQuestionModalLogic = ({ question }: QuestionModalLogicProps) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<'question' | 'answer' | null>(null);
  const [isTimerEnabled, setIsTimerEnabled] = useState(false);
  const [showBonusPoints, setShowBonusPoints] = useState(false);
  const hasAutoPlayedRef = useRef(false);
  
  const { settings: voiceSettings } = useVoiceSettings();

  // Show bonus points display when question loads if there are bonus points
  useEffect(() => {
    if (question.bonusPoints && question.bonusPoints > 0) {
      console.log('Showing bonus points animation:', question.bonusPoints);
      setShowBonusPoints(true);
      const timer = setTimeout(() => {
        setShowBonusPoints(false);
      }, 4000); // Show for 4 seconds to make it more visible
      return () => clearTimeout(timer);
    }
  }, [question.bonusPoints]);

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
      // Don't reset state here - let the completion callback handle it
      // This prevents premature state reset when falling back to browser speech
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
        
        try {
          // Initialize speech system
          await initializeSpeechSystem();
          
          // Preload both question and answer audio in parallel (but don't wait)
          preloadAudio(question.question).catch(error => {
            console.log('Question preload failed:', error);
          });
          preloadAudio(question.answer).catch(error => {
            console.log('Answer preload failed:', error);
          });
          
          // Start speaking question immediately
          console.log('Auto-playing question');
          setIsSpeaking(true);
          setCurrentSpeech('question');
          
          await speakWithElevenLabs(question.question);
          console.log('Auto-play question completed');
        } catch (error) {
          console.error('Auto-play initialization/speech error:', error);
          // Don't reset state here - let the completion callback handle it
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
        console.log('Auto-play answer completed');
      } catch (error) {
        console.error('Auto-play answer error:', error);
        // Don't reset state here - let the completion callback handle it
      }
    }
  };

  const handleTimeUp = () => {
    console.log('Time is up!');
  };

  // Debug logging for state changes
  useEffect(() => {
    console.log(`QuestionModal state updated: isSpeaking=${isSpeaking}, currentSpeech=${currentSpeech}`);
  }, [isSpeaking, currentSpeech]);

  return {
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
  };
};
