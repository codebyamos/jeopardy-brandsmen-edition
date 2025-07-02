
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Plus, Edit2, Trash2, Settings, X, Check, Upload } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  score: number;
  avatar?: string;
}

interface PlayerManagerProps {
  players: Player[];
  onPlayersUpdate: (players: Player[]) => void;
}

const PlayerManager: React.FC<PlayerManagerProps> = ({ players, onPlayersUpdate }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editingScoreId, setEditingScoreId] = useState<number | null>(null);
  const [editScore, setEditScore] = useState('');
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

  const startScoreEdit = (player: Player) => {
    setEditingScoreId(player.id);
    setEditScore(player.score.toString());
  };

  const saveScoreEdit = () => {
    const newScore = parseInt(editScore) || 0;
    onPlayersUpdate(players.map(p => 
      p.id === editingScoreId ? { ...p, score: newScore } : p
    ));
    setEditingScoreId(null);
    setEditScore('');
  };

  const handleAvatarUpload = (playerId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarUrl = e.target?.result as string;
        onPlayersUpdate(players.map(p => 
          p.id === playerId ? { ...p, avatar: avatarUrl } : p
        ));
      };
      reader.readAsDataURL(file);
    }
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
                <h3 className="text-2xl font-bold text-yellow-400" style={{color: '#fa1e4e'}}>Manage Players</h3>
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
                    {/* Avatar Section */}
                    <div className="flex justify-center mb-3">
                      <div className="relative">
                        {player.avatar ? (
                          <img 
                            src={player.avatar} 
                            alt={`${player.name} avatar`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center border-2 border-gray-500">
                            <span className="text-gray-300 text-xs">No Image</span>
                          </div>
                        )}
                        <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 rounded-full p-1 cursor-pointer">
                          <Upload className="w-3 h-3 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAvatarUpload(player.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

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
                          <div className="flex-1">
                            <h4 style={{color: '#fa1e4e'}} className="text-yellow-300 font-semibold mb-1 text-center">{player.name}</h4>
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-gray-400 text-sm">Score:</span>
                              {editingScoreId === player.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={editScore}
                                    onChange={(e) => setEditScore(e.target.value)}
                                    className="w-20 bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && saveScoreEdit()}
                                  />
                                  <Button onClick={saveScoreEdit} size="sm" variant="ghost" className="text-green-400 hover:text-green-300 p-1">
                                    <Check className="w-3 h-3" />
                                  </Button>
                                  <Button onClick={() => setEditingScoreId(null)} size="sm" variant="ghost" className="text-red-400 hover:text-red-300 p-1">
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="text-white font-medium">{player.score}</span>
                                  <Button
                                    onClick={() => startScoreEdit(player)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-400 hover:text-white p-1"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1 justify-center mt-2">
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
