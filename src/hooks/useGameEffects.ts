
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
    const loadGameState = async () => {
      if (!isAuthenticated) {
        setIsLoadingGameState(false);
        return;
      }

      try {
        console.log('=== STARTUP: LOADING GAME STATE ===');
        
        // Load from database first
        const recentGames = await stableLoadRecentGames();
        console.log('Database games loaded:', recentGames?.length || 0);
        
        // Initialize variables for loaded data
        let loadedQuestions: Question[] = [];
        let loadedDescriptions: CategoryDescription[] = [];
        let loadedPlayers: Player[] = [];
        let loadedAnsweredQuestions: number[] = [];
        
        if (recentGames.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const todaysGame = recentGames.find(game => {
            const gameDate = new Date(game.game_date).toISOString().split('T')[0];
            return today === gameDate;
          });
          
          if (todaysGame) {
            console.log('✅ STARTUP: Loading today\'s game from database:', {
              questions: todaysGame.game_questions?.length || 0,
              categories: todaysGame.game_categories?.length || 0,
              players: todaysGame.game_players?.length || 0
            });

            // Load players from database
            if (todaysGame.game_players && todaysGame.game_players.length > 0) {
              loadedPlayers = todaysGame.game_players.map((player, index) => ({
                id: index + 1,
                name: player.player_name,
                score: player.player_score,
                avatar: player.avatar_url || undefined
              }));
            }

            // Load questions from database
            if (todaysGame.game_questions && todaysGame.game_questions.length > 0) {
              loadedQuestions = todaysGame.game_questions.map(q => ({
                id: q.question_id,
                category: q.category,
                points: q.points,
                question: q.question,
                answer: q.answer,
                bonusPoints: q.bonus_points || 0,
                imageUrl: q.image_url || undefined,
                videoUrl: q.video_url || undefined
              }));

              loadedAnsweredQuestions = todaysGame.game_questions
                .filter(q => q.is_answered)
                .map(q => q.question_id);
            }

            // Load categories from database
            if (todaysGame.game_categories && todaysGame.game_categories.length > 0) {
              loadedDescriptions = todaysGame.game_categories.map(cat => ({
                category: cat.category_name,
                description: cat.description || ''
              }));
            }
          } else {
            console.log('STARTUP: No today\'s game in database');
          }
        } else {
          console.log('STARTUP: No games found in database');
        }

        // Set state from database data
        if (loadedPlayers.length > 0) {
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
  }, [isAuthenticated, stableLoadRecentGames, forceSaveToLocal, loadFromLocalStorage, setIsLoadingGameState, setQuestions, setCategoryDescriptions, setPlayers, setAnsweredQuestions]);

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
  }, [questions, categoryDescriptions, forceSaveToLocal, isAuthenticated, isLoadingGameState]);

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
