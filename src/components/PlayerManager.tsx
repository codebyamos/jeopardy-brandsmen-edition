
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Plus, Edit2, Trash2, X, Check, Upload } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  score: number;
  avatar?: string;
}

interface PlayerManagerProps {
  players: Player[];
  onPlayersUpdate: (players: Player[]) => void;
  isVisible: boolean;
  onClose: () => void;
}

const PlayerManager: React.FC<PlayerManagerProps> = ({ 
  players, 
  onPlayersUpdate, 
  isVisible, 
  onClose 
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editingScoreId, setEditingScoreId] = useState<number | null>(null);
  const [editScore, setEditScore] = useState('');

  // Check if any player is currently being edited
  const isAnyPlayerBeingEdited = editingId !== null || editingScoreId !== null;

  const addPlayer = () => {
    if (isAnyPlayerBeingEdited) return; // Prevent adding while editing
    
    const newPlayer: Player = {
      id: Date.now(),
      name: `Team ${players.length + 1}`,
      score: 0
    };
    onPlayersUpdate([...players, newPlayer]);
  };

  const removePlayer = (id: number) => {
    if (isAnyPlayerBeingEdited) return; // Prevent removing while editing
    
    onPlayersUpdate(players.filter(p => p.id !== id));
  };

  const startEdit = (player: Player) => {
    if (isAnyPlayerBeingEdited) return; // Prevent starting new edit while editing
    
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

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const startScoreEdit = (player: Player) => {
    if (isAnyPlayerBeingEdited) return; // Prevent starting new edit while editing
    
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

  const cancelScoreEdit = () => {
    setEditingScoreId(null);
    setEditScore('');
  };

  const handleAvatarUpload = (playerId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (isAnyPlayerBeingEdited) return; // Prevent avatar upload while editing
    
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

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto shadow-2xl" style={{ borderColor: '#2c5b69' }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold" style={{ color: '#2c5b69' }}>Manage Players</h3>
            <div className="flex gap-2">
              <Button 
                onClick={addPlayer}
                className="text-white hover:opacity-90"
                style={{ backgroundColor: '#2c5b69' }}
                size="sm"
                disabled={isAnyPlayerBeingEdited}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Player
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:opacity-90"
                style={{ backgroundColor: '#2c5b69' }}
                disabled={isAnyPlayerBeingEdited}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {isAnyPlayerBeingEdited && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Complete your current edit before making changes to other players.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <div key={player.id} className="bg-gray-50 border-2 rounded-lg p-4" style={{ borderColor: '#2c5b69' }}>
                {/* Avatar Section */}
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    {player.avatar ? (
                      <img 
                        src={player.avatar} 
                        alt={`${player.name} avatar`}
                        className="w-16 h-16 rounded-full object-cover border-2"
                        style={{ borderColor: '#2c5b69' }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2" style={{ borderColor: '#2c5b69' }}>
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                    <label className={`absolute bottom-0 right-0 rounded-full p-1 hover:opacity-90 ${isAnyPlayerBeingEdited ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} style={{ backgroundColor: '#2c5b69' }}>
                      <Upload className="w-3 h-3 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAvatarUpload(player.id, e)}
                        className="hidden"
                        disabled={isAnyPlayerBeingEdited}
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
                        className="w-full bg-white px-2 py-1 rounded text-sm border-2"
                        style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                      />
                      <div className="flex gap-1 mt-1">
                        <Button onClick={saveEdit} size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                          Save
                        </Button>
                        <Button onClick={cancelEdit} size="sm" variant="outline" className="text-xs border-gray-300">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1 text-center" style={{ color: '#2c5b69' }}>{player.name}</h4>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-gray-600 text-sm">Score:</span>
                          {editingScoreId === player.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={editScore}
                                onChange={(e) => setEditScore(e.target.value)}
                                className="w-20 bg-white px-2 py-1 rounded text-sm border-2"
                                style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                                onKeyDown={(e) => e.key === 'Enter' && saveScoreEdit()}
                                autoFocus
                              />
                              <Button onClick={saveScoreEdit} size="sm" variant="ghost" className="text-green-600 hover:text-green-700 p-1">
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button onClick={cancelScoreEdit} size="sm" variant="ghost" className="text-red-600 hover:text-red-700 p-1">
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="font-medium" style={{ color: '#2c5b69' }}>{player.score}</span>
                              <Button
                                onClick={() => startScoreEdit(player)}
                                size="sm"
                                variant="ghost"
                                className="text-gray-600 hover:text-gray-800 p-1"
                                disabled={isAnyPlayerBeingEdited}
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
                    className="text-gray-600 hover:text-gray-800 p-1"
                    disabled={isAnyPlayerBeingEdited}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => removePlayer(player.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 p-1"
                    disabled={isAnyPlayerBeingEdited}
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
  );
};

export default PlayerManager;
