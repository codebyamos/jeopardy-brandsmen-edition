/**
 * Global debug function to check game state from browser console
 * Call window.debugGameState() from the browser console to check current state
 */

declare global {
  interface Window {
    debugGameState: () => void;
    debugStartNewGame: () => void;
  }
}

// Function to check all game state
window.debugGameState = () => {
  console.log('=== 🔍 COMPREHENSIVE GAME STATE DEBUG ===');
  
  // Check React DevTools state if available
  try {
    // @ts-ignore
    const reactFiber = document.querySelector('#root')?._reactInternalInstance || 
                      // @ts-ignore
                      document.querySelector('#root')?._reactInternals ||
                      // @ts-ignore  
                      document.querySelector('[data-reactroot]')?._reactInternalInstance;
    console.log('React Fiber:', reactFiber);
  } catch (e) {
    console.log('React DevTools not available');
  }
  
  // Check localStorage
  console.log('📂 LOCALSTORAGE:');
  const gameState = localStorage.getItem('jeopardy-game-state');
  if (gameState) {
    try {
      const parsed = JSON.parse(gameState);
      console.log('  - Game state:', parsed);
      console.log('  - Players in localStorage:', parsed.players);
      console.log('  - Players count in localStorage:', parsed.players?.length || 0);
    } catch (e) {
      console.log('  - Error parsing game state:', e);
    }
  } else {
    console.log('  - No game state in localStorage');
  }
  
  // Check sessionStorage
  console.log('📋 SESSIONSTORAGE:');
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('game') || key.includes('player')) {
      console.log(`  - ${key}:`, sessionStorage.getItem(key));
    }
  });
  
  // Check current game ID
  const gameId = localStorage.getItem('currentGameId');
  console.log('🎮 CURRENT GAME ID:', gameId);
  
  // Check if we can find any DOM elements that might show player info
  console.log('🎯 DOM ELEMENTS:');
  const playerElements = document.querySelectorAll('[id="score-players"] [key], .player, .score');
  console.log(`  - Found ${playerElements.length} potential player elements`);
  
  // Check for any React state in the DOM
  const rootElement = document.querySelector('#root');
  if (rootElement) {
    // @ts-ignore
    const reactProps = rootElement._reactInternalInstance?.memoizedProps || 
                      // @ts-ignore
                      rootElement._reactInternals?.memoizedProps;
    if (reactProps) {
      console.log('  - React props on root:', reactProps);
    }
  }
  
  console.log('=== END DEBUG ===');
};

// Function to simulate start new game debug
window.debugStartNewGame = () => {
  console.log('=== 🎯 SIMULATING START NEW GAME DEBUG ===');
  
  // Check the current state before starting new game
  window.debugGameState();
  
  // Look for the actual Start New Game button and check if we can trace its event handlers
  const startGameButtons = document.querySelectorAll('button');
  console.log('🔍 SEARCHING FOR START NEW GAME BUTTON:');
  
  startGameButtons.forEach((button, index) => {
    const text = button.textContent?.toLowerCase();
    if (text?.includes('start') && text?.includes('new') && text?.includes('game')) {
      console.log(`  - Found button ${index}:`, button);
      console.log(`  - Button text:`, button.textContent);
      console.log(`  - Button disabled:`, button.disabled);
      
      // Check if we can see the click handler
      // @ts-ignore
      const reactProps = button._owner || button.__reactInternalInstance;
      if (reactProps) {
        console.log(`  - React props:`, reactProps);
      }
    }
  });
  
  console.log('=== END START NEW GAME DEBUG ===');
};

console.log('🔧 Debug functions loaded! Use:');
console.log('  - window.debugGameState() to check current game state');
console.log('  - window.debugStartNewGame() to debug start new game flow');
