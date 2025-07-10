
import React, { useEffect } from 'react';
import { speakWithElevenLabs } from '../utils/textToSpeech';
import { useVoiceSettings } from '../hooks/useVoiceSettings';

interface BonusPointsDisplayProps {
  bonusPoints: number;
  isVisible: boolean;
}

const BonusPointsDisplay: React.FC<BonusPointsDisplayProps> = ({ bonusPoints, isVisible }) => {
  const { settings: voiceSettings } = useVoiceSettings();

  useEffect(() => {
    if (isVisible && bonusPoints > 0 && voiceSettings.isVoiceEnabled) {
      // Say "Bonus points!" with excitement
      speakWithElevenLabs("Bonus points!!").catch(error => {
        console.log('Bonus points speech failed:', error);
      });
    }
  }, [isVisible, bonusPoints, voiceSettings.isVoiceEnabled]);

  if (!isVisible || bonusPoints <= 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] animate-fade-in">
      {/* Confetti/Party elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating confetti */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute text-3xl animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`
            }}
          >
            {['🎊', '🎉', '✨', '🌟', '💫', '🎈', '🏆', '💎'][Math.floor(Math.random() * 8)]}
          </div>
        ))}
        
        {/* Party ribbons */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`ribbon-${i}`}
            className="absolute w-3 bg-gradient-to-b opacity-40 animate-pulse"
            style={{
              left: `${8.33 * i}%`,
              top: '0',
              height: '100vh',
              animationDelay: `${i * 0.15}s`,
              transform: `rotate(${-15 + Math.random() * 30}deg)`,
              background: `linear-gradient(to bottom, ${
                ['#FFD700', '#FF6B35', '#F7931E', '#C5A572', '#E74C3C', '#9B59B6'][Math.floor(Math.random() * 6)]
              }, transparent)`
            }}
          />
        ))}

        {/* Firework bursts */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`firework-${i}`}
            className="absolute w-4 h-4 rounded-full animate-ping"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 1.5}s`,
              backgroundColor: ['#FFD700', '#FF6B35', '#E74C3C', '#9B59B6', '#3498DB'][Math.floor(Math.random() * 5)]
            }}
          />
        ))}
      </div>
      
      {/* Main bonus display */}
      <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white p-12 rounded-2xl shadow-2xl animate-scale-in relative overflow-hidden border-4 border-yellow-300">
        {/* Animated border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 rounded-2xl animate-pulse opacity-30"></div>
        
        {/* Sparkle effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute text-2xl animate-spin"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              {['✨', '💫', '⭐', '🌟'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
        
        <div className="text-center relative z-10">
          <div className="text-8xl mb-6 animate-bounce">🎉🏆🎊</div>
          <h2 className="text-6xl font-extrabold mb-6 animate-pulse drop-shadow-lg">
            BONUS POINTS!
          </h2>
          <div className="text-8xl font-extrabold text-yellow-100 animate-pulse mb-6 drop-shadow-xl">
            +{bonusPoints}
          </div>
          <p className="text-3xl opacity-90 animate-bounce font-bold">Get ready for extra points!</p>
          <div className="text-8xl mt-6 animate-spin">🌟</div>
          
          {/* Additional party elements */}
          <div className="flex justify-center gap-6 mt-6">
            <span className="text-5xl animate-bounce" style={{animationDelay: '0.1s'}}>🎈</span>
            <span className="text-5xl animate-bounce" style={{animationDelay: '0.2s'}}>🎭</span>
            <span className="text-5xl animate-bounce" style={{animationDelay: '0.3s'}}>🎪</span>
            <span className="text-5xl animate-bounce" style={{animationDelay: '0.4s'}}>🎨</span>
          </div>

          {/* Pulsing rings */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div
                key={`ring-${i}`}
                className="absolute inset-0 border-4 border-yellow-300 rounded-2xl animate-ping opacity-20"
                style={{
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BonusPointsDisplay;
