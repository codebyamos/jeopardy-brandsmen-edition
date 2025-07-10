
import React from 'react';

interface MediaSectionProps {
  imageUrl?: string;
  videoUrl?: string;
}

const MediaSection: React.FC<MediaSectionProps> = ({ imageUrl, videoUrl }) => {
  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (!imageUrl && !videoUrl) return null;

  return (
    <div className="mb-4 flex flex-col items-center gap-4">
      {imageUrl && (
        <div className="max-w-sm">
          <img 
            src={imageUrl} 
            alt="Question image" 
            className="w-full h-auto rounded-lg shadow-md max-h-64 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      {videoUrl && (
        <div className="max-w-lg w-full">
          {getYouTubeVideoId(videoUrl) ? (
            <div className="relative w-full" style={{ paddingBottom: '42.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(videoUrl)}`}
                title="Question video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video 
              controls 
              className="w-full rounded-lg shadow-md max-h-48"
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
              }}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaSection;
