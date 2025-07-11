
import { useState, useCallback } from 'react';
import { Question, Player, CategoryDescription } from '../types/game';

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
    if (selectedQuestion && !answeredQuestions.has(selectedQuestion.id)) {
      setAnsweredQuestions(prev => new Set([...prev, selectedQuestion.id]));
      setShowScoring(true);
    }
    setSelectedQuestion(null);
  }, [selectedQuestion, answeredQuestions]);

  const handleScorePlayer = useCallback((playerId: number, points: number) => {
    console.log('🎯 handleScorePlayer called:', { playerId, points });
    console.log('🎯 Current players before update:', players);
    
    setPlayers(prev => {
      const updated = prev.map(p => 
        p.id === playerId ? { ...p, score: p.score + points } : p
      );
      console.log('🎯 Updated players after scoring:', updated);
      return updated;
    });
  }, [players]);

  const handleStartNewGame = useCallback((newPasscode?: string) => {
    // Reset all game state but keep database categories
    setQuestions([]);
    setAnsweredQuestions(new Set());
    setPlayers([]);
    setSelectedQuestion(null);
    setShowScoring(false);
    setShowGameEditor(false);
    setShowScoreManager(false);
    setShowGameHistory(false);
  }, []);

  const handleCategoryDescriptionUpdate = useCallback((category: string, description: string) => {
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
