
import React from 'react';
import { Player } from '../types/game';

interface PlayerScoresProps {
  players: Player[];
}

const PlayerScores: React.FC<PlayerScoresProps> = ({ players }) => {
  return (
    <div className="mb-4 flex justify-center">
      <div className="flex flex-wrap gap-2 sm:gap-4 lg:gap-8 justify-center">
        {players.map((player) => (
          <div key={player.id} className="bg-yellow-400 text-black rounded-lg px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 min-w-[100px] sm:min-w-[120px] text-center" style={{ backgroundColor: '#fa1e4e' }}>
            {/* Name with Avatar */}
            <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
              {player.avatar && (
                <img 
                  src={player.avatar} 
                  alt={`${player.name} avatar`}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-white/30 flex-shrink-0"
                />
              )}
              <div className="font-bold text-sm sm:text-lg" style={{fontWeight: '400'}}>{player.name}</div>
            </div>
            <div className="bg-blue-800 text-white rounded px-2 sm:px-4 py-1 sm:py-2 text-base sm:text-xl font-bold" style={{backgroundColor: '#1c1726', fontWeight:'400', fontSize: '14px', padding: '3px 3px'}}>
              {player.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerScores;
