
import React from 'react';
import GameBoard from './GameBoard';
import QuestionModal from './QuestionModal';
import GameControls from './GameControls';
import GameEditor from './GameEditor';
import ScoreManager from './ScoreManager';
import GameHistory from './GameHistory';
import PlayerScores from './PlayerScores';
import ScoringModal from './ScoringModal';
import { Question, Player, CategoryDescription } from '../types/game';

interface GameContainerProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  categoryDescriptions: CategoryDescription[];
  setCategoryDescriptions: (descriptions: CategoryDescription[]) => void;
  selectedQuestion: Question | null;
  answeredQuestions: Set<number>;
  setAnsweredQuestions: (answered: Set<number>) => void;
  showScoring: boolean;
  setShowScoring: (show: boolean) => void;
  showGameEditor: boolean;
  setShowGameEditor: (show: boolean) => void;
  showScoreManager: boolean;
  setShowScoreManager: (show: boolean) => void;
  showGameHistory: boolean;
  setShowGameHistory: (show: boolean) => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
  categories: string[];
  pointValues: number[];
  onQuestionSelect: (category: string, points: number) => void;
  onQuestionClose: () => void;
  onScorePlayer: (playerId: number, points: number) => void;
  onSaveGame: () => void;
  onStartNewGame: (newPasscode?: string) => void;
  onCategoryDescriptionUpdate: (category: string, description: string) => void;
  isLoading: boolean;
}

const GameContainer: React.FC<GameContainerProps> = ({
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
  categories,
  pointValues,
  onQuestionSelect,
  onQuestionClose,
  onScorePlayer,
  onSaveGame,
  onStartNewGame,
  onCategoryDescriptionUpdate,
  isLoading
}) => {
  React.useEffect(() => {
    console.log('[GameContainer] answeredQuestions:', Array.from(answeredQuestions));
  }, [answeredQuestions]);

  return (
    <div className="min-h-screen bg-cover bg-top bg-no-repeat" 
         style={{ backgroundImage: 'url(/lovable-uploads/d1647a56-db6d-4277-aeb4-395f4275273b.png)' }}>
      <div className="container mx-auto p-4 space-y-6">
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <h1 className="main-title font-bold mb-2 tracking-wider text-lg sm:text-xl lg:text-2xl" 
              style={{ fontFamily: 'arial', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            JEOPARDY: BRANDSMEN EDITION
          </h1>
        </div>
        
        <GameBoard
          categories={categories}
          pointValues={pointValues}
          questions={questions}
          answeredQuestions={answeredQuestions}
          categoryDescriptions={categoryDescriptions}
          onQuestionSelect={onQuestionSelect}
          onCategoryDescriptionUpdate={onCategoryDescriptionUpdate}
        />

        <PlayerScores 
          players={players} 
          onScoreChange={onScorePlayer}
          setPlayers={setPlayers} 
        />

        <GameControls
          players={players}
          onPlayersUpdate={setPlayers}
          onSaveGame={onSaveGame}
          onShowGameHistory={() => setShowGameHistory(true)}
          onShowGameEditor={() => setShowGameEditor(true)}
          onShowScoreManager={() => setShowScoreManager(true)}
          onStartNewGame={onStartNewGame}
          isLoading={isLoading}
        />
        
        {/* Modals */}
        {selectedQuestion && (
          <QuestionModal
            question={selectedQuestion}
            players={players}
            onClose={onQuestionClose}
            onScorePlayer={onScorePlayer}
            answeredQuestions={answeredQuestions}
            setAnsweredQuestions={setAnsweredQuestions}
            setPlayers={setPlayers}
          />
        )}

        <GameEditor
          questions={questions}
          categoryDescriptions={categoryDescriptions}
          onQuestionsUpdate={setQuestions}
          onCategoryDescriptionsUpdate={setCategoryDescriptions}
          answeredQuestions={answeredQuestions}
          setAnsweredQuestions={setAnsweredQuestions}
          isVisible={showGameEditor}
          onClose={() => setShowGameEditor(false)}
        />

        <ScoreManager
          players={players}
          onPlayersUpdate={setPlayers}
          isVisible={showScoreManager}
          onClose={() => setShowScoreManager(false)}
        />

        <GameHistory
          isVisible={showGameHistory}
          onClose={() => setShowGameHistory(false)}
        />

        {showScoring && (
          <ScoringModal
            players={players}
            answeredQuestions={answeredQuestions}
            questions={questions}
            onScorePlayer={onScorePlayer}
            onClose={() => setShowScoring(false)}
          />
        )}
      </div>
    </div>
  );
};

export default GameContainer;
