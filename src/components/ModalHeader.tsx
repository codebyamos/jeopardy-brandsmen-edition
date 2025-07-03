
import React from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  category: string;
  points: number;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ category, points, onClose }) => {
  return (
    <>
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-red-400 p-2 z-10"
        style={{backgroundColor: '#fa1e4e', color: 'white'}}
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
      
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2" style={{color: '#fa1e4e'}}>
          {category.toUpperCase()}
        </div>
        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{color: '#fa1e4e'}}>
          ${points}
        </div>
      </div>
    </>
  );
};

export default ModalHeader;
