
import { useEffect, useCallback } from 'react';
import { Question, Player, CategoryDescription } from '../types/game';
import { useGameData } from './useGameData';
import { useLocalStorage } from './useLocalStorage';
import { usePeriodicSave } from './usePeriodicSave';
import { initializeSpeechSystem } from '../utils/textToSpeech';

interface UseGameEffectsProps {
  isAuthenticated: boolean;
  isLoadingGameState: boolean;
  setIsLoadingGameState: (loading: boolean) => void;
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  categoryDescriptions: CategoryDescription[];
  setCategoryDescriptions: (descriptions: CategoryDescription[]) => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
  answeredQuestions: Set<number>;
  setAnsweredQuestions: (answered: Set<number>) => void;
}

export const useGameEffects = ({
  isAuthenticated,
  isLoadingGameState,
  setIsLoadingGameState,
  questions,
  setQuestions,
  categoryDescriptions,
  setCategoryDescriptions,
  players,
  setPlayers,
  answeredQuestions,
  setAnsweredQuestions
}: UseGameEffectsProps) => {
  const { saveGame, loadRecentGames } = useGameData();
  const { forceSaveToLocal, loadFromLocalStorage, clearLocalStorage } = useLocalStorage();

  const stableLoadRecentGames = useCallback(() => {
    return loadRecentGames(1);
  }, [loadRecentGames]);

  // Set up periodic database saves every 20 minutes (no toast notifications)
  const { triggerManualSave } = usePeriodicSave({
    questions,
    categoryDescriptions,
    onSave: async (qs, cats) => {
      console.log('🔄 Periodic save: Pushing local data to database');
      await saveGame(players, qs, Array.from(answeredQuestions), cats, undefined, false);
    },
    onClearLocal: clearLocalStorage,
    intervalMinutes: 20,
    enabled: isAuthenticated && !isLoadingGameState && questions.length > 0
  });

  // Load from database ONCE at startup, then work with local data
  useEffect(() => {
    console.log('🔥 LOADING EFFECT TRIGGERED', { isAuthenticated, isLoadingGameState });
    
    const loadGameState = async () => {
      console.log('🎯 LOAD GAME STATE CALLED', { isAuthenticated });
      
      if (!isAuthenticated) {
        console.log('❌ NOT AUTHENTICATED: Setting loading to false');
        setIsLoadingGameState(false);
        return;
      }

      // Only proceed if not already loading
      if (isLoadingGameState) {
        console.log('⏭️ SKIPPING: Already loading');
        return;
      }

      try {
        console.log('=== STARTUP: LOADING GAME STATE ===');
        setIsLoadingGameState(true);
        
        // Load from database first
        const recentGames = await stableLoadRecentGames();
        console.log('Database games loaded:', recentGames?.length || 0);
        
        // Initialize variables for loaded data
        let loadedQuestions: Question[] = [];
        let loadedDescriptions: CategoryDescription[] = [];
        let loadedPlayers: Player[] = [];
        let loadedAnsweredQuestions: number[] = [];
        
        if (recentGames.length > 0) {
          console.log('STARTUP: Recent games found in database, but NOT auto-loading by date');
          console.log('STARTUP: User must manually start new game to load database content');
        } else {
          console.log('STARTUP: No games found in database');
        }

        // Set state from database data ONLY ONCE
        if (loadedPlayers.length > 0) {
          console.log('🎯 STARTUP: Setting players from database:', loadedPlayers);
          setPlayers(loadedPlayers);
        }
        if (loadedQuestions.length > 0) {
          setQuestions(loadedQuestions);
        }
        if (loadedDescriptions.length > 0) {
          setCategoryDescriptions(loadedDescriptions);
        }
        if (loadedAnsweredQuestions.length > 0) {
          setAnsweredQuestions(new Set(loadedAnsweredQuestions));
        }

        // Now save this data to localStorage for local work
        if (loadedQuestions.length > 0 || loadedDescriptions.length > 0) {
          console.log('💾 STARTUP: Saving database data to localStorage');
          forceSaveToLocal(loadedQuestions, loadedDescriptions);
        } else {
          // Try to load from localStorage as fallback
          const localData = loadFromLocalStorage();
          if (localData && localData.questions.length > 0) {
            console.log('📂 STARTUP: Using localStorage fallback data');
            setQuestions(localData.questions);
            setCategoryDescriptions(localData.categoryDescriptions);
          }
        }
        
      } catch (error) {
        console.error('STARTUP: Failed to load from database:', error);
        
        // Try localStorage as fallback
        const localData = loadFromLocalStorage();
        if (localData && localData.questions.length > 0) {
          console.log('📂 STARTUP: Using localStorage fallback after database error');
          setQuestions(localData.questions);
          setCategoryDescriptions(localData.categoryDescriptions);
        }
      } finally {
        console.log('=== STARTUP: GAME STATE LOADING COMPLETE ===');
        setIsLoadingGameState(false);
      }
    };

    loadGameState();
  }, [isAuthenticated]);

  // Save changes to localStorage immediately whenever state changes
  useEffect(() => {
    if (!isAuthenticated || isLoadingGameState) {
      return;
    }

    // Only save if we have data to save
    if (questions.length > 0 || categoryDescriptions.length > 0) {
      console.log('💾 Auto-saving changes to localStorage');
      forceSaveToLocal(questions, categoryDescriptions);
    }
  }, [questions, categoryDescriptions, players, forceSaveToLocal, isAuthenticated, isLoadingGameState]);

  // Initialize speech system on app load
  useEffect(() => {
    initializeSpeechSystem();
  }, []);

  const handleSaveGame = useCallback(async () => {
    try {
      console.log('💾 MANUAL SAVE: Pushing all local data to database');
      await triggerManualSave();
    } catch (error) {
      console.error('❌ MANUAL SAVE: Failed to save game manually:', error);
      throw error;
    }
  }, [triggerManualSave]);

  return {
    handleSaveGame
  };
};
