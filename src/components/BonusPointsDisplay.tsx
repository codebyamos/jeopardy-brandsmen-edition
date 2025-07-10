
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
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-8 rounded-xl shadow-2xl animate-scale-in">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4 animate-bounce">🎉✨🎊</div>
          <h2 className="text-4xl font-bold mb-4">BONUS POINTS!</h2>
          <div className="text-7xl font-extrabold text-yellow-100 animate-pulse">
            +{bonusPoints}
          </div>
          <p className="text-2xl mt-4 opacity-90 animate-bounce">Extra points available!</p>
          <div className="text-6xl mt-4 animate-spin">🌟</div>
        </div>
      </div>
    </div>
  );
};

export default BonusPointsDisplay;
