import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from '../components/GameBoard';
import QuestionModal from '../components/QuestionModal';
import GameControls from '../components/GameControls';
import GameEditor from '../components/GameEditor';
import ScoreManager from '../components/ScoreManager';
import GameHistory from '../components/GameHistory';
import PlayerScores from '../components/PlayerScores';
import ScoringModal from '../components/ScoringModal';
import PasscodeScreen from '../components/PasscodeScreen';
import { Question, Player, CategoryDescription } from '../types/game';
import { useGameData } from '../hooks/useGameData';
import { initializeSpeechSystem } from '../utils/textToSpeech';
import { useTheme } from '../hooks/useTheme';
import { usePasscode } from '../contexts/PasscodeContext';

const sampleQuestions: Question[] = [
  // Category 1: Company History
  { id: 1, category: "Company History", points: 100, question: "In what year was Brandsmen founded?", answer: "What is 2010?" },
  { id: 2, category: "Company History", points: 200, question: "Who is the founder and CEO of Brandsmen?", answer: "Who is John Smith?" },
  { id: 3, category: "Company History", points: 300, question: "What was Brandsmen's first major client?", answer: "What is ABC Corporation?" },
  { id: 4, category: "Company History", points: 400, question: "In which city is Brandsmen's headquarters located?", answer: "What is New York?" },
  { id: 5, category: "Company History", points: 500, question: "What milestone did Brandsmen achieve in 2020?", answer: "What is reaching 100 employees?" },
  { id: 6, category: "Services", points: 100, question: "What is Brandsmen's primary service offering?", answer: "What is brand strategy?" },
  { id: 7, category: "Services", points: 200, question: "Which department handles digital marketing campaigns?", answer: "What is the Digital Team?" },
  { id: 8, category: "Services", points: 300, question: "What type of analysis does Brandsmen provide to understand market position?", answer: "What is competitive analysis?" },
  { id: 9, category: "Services", points: 400, question: "Which service helps clients improve their online presence?", answer: "What is SEO optimization?" },
  { id: 10, category: "Services", points: 500, question: "What comprehensive service package includes strategy, creative, and execution?", answer: "What is full-service branding?" },
  { id: 11, category: "Team Culture", points: 100, question: "What is the name of Brandsmen's annual team retreat?", answer: "What is Brand Summit?" },
  { id: 12, category: "Team Culture", points: 200, question: "Which day of the week features team lunch at the office?", answer: "What is Friday?" },
  { id: 13, category: "Team Culture", points: 300, question: "What recognition program rewards outstanding employee performance?", answer: "What is the Excellence Award?" },
  { id: 14, category: "Team Culture", points: 400, question: "What flexible work policy was implemented in 2021?", answer: "What is hybrid working?" },
  { id: 15, category: "Team Culture", points: 500, question: "What wellness initiative provides mental health support to employees?", answer: "What is the Employee Assistance Program?" },
  { id: 16, category: "Industry Knowledge", points: 100, question: "What does ROI stand for in marketing?", answer: "What is Return on Investment?" },
  { id: 17, category: "Industry Knowledge", points: 200, question: "Which social media platform is best for B2B marketing?", answer: "What is LinkedIn?" },
  { id: 18, category: "Industry Knowledge", points: 300, question: "What metric measures the percentage of email recipients who click on a link?", answer: "What is click-through rate?" },
  { id: 19, category: "Industry Knowledge", points: 400, question: "What framework is used to analyze Strengths, Weaknesses, Opportunities, and Threats?", answer: "What is SWOT analysis?" },
  { id: 20, category: "Industry Knowledge", points: 500, question: "What emerging technology is revolutionizing personalized marketing?", answer: "What is artificial intelligence?" },
  { id: 21, category: "Fun Facts", points: 100, question: "What beverage is always stocked in the office kitchen?", answer: "What is coffee?" },
  { id: 22, category: "Fun Facts", points: 200, question: "Which employee holds the office ping pong championship?", answer: "Who is Sarah from Creative?" },
  { id: 23, category: "Fun Facts", points: 300, question: "What plant species thrives in the office lobby?", answer: "What is a fiddle leaf fig?" },
  { id: 24, category: "Fun Facts", points: 400, question: "Which team tradition involves wearing themed costumes every Halloween?", answer: "What is the annual costume contest?" },
  { id: 25, category: "Fun Facts", points: 500, question: "What surprise did the company arrange for the 10th anniversary celebration?", answer: "What is a surprise party with a live band?" }
];

const Index = () => {
  const { isAuthenticated, setPasscode, logout } = usePasscode();
  
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
  const [categoryDescriptions, setCategoryDescriptions] = useState<CategoryDescription[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [showScoring, setShowScoring] = useState(false);
  const [showGameEditor, setShowGameEditor] = useState(false);
  const [showScoreManager, setShowScoreManager] = useState(false);
  const [showGameHistory, setShowGameHistory] = useState(false);
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Team 1', score: 0 },
    { id: 2, name: 'Team 2', score: 0 }
  ]);
  const [isLoadingGameState, setIsLoadingGameState] = useState(true);
  const [hasDataLoaded, setHasDataLoaded] = useState(false);

  const { saveGame, loadRecentGames, isLoading } = useGameData();
  const { theme } = useTheme();

  const categories = Array.from(new Set(questions.map(q => q.category)));
  const pointValues = [100, 200, 300, 400, 500];

  // Create a stable loadRecentGames function to avoid infinite loops
  const stableLoadRecentGames = useCallback(() => {
    return loadRecentGames(1);
  }, []);

  // Load existing game state on component mount
  useEffect(() => {
    const loadGameState = async () => {
      if (!isAuthenticated) {
        setIsLoadingGameState(false);
        return;
      }

      try {
        console.log('Loading game state from database...');
        const recentGames = await stableLoadRecentGames();
        console.log('Recent games loaded:', recentGames);
        
        if (recentGames.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const todaysGame = recentGames.find(game => {
            const gameDate = new Date(game.game_date).toISOString().split('T')[0];
            console.log('Comparing dates:', { today, gameDate, match: today === gameDate });
            return today === gameDate;
          });
          
          console.log('Todays game found:', todaysGame);
          
          if (todaysGame) {
            // Load players from the database
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

            // Load questions from the database
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
              console.log('Loaded questions from database:', loadedQuestions);
              setQuestions(loadedQuestions);

              // Load answered questions
              const answeredIds = todaysGame.game_questions
                .filter(q => q.is_answered)
                .map(q => q.question_id);
              console.log('Loaded answered questions:', answeredIds);
              setAnsweredQuestions(new Set(answeredIds));
            }

            // Load category descriptions from the database
            if (todaysGame.game_categories && todaysGame.game_categories.length > 0) {
              const loadedDescriptions: CategoryDescription[] = todaysGame.game_categories.map(cat => ({
                category: cat.category_name,
                description: cat.description || ''
              }));
              console.log('Loaded category descriptions:', loadedDescriptions);
              setCategoryDescriptions(loadedDescriptions);
            }
            
            setHasDataLoaded(true);
          }
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
        // Continue with default data if loading fails
      } finally {
        setIsLoadingGameState(false);
        if (!hasDataLoaded) {
          setHasDataLoaded(true);
        }
      }
    };

    loadGameState();
  }, [isAuthenticated, stableLoadRecentGames, hasDataLoaded]);

  // Auto-save game state every 20 minutes
  useEffect(() => {
    if (!isAuthenticated || isLoadingGameState || !hasDataLoaded) {
      console.log('Skipping auto-save setup:', { isAuthenticated, isLoadingGameState, hasDataLoaded });
      return;
    }

    // Set up auto-save every 20 minutes (1200000 ms)
    const autoSaveInterval = setInterval(async () => {
      try {
        console.log('Auto-saving game state...');
        await saveGame(players, questions, Array.from(answeredQuestions), categoryDescriptions, undefined, false);
        console.log('Game state auto-saved successfully');
      } catch (error) {
        console.error('Failed to auto-save game state:', error);
      }
    }, 1200000); // 20 minutes

    return () => clearInterval(autoSaveInterval);
  }, [players, questions, answeredQuestions, categoryDescriptions, saveGame, isAuthenticated, isLoadingGameState, hasDataLoaded]);

  const handleQuestionSelect = (category: string, points: number) => {
    const question = questions.find(q => q.category === category && q.points === points);
    if (question) {
      setSelectedQuestion(question);
    }
  };

  const handleQuestionClose = () => {
    if (selectedQuestion && !answeredQuestions.has(selectedQuestion.id)) {
      setAnsweredQuestions(prev => new Set([...prev, selectedQuestion.id]));
      setShowScoring(true);
    }
    setSelectedQuestion(null);
  };

  const handleScorePlayer = (playerId: number, points: number) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, score: p.score + points } : p
    ));
    // Don't close scoring modal automatically
  };

  const handleSaveGame = async () => {
    try {
      console.log('Manual save triggered');
      await saveGame(players, questions, Array.from(answeredQuestions), categoryDescriptions, undefined, true);
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  };

  const handleStartNewGame = (newPasscode?: string) => {
    // Update the passcode if provided
    if (newPasscode) {
      setPasscode(newPasscode);
      // Log out the user so they need to re-authenticate with the new passcode
      logout();
      return; // Exit early as the user will be redirected to the passcode screen
    }
    
    // Reset all game state
    setQuestions(sampleQuestions);
    setAnsweredQuestions(new Set());
    setCategoryDescriptions([]);
    setPlayers([
      { id: 1, name: 'Team 1', score: 0 },
      { id: 2, name: 'Team 2', score: 0 }
    ]);
    setSelectedQuestion(null);
    setShowScoring(false);
    setShowGameEditor(false);
    setShowScoreManager(false);
    setShowGameHistory(false);
    setHasDataLoaded(false); // Reset this so new data can be loaded
  };

  const handleCategoryDescriptionUpdate = (category: string, description: string) => {
    const existingIndex = categoryDescriptions.findIndex(desc => desc.category === category);
    let updatedDescriptions;
    
    if (existingIndex >= 0) {
      updatedDescriptions = categoryDescriptions.map(desc =>
        desc.category === category ? { ...desc, description } : desc
      );
    } else {
      updatedDescriptions = [...categoryDescriptions, { category, description }];
    }
    
    setCategoryDescriptions(updatedDescriptions);
  };

  // Initialize speech system on app load
  useEffect(() => {
    initializeSpeechSystem();
  }, []);

  // Show passcode screen if not authenticated
  if (!isAuthenticated) {
    return <PasscodeScreen />;
  }

  // Show loading state while game state is being loaded
  if (isLoadingGameState) {
    return (
      <div className="min-h-screen bg-cover bg-top bg-no-repeat flex items-center justify-center"
           style={{ backgroundImage: 'url(/lovable-uploads/d1647a56-db6d-4277-aeb4-395f4275273b.png)' }}>
        <div className="text-center">
          <div className="text-xl font-bold mb-4" style={{ color: '#2c5b69' }}>Loading Game...</div>
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f1f5f9' }}>
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
          onQuestionSelect={handleQuestionSelect}
          onCategoryDescriptionUpdate={handleCategoryDescriptionUpdate}
        />

        <PlayerScores players={players} />

        <GameControls
          players={players}
          onPlayersUpdate={setPlayers}
          onSaveGame={handleSaveGame}
          onShowGameHistory={() => setShowGameHistory(true)}
          onShowGameEditor={() => setShowGameEditor(true)}
          onShowScoreManager={() => setShowScoreManager(true)}
          onStartNewGame={handleStartNewGame}
          isLoading={isLoading}
        />
        
        {/* Modals */}
        {selectedQuestion && (
          <QuestionModal
            question={selectedQuestion}
            players={players}
            onClose={handleQuestionClose}
            onScorePlayer={handleScorePlayer}
          />
        )}

        <GameEditor
          questions={questions}
          categoryDescriptions={categoryDescriptions}
          onQuestionsUpdate={setQuestions}
          onCategoryDescriptionsUpdate={setCategoryDescriptions}
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
            onScorePlayer={handleScorePlayer}
            onClose={() => setShowScoring(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
