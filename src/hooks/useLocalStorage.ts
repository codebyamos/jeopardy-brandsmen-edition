
import { useState, useEffect } from 'react';
import { Question, CategoryDescription } from '../types/game';

interface GameState {
  questions: Question[];
  categoryDescriptions: CategoryDescription[];
  lastSaved: string;
}

export const useLocalStorage = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const saveToLocalStorage = (questions: Question[], categoryDescriptions: CategoryDescription[]) => {
    const gameState: GameState = {
      questions,
      categoryDescriptions,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem('jeopardy-game-state', JSON.stringify(gameState));
    setHasUnsavedChanges(true);
    console.log('Saved to localStorage:', { questions: questions.length, categories: categoryDescriptions.length });
  };

  const loadFromLocalStorage = (): GameState | null => {
    try {
      const stored = localStorage.getItem('jeopardy-game-state');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Loaded from localStorage:', { questions: parsed.questions?.length || 0, categories: parsed.categoryDescriptions?.length || 0 });
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('jeopardy-game-state');
    setHasUnsavedChanges(false);
    console.log('Cleared localStorage');
  };

  const getLastSaved = (): string | null => {
    const stored = loadFromLocalStorage();
    return stored?.lastSaved || null;
  };

  const markAsSaved = () => {
    setHasUnsavedChanges(false);
  };

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    getLastSaved,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    markAsSaved
  };
};
