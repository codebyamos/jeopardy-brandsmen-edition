
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';

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

  const addPlayer = () => {
    const newPlayer: Player = {
      id: Date.now(),
      name: `Player ${players.length + 1}`,
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

  const updateScore = (id: number, change: number) => {
    onPlayersUpdate(players.map(p => 
      p.id === id ? { ...p, score: p.score + change } : p
    ));
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-yellow-400">Players & Scores</h3>
        <Button 
          onClick={addPlayer}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Player
        </Button>
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
                  <h4 className="text-yellow-300 font-semibold">{player.name}</h4>
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
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                ${player.score.toLocaleString()}
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => updateScore(player.id, -100)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-2"
                >
                  -100
                </Button>
                <Button
                  onClick={() => updateScore(player.id, 100)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2"
                >
                  +100
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerManager;
