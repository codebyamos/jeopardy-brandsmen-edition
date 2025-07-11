
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
  const { saveToLocalStorage } = useLocalStorage();

  const stableLoadRecentGames = useCallback(() => {
    return loadRecentGames(1);
  }, [loadRecentGames]);

  // Load existing game state on component mount - PRIORITIZE DATABASE
  useEffect(() => {
    const loadGameState = async () => {
      if (!isAuthenticated) {
        setIsLoadingGameState(false);
        return;
      }

      try {
        console.log('=== LOADING GAME STATE (DATABASE FIRST) ===');
        
        // FIRST: Always try to load from database
        const recentGames = await stableLoadRecentGames();
        console.log('Database games loaded:', recentGames?.length || 0);
        
        if (recentGames.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const todaysGame = recentGames.find(game => {
            const gameDate = new Date(game.game_date).toISOString().split('T')[0];
            return today === gameDate;
          });
          
          if (todaysGame) {
            console.log('✅ USING DATABASE DATA (Primary source):', {
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
              console.log('Loaded players from database:', loadedPlayers);
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
              console.log('Using database questions:', loadedQuestions.length);
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
              console.log('Using database categories:', loadedDescriptions);
              setCategoryDescriptions(loadedDescriptions);

              // Also save to localStorage as backup
              if (todaysGame.game_questions && todaysGame.game_questions.length > 0) {
                const questionsForStorage: Question[] = todaysGame.game_questions.map(q => ({
                  id: q.question_id,
                  category: q.category,
                  points: q.points,
                  question: q.question,
                  answer: q.answer,
                  bonusPoints: q.bonus_points || 0,
                  imageUrl: q.image_url || undefined,
                  videoUrl: q.video_url || undefined
                }));
                saveToLocalStorage(questionsForStorage, loadedDescriptions);
              }
            }
          } else {
            console.log('No today\'s game in database - will create new one');
          }
        } else {
          console.log('No games found in database');
        }
        
      } catch (error) {
        console.error('Failed to load game state from database:', error);
      } finally {
        console.log('=== GAME STATE LOADING COMPLETE ===');
        setIsLoadingGameState(false);
      }
    };

    loadGameState();
  }, [isAuthenticated, stableLoadRecentGames, saveToLocalStorage, setIsLoadingGameState, setQuestions, setCategoryDescriptions, setPlayers, setAnsweredQuestions]);

  // Immediate save to database on every change - no delays
  useEffect(() => {
    if (!isAuthenticated || isLoadingGameState) {
      return;
    }

    // Save immediately whenever data changes
    const saveToDatabase = async () => {
      try {
        console.log('💾 Immediate database save triggered by data change');
        await saveGame(players, questions, Array.from(answeredQuestions), categoryDescriptions, undefined, false);
        console.log('✅ Data saved to database successfully');
        
        // Also backup to localStorage
        if (questions.length > 0) {
          saveToLocalStorage(questions, categoryDescriptions);
        }
      } catch (error) {
        console.error('❌ Failed to save to database:', error);
      }
    };

    // Debounce saves to avoid too many requests
    const timeoutId = setTimeout(saveToDatabase, 2000); // 2 second delay
    return () => clearTimeout(timeoutId);
  }, [players, questions, answeredQuestions, categoryDescriptions, saveGame, saveToLocalStorage, isAuthenticated, isLoadingGameState]);

  // Initialize speech system on app load
  useEffect(() => {
    initializeSpeechSystem();
  }, []);

  const handleSaveGame = useCallback(async () => {
    try {
      console.log('💾 Manual save triggered - saving to database');
      await saveGame(players, questions, Array.from(answeredQuestions), categoryDescriptions, undefined, true);
      
      // Also save to localStorage as backup
      if (questions.length > 0) {
        saveToLocalStorage(questions, categoryDescriptions);
      }
    } catch (error) {
      console.error('❌ Failed to save game:', error);
    }
  }, [saveGame, saveToLocalStorage, players, questions, answeredQuestions, categoryDescriptions]);

  return {
    handleSaveGame
  };
};
