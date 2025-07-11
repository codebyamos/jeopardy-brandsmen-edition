import { useState } from 'react';
import { cleanupUnusedMedia } from '@/utils/mediaCleanup';
import { useGameSaving } from './gameData/gameSaving';
import { useGameManagement } from './gameData/gameManagement';

export const useGameData = () => {
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

  // Use the separated hook functions
  const { saveGame, isLoading: savingLoading } = useGameSaving(currentGameId, setCurrentGameId);
  const { 
    deleteGame, 
    loadRecentGames, 
    resetCurrentGame, 
    isLoading: managementLoading 
  } = useGameManagement(currentGameId, setCurrentGameId);

  // Combined loading state
  const isLoading = savingLoading || managementLoading;

  return {
    saveGame,
    deleteGame,
    loadRecentGames,
    resetCurrentGame,
    currentGameId,
    isLoading,
    cleanupUnusedMedia
  };
};
