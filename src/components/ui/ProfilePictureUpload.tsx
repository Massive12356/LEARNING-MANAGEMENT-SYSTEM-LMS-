import React, { useState } from 'react';
import { 
  UserCircleIcon, 
  CameraIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import { Button } from './Button';
import { FileUploader } from './FileUploader';
import { Modal } from './Modal';
import { fileUploadService } from '../../services/fileUploadService';
import toast from 'react-hot-toast';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onImageUpdate: (imageUrl: string | null) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24', 
  lg: 'h-32 w-32',
  xl: 'h-40 w-40'
};

const iconSizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16', 
  xl: 'h-20 w-20'
};

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  onImageUpdate,
  disabled = false,
  size = 'lg'
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload the file using the fileUploadService
      const result = await fileUploadService.uploadFile(file, {
        folder: 'profile-pictures',
        compress: true,
        generateThumbnail: true,
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      });

      // Update the profile image
      onImageUpdate(result.publicUrl);
      toast.success('Profile picture updated successfully!');
      setShowUploadModal(false);
      
      // Clean up preview URL
      URL.revokeObjectURL(preview);
      setPreviewUrl(null);
      
    } catch (error) {
      console.error('Profile picture upload failed:', error);
      toast.error('Failed to upload profile picture');
      
      // Clean up preview URL on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageUpdate(null);
    toast.success('Profile picture removed');
  };

  const renderProfileImage = () => {
    const imageUrl = previewUrl || currentImageUrl;
    
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt="Profile"
          className={`${sizeClasses[size]} rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg`}
        />
      );
    }

    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center`}>
        <UserCircleIcon className={`${iconSizeClasses[size]} text-gray-400`} />
      </div>
    );
  };

  return (
    <>
      <div className="relative inline-block">
        {renderProfileImage()}
        
        {/* Upload/Edit Button */}
        {!disabled && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            title="Change profile picture"
          >
            <CameraIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
        }}
        title="Update Profile Picture"
      >
        <div className="space-y-6">
          {/* Current/Preview Image */}
          <div className="text-center">
            <div className="inline-block relative">
              {renderProfileImage()}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <FileUploader
              legacyMode={true}
              accept="image/*"
              maxFiles={1}
              maxSize={5 * 1024 * 1024} // 5MB
              onUpload={handleFileUpload}
              disabled={uploading}
              dropzoneText={uploading ? "Uploading..." : "Drop your profile picture here, or click to browse"}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6"
            />
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Supported formats: JPEG, PNG, WebP, GIF (max 5MB)
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <div>
              {currentImageUrl && (
                <Button
                  variant="outline"
                  onClick={handleRemoveImage}
                  className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Remove Picture
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};