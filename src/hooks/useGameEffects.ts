
import { useEffect, useCallback } from 'react';
import { Question, Player, CategoryDescription } from '../types/game';
import { useGameData } from './useGameData';
import { useLocalStorage } from './useLocalStorage';
import { usePeriodicSave } from './usePeriodicSave';
import { initializeSpeechSystem } from '../utils/textToSpeech';
import { supabase } from '../integrations/supabase/client';

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
        
        console.log('📂 STARTUP: Loading ALL data from database');
        
        // Load categories and descriptions
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('game_categories')
          .select('category_name, description')
          .order('category_name');
        
        // Load players
        const { data: playersData, error: playersError } = await supabase
          .from('game_players')
          .select('player_name, player_score, avatar_url')
          .order('created_at', { ascending: false });
        
        
        if (categoriesError) {
          console.error('STARTUP: Failed to load categories:', categoriesError);
        } else if (categoriesData && categoriesData.length > 0) {
          const loadedDescriptions = categoriesData.map(cat => ({
            category: cat.category_name,
            description: cat.description || ''
          }));
          console.log('✅ STARTUP: Loaded categories from database:', loadedDescriptions.length);
          setCategoryDescriptions(loadedDescriptions);
        }
        
        if (playersError) {
          console.error('STARTUP: Failed to load players:', playersError);
        } else if (playersData && playersData.length > 0) {
          const loadedPlayers = playersData.map((player, index) => ({
            id: index + 1,
            name: player.player_name,
            score: player.player_score,
            avatar: player.avatar_url || undefined
          }));
          console.log('✅ STARTUP: Loaded players from database:', loadedPlayers.length);
          setPlayers(loadedPlayers);
        }
        
        // Load recent game data including questions
        console.log('📝 STARTUP: Loading recent game data including questions');
        
        const recentGames = await stableLoadRecentGames();
        
        if (recentGames.length > 0) {
          const mostRecentGame = recentGames[0];
          console.log('✅ STARTUP: Found recent game data, loading it automatically');
          
          // Load questions from the most recent game
          if (mostRecentGame.game_questions && mostRecentGame.game_questions.length > 0) {
            const loadedQuestions = mostRecentGame.game_questions.map(q => ({
              id: q.question_id,
              category: q.category,
              points: q.points,
              question: q.question,
              answer: q.answer,
              bonusPoints: q.bonus_points || 0,
              imageUrl: q.image_url || '',
              videoUrl: q.video_url || ''
            }));
            console.log('✅ STARTUP: Loaded questions from database:', loadedQuestions.length);
            setQuestions(loadedQuestions);
            
            // Load answered questions
            const answeredQuestionIds = mostRecentGame.game_questions
              .filter(q => q.is_answered)
              .map(q => q.question_id);
            if (answeredQuestionIds.length > 0) {
              setAnsweredQuestions(new Set(answeredQuestionIds));
              console.log('✅ STARTUP: Loaded answered questions:', answeredQuestionIds.length);
            }
          }
        } else {
          console.log('📝 STARTUP: No games found in database');
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
