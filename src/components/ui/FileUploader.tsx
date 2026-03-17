import React, { useState, useRef, useCallback } from 'react';
import { 
  ArrowUpTrayIcon, 
  XMarkIcon, 
  DocumentIcon, 
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { fileUploadService, UploadResult, UploadOptions } from '../../services/fileUploadService';

interface FileUploaderPropsBase {
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  onRemove?: (index: number) => void;
  disabled?: boolean;
  className?: string;
  dropzoneText?: string;
  uploadedFiles?: UploadedFile[];
  uploadOptions?: UploadOptions;
  showProgress?: boolean;
  autoUpload?: boolean;
}

interface FileUploaderPropsLegacy extends FileUploaderPropsBase {
  legacyMode: true;
  onUpload: (files: File[]) => Promise<void> | void;
}

interface FileUploaderPropsModern extends FileUploaderPropsBase {
  legacyMode?: false;
  onUpload: (files: UploadResult[]) => Promise<void> | void;
}

type FileUploaderProps = FileUploaderPropsLegacy | FileUploaderPropsModern;

interface UploadedFile {
  file: File;
  url?: string;
  progress?: number;
  error?: string;
  result?: UploadResult;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  multiple = false,
  onUpload,
  onRemove,
  disabled = false,
  className = '',
  dropzoneText = 'Drop files here or click to browse',
  uploadedFiles = [],
  uploadOptions = {},
  showProgress = true,
  autoUpload = true,
  legacyMode = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}.`;
    }

    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return acceptedType === fileExtension;
        }
        if (acceptedType.includes('/*')) {
          return fileType.startsWith(acceptedType.replace('/*', ''));
        }
        return fileType === acceptedType;
      });

      if (!isAccepted) {
        return `File type "${fileExtension}" is not accepted.`;
      }
    }

    return null;
  }, [accept, maxSize]);

  const handleFileSelection = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      validationErrors.push(`Cannot upload more than ${maxFiles} file${maxFiles > 1 ? 's' : ''}.`);
      setErrors(validationErrors);
      return;
    }

    // Validate each file
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(validationErrors);

    if (validFiles.length > 0) {
      setIsUploading(true);
      try {
        if (legacyMode) {
          // Legacy mode: return File[] directly
          (onUpload as (files: File[]) => Promise<void> | void)(validFiles);
        } else if (autoUpload) {
          // Upload files using the new service
          const uploadResults: UploadResult[] = [];
          
          for (const file of validFiles) {
            const result = await fileUploadService.uploadFile(
              file,
              {
                ...uploadOptions,
                maxSize,
                allowedTypes: accept ? accept.split(',').map(t => t.trim()) : undefined
              },
              showProgress ? (progress) => {
                // Update progress for this file
                console.log(`Upload progress: ${progress.percentage}%`);
              } : undefined
            );
            uploadResults.push(result);
          }
          
          await (onUpload as (files: UploadResult[]) => Promise<void> | void)(uploadResults);
        } else {
          // Convert files to UploadResult format without actually uploading
          const mockResults: UploadResult[] = validFiles.map(file => ({
            id: `temp_${Date.now()}_${Math.random()}`,
            url: '', // Don't create blob URL - not needed for display
            publicUrl: '',
            filename: file.name, // Use actual filename
            originalName: file.name, // Use actual filename
            size: file.size,
            type: file.type,
            metadata: {
              originalFileObject: file, // Store reference to actual File
            },
          }));

          await(onUpload as (files: UploadResult[]) => Promise<void> | void)(mockResults);
        }
      } catch (error) {
        setErrors(prev => [...prev, 'Upload failed. Please try again.']);
      } finally {
        setIsUploading(false);
      }
    }
  }, [validateFile, onUpload, maxFiles, uploadedFiles.length, maxSize, accept, uploadOptions, autoUpload, showProgress, legacyMode]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!disabled) {
      const files = e.dataTransfer.files;
      handleFileSelection(files);
    }
  }, [disabled, handleFileSelection]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files);
    // Reset input value to allow uploading the same file again
    e.target.value = '';
  }, [handleFileSelection]);

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return PhotoIcon;
    if (type.startsWith('video/')) return VideoCameraIcon;
    if (type.includes('pdf') || type.includes('document')) return DocumentTextIcon;
    return DocumentIcon;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
        />
        
        <div className="space-y-2">
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div>
            <p className="text-gray-600 dark:text-gray-400">{dropzoneText}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {accept && `Accepted: ${accept}`}
              {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
              {maxFiles > 1 && ` • Max files: ${maxFiles}`}
            </p>
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Uploaded Files</h4>
          {uploadedFiles.map((uploadedFile, index) => {
            // Check if this is a File object (legacy mode) or UploadResult (modern mode)
            const isLegacyMode = 'file' in uploadedFile && uploadedFile.file instanceof File;
            const fileName = isLegacyMode 
              ? uploadedFile.file.name 
              : (uploadedFile as any).originalName || (uploadedFile as any).filename || 'Unknown file';
            const fileSize = isLegacyMode 
              ? formatFileSize(uploadedFile.file.size)
              : formatFileSize((uploadedFile as any).size || 0);
            const Icon = isLegacyMode ? getFileIcon(uploadedFile.file) : DocumentTextIcon;
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fileSize}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {uploadedFile.progress !== undefined && uploadedFile.progress < 100 && (
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all" 
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {uploadedFile.error && (
                    <span className="text-xs text-red-600">{uploadedFile.error}</span>
                  )}
                  
                  {onRemove && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemove(index)}
                      className="p-1"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};