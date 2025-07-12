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
export {
  deleteCategoryFromDatabase
} from './database/categoryOperations';
export {
  loadGamePlayers,
  refreshPlayers
} from './database/playerOperations';

// Export the new history operations
export {
  saveGameToHistory,
  loadGameHistory,
  deleteGameHistory
} from './database/historyOperations';

// Export database diagnostics
export {
  checkDatabaseTables,
  checkTableStructure,
  testInsertHistory,
  testMultipleGamesSameWinner
} from './database/databaseDiagnostics';
