
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      {/* Confetti/Party elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating confetti */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            {['🎊', '🎉', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
        
        {/* Party ribbons */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`ribbon-${i}`}
            className="absolute w-2 bg-gradient-to-b from-yellow-400 to-orange-500 animate-pulse"
            style={{
              left: `${12.5 * i + 10}%`,
              top: '0',
              height: '100vh',
              animationDelay: `${i * 0.2}s`,
              transform: `rotate(${-20 + Math.random() * 40}deg)`,
              opacity: 0.3
            }}
          />
        ))}
      </div>
      
      {/* Main bonus display */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-8 rounded-xl shadow-2xl animate-scale-in relative overflow-hidden">
        {/* Sparkle effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
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
              ✨
            </div>
          ))}
        </div>
        
        <div className="text-center relative z-10">
          <div className="text-6xl mb-4 animate-bounce">🎉🏆🎊</div>
          <h2 className="text-4xl font-bold mb-4 animate-pulse">BONUS POINTS!</h2>
          <div className="text-7xl font-extrabold text-yellow-100 animate-pulse mb-4">
            +{bonusPoints}
          </div>
          <p className="text-2xl opacity-90 animate-bounce">Get ready for extra points!</p>
          <div className="text-6xl mt-4 animate-spin">🌟</div>
          
          {/* Additional party elements */}
          <div className="flex justify-center gap-4 mt-4">
            <span className="text-4xl animate-bounce" style={{animationDelay: '0.1s'}}>🎈</span>
            <span className="text-4xl animate-bounce" style={{animationDelay: '0.2s'}}>🎭</span>
            <span className="text-4xl animate-bounce" style={{animationDelay: '0.3s'}}>🎪</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BonusPointsDisplay;
