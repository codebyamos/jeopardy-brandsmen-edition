
import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Slider } from './ui/slider';
import { useTheme, ThemeColors } from '../hooks/useTheme';
import { X, Eye, RotateCcw, Upload, Trash2, Image } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface ThemeSettingsProps {
  isVisible: boolean;
  onClose: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isVisible, onClose }) => {
  const { 
    theme, 
    backgroundImage, 
    updateTheme, 
    updateBackgroundImage, 
    previewTheme, 
    resetTheme, 
    applyBrandsmenTheme,
    brandsmenTheme,
    generatePreview 
  } = useTheme();
  const { toast } = useToast();
  const [tempTheme, setTempTheme] = useState<ThemeColors>(theme);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (key: keyof ThemeColors, value: string | number) => {
    const newTheme = { ...tempTheme, [key]: value };
    setTempTheme(newTheme);
    
    if (isPreviewActive) {
      previewTheme(newTheme);
    }
  };

  const handlePreviewToggle = () => {
    if (!isPreviewActive) {
      previewTheme(tempTheme);
      setIsPreviewActive(true);
    } else {
      previewTheme(theme); // Revert to saved theme
      setIsPreviewActive(false);
    }
  };

  const handleSave = () => {
    updateTheme(tempTheme);
    setIsPreviewActive(false);
    onClose();
  };

  const handleCancel = () => {
    if (isPreviewActive) {
      previewTheme(theme); // Revert to saved theme
    }
    setTempTheme(theme);
    setIsPreviewActive(false);
    onClose();
  };

  const handleReset = () => {
    const defaultTheme: ThemeColors = {
      primaryColor: '#fa1e4e',
      secondaryColor: '#1c1726',
      gradientStart: '#000000',
      gradientEnd: '#374151',
      opacity: 0.8
    };
    setTempTheme(defaultTheme);
    if (isPreviewActive) {
      previewTheme(defaultTheme);
    }
  };

  const handleApplyBrandsmenTheme = () => {
    setTempTheme(brandsmenTheme);
    if (isPreviewActive) {
      previewTheme(brandsmenTheme);
    }
    toast({
      title: "Brandsmen Theme Applied",
      description: "Theme colors updated to match Brandsmen branding.",
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateBackgroundImage(imageUrl);
        toast({
          title: "Background Updated",
          description: "Background image has been uploaded successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    updateBackgroundImage('');
    toast({
      title: "Background Removed",
      description: "Background image has been removed.",
    });
  };

  if (!isVisible) return null;

  const previewVariations = generatePreview(tempTheme);

  return (
    <Dialog open={isVisible} onOpenChange={handleCancel}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold" style={{ color: 'var(--theme-accent, #fa1e4e)' }}>
            Theme Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Background Image Section */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-300 mb-3">Background Image</h3>
            
            {backgroundImage ? (
              <div className="space-y-3">
                <div 
                  className="w-full h-32 rounded border border-gray-600 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${backgroundImage})` }}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Image
                  </Button>
                  <Button
                    onClick={handleRemoveBackground}
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full h-32 rounded border-2 border-dashed border-gray-600 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Image className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No background image</p>
                  </div>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Background
                </Button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Quick Theme Options */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-300 mb-3">Quick Themes</h3>
            <div className="flex gap-2">
              <Button
                onClick={handleApplyBrandsmenTheme}
                size="sm"
                className="bg-teal-600 hover:bg-teal-700"
              >
                Apply Brandsmen Theme
              </Button>
              <Button
                onClick={handleReset}
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Default Theme
              </Button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-300">Theme Preview</h3>
              <Button
                onClick={handlePreviewToggle}
                size="sm"
                className={`${isPreviewActive ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewActive ? 'Live Preview ON' : 'Preview Changes'}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div 
                  className="w-full h-8 rounded mb-2 flex items-center justify-center text-white font-medium"
                  style={{ background: previewVariations.primary }}
                >
                  Primary Color
                </div>
                <div 
                  className="w-full h-8 rounded mb-2 flex items-center justify-center text-white font-medium"
                  style={{ background: previewVariations.questionItemHover }}
                >
                  Question Hover
                </div>
              </div>
              <div>
                <div 
                  className="w-full h-8 rounded mb-2 flex items-center justify-center text-white font-medium"
                  style={{ background: previewVariations.secondary }}
                >
                  Secondary Color
                </div>
                <div 
                  className="w-full h-16 rounded flex items-center justify-center text-white font-medium"
                  style={{ background: previewVariations.background }}
                >
                  Background Gradient
                </div>
              </div>
            </div>
          </div>

          {/* Theme Controls */}
          <div className="space-y-5">
            {/* Primary Color */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Primary Color
                </label>
                <p className="text-xs text-gray-400">Main accent color for buttons and highlights</p>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded border border-gray-600"
                  style={{ backgroundColor: tempTheme.primaryColor }}
                />
                <input
                  type="color"
                  value={tempTheme.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Secondary Color
                </label>
                <p className="text-xs text-gray-400">Category headers and secondary elements</p>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded border border-gray-600"
                  style={{ backgroundColor: tempTheme.secondaryColor }}
                />
                <input
                  type="color"
                  value={tempTheme.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* Background Gradient Start */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Background Start
                </label>
                <p className="text-xs text-gray-400">Beginning color of the background gradient</p>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded border border-gray-600"
                  style={{ backgroundColor: tempTheme.gradientStart }}
                />
                <input
                  type="color"
                  value={tempTheme.gradientStart}
                  onChange={(e) => handleColorChange('gradientStart', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* Background Gradient End */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Background End
                </label>
                <p className="text-xs text-gray-400">Ending color of the background gradient</p>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded border border-gray-600"
                  style={{ backgroundColor: tempTheme.gradientEnd }}
                />
                <input
                  type="color"
                  value={tempTheme.gradientEnd}
                  onChange={(e) => handleColorChange('gradientEnd', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Background Opacity
                  </label>
                  <p className="text-xs text-gray-400">Adjust transparency of gradient backgrounds</p>
                </div>
                <span className="text-sm text-gray-300 font-mono">
                  {Math.round(tempTheme.opacity * 100)}%
                </span>
              </div>
              <Slider
                value={[tempTheme.opacity]}
                onValueChange={(value) => handleColorChange('opacity', value[0])}
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
            Save Theme
          </Button>
          <Button 
            onClick={handleCancel} 
            variant="outline" 
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSettings;
