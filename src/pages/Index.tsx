
import React from 'react';
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
    // Update the passcode if provided
    if (newPasscode) {
      setPasscode(newPasscode);
      // Log out the user so they need to re-authenticate with the new passcode
      logout();
      return; // Exit early as the user will be redirected to the passcode screen
    }
    
    baseHandleStartNewGame();
  };

  // Show passcode screen if not authenticated
  if (!isAuthenticated) {
    return <PasscodeScreen />;
  }

  // Show loading state while game state is being loaded
  if (isLoadingGameState) {
    return <GameLoadingScreen />;
  }

  return (
    <GameContainer
      questions={questions}
      setQuestions={setQuestions}
      categoryDescriptions={categoryDescriptions}
      setCategoryDescriptions={setCategoryDescriptions}
      selectedQuestion={selectedQuestion}
      answeredQuestions={answeredQuestions}
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
  );
};

export default Index;
