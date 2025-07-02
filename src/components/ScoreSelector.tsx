
import React from 'react';
import { Button } from './ui/button';

interface Player {
  id: number;
  name: string;
  score: number;
}

interface ScoreSelectorProps {
  players: Player[];
  questionPoints: number;
  onScorePlayer: (playerId: number, points: number) => void;
}

const ScoreSelector: React.FC<ScoreSelectorProps> = ({ 
  players, 
  questionPoints, 
  onScorePlayer 
}) => {
  if (players.length === 0) return null;

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
      <h4 className="text-yellow-300 font-semibold mb-3 text-center">Award Points</h4>
      <div className="grid grid-cols-1 gap-2">
        {players.map((player) => (
          <div key={player.id} className="flex justify-between items-center">
            <span className="text-white">{player.name}</span>
            <div className="flex gap-2">
              <Button
                onClick={() => onScorePlayer(player.id, questionPoints)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                +${questionPoints}
              </Button>
              <Button
                onClick={() => onScorePlayer(player.id, -questionPoints)}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                -${questionPoints}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreSelector;
