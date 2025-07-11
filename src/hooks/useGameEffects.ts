
import { useEffect, useCallback } from 'react';
import { Question, Player, CategoryDescription } from '../types/game';
import { useGameData } from './useGameData';
import { useLocalStorage } from './useLocalStorage';
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
  const { loadFromLocalStorage, getLocalStorageStats } = useLocalStorage();

  const stableLoadRecentGames = useCallback(() => {
    return loadRecentGames(1);
  }, [loadRecentGames]);

  // Load existing game state on component mount - PRIORITIZE LOCAL STORAGE
  useEffect(() => {
    const loadGameState = async () => {
      if (!isAuthenticated) {
        setIsLoadingGameState(false);
        return;
      }

      try {
        console.log('=== LOADING GAME STATE (PRIORITIZING LOCAL STORAGE) ===');
        
        // FIRST: Always check localStorage stats
        const localStats = getLocalStorageStats();
        console.log('Local storage stats:', localStats);
        
        const localData = loadFromLocalStorage();
        let useLocalData = false;
        
        // PRIORITIZE LOCAL DATA if it exists and has content
        if (localData && localData.questions && localData.questions.length > 0) {
          console.log('✅ USING LOCAL DATA (Primary source):', { 
            questions: localData.questions.length, 
            categories: localData.categoryDescriptions?.length || 0,
            lastSaved: localData.lastSaved,
            version: localData.version
          });
          
          setQuestions(localData.questions);
          if (localData.categoryDescriptions) {
            setCategoryDescriptions(localData.categoryDescriptions);
          }
          useLocalData = true;
        }

        // SECOND: Load players from database (players are always synced)
        try {
          const recentGames = await stableLoadRecentGames();
          console.log('Database games loaded:', recentGames?.length || 0);
          
          if (recentGames.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const todaysGame = recentGames.find(game => {
              const gameDate = new Date(game.game_date).toISOString().split('T')[0];
              return today === gameDate;
            });
            
            if (todaysGame) {
              // Always load players from database
              if (todaysGame.game_players && todaysGame.game_players.length > 0) {
                const loadedPlayers: Player[] = todaysGame.game_players.map((player, index) => ({
                  id: index + 1,
                  name: player.player_name,
                  score: player.player_score,
                  avatar: player.avatar_url || undefined
                }));
                console.log('Loaded players from database:', loadedPlayers);
                setPlayers(loadedPlayers);
              }

              // Only use database questions/categories if NO local data exists
              if (!useLocalData) {
                console.log('⚠️ No local data found, using database as fallback');
                
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
                  console.log('Using database questions:', loadedQuestions.length);
                  setQuestions(loadedQuestions);

                  const answeredIds = todaysGame.game_questions
                    .filter(q => q.is_answered)
                    .map(q => q.question_id);
                  setAnsweredQuestions(new Set(answeredIds));
                }

                if (todaysGame.game_categories && todaysGame.game_categories.length > 0) {
                  const loadedDescriptions: CategoryDescription[] = todaysGame.game_categories.map(cat => ({
                    category: cat.category_name,
                    description: cat.description || ''
                  }));
                  console.log('Using database categories:', loadedDescriptions);
                  setCategoryDescriptions(loadedDescriptions);
                }
              } else {
                console.log('✅ Local data takes precedence over database data');
              }
            } else {
              console.log('No today\'s game in database');
            }
          }
        } catch (dbError) {
          console.error('Database load failed, but local data is available:', dbError);
          if (!useLocalData) {
            console.log('⚠️ Both database and local storage failed, using sample data');
          }
        }
        
      } catch (error) {
        console.error('Failed to load game state:', error);
        
        // Final fallback to localStorage
        const localData = loadFromLocalStorage();
        if (localData && localData.questions && localData.questions.length > 0) {
          console.log('🔄 Emergency fallback to localStorage successful');
          setQuestions(localData.questions);
          if (localData.categoryDescriptions) {
            setCategoryDescriptions(localData.categoryDescriptions);
          }
        }
      } finally {
        console.log('=== GAME STATE LOADING COMPLETE ===');
        setIsLoadingGameState(false);
      }
    };

    loadGameState();
  }, [isAuthenticated, stableLoadRecentGames, loadFromLocalStorage, getLocalStorageStats, setIsLoadingGameState, setQuestions, setCategoryDescriptions, setPlayers, setAnsweredQuestions]);

  // More frequent auto-save every 5 minutes instead of 10
  useEffect(() => {
    if (!isAuthenticated || isLoadingGameState) {
      console.log('Skipping auto-save setup:', { isAuthenticated, isLoadingGameState });
      return;
    }

    const autoSaveInterval = setInterval(async () => {
      try {
        console.log('🔄 Auto-saving game state (every 5 minutes)...');
        await saveGame(players, questions, Array.from(answeredQuestions), categoryDescriptions, undefined, false);
        console.log('✅ Game state auto-saved successfully');
      } catch (error) {
        console.error('❌ Failed to auto-save game state:', error);
      }
    }, 300000); // 5 minutes instead of 10

    return () => clearInterval(autoSaveInterval);
  }, [players, questions, answeredQuestions, categoryDescriptions, saveGame, isAuthenticated, isLoadingGameState]);

  // Initialize speech system on app load
  useEffect(() => {
    initializeSpeechSystem();
  }, []);

  const handleSaveGame = useCallback(async () => {
    try {
      console.log('💾 Manual save triggered');
      await saveGame(players, questions, Array.from(answeredQuestions), categoryDescriptions, undefined, true);
    } catch (error) {
      console.error('❌ Failed to save game:', error);
    }
  }, [saveGame, players, questions, answeredQuestions, categoryDescriptions]);

  return {
    handleSaveGame
  };
};
