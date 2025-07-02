
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Settings, Save, History, Edit, Calculator, Trash2 } from 'lucide-react';
import PlayerManager from './PlayerManager';
import { Player } from '../types/game';

interface GameControlsProps {
  players: Player[];
  onPlayersUpdate: (players: Player[]) => void;
  onSaveGame: () => void;
  onShowGameHistory: () => void;
  onShowGameEditor: () => void;
  onShowScoreManager: () => void;
  isLoading?: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  players,
  onPlayersUpdate,
  onSaveGame,
  onShowGameHistory,
  onShowGameEditor,
  onShowScoreManager,
  isLoading = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { icon: Save, label: 'Save Game', action: onSaveGame, disabled: isLoading },
    { icon: History, label: 'Game History', action: onShowGameHistory },
    { icon: Edit, label: 'Edit Game', action: onShowGameEditor },
    { icon: Calculator, label: 'Manage Scores', action: onShowScoreManager },
  ];

  return (
    <>
      {/* Main Settings Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 rounded-full w-12 h-12 p-0 shadow-lg"
        >
          <Settings className="w-6 h-6" />
        </Button>

        {/* Menu Items */}
        {isMenuOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-2 bg-gray-800 border border-gray-600 rounded-lg p-2 shadow-xl">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                onClick={() => {
                  item.action();
                  setIsMenuOpen(false);
                }}
                disabled={item.disabled}
                size="sm"
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600 justify-start gap-2 min-w-[140px]"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Player Manager Component */}
      <PlayerManager 
        players={players}
        onPlayersUpdate={onPlayersUpdate}
      />
    </>
  );
};

export default GameControls;
