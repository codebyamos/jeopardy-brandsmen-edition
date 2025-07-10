
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
  };

  const loadFromLocalStorage = (): GameState | null => {
    try {
      const stored = localStorage.getItem('jeopardy-game-state');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('jeopardy-game-state');
    setHasUnsavedChanges(false);
  };

  const getLastSaved = (): string | null => {
    const stored = loadFromLocalStorage();
    return stored?.lastSaved || null;
  };

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    getLastSaved,
    hasUnsavedChanges,
    setHasUnsavedChanges
  };
};
