
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useTheme, ThemeColors } from '../hooks/useTheme';
import { X } from 'lucide-react';

interface ThemeSettingsProps {
  isVisible: boolean;
  onClose: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isVisible, onClose }) => {
  const { theme, updateTheme, resetTheme } = useTheme();
  const [tempTheme, setTempTheme] = useState<ThemeColors>(theme);

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setTempTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateTheme(tempTheme);
    onClose();
  };

  const handleReset = () => {
    resetTheme();
    setTempTheme(theme);
  };

  const colorFields = [
    { key: 'primary' as keyof ThemeColors, label: 'Primary Color', description: 'Main accent color' },
    { key: 'secondary' as keyof ThemeColors, label: 'Secondary Color', description: 'Category headers' },
    { key: 'background' as keyof ThemeColors, label: 'Background', description: 'Main background' },
    { key: 'boardBackground' as keyof ThemeColors, label: 'Board Background', description: 'Game board background' },
    { key: 'categoryHeader' as keyof ThemeColors, label: 'Category Header', description: 'Category header background' },
    { key: 'questionItem' as keyof ThemeColors, label: 'Question Items', description: 'Question button background' },
    { key: 'questionItemHover' as keyof ThemeColors, label: 'Question Hover', description: 'Question button hover' },
    { key: 'text' as keyof ThemeColors, label: 'Text Color', description: 'Primary text color' },
    { key: 'buttonText' as keyof ThemeColors, label: 'Button Text', description: 'Button text color' }
  ];

  if (!isVisible) return null;

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-yellow-400">Theme Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {colorFields.map((field) => (
            <div key={field.key} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {field.label}
                </label>
                <p className="text-xs text-gray-400">{field.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded border border-gray-600"
                  style={{ backgroundColor: tempTheme[field.key] }}
                />
                <input
                  type="color"
                  value={tempTheme[field.key]}
                  onChange={(e) => handleColorChange(field.key, e.target.value)}
                  className="w-12 h-8 rounded border border-gray-600 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={tempTheme[field.key]}
                  onChange={(e) => handleColorChange(field.key, e.target.value)}
                  className="w-20 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
            Save Theme
          </Button>
          <Button onClick={handleReset} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            Reset to Default
          </Button>
          <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSettings;
