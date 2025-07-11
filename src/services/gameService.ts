// Re-export all functions for backward compatibility
export { testConnection } from './database/connectionService';
export { 
  createOrFindGame, 
  deleteGameData, 
  loadRecentGamesData 
} from './database/gameOperations';
export { 
  saveGamePlayers, 
  saveGameQuestions, 
  saveGameCategories 
} from './database/gameDataOperations';
