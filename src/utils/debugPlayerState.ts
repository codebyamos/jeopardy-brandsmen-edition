import { Player } from '@/types/game';

/**
 * Debug function to check current player state
 */
export const debugPlayerState = () => {
  console.log('=== 🔍 DEBUGGING PLAYER STATE ===');
  
  // Check localStorage for player data
  const localStorageData = localStorage.getItem('jeopardy-game-state');
  if (localStorageData) {
    try {
      const parsed = JSON.parse(localStorageData);
      console.log('📂 LocalStorage game state:', parsed);
      console.log('📂 LocalStorage players:', parsed.players);
      console.log('📂 LocalStorage players count:', parsed.players?.length || 0);
    } catch (error) {
      console.error('❌ Error parsing localStorage:', error);
    }
  } else {
    console.log('📂 No localStorage game state found');
  }
  
  // Check sessionStorage
  const sessionKeys = Object.keys(sessionStorage);
  console.log('📋 SessionStorage keys:', sessionKeys);
  sessionKeys.forEach(key => {
    if (key.includes('player') || key.includes('game')) {
      console.log(`📋 SessionStorage ${key}:`, sessionStorage.getItem(key));
    }
  });
  
  // Check current game ID
  const currentGameId = localStorage.getItem('currentGameId');
  console.log('🎮 Current Game ID:', currentGameId);
  
  return {
    localStorageData: localStorageData ? JSON.parse(localStorageData) : null,
    currentGameId,
    sessionStorageKeys: sessionKeys,
    timestamp: new Date().toISOString()
  };
};

/**
 * Debug function to check what happens during "Start New Game"
 */
export const debugStartNewGameFlow = (players: Player[]) => {
  console.log('=== 🎯 DEBUGGING START NEW GAME FLOW ===');
  console.log('🔍 Players passed to function:', players);
  console.log('🔍 Players array length:', players?.length || 0);
  console.log('🔍 Players array type:', typeof players);
  console.log('🔍 Is players an array?', Array.isArray(players));
  
  if (players && players.length > 0) {
    console.log('✅ Players found! Details:');
    players.forEach((player, index) => {
      console.log(`   Player ${index + 1}:`, {
        id: player.id,
        name: player.name,
        score: player.score,
        scoreType: typeof player.score,
        hasAvatar: !!player.avatar
      });
    });
    return true;
  } else {
    console.log('❌ No players detected!');
    console.log('   - Players variable:', players);
    console.log('   - Players length:', players?.length);
    return false;
  }
};
