import { useState, useEffect } from 'react';
import { Question, CategoryDescription } from '../types/game';

interface GameState {
  questions: Question[];
  categoryDescriptions: CategoryDescription[];
  lastSaved: string;
  version: number; // Add version tracking
}

export const useLocalStorage = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const saveToLocalStorage = (questions: Question[], categoryDescriptions: CategoryDescription[]) => {
    const gameState: GameState = {
      questions,
      categoryDescriptions,
      lastSaved: new Date().toISOString(),
      version: Date.now() // Use timestamp as version
    };
    
    // Save main state
    localStorage.setItem('jeopardy-game-state', JSON.stringify(gameState));
    
    // Save backup copies with timestamps
    const backupKey = `jeopardy-backup-${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(gameState));
    
    // Keep only the latest 5 backups
    const allKeys = Object.keys(localStorage);
    const backupKeys = allKeys.filter(key => key.startsWith('jeopardy-backup-'))
      .sort()
      .reverse();
    
    // Remove old backups, keep only latest 5
    backupKeys.slice(5).forEach(key => {
      localStorage.removeItem(key);
    });
    
    setHasUnsavedChanges(true);
    console.log('Saved to localStorage with backup:', { 
      questions: questions.length, 
      categories: categoryDescriptions.length,
      version: gameState.version,
      backups: Math.min(backupKeys.length + 1, 5)
    });
  };

  const loadFromLocalStorage = (): GameState | null => {
    try {
      const stored = localStorage.getItem('jeopardy-game-state');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Loaded from localStorage:', { 
          questions: parsed.questions?.length || 0, 
          categories: parsed.categoryDescriptions?.length || 0,
          version: parsed.version || 'legacy',
          lastSaved: parsed.lastSaved
        });
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Error loading from localStorage, trying backup:', error);
      return loadFromBackup();
    }
  };

  const loadFromBackup = (): GameState | null => {
    try {
      const allKeys = Object.keys(localStorage);
      const backupKeys = allKeys.filter(key => key.startsWith('jeopardy-backup-'))
        .sort()
        .reverse(); // Get most recent backup first
      
      for (const backupKey of backupKeys) {
        try {
          const backup = localStorage.getItem(backupKey);
          if (backup) {
            const parsed = JSON.parse(backup);
            console.log('Restored from backup:', backupKey, { 
              questions: parsed.questions?.length || 0, 
              categories: parsed.categoryDescriptions?.length || 0 
            });
            return parsed;
          }
        } catch (backupError) {
          console.error('Failed to load backup:', backupKey, backupError);
          continue;
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading from backup:', error);
      return null;
    }
  };

  const clearLocalStorage = () => {
    // Clear main storage
    localStorage.removeItem('jeopardy-game-state');
    
    // Clear all backups
    const allKeys = Object.keys(localStorage);
    const backupKeys = allKeys.filter(key => key.startsWith('jeopardy-backup-'));
    backupKeys.forEach(key => localStorage.removeItem(key));
    
    setHasUnsavedChanges(false);
    console.log('Cleared localStorage and all backups');
  };

  const getLastSaved = (): string | null => {
    const stored = loadFromLocalStorage();
    return stored?.lastSaved || null;
  };

  const markAsSaved = () => {
    setHasUnsavedChanges(false);
    console.log('Marked as saved - unsaved changes cleared');
  };

  const getLocalStorageStats = () => {
    const allKeys = Object.keys(localStorage);
    const backupKeys = allKeys.filter(key => key.startsWith('jeopardy-backup-'));
    const mainState = loadFromLocalStorage();
    
    return {
      hasMainState: !!mainState,
      backupCount: backupKeys.length,
      lastSaved: mainState?.lastSaved,
      version: mainState?.version,
      hasUnsavedChanges
    };
  };

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    getLastSaved,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    markAsSaved,
    getLocalStorageStats
  };
};
