import React from 'react';
import { PlayIcon } from '@heroicons/react/24/outline';

interface VideoPlayerProps {
  content: {
    type: 'upload' | 'embed';
    url?: string;
    embedUrl?: string;
    filename?: string;
  };
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ content, className = '' }) => {
  if (!content) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <PlayIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No video content available</p>
        </div>
      </div>
    );
  }

  if (content.type === 'upload' && content.url) {
    return (
      <div className={className}>
        <video 
          src={content.url} 
          controls 
          className="w-full rounded-lg"
          poster="https://placehold.co/800x450/333333/FFFFFF?text=Video+Preview"
        >
          Your browser does not support the video tag.
        </video>
        {content.filename && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {content.filename}
          </p>
        )}
      </div>
    );
  }

  if (content.type === 'embed' && content.embedUrl) {
    // For YouTube videos, we need to make sure the URL is properly formatted
    let embedUrl = content.embedUrl;
    if (embedUrl.includes('youtube.com/watch')) {
      const videoId = embedUrl.split('v=')[1]?.split('&')[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    if (embedUrl.includes('youtu.be')) {
      const videoId = embedUrl.split('/').pop();
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }


    return (
      <div className={className}>
        <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded video"
          />
        </div>
        {content.embedUrl && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 truncate">
            Embedded video: {content.embedUrl}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center">
        <PlayIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500 dark:text-gray-400">No video content available</p>
      </div>
    </div>
  );
};
