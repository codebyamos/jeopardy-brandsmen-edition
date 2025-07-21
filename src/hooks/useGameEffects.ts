import { useEffect, useCallback } from 'react';
import { Question, Player, CategoryDescription } from '../types/game';
import { useGameData } from './useGameData';
import { useLocalStorage } from './useLocalStorage';
import { usePeriodicSave } from './usePeriodicSave';
import { toast } from './use-toast';
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
    players,
    onSave: async (qs, cats, plys) => {
      console.log('🔄 Periodic save: Pushing local data to database');
      // Use the provided players if available, otherwise use current state
      const playersToSave = plys && plys.length > 0 ? plys : players;
      await saveGame(playersToSave, qs, Array.from(answeredQuestions), cats, undefined, false);
      toast({
        title: 'Game auto-saved',
        description: 'Your progress was automatically saved.',
        duration: 3000,
        className: 'bg-gray-900 text-white text-xs',
      });
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
      
        // Check if there's a specific game ID in the URL (for new games or shared links)
        const urlParams = new URLSearchParams(window.location.search);
        const urlGameId = urlParams.get('new-game');
        
        // Handle special case of page reload after new game
        const urlHasRefreshParam = window.location.search.includes('refresh=');
        if (urlHasRefreshParam) {
          console.log('🔥 DETECTED POST-RESET RELOAD - will force clean state');
          // Clean URL to remove the refresh parameter
          try {
            window.history.replaceState({}, '', window.location.pathname);
          } catch (error) {
            console.error('Failed to clean URL:', error);
          }
        }
        
        // Check if we're in incognito mode - we should always prioritize DB data in this case
        const isIncognitoMode = !window.indexedDB || 
          window.navigator.userAgent.includes('incognito') ||
          window.location.href.includes('incognito');
        
        // ALWAYS prioritize database data over localStorage for consistency
        const shouldPrioritizeDatabase = true; // Changed from isIncognitoMode to always true
        
        if (isIncognitoMode) {
          console.log('🔍 DETECTED INCOGNITO MODE - will prioritize database data');
          localStorage.setItem('force-db-mode', 'true');
        } else {
          console.log('🔍 REGULAR BROWSER MODE - will also prioritize database data for consistency');
          localStorage.setItem('force-db-mode', 'true');
        }
      
      // First, immediately check if we've just started a new game
      const justStartedNewGame = localStorage.getItem('isNewGame') === 'true' || urlHasRefreshParam;
      
      if (justStartedNewGame) {
        console.log('🚫 STARTUP: New game flag or refresh detected, SKIPPING local data loading entirely');
        localStorage.removeItem('isNewGame');
        // Don't set loading state to false yet, we want to continue with DB loading for the new game
      }
      
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
        
        // Initialize variables for game loading
        let currentGameId: string | null = null;
        let freshGameNeeded = false;
        let shouldLoadPlayersFromDB = true; // Always try to load players from DB by default
        let questionsLoaded = false;
        let categoriesLoaded = false;
        
        // Always get the most recent game from database instead of relying on localStorage
        // UNLESS there's a specific game ID in the URL
        if (urlGameId) {
          console.log('📂 STARTUP: Using game ID from URL parameter:', urlGameId);
          currentGameId = urlGameId;
          // Save this as the current game in localStorage
          localStorage.setItem('currentGameId', currentGameId);
        } else {
          console.log('📂 STARTUP: Looking for most recent game from database');
          
          // Get the most recent game ID from database
          const { data: gameIdData, error: gameIdError } = await supabase
            .from('games')
            .select('id')
            .order('game_date', { ascending: false })
            .limit(1);
            
          if (!gameIdError && gameIdData && gameIdData.length > 0) {
            currentGameId = gameIdData[0].id;
            // Save this as the current game in localStorage for offline fallback
            localStorage.setItem('currentGameId', currentGameId);
            console.log('📂 STARTUP: Using most recent game ID from database:', currentGameId);
          } else {
            console.log('📂 STARTUP: No existing games found, will create new game');
            // Create a new game
            freshGameNeeded = true;
          }
        }
        
        // First check if we're in a new game state
        const justStartedNewGame = localStorage.getItem('isNewGame') === 'true';
        if (justStartedNewGame) {
          console.log('📂 STARTUP: New game flag detected, skipping localStorage data');
          localStorage.removeItem('isNewGame');
          shouldLoadPlayersFromDB = currentGameId !== null;
        }
        
        // Check if we're in incognito mode - we should always prioritize DB data in this case
        const isIncognitoMode = !window.indexedDB || 
          !window.localStorage || 
          window.navigator.userAgent.includes('incognito');
        
        // ALWAYS prioritize database data over localStorage for consistency
        const shouldPrioritizeDatabase = true; // Changed to always prioritize DB data
        
        if (isIncognitoMode) {
          console.log('📂 STARTUP: Incognito mode detected, prioritizing database data over localStorage');
        } else {
          console.log('📂 STARTUP: Regular browser mode, also prioritizing database data for consistency');
        }
        
        // Check if we have local data (for fallback only)
        const localData = loadFromLocalStorage();
        
        // Only use local data if we have no game ID at all AND we want to allow fallbacks
        // We've changed the behavior to prioritize database data consistently
        if (!currentGameId && !shouldPrioritizeDatabase) {
          if (localData && localData.questions.length > 0) {
            console.log('📂 STARTUP: No game ID available, using localStorage as fallback');
            setQuestions(localData.questions);
            setCategoryDescriptions(localData.categoryDescriptions);
            
            if (localData.players && localData.players.length > 0) {
              console.log('📂 STARTUP: Using local players as fallback:', localData.players.length);
              setPlayers(localData.players);
            }
          }
          
          setIsLoadingGameState(false);
          return;
        }
        
        // Since we now always prioritize database, we'll always try to load from database
        if (shouldPrioritizeDatabase || isIncognitoMode) {
          console.log('📂 STARTUP: Prioritizing database data over localStorage');
          // We'll continue with database loading below
        }
        
        // When we have a game ID, always load from database
        console.log('📂 STARTUP: Will load all data from database for gameId:', currentGameId);
        
        // If we need a new game or don't have any data, create a default state
        if (freshGameNeeded || !currentGameId) {
          console.log('📂 STARTUP: Setting up new empty game');
          
          // We're starting fresh, so keep the default empty state
          setIsLoadingGameState(false);
          return;
        }
        
        console.log('📂 STARTUP: Loading game data from database for game:', currentGameId);
        
        // Always try to load players from database when we have a game ID
        console.log('👤 STARTUP: Loading players from database for game:', currentGameId);
        const { data: playersData = [], error: playersError } = 
          await supabase
            .from('game_players')
            .select('player_name, player_score, avatar_url')
            .eq('game_id', currentGameId)
            .order('created_at', { ascending: true });
            
        // Process players data
        if (playersError) {
          console.error('STARTUP: Failed to load players:', playersError);
        } else if (playersData && playersData.length > 0) {
          // Deduplicate by player name
          const uniquePlayers = Array.from(new Map(playersData.map(p => [p.player_name, p])).values());
          const loadedPlayers = uniquePlayers.map((player, index) => ({
            id: index + 1,
            name: player.player_name,
            score: player.player_score,
            avatar: player.avatar_url || undefined
          }));
          console.log('✅ STARTUP: Loaded unique players from database:', loadedPlayers.length);
          setPlayers(loadedPlayers);
        }
        
        // Always load categories and descriptions from the database when we have a gameId
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('game_categories')
          .select('category_name, description')
          .eq('game_id', currentGameId)
          .order('category_name');
        
        categoriesLoaded = false;
        if (categoriesError) {
          console.error('STARTUP: Failed to load categories:', categoriesError);
        } else if (categoriesData && categoriesData.length > 0) {
          // Deduplicate by category name
          const uniqueCategories = Array.from(new Map(categoriesData.map(c => 
            [c.category_name, { category_name: c.category_name, description: c.description }]
          )).values());
          
          const loadedDescriptions = uniqueCategories.map(cat => ({
            category: cat.category_name,
            description: cat.description || ''
          }));
          console.log('✅ STARTUP: Loaded unique categories from database:', loadedDescriptions.length);
          setCategoryDescriptions(loadedDescriptions);
          categoriesLoaded = true;
        } else {
          console.log('⚠️ STARTUP: No categories found in database for game:', currentGameId);
        }
        
        if (playersError) {
          console.error('STARTUP: Failed to load players:', playersError);
        } else if (playersData && playersData.length > 0) {
          // Deduplicate by player name
          const uniquePlayers = Array.from(new Map(playersData.map(p => [p.player_name, p])).values());
          const loadedPlayers = uniquePlayers.map((player, index) => ({
            id: index + 1,
            name: player.player_name,
            score: player.player_score,
            avatar: player.avatar_url || undefined
          }));
          console.log('✅ STARTUP: Loaded unique players from database:', loadedPlayers.length);
          setPlayers(loadedPlayers);
          
          // Also save the loaded players to localStorage for offline use
          if (localData) {
            const updatedLocalData = {
              ...localData,
              players: loadedPlayers,
            };
            console.log('💾 STARTUP: Saving database players to localStorage');
            forceSaveToLocal(
              localData.questions, 
              localData.categoryDescriptions, 
              loadedPlayers
            );
          }
        }
        
        // Always load questions for the current game ID from the database
        console.log('📝 STARTUP: Loading questions for game ID:', currentGameId);
        
        const { data: questionsData = [], error: questionsError } = await supabase
          .from('game_questions')
          .select('*')
          .eq('game_id', currentGameId);
          
        questionsLoaded = false;
        if (questionsError) {
          console.error('STARTUP: Failed to load questions:', questionsError);
        } else if (questionsData && questionsData.length > 0) {
          // Deduplicate by question id
          const uniqueQuestions = Array.from(new Map(questionsData.map(q => 
            [q.id, q]
          )).values());
          
          const loadedQuestions = uniqueQuestions.map(q => ({
            id: q.question_id,
            category: q.category,
            points: q.points,
            question: q.question,
            answer: q.answer,
            bonusPoints: q.bonus_points || 0,
            imageUrl: q.image_url || '',
            videoUrl: q.video_url || '',
            mediaAssignment: (q.media_assignment as 'question' | 'answer' | 'both') || 'both'
          }));
          
          console.log('✅ STARTUP: Loaded unique questions from database:', loadedQuestions.length);
          setQuestions(loadedQuestions);
          questionsLoaded = true;
          
          // Load answered questions
          const answeredQuestionIds = questionsData
            .filter(q => q.is_answered)
            .map(q => q.question_id);
          
          if (answeredQuestionIds.length > 0) {
            setAnsweredQuestions(new Set(answeredQuestionIds));
            console.log('✅ STARTUP: Loaded answered questions:', answeredQuestionIds.length);
          }
        } else {
          console.log('⚠️ STARTUP: No questions found in database for this game');
        }

        
      } catch (error) {
        console.error('STARTUP: Failed to load from database:', error);
        
        // Use localStorage as a complete fallback when database loading fails
        const localData = loadFromLocalStorage();
        if (localData && localData.questions.length > 0) {
          console.log('📂 STARTUP: Using localStorage fallback after database error');
          
          // Load all data from localStorage as fallback
          setQuestions(localData.questions);
          setCategoryDescriptions(localData.categoryDescriptions);
          
          // Also load players if available
          if (localData.players && localData.players.length > 0) {
            setPlayers(localData.players);
          }
        }
      } finally {
        console.log('=== STARTUP: GAME STATE LOADING COMPLETE ===');
        
        // If we successfully loaded from database and have questions, update localStorage
        if (questions.length > 0) {
          console.log('💾 STARTUP: Updating localStorage with database data');
          forceSaveToLocal(questions, categoryDescriptions, players);
        }
        
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
    if (questions.length > 0 || categoryDescriptions.length > 0 || players.length > 0) {
      console.log('💾 Auto-saving changes to localStorage');
      forceSaveToLocal(questions, categoryDescriptions, players);
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
      toast({
        title: 'Game saved!',
        description: 'Your game was saved to the database.',
        duration: 3000,
        className: 'bg-[#2c5b69] text-white text-xs',
      });
    } catch (error) {
      console.error('❌ MANUAL SAVE: Failed to save game manually:', error);
      throw error;
    }
  }, [triggerManualSave]);

  return {
    handleSaveGame
  };
};
