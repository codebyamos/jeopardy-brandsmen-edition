
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  currentImageUrl?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, currentImageUrl }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for cross-origin compatibility
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        console.log('Image converted to base64, size:', base64String.length);
        onImageSelect(base64String);
        setIsUploading(false);
      };
      reader.onerror = () => {
        console.error('Failed to convert image to base64');
        alert('Error processing image');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image processing error:', error);
      alert('Error processing image');
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageSelect('');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <label className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full border-2"
            style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
            disabled={isUploading}
            onClick={() => {
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              input?.click();
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </label>
        
        {currentImageUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            className="border-2 border-red-400 text-red-400 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {currentImageUrl && (
        <div className="mt-2">
          <img 
            src={currentImageUrl} 
            alt="Preview" 
            className="max-w-full h-20 object-contain rounded border"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
