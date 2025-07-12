import { saveGameToHistory } from './historyOperations';
import { Player } from '@/types/game';

/**
 * Test function to demonstrate the game saving flow
 */
export const testGameSavingFlow = async () => {
  console.log('=== TESTING GAME SAVING FLOW ===');
  
  // Test 1: Try to save game with no players (this is what's happening in your case)
  console.log('\n🔍 TEST 1: Saving game with no players');
  try {
    const result1 = await saveGameToHistory([]);
    console.log('✅ Result with no players:', result1); // Should return null
  } catch (error) {
    console.error('❌ Error with no players:', error);
  }
  
  // Test 2: Save game with players (this is what should happen)
  console.log('\n🔍 TEST 2: Saving game with players');
  try {
    const testPlayers: Player[] = [
      { id: 1, name: 'Player 1', score: 100 },
      { id: 2, name: 'Player 2', score: 200 },
      { id: 3, name: 'Player 3', score: 150 }
    ];
    
    const result2 = await saveGameToHistory(testPlayers);
    console.log('✅ Result with players:', result2); // Should return game ID
  } catch (error) {
    console.error('❌ Error with players:', error);
  }
  
  console.log('\n=== TEST COMPLETE ===');
  
  return {
    message: 'Game saving flow test completed',
    explanation: 'Games are only saved to history when there are players in the game when you click "Start New Game"'
  };
};
