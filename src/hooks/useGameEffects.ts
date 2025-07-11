
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
  const { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage } = useLocalStorage();

  const stableLoadRecentGames = useCallback(() => {
    return loadRecentGames(1);
  }, [loadRecentGames]);

  // Set up periodic database saves every 20 minutes
  const { triggerManualSave } = usePeriodicSave({
    questions,
    categoryDescriptions,
    onSave: async (qs, cats) => {
      await saveGame(players, qs, Array.from(answeredQuestions), cats, undefined, false);
    },
    onClearLocal: clearLocalStorage,
    intervalMinutes: 20,
    enabled: isAuthenticated && !isLoadingGameState
  });

  // ALWAYS load from database first when opening app
  useEffect(() => {
    const loadGameState = async () => {
      if (!isAuthenticated) {
        setIsLoadingGameState(false);
        return;
      }

      try {
        console.log('=== LOADING GAME STATE (DATABASE PRIORITY) ===');
        
        // ALWAYS try to load from database first
        const recentGames = await stableLoadRecentGames();
        console.log('Database games loaded:', recentGames?.length || 0);
        
        if (recentGames.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const todaysGame = recentGames.find(game => {
            const gameDate = new Date(game.game_date).toISOString().split('T')[0];
            return today === gameDate;
          });
          
          if (todaysGame) {
            console.log('✅ LOADING FROM DATABASE (Primary source):', {
              questions: todaysGame.game_questions?.length || 0,
              categories: todaysGame.game_categories?.length || 0,
              players: todaysGame.game_players?.length || 0
            });

            // Load players from database
            if (todaysGame.game_players && todaysGame.game_players.length > 0) {
              const loadedPlayers: Player[] = todaysGame.game_players.map((player, index) => ({
                id: index + 1,
                name: player.player_name,
                score: player.player_score,
                avatar: player.avatar_url || undefined
              }));
              setPlayers(loadedPlayers);
            }

            // Load questions from database
            if (todaysGame.game_questions && todaysGame.game_questions.length > 0) {
              const loadedQuestions: Question[] = todaysGame.game_questions.map(q => ({
                id: q.question_id,
                category: q.category,
                points: q.points,
                question: q.question,
                answer: q.answer,
                bonusPoints: q.bonus_points || 0,
                imageUrl: q.image_url || undefined,
                videoUrl: q.video_url || undefined
              }));
              setQuestions(loadedQuestions);

              const answeredIds = todaysGame.game_questions
                .filter(q => q.is_answered)
                .map(q => q.question_id);
              setAnsweredQuestions(new Set(answeredIds));
            }

            // Load categories from database
            if (todaysGame.game_categories && todaysGame.game_categories.length > 0) {
              const loadedDescriptions: CategoryDescription[] = todaysGame.game_categories.map(cat => ({
                category: cat.category_name,
                description: cat.description || ''
              }));
              setCategoryDescriptions(loadedDescriptions);
            }

            // Clear any old local storage since we loaded from database
            clearLocalStorage();
            console.log('🗑️ Cleared old local storage - using fresh database data');
          } else {
            console.log('No today\'s game in database - will create new one');
          }
        } else {
          console.log('No games found in database');
        }
        
      } catch (error) {
        console.error('Failed to load from database, checking localStorage fallback:', error);
        
        // Only use localStorage as absolute fallback
        const localData = loadFromLocalStorage();
        if (localData && localData.questions.length > 0) {
          console.log('📂 Using localStorage fallback data');
          setQuestions(localData.questions);
          setCategoryDescriptions(localData.categoryDescriptions);
        }
      } finally {
        console.log('=== GAME STATE LOADING COMPLETE ===');
        setIsLoadingGameState(false);
      }
    };

    loadGameState();
  }, [isAuthenticated, stableLoadRecentGames, clearLocalStorage, loadFromLocalStorage, setIsLoadingGameState, setQuestions, setCategoryDescriptions, setPlayers, setAnsweredQuestions]);

  // Save changes to localStorage for immediate local testing
  useEffect(() => {
    if (!isAuthenticated || isLoadingGameState || questions.length === 0) {
      return;
    }

    // Save to localStorage immediately for local testing
    saveToLocalStorage(questions, categoryDescriptions);
  }, [questions, categoryDescriptions, saveToLocalStorage, isAuthenticated, isLoadingGameState]);

  // Initialize speech system on app load
  useEffect(() => {
    initializeSpeechSystem();
  }, []);

  const handleSaveGame = useCallback(async () => {
    try {
      console.log('💾 Manual save game clicked - saving to database and clearing local');
      await triggerManualSave();
    } catch (error) {
      console.error('❌ Failed to save game manually:', error);
      throw error;
    }
  }, [triggerManualSave]);

  return {
    handleSaveGame
  };
};
