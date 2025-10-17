
import React, { useEffect } from 'react';
import PasscodeScreen from '../components/PasscodeScreen';
import GameLoadingScreen from '../components/GameLoadingScreen';
import GameContainer from '../components/GameContainer';
import { usePasscode } from '../contexts/PasscodeContext';
import { useGameData } from '../hooks/useGameData';
import { useGameState } from '../hooks/useGameState';
import { useGameEffects } from '../hooks/useGameEffects';

const Index = () => {
  const { isAuthenticated, setPasscode, logout } = usePasscode();
  const { isLoading } = useGameData();
  
  // Check for hard reset flag and passcode updates on component mount
  useEffect(() => {
    const hardResetFlag = sessionStorage.getItem('hard-reset-new-game');
    const newGamePasscode = sessionStorage.getItem('new-game-passcode');
    
    // Handle new passcode first (might not have a hard reset flag)
    if (newGamePasscode) {
      console.log('🔑 Found new game passcode in session storage');
      localStorage.setItem('jeopardy-passcode', newGamePasscode);
      setPasscode(newGamePasscode);
      sessionStorage.removeItem('new-game-passcode');
    }
    
    // Handle hard reset scenario
    if (hardResetFlag === 'true') {
      console.log('🔥 Detected hard reset flag - ensuring clean state');
      // Remove the flag to prevent infinite refreshes
      sessionStorage.removeItem('hard-reset-new-game');
      
      // Clear any residual state from previous game
      localStorage.removeItem('jeopardy-game-state');
      
      // Restore the passcode if it was temporarily stored
      const tempPasscode = sessionStorage.getItem('temp-jeopardy-passcode');
      if (tempPasscode) {
        console.log('Restoring passcode from temporary storage');
        localStorage.setItem('jeopardy-passcode', tempPasscode);
        // Ensure we're authenticated with this passcode
        setPasscode(tempPasscode);
        sessionStorage.removeItem('temp-jeopardy-passcode');
      }
    }
  }, [setPasscode]);
  
  const {
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
    handleQuestionSelect,
    handleQuestionClose,
    handleScorePlayer,
    handleStartNewGame: baseHandleStartNewGame,
    handleCategoryDescriptionUpdate
  } = useGameState();

  const { handleSaveGame } = useGameEffects({
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
  });

  const handleStartNewGame = (newPasscode?: string) => {
    console.log('Starting new game, resetting all data');
    
    // Update the passcode if a new one is provided
    if (newPasscode) {
      console.log('Setting new passcode but staying logged in');
      
      // Store the new passcode in sessionStorage to survive the reload
      sessionStorage.setItem('new-game-passcode', newPasscode);
      
      // Update the passcode in the context
      setPasscode(newPasscode);
      
      // Also update localStorage directly to ensure it persists through reload
      localStorage.setItem('jeopardy-passcode', newPasscode);
      
      // Add to temp storage as well for extra safety
      sessionStorage.setItem('temp-jeopardy-passcode', newPasscode);
    }
    
    // Always reset the game state regardless of passcode change
    baseHandleStartNewGame(newPasscode, players);
  };

  if (!isAuthenticated) {
    return <PasscodeScreen />;
  }

  if (isLoadingGameState) {
    return <GameLoadingScreen />;
  }

  return (
    <div>
      <GameContainer
      questions={questions}
      setQuestions={setQuestions}
      categoryDescriptions={categoryDescriptions}
      setCategoryDescriptions={setCategoryDescriptions}
      selectedQuestion={selectedQuestion}
      answeredQuestions={answeredQuestions}
      setAnsweredQuestions={setAnsweredQuestions}
      showScoring={showScoring}
      setShowScoring={setShowScoring}
      showGameEditor={showGameEditor}
      setShowGameEditor={setShowGameEditor}
      showScoreManager={showScoreManager}
      setShowScoreManager={setShowScoreManager}
      showGameHistory={showGameHistory}
      setShowGameHistory={setShowGameHistory}
      players={players}
      setPlayers={setPlayers}
      categories={categories}
      pointValues={pointValues}
      onQuestionSelect={handleQuestionSelect}
      onQuestionClose={handleQuestionClose}
      onScorePlayer={handleScorePlayer}
      onSaveGame={handleSaveGame}
      onStartNewGame={handleStartNewGame}
      onCategoryDescriptionUpdate={handleCategoryDescriptionUpdate}
      isLoading={isLoading}
    />
    </div>
  );
};

export default Index;
