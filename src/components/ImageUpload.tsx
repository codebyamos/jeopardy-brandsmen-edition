
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  currentImageUrl?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, currentImageUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  // Supported file types with explicit MIME types
  const SUPPORTED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/avif'
  ];

  const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.avif'];

  // Increased file size limit to 25MB
  const MAX_FILE_SIZE = 25 * 1024 * 1024;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File) => {
    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(fileExtension)) {
      toast({
        title: "Unsupported file type",
        description: `Please select one of these image formats: ${SUPPORTED_EXTENSIONS.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    // Check MIME type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `File type ${file.type} is not supported. Please select a valid image file.`,
        variant: "destructive",
      });
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `File size is ${formatFileSize(file.size)}. Please select an image smaller than ${formatFileSize(MAX_FILE_SIZE)}.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset the input value so the same file can be selected again
    event.target.value = '';

    if (!validateFile(file)) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Show progress for larger files
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min(prev + 10, 90);
          return newProgress;
        });
      }, 100);

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          const base64String = e.target?.result as string;
          console.log(`Image converted to base64. Original: ${formatFileSize(file.size)}, Base64: ${formatFileSize(base64String.length)}`);
          
          onImageSelect(base64String);
          
          toast({
            title: "Image uploaded successfully!",
            description: `${file.name} (${formatFileSize(file.size)}) has been uploaded.`,
          });
          
          setIsUploading(false);
          setUploadProgress(0);
        } catch (error) {
          console.error('Error processing loaded image:', error);
          clearInterval(progressInterval);
          toast({
            title: "Processing failed",
            description: "Failed to process the uploaded image. Please try again with a smaller file.",
            variant: "destructive",
          });
          setIsUploading(false);
          setUploadProgress(0);
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        clearInterval(progressInterval);
        toast({
          title: "Upload failed",
          description: "Failed to read the image file. Please try again.",
          variant: "destructive",
        });
        setIsUploading(false);
        setUploadProgress(0);
      };
      
      reader.onabort = () => {
        console.log('FileReader aborted');
        clearInterval(progressInterval);
        toast({
          title: "Upload cancelled",
          description: "Image upload was cancelled.",
          variant: "destructive",
        });
        setIsUploading(false);
        setUploadProgress(0);
      };

      // Use readAsDataURL for base64 conversion
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred while uploading the image.",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    onImageSelect('');
    toast({
      title: "Image removed",
      description: "The image has been successfully removed.",
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <label className="flex-1">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff,.avif,image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/bmp,image/tiff,image/avif"
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
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>
        </label>
        
        {currentImageUrl && !isUploading && (
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
      
      {/* Progress bar for uploads */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      
      {/* File type info */}
      <div className="text-xs text-gray-500">
        Supported formats: JPG, JPEG, PNG, GIF, WebP, SVG, BMP, TIFF, AVIF (up to {formatFileSize(MAX_FILE_SIZE)})
      </div>
      
      {currentImageUrl && (
        <div className="mt-2">
          <img 
            src={currentImageUrl} 
            alt="Preview" 
            className="max-w-full h-20 object-contain rounded border"
            onError={(e) => {
              console.error('Error loading image preview');
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Image preview loaded successfully');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
