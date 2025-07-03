
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Settings, Save, History, Edit, Calculator, Users, Volume2, Timer, Key, RotateCcw } from 'lucide-react';
import PlayerManager from './PlayerManager';
import VoiceSettings from './VoiceSettings';
import TimerSettings from './TimerSettings';
import NewGameSettings from './NewGameSettings';
import PasscodeManager from './PasscodeManager';
import { Player } from '../types/game';

interface GameControlsProps {
  players: Player[];
  onPlayersUpdate: (players: Player[]) => void;
  onSaveGame: () => void;
  onShowGameHistory: () => void;
  onShowGameEditor: () => void;
  onShowScoreManager: () => void;
  onStartNewGame: (newPasscode?: string) => void;
  isLoading?: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  players,
  onPlayersUpdate,
  onSaveGame,
  onShowGameHistory,
  onShowGameEditor,
  onShowScoreManager,
  onStartNewGame,
  isLoading = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPlayerManager, setShowPlayerManager] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [showNewGameSettings, setShowNewGameSettings] = useState(false);
  const [showPasscodeManager, setShowPasscodeManager] = useState(false);

  const menuItems = [
    { icon: Save, label: 'Save Game', action: onSaveGame, disabled: false }, // Re-enabled the save button
    { icon: History, label: 'Game History', action: onShowGameHistory },
    { icon: Edit, label: 'Edit Game', action: onShowGameEditor },
    { icon: Calculator, label: 'Manage Scores', action: onShowScoreManager },
    { icon: Users, label: 'Manage Players', action: () => setShowPlayerManager(true) },
    { icon: Volume2, label: 'Voice Settings', action: () => setShowVoiceSettings(true) },
    { icon: Timer, label: 'Timer Settings', action: () => setShowTimerSettings(true) },
    { icon: Key, label: 'Manage Passcode', action: () => setShowPasscodeManager(true) },
    { icon: RotateCcw, label: 'Start New Game', action: () => setShowNewGameSettings(true) },
  ];

  const handleStartNewGame = (newPasscode: string) => {
    // Pass the new passcode to the parent component
    onStartNewGame(newPasscode);
  };

  return (
    <>
      {/* Main Settings Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white border rounded-full w-12 h-12 p-0 shadow-lg hover:opacity-90"
          style={{ backgroundColor: '#2c5b69', borderColor: '#2c5b69' }}
        >
          <Settings className="w-6 h-6" />
        </Button>

        {/* Menu Items */}
        {isMenuOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-2 bg-white border-2 rounded-lg p-2 shadow-xl" style={{ borderColor: '#2c5b69' }}>
            {menuItems.map((item, index) => (
              <Button
                key={index}
                onClick={() => {
                  item.action();
                  setIsMenuOpen(false);
                }}
                disabled={item.disabled || (item.label === 'Save Game' && isLoading)}
                size="sm"
                className="text-white border justify-start gap-2 min-w-[140px] hover:opacity-90"
                style={{ backgroundColor: '#2c5b69', borderColor: '#2c5b69' }}
              >
                <item.icon className="w-4 h-4" />
                {item.label} {item.label === 'Save Game' && isLoading && '...'}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Player Manager Modal */}
      <PlayerManager 
        players={players}
        onPlayersUpdate={onPlayersUpdate}
        isVisible={showPlayerManager}
        onClose={() => setShowPlayerManager(false)}
      />

      {/* Voice Settings Modal */}
      <VoiceSettings
        isVisible={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
      />

      {/* Timer Settings Modal */}
      <TimerSettings
        isVisible={showTimerSettings}
        onClose={() => setShowTimerSettings(false)}
      />

      {/* New Game Settings Modal */}
      <NewGameSettings
        isVisible={showNewGameSettings}
        onClose={() => setShowNewGameSettings(false)}
        onStartNewGame={handleStartNewGame}
      />

      {/* Passcode Manager Modal */}
      <PasscodeManager
        isVisible={showPasscodeManager}
        onClose={() => setShowPasscodeManager(false)}
      />
    </>
  );
};

export default GameControls;
