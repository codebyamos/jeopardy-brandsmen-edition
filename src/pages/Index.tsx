
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import GameBoard from '../components/GameBoard';
import QuestionModal from '../components/QuestionModal';
import GameControls from '../components/GameControls';
import GameEditor from '../components/GameEditor';
import ScoreManager from '../components/ScoreManager';
import GameHistory from '../components/GameHistory';
import { Question, Player } from '../types/game';
import { useGameData } from '../hooks/useGameData';

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
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
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

  const { saveGame, isLoading } = useGameData();

  const categories = Array.from(new Set(questions.map(q => q.category)));
  const pointValues = [100, 200, 300, 400, 500];

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
    setShowScoring(false);
  };

  const handleSaveGame = async () => {
    try {
      await saveGame(players);
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-2 sm:p-4 lg:p-8">
      <div className="container mx-auto">
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <h1 className="main-title font-bold text-yellow-400 mb-2 tracking-wider text-lg sm:text-xl lg:text-2xl" style={{ fontFamily: 'arial', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            JEOPARDY: BRANDSMEN EDITION
          </h1>
        </div>
        
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <GameBoard
            categories={categories}
            pointValues={pointValues}
            questions={questions}
            answeredQuestions={answeredQuestions}
            onQuestionSelect={handleQuestionSelect}
          />
        </div>
        
        {/* Bottom Player Scores with Avatars */}
        <div className="mb-4 flex justify-center">
          <div className="flex flex-wrap gap-2 sm:gap-4 lg:gap-8 justify-center">
            {players.map((player) => (
              <div key={player.id} className="bg-yellow-400 text-black rounded-lg px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 min-w-[100px] sm:min-w-[120px] text-center" style={{ backgroundColor: '#fa1e4e' }}>
                {/* Name with Avatar */}
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                  {player.avatar && (
                    <img 
                      src={player.avatar} 
                      alt={`${player.name} avatar`}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-white/30 flex-shrink-0"
                    />
                  )}
                  <div className="font-bold text-sm sm:text-lg" style={{fontWeight: '400'}}>{player.name}</div>
                </div>
                <div className="bg-blue-800 text-white rounded px-2 sm:px-4 py-1 sm:py-2 text-base sm:text-xl font-bold" style={{backgroundColor: '#1c1726', fontWeight:'400', fontSize: '14px', padding: '3px 3px'}}>
                  {player.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consolidated Game Controls */}
        <GameControls
          players={players}
          onPlayersUpdate={setPlayers}
          onSaveGame={handleSaveGame}
          onShowGameHistory={() => setShowGameHistory(true)}
          onShowGameEditor={() => setShowGameEditor(true)}
          onShowScoreManager={() => setShowScoreManager(true)}
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
          onQuestionsUpdate={setQuestions}
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

        {/* Score Assignment Overlay */}
        {showScoring && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full p-4 sm:p-6">
              <h3 className="text-yellow-400 text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center" style={{color: '#fa1e4e'}}>Award Points</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {players.map((player) => (
                  <div key={player.id} className="flex justify-between items-center bg-gray-800 rounded-lg p-3 sm:p-4">
                    <span className="text-white text-lg sm:text-xl font-medium">{player.name}</span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleScorePlayer(player.id, answeredQuestions.size > 0 ? 
                          Array.from(answeredQuestions).slice(-1).map(id => 
                            questions.find(q => q.id === id)?.points || 0
                          )[0] : 0)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-lg px-3 sm:px-4 py-2"
                      >
                        +Points
                      </Button>
                      <Button
                        onClick={() => handleScorePlayer(player.id, -(answeredQuestions.size > 0 ? 
                          Array.from(answeredQuestions).slice(-1).map(id => 
                            questions.find(q => q.id === id)?.points || 0
                          )[0] : 0))}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-lg px-3 sm:px-4 py-2"
                      >
                        -Points
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4 sm:mt-6">
                <Button
                  onClick={() => setShowScoring(false)}
                  variant="outline"
                  className="text-white border-gray-600 hover:bg-gray-800"
                >
                  Skip Scoring
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
