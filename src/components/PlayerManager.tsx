import React, { useState } from 'react';
import { Button } from './ui/button';
import { Plus, Edit2, Trash2, Settings, X } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  score: number;
}

interface PlayerManagerProps {
  players: Player[];
  onPlayersUpdate: (players: Player[]) => void;
}

const PlayerManager: React.FC<PlayerManagerProps> = ({ players, onPlayersUpdate }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const addPlayer = () => {
    const newPlayer: Player = {
      id: Date.now(),
      name: `Team ${players.length + 1}`,
      score: 0
    };
    onPlayersUpdate([...players, newPlayer]);
  };

  const removePlayer = (id: number) => {
    onPlayersUpdate(players.filter(p => p.id !== id));
  };

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
  };

  const saveEdit = () => {
    onPlayersUpdate(players.map(p => 
      p.id === editingId ? { ...p, name: editName } : p
    ));
    setEditingId(null);
    setEditName('');
  };

  return (
    <>
      {/* Settings Icon - Bottom Right Corner */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button 
          onClick={() => setIsVisible(!isVisible)}
          className="bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-gray-600 rounded-full w-12 h-12 p-0 shadow-lg"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </div>

      {/* Player Management Modal */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-yellow-400">Manage Players</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={addPlayer}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Player
                  </Button>
                  <Button
                    onClick={() => setIsVisible(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <div key={player.id} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      {editingId === player.id ? (
                        <div className="flex-1 mr-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          />
                          <div className="flex gap-1 mt-1">
                            <Button onClick={saveEdit} size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                              Save
                            </Button>
                            <Button onClick={() => setEditingId(null)} size="sm" variant="outline" className="text-xs">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <h4 className="text-yellow-300 font-semibold">{player.name}</h4>
                            <p className="text-gray-400 text-sm">Score: {player.score}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => startEdit(player)}
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-white p-1"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => removePlayer(player.id)}
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlayerManager;
