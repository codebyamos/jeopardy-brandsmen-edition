
import React from 'react';

const GameLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-cover bg-top bg-no-repeat flex items-center justify-center"
         style={{ backgroundImage: 'url(/lovable-uploads/d1647a56-db6d-4277-aeb4-395f4275273b.png)' }}>
      <div className="text-center">
        <div className="text-xl font-bold mb-4" style={{ color: '#2c5b69' }}>Loading Game...</div>
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default GameLoadingScreen;
