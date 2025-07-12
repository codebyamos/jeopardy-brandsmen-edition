
import { useState, useEffect } from 'react';
import { Question, CategoryDescription, Player } from '../types/game';

interface GameState {
  questions: Question[];
  categoryDescriptions: CategoryDescription[];
  lastSaved: string;
  version: number;
  players?: Player[]; // Make players optional for backward compatibility
}

export const useLocalStorage = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const saveToLocalStorage = (
    questions: Question[], 
    categoryDescriptions: CategoryDescription[], 
    players?: Player[],
    silent: boolean = true
  ) => {
    const gameState: GameState = {
      questions,
      categoryDescriptions,
      lastSaved: new Date().toISOString(),
      version: Date.now(),
      players
    };
    
    localStorage.setItem('jeopardy-game-state', JSON.stringify(gameState));
    setHasUnsavedChanges(true);
    
    // Only log if not silent
    if (!silent) {
      console.log('💾 Saved to localStorage:', { 
        questions: questions.length, 
        categories: categoryDescriptions.length,
        players: players?.length || 0,
        version: gameState.version
      });
    }
  };

  const loadFromLocalStorage = (): GameState | null => {
    try {
      const stored = localStorage.getItem('jeopardy-game-state');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📂 Loaded from localStorage:', { 
          questions: parsed.questions?.length || 0, 
          categories: parsed.categoryDescriptions?.length || 0,
          version: parsed.version || 'legacy',
          lastSaved: parsed.lastSaved
        });
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
    console.log('🗑️ Cleared localStorage after database save');
  };

  const getLastSaved = (): string | null => {
    const stored = loadFromLocalStorage();
    return stored?.lastSaved || null;
  };

  const markAsSaved = () => {
    setHasUnsavedChanges(false);
  };

  // Force save any data immediately to localStorage
  const forceSaveToLocal = (questions: Question[], categoryDescriptions: CategoryDescription[], players?: Player[]) => {
    console.log('💾 Force saving to localStorage:', { 
      questions: questions.length, 
      categories: categoryDescriptions.length,
      players: players?.length || 0
    });
    saveToLocalStorage(questions, categoryDescriptions, players, false);
  };

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    getLastSaved,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    markAsSaved,
    forceSaveToLocal
  };
};
