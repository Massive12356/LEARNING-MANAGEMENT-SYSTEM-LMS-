import { authenticatedFetch } from '../hooks/useAuthTokens';

export interface UploadOptions {
  folder?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  compress?: boolean;
  generateThumbnail?: boolean;
}

export interface UploadResult {
  id: string;
  url: string;
  publicUrl: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  folder?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

type ProgressCallback = (progress: UploadProgress) => void;

class FileUploadService {
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB default
  private readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks for large files
  
  // Mock CDN URLs for different file types
  private readonly MOCK_CDNS = {
    images: 'https://picsum.photos',
    documents: 'https://www.learningcontainer.com/wp-content/uploads/2019/09',
    videos: 'https://sample-videos.com/zip/10/mp4',
    audio: 'https://www.soundjay.com/misc/sounds-1'
  };

  // Validate file before upload
  private validateFile(file: File, options: UploadOptions = {}): void {
    const maxSize = options.maxSize || this.MAX_FILE_SIZE;
    
    if (file.size > maxSize) {
      throw new Error(`File size exceeds limit of ${this.formatFileSize(maxSize)}`);
    }

    if (options.allowedTypes && options.allowedTypes.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;
      
      const isAllowed = options.allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return type === fileExtension;
        }
        if (type.includes('/*')) {
          return mimeType.startsWith(type.replace('/*', ''));
        }
        return type === mimeType;
      });

      if (!isAllowed) {
        throw new Error(`File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`);
      }
    }
  }

  // Mock file compression
  private async compressFile(file: File): Promise<File> {
    // In a real implementation, you'd use libraries like:
    // - browser-image-compression for images
    // - ffmpeg.wasm for videos
    // - pdfjs for PDFs
    
    if (file.type.startsWith('image/')) {
      // Mock image compression
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          const maxDimension = 1920;
          let { width, height } = img;
          
          if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: file.lastModified
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, file.type, 0.8);
        };
        
        img.src = URL.createObjectURL(file);
      });
    }
    
    return file; // Return original if not compressible
  }

  // Generate thumbnail for images/videos
  private async generateThumbnail(file: File): Promise<string | undefined> {
    if (file.type.startsWith('image/')) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          const size = 200;
          canvas.width = size;
          canvas.height = size;
          
          const { width, height } = img;
          const ratio = Math.min(size / width, size / height);
          const newWidth = width * ratio;
          const newHeight = height * ratio;
          const x = (size - newWidth) / 2;
          const y = (size - newHeight) / 2;
          
          ctx?.drawImage(img, x, y, newWidth, newHeight);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        
        img.src = URL.createObjectURL(file);
      });
    }
    
    if (file.type.startsWith('video/')) {
      // Mock video thumbnail generation
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNsaWNrIGZvciBQcmV2aWV3PC90ZXh0Pgo8L3N2Zz4K';
    }
    
    return undefined;
  }

  // Mock file upload to different cloud providers
  private async uploadToProvider(
    file: File,
    options: UploadOptions,
    onProgress?: ProgressCallback
  ): Promise<UploadResult> {
    // Simulate upload progress
    const simulateProgress = async () => {
      const duration = Math.random() * 2000 + 1000; // 1-3 seconds
      const steps = 20;
      const stepDuration = duration / steps;
      
      for (let i = 0; i <= steps; i++) {
        const percentage = (i / steps) * 100;
        onProgress?.({
          loaded: (file.size * percentage) / 100,
          total: file.size,
          percentage
        });
        
        if (i < steps) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
      }
    };

    await simulateProgress();

    // Generate mock URLs based on file type
    const fileType = file.type.split('/')[0];
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let mockUrl: string;
    let publicUrl: string;
    
    switch (fileType) {
      case 'image':
        const dimension = Math.random() > 0.5 ? '800/600' : '600/800';
        mockUrl = `${this.MOCK_CDNS.images}/${dimension}?random=${Date.now()}`;
        publicUrl = mockUrl;
        break;
        
      case 'video':
        mockUrl = `${this.MOCK_CDNS.videos}/SampleVideo_1280x720_1mb.mp4`;
        publicUrl = mockUrl;
        break;
        
      case 'audio':
        mockUrl = `${this.MOCK_CDNS.audio}/beep-07.wav`;
        publicUrl = mockUrl;
        break;
        
      default:
        // For documents (PDF, DOCX, etc.), create a local object URL for preview
        // In a real implementation, this would upload to actual storage
        mockUrl = URL.createObjectURL(file);
        publicUrl = mockUrl;
    }

    const result: UploadResult = {
      id: fileId,
      url: mockUrl,
      publicUrl,
      filename: `${fileId}_${file.name}`,
      originalName: file.name,
      size: file.size,
      type: file.type,
      folder: options.folder,
      metadata: {
        uploadedAt: new Date().toISOString(),
        provider: 'mock-s3',
        bucket: 'lms-uploads',
        region: 'us-east-1'
      }
    };

    // Add thumbnail if requested
    if (options.generateThumbnail) {
      const thumbnail = await this.generateThumbnail(file);
      if (thumbnail) {
        result.thumbnailUrl = thumbnail;
      }
    }

    return result;
  }

  // Single file upload
  async uploadFile(
    file: File,
    options: UploadOptions = {},
    onProgress?: ProgressCallback
  ): Promise<UploadResult> {
    try {
      this.validateFile(file, options);
      
      let processedFile = file;
      
      // Compress if requested
      if (options.compress) {
        processedFile = await this.compressFile(file);
      }
      
      return await this.uploadToProvider(processedFile, options, onProgress);
      
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Multiple file upload
  async uploadFiles(
    files: File[],
    options: UploadOptions = {},
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await this.uploadFile(
          file,
          options,
          (progress) => onProgress?.(i, progress)
        );
        results.push(result);
      } catch (error) {
        throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return results;
  }

  // Chunked upload for large files
  async uploadLargeFile(
    file: File,
    options: UploadOptions = {},
    onProgress?: ProgressCallback
  ): Promise<UploadResult> {
    if (file.size < this.CHUNK_SIZE) {
      return this.uploadFile(file, options, onProgress);
    }

    // Simulate chunked upload
    const chunks = Math.ceil(file.size / this.CHUNK_SIZE);
    let uploadedBytes = 0;

    for (let i = 0; i < chunks; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const chunkSize = Math.min(this.CHUNK_SIZE, file.size - uploadedBytes);
      uploadedBytes += chunkSize;
      
      onProgress?.({
        loaded: uploadedBytes,
        total: file.size,
        percentage: (uploadedBytes / file.size) * 100
      });
    }

    return this.uploadToProvider(file, options);
  }

  // Delete file
  async deleteFile(fileId: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`File ${fileId} deleted`);
  }

  // Get file metadata
  async getFileMetadata(fileId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      id: fileId,
      uploadedAt: new Date().toISOString(),
      size: Math.floor(Math.random() * 10000000),
      downloads: Math.floor(Math.random() * 100),
      lastAccessed: new Date().toISOString()
    };
  }

  // Generate signed URL for secure access
  async generateSignedUrl(fileId: string, expiresIn: number = 3600): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const expiry = Date.now() + (expiresIn * 1000);
    return `https://mock-cdn.com/secure/${fileId}?expires=${expiry}&signature=mock_signature`;
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileTypeIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊';
    return '📎';
  }

  // Configuration for different cloud providers
  configureProvider(provider: 'aws-s3' | 'cloudinary' | 'google-cloud', config: any): void {
    console.log(`Configuring ${provider} with:`, config);
    // In a real implementation, this would set up the actual provider SDK
  }
}

export const fileUploadService = new FileUploadService();

// Provider-specific configurations
export const cloudProviderConfigs = {
  'aws-s3': {
    bucket: import.meta.env.VITE_AWS_S3_BUCKET || 'lms-uploads',
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  },
  'cloudinary': {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  },
  'google-cloud': {
    projectId: import.meta.env.VITE_GCP_PROJECT_ID,
    bucket: import.meta.env.VITE_GCS_BUCKET || 'lms-uploads',
    keyFilename: import.meta.env.VITE_GCP_KEY_FILE
  }
};