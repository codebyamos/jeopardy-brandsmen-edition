
import React from 'react';
import { Button } from './ui/button';
import { X, FolderPlus } from 'lucide-react';

interface GameEditorHeaderProps {
  isSaving: boolean;
  isMainView: boolean;
  onAddCategory: () => void;
  onClose: () => void;
}

const GameEditorHeader: React.FC<GameEditorHeaderProps> = ({
  isSaving,
  isMainView,
  onAddCategory,
  onClose
}) => {
  return (
    <div className="flex justify-between items-center mb-4 sm:mb-6">
      <div className="flex items-center gap-2">
        <h3 className="text-xl sm:text-2xl font-bold" style={{color: '#2c5b69'}}>Edit Game Content</h3>
        {isSaving && (
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            Saving...
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {isMainView && (
          <Button
            onClick={onAddCategory}
            size="sm"
            className="text-white"
            style={{ backgroundColor: '#0f766e' }}
            disabled={isSaving}
          >
            <FolderPlus className="w-4 h-4 mr-1" />
            Add Category
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-white hover:text-red-400"
          style={{ backgroundColor: '#2c5b69' }}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default GameEditorHeader;
