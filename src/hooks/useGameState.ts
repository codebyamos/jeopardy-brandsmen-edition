
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
