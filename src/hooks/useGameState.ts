
import { useState, useCallback } from 'react';
import { Question, Player, CategoryDescription } from '../types/game';

// No sample questions - start completely empty
export const useGameState = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categoryDescriptions, setCategoryDescriptions] = useState<CategoryDescription[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [showScoring, setShowScoring] = useState(false);
  const [showGameEditor, setShowGameEditor] = useState(false);
  const [showScoreManager, setShowScoreManager] = useState(false);
  const [showGameHistory, setShowGameHistory] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoadingGameState, setIsLoadingGameState] = useState(true);

  // Get categories from database category descriptions, not from questions
  const categories = categoryDescriptions.map(desc => desc.category);
  const pointValues = [100, 200, 300, 400, 500];

  const handleQuestionSelect = useCallback((category: string, points: number) => {
    const question = questions.find(q => q.category === category && q.points === points);
    if (question) {
      setSelectedQuestion(question);
    }
  }, [questions]);

  const handleQuestionClose = useCallback(() => {
    // Do NOT mark as answered when closing; only the toggle controls the checkmark
    setSelectedQuestion(null);
  }, []);

  const handleScorePlayer = useCallback((playerId: number, points: number) => {
    console.log('🎯 handleScorePlayer called:', { playerId, points, pointsType: typeof points });
    console.log('🎯 Current players before update:', players);
    
    // Ensure points is a number
    const numericPoints = Number(points) || 0;
    
    setPlayers(prev => {
      const updated = prev.map(p => 
        p.id === playerId ? { ...p, score: numericPoints } : p
      );
      console.log('🎯 Updated players after scoring:', updated);
      
      // Log each player's score with type information
      updated.forEach(player => {
        console.log(`Player ${player.name} score: ${player.score} (${typeof player.score})`);
      });
      
      return updated;
    });
  }, [players]);

  const handleStartNewGame = useCallback(async (newPasscode?: string, currentPlayers?: Player[]) => {
    // Use passed players or fall back to hook state
    const playersToUse = currentPlayers || players;
    
    console.log('🔄 Starting new game, completely resetting all data');
    
    // First, save the current game state to history if there are players
    if (playersToUse.length > 0) {
      try {
        console.log('✅ Saving current game to history before reset');
        // Ensure all scores are proper numbers before saving
        const playersWithNumberScores = playersToUse.map(player => ({
          ...player,
          score: Number(player.score) || 0
        }));
        
        console.log('📋 STEP 1.5: SAVING TO HISTORY BEFORE RESET');
        const { saveGameToHistory } = await import('@/services/database/historyOperations');
        const historyId = await saveGameToHistory(playersWithNumberScores);
        
        console.log('✅ Successfully saved game to history with ID:', historyId);
        
        // Add a small delay to ensure save operation completes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify the save was successful by checking if we got a valid historyId
        if (!historyId) {
          console.error('❌ SAVE FAILED: No history ID returned');
          alert('Warning: Failed to save game to history. Continue anyway?');
        } else {
          console.log('✅ SAVE CONFIRMED: Game saved to history successfully');
        }
      } catch (error) {
        console.error('Failed to save game to history:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
        // Continue with reset even if history save fails
      }
    } else {
      console.log('❌ No players to save to history - skipping save');
    }
    
    // CRITICAL - Set flags in sessionStorage to control the reset process
    sessionStorage.setItem('hard-reset-new-game', 'true');
    sessionStorage.setItem('reset-in-progress', 'true');
    
    // For debugging - save start time
    sessionStorage.setItem('reset-start-time', new Date().toISOString());
    
    // Add clear console marker for easier debugging
    console.log('%c==== STARTING COMPLETE GAME RESET ====', 'background: red; color: white; font-size: 16px;');
    
    // Clear the application state immediately
    setAnsweredQuestions(new Set());
    setPlayers([]);
    setSelectedQuestion(null);
    setShowScoring(false);
    setShowGameEditor(false);
    setShowScoreManager(false);
    setShowGameHistory(false);
    setIsLoadingGameState(true);
    
    // Save any important settings before clearing storage
    const timerSettings = localStorage.getItem('timer-settings');
    const voiceSettings = localStorage.getItem('voice-settings');
    const passcodeValue = localStorage.getItem('jeopardy-passcode');
    const currentGameId = localStorage.getItem('currentGameId');
    
    // Preserve the passcode for authentication after reload
    if (passcodeValue) {
      sessionStorage.setItem('temp-jeopardy-passcode', passcodeValue);
    }
    
    // Set default game state immediately in UI
    const defaultCategory = "Category 1";
    const defaultQuestion: Question = {
      id: 1,
      category: defaultCategory,
      points: 100,
      question: "Click edit to modify this question",
      answer: "Click edit to set the answer",
      bonusPoints: 0,
    };
    
    setQuestions([defaultQuestion]);
    setCategoryDescriptions([{
      category: defaultCategory,
      description: ""
    }]);
    
    // Clear localStorage (except critical settings) before we start
    localStorage.clear();
    localStorage.removeItem('jeopardy-game-state');
    localStorage.setItem('isNewGame', 'true');
    
    // Restore settings
    if (timerSettings) localStorage.setItem('timer-settings', timerSettings);
    if (voiceSettings) localStorage.setItem('voice-settings', voiceSettings);
    if (passcodeValue) localStorage.setItem('jeopardy-passcode', passcodeValue);
    
    // Store the new default state in localStorage to prevent loading old data
    const newState = {
      questions: [defaultQuestion],
      categoryDescriptions: [{category: defaultCategory, description: ""}],
      players: [],
      lastSaved: new Date().toISOString(),
      version: Date.now()
    };
    localStorage.setItem('jeopardy-game-state', JSON.stringify(newState));
    
    console.log('📋 STEP 1: Local state reset complete');
    
    // CRITICAL: Now handle database operations in sequential order
    try {
      console.log('📋 STEP 2: Starting database operations');
      
      // Step 1: Delete existing game data if we have a game ID
      if (currentGameId) {
        console.log(`📋 STEP 2.1: Deleting game ${currentGameId} from database`);
        try {
          const { deleteGameData } = await import('@/services/gameService');
          await deleteGameData(currentGameId);
          console.log('✅ Successfully deleted previous game data from database');
          
          // Force a small delay to ensure deletion completes
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('❌ Failed to delete previous game data:', error);
        }
      } else {
        console.log('📋 STEP 2.1: No previous game ID found, skipping deletion');
      }
      
      // Step 2: Create a new game
      console.log('📋 STEP 2.2: Creating new game in database');
      const { createOrFindGame } = await import('@/services/gameService');
      const today = new Date().toISOString().split('T')[0];
      const newGameId = await createOrFindGame(today, null);
      
      // Save the new game ID to localStorage
      localStorage.setItem('currentGameId', newGameId);
      console.log('✅ Created brand new game in database with ID:', newGameId);
      
      // Store this ID in sessionStorage as well to ensure it persists
      sessionStorage.setItem('new-game-id', newGameId);
      
      console.log('📋 STEP 2: Database operations complete');
      
      // Step 3: Soft reset without page refresh to preserve console and save operation
      console.log('📋 STEP 3: Performing soft reset (no page refresh)');
      
      // Signal that reset was successful
      sessionStorage.setItem('reset-success', 'true');
      
      // Reset the loading state to trigger a fresh data load
      setIsLoadingGameState(false);
      
      // Clear the reset flags
      sessionStorage.removeItem('reset-in-progress');
      sessionStorage.removeItem('hard-reset-new-game');
      
      console.log('✅ SOFT RESET COMPLETE - Game history should be saved, new game ready');
      
    } catch (error) {
      console.error('❌ Failed during game reset process:', error);
      
      // Show error to user
      alert('There was a problem resetting the game. Please try again.');
      
      // Clear loading state
      setIsLoadingGameState(false);
      sessionStorage.removeItem('reset-in-progress');
    }
  }, []);

  const handleCategoryDescriptionUpdate = useCallback((category: string, description: string) => {
    const existingIndex = categoryDescriptions.findIndex(
      desc => desc.category.toLowerCase() === category.toLowerCase()
    );
    let updatedDescriptions;
    
    if (existingIndex >= 0) {
      updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category.toLowerCase() === category.toLowerCase() 
          ? { ...desc, description } 
          : desc
      );
    } else {
      updatedDescriptions = [...categoryDescriptions, { category, description }];
    }
    
    setCategoryDescriptions(updatedDescriptions);
    console.log(`✅ Category description updated for "${category}"`);
  }, [categoryDescriptions]);

  return {
    // State
    questions,
    setQuestions,
    categoryDescriptions,
    setCategoryDescriptions,
    selectedQuestion,
    answeredQuestions,
    setAnsweredQuestions,
    showScoring,
    setShowScoring,
    showGameEditor,
    setShowGameEditor,
    showScoreManager,
    setShowScoreManager,
    showGameHistory,
    setShowGameHistory,
    players,
    setPlayers,
    isLoadingGameState,
    setIsLoadingGameState,
    categories,
    pointValues,
    // Handlers
    handleQuestionSelect,
    handleQuestionClose,
    handleScorePlayer,
    handleStartNewGame,
    handleCategoryDescriptionUpdate
  };
};
