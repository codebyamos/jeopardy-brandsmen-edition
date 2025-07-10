
import React from 'react';

interface BonusPointsDisplayProps {
  bonusPoints: number;
  isVisible: boolean;
}

const BonusPointsDisplay: React.FC<BonusPointsDisplayProps> = ({ bonusPoints, isVisible }) => {
  if (!isVisible || bonusPoints <= 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-8 rounded-xl shadow-2xl animate-scale-in">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 animate-pulse">🎉 BONUS POINTS! 🎉</h2>
          <div className="text-6xl font-extrabold text-yellow-100">
            +{bonusPoints}
          </div>
          <p className="text-xl mt-4 opacity-90">Extra points available!</p>
        </div>
      </div>
    </div>
  );
};

export default BonusPointsDisplay;
