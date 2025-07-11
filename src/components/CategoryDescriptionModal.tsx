
import React, { useState } from 'react';
import { Button } from './ui/button';
import { X, Save } from 'lucide-react';

interface CategoryDescriptionModalProps {
  category: string;
  description: string;
  isVisible: boolean;
  onSave: (description: string) => void;
  onClose: () => void;
}

const CategoryDescriptionModal: React.FC<CategoryDescriptionModalProps> = ({
  category,
  description,
  isVisible,
  onSave,
  onClose
}) => {
  const [tempDescription, setTempDescription] = useState(description);

  // Reset temp description when the modal opens with new description
  React.useEffect(() => {
    if (isVisible) {
      setTempDescription(description);
    }
  }, [description, isVisible]);

  const handleSave = () => {
    onSave(tempDescription);
    onClose();
  };

  const handleClose = () => {
    setTempDescription(description);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 rounded-lg w-full max-w-md shadow-2xl" style={{ borderColor: '#2c5b69' }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold" style={{ color: '#2c5b69' }}>
              Edit Category Description
            </h3>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-white hover:text-red-400"
              style={{ backgroundColor: '#2c5b69' }}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>
              Category: {category}
            </p>
            <textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              className="w-full p-3 border-2 rounded resize-none"
              style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
              placeholder="Enter category description..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="flex-1 text-white"
              style={{ backgroundColor: '#0f766e' }}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-2"
              style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDescriptionModal;
