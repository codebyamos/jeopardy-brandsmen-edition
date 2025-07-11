
import React from 'react';
import { Player } from '../types/game';

interface PlayerScoresProps {
  players: Player[];
}

const PlayerScores: React.FC<PlayerScoresProps> = ({ players }) => {
  return (
    <div id="score-players" className="mb-4 flex justify-center">
      <div className="flex flex-wrap gap-2 sm:gap-4 lg:gap-8 justify-center">
        {players.map((player) => (
          <div key={player.id} className="bg-white text-black rounded-lg px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 min-w-[100px] sm:min-w-[120px] text-center border-2 border-gray-200">
            {/* Name with Avatar */}
            <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
              {player.avatar && (
                <img 
                  src={player.avatar} 
                  alt={`${player.name} avatar`}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-gray-300 flex-shrink-0"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error('Player score avatar failed to load for:', player.name);
                    // Try reloading without cache
                    if (!target.src.includes('&refresh=')) {
                      target.src = player.avatar + '&refresh=' + Date.now();
                    } else {
                      // If still fails, hide the avatar
                      target.style.display = 'none';
                    }
                  }}
                />
              )}
              <div className="font-bold text-sm sm:text-lg text-gray-800">{player.name}</div>
            </div>
            <div className="rounded px-2 sm:px-4 py-1 sm:py-2 text-base sm:text-xl font-bold text-white" style={{ backgroundColor: '#2c5b69' }}>
              {player.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerScores;
