import React, { useState, useEffect } from 'react';
import { UserCircleIcon, CameraIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { FileUploader } from './FileUploader';
import { Modal } from './Modal';
import toast from 'react-hot-toast';

interface ProfilePictureUploadProps {
  currentImageUrl?: string; // URL from backend
  onFileSelect: (file: File | null) => void; // only gives the selected file, parent handles upload/save
  onRemove?: () => void; // 👈 add this line
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
  xl: 'h-40 w-40',
};

const iconSizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
};

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  onFileSelect,
  onRemove, // 👈 add this line
  disabled = false,
  size = 'lg',
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Cleanup object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);

    // Notify parent only when form saves, not now
    // onFileSelect(file); --> parent handles later
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onFileSelect(null);
    if (onRemove) onRemove(); // 👈 notify parent
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
      <div
        className={`${sizeClasses[size]} rounded-full bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center`}
      >
        <UserCircleIcon className={`${iconSizeClasses[size]} text-gray-400`} />
      </div>
    );
  };

  return (
    <>
      <div className="relative inline-block">
        {renderProfileImage()}

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
        onClose={() => setShowUploadModal(false)}
        title="Update Profile Picture"
      >
        <div className="space-y-6">
          {/* Preview */}
          <div className="text-center">
            <div className="inline-block relative">{renderProfileImage()}</div>
          </div>

          {/* File Upload */}
          <FileUploader
            legacyMode
            accept="image/*"
            maxFiles={1}
            maxSize={5 * 1024 * 1024}
            onUpload={handleFileSelect}
            disabled={false}
            dropzoneText="Drop your profile picture here, or click to browse"
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Supported formats: JPEG, PNG, WebP, GIF (max 5MB)
          </p>

          {/* Actions */}
          <div className="flex justify-between">
            <div>
              {(currentImageUrl || selectedFile) && (
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
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              {selectedFile && (
                <Button
                  onClick={() => {
                    onFileSelect(selectedFile); // send file to parent for saving
                    setShowUploadModal(false);
                    toast.success('Profile picture ready to save');
                  }}
                >
                  Use This Image
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
