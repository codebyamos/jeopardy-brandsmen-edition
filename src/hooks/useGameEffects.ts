
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
  const { loadFromLocalStorage } = useLocalStorage();

  const stableLoadRecentGames = useCallback(() => {
    return loadRecentGames(1);
  }, [loadRecentGames]);

  // Load existing game state on component mount
  useEffect(() => {
    const loadGameState = async () => {
      if (!isAuthenticated) {
        setIsLoadingGameState(false);
        return;
      }

      try {
        console.log('Loading game state...');
        
        const localData = loadFromLocalStorage();
        let hasLocalData = false;
        
        if (localData && localData.questions && localData.questions.length > 0) {
          console.log('Found local data, loading:', { 
            questions: localData.questions.length, 
            categories: localData.categoryDescriptions?.length || 0 
          });
          
          setQuestions(localData.questions);
          if (localData.categoryDescriptions) {
            setCategoryDescriptions(localData.categoryDescriptions);
          }
          hasLocalData = true;
        }

        const recentGames = await stableLoadRecentGames();
        console.log('Recent games loaded:', recentGames?.length || 0);
        
        if (recentGames.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const todaysGame = recentGames.find(game => {
            const gameDate = new Date(game.game_date).toISOString().split('T')[0];
            console.log('Comparing dates:', { today, gameDate, match: today === gameDate });
            return today === gameDate;
          });
          
          console.log('Todays game found:', !!todaysGame);
          
          if (todaysGame) {
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

            if (!hasLocalData && todaysGame.game_questions && todaysGame.game_questions.length > 0) {
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
              console.log('Loaded questions from database:', loadedQuestions.length);
              setQuestions(loadedQuestions);

              const answeredIds = todaysGame.game_questions
                .filter(q => q.is_answered)
                .map(q => q.question_id);
              console.log('Loaded answered questions:', answeredIds);
              setAnsweredQuestions(new Set(answeredIds));
            }

            if (!hasLocalData && todaysGame.game_categories && todaysGame.game_categories.length > 0) {
              const loadedDescriptions: CategoryDescription[] = todaysGame.game_categories.map(cat => ({
                category: cat.category_name,
                description: cat.description || ''
              }));
              console.log('Loaded category descriptions from database:', loadedDescriptions);
              setCategoryDescriptions(loadedDescriptions);
            }
          } else if (!hasLocalData) {
            console.log('No todays game found and no local data, using sample questions');
          }
        } else if (!hasLocalData) {
          console.log('No recent games found and no local data, using sample questions');
        }
        
        if (hasLocalData) {
          console.log('Using local data as primary source');
        }
        
      } catch (error) {
        console.error('Failed to load game state:', error);
        
        const localData = loadFromLocalStorage();
        if (localData && localData.questions && localData.questions.length > 0) {
          console.log('Database failed, falling back to localStorage');
          setQuestions(localData.questions);
          if (localData.categoryDescriptions) {
            setCategoryDescriptions(localData.categoryDescriptions);
          }
        }
      } finally {
        setIsLoadingGameState(false);
      }
    };

    loadGameState();
  }, [isAuthenticated, stableLoadRecentGames, loadFromLocalStorage, setIsLoadingGameState, setQuestions, setCategoryDescriptions, setPlayers, setAnsweredQuestions]);

  // Auto-save game state every 10 minutes
  useEffect(() => {
    if (!isAuthenticated || isLoadingGameState) {
      console.log('Skipping auto-save setup:', { isAuthenticated, isLoadingGameState });
      return;
    }

    const autoSaveInterval = setInterval(async () => {
      try {
        console.log('Auto-saving game state...');
        await saveGame(players, questions, Array.from(answeredQuestions), categoryDescriptions, undefined, false);
        console.log('Game state auto-saved successfully');
      } catch (error) {
        console.error('Failed to auto-save game state:', error);
      }
    }, 600000); // 10 minutes

    return () => clearInterval(autoSaveInterval);
  }, [players, questions, answeredQuestions, categoryDescriptions, saveGame, isAuthenticated, isLoadingGameState]);

  // Initialize speech system on app load
  useEffect(() => {
    initializeSpeechSystem();
  }, []);

  const handleSaveGame = useCallback(async () => {
    try {
      console.log('Manual save triggered');
      await saveGame(players, questions, Array.from(answeredQuestions), categoryDescriptions, undefined, true);
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }, [saveGame, players, questions, answeredQuestions, categoryDescriptions]);

  return {
    handleSaveGame
  };
};
