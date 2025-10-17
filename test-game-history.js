// Test Game History Saving
// Run this in the browser console to test game history functionality

const testGameHistorySaving = async () => {
  console.log('🧪 Testing Game History Saving...');
  
  // Mock some test players
  const testPlayers = [
    { id: '1', name: 'Alice', score: 1500, avatar: null },
    { id: '2', name: 'Bob', score: 1200, avatar: null },
    { id: '3', name: 'Charlie', score: 800, avatar: null }
  ];
  
  try {
    // Import the function
    const { saveGameToHistory } = await import('./src/services/database/historyOperations.ts');
    
    console.log('📝 Attempting to save test game...');
    const historyId = await saveGameToHistory(testPlayers);
    
    if (historyId) {
      console.log('✅ SUCCESS: Game saved with ID:', historyId);
    } else {
      console.log('❌ FAILED: No history ID returned');
    }
    
    // Test loading history
    const { loadGameHistory } = await import('./src/services/database/historyOperations.ts');
    console.log('📖 Loading game history...');
    const history = await loadGameHistory(5);
    console.log('📊 Loaded history:', history);
    
    return { success: !!historyId, historyId, historyCount: history.length };
  } catch (error) {
    console.error('🚨 Test failed:', error);
    return { success: false, error: error.message };
  }
};

// Also test the database connection
const testDatabaseConnection = async () => {
  try {
    const { testConnection } = await import('./src/services/database/connectionService.ts');
    const result = await testConnection();
    console.log('🔗 Database connection test:', result);
    return true;
  } catch (error) {
    console.error('🚨 Database connection failed:', error);
    return false;
  }
};

// Run tests
window.testGameHistory = testGameHistorySaving;
window.testDbConnection = testDatabaseConnection;

console.log('🧪 Test functions loaded! Run in console:');
console.log('testGameHistory() - Test saving/loading game history');
console.log('testDbConnection() - Test database connection');