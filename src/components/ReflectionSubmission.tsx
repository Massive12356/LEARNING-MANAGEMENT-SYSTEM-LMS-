// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { FileUploader } from './ui/FileUploader';
import { Input } from './ui/Input';
import { RichTextEditor } from './ui/RichTextEditor';
import { 
  PencilSquareIcon,
  DocumentArrowUpIcon,
  LinkIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ReflectionSubmissionProps {
  lessonId: string;
  title: string;
  description: string;
  submissionType?: 'text' | 'file' | 'both' | 'link';
  maxFiles?: number;
  allowedFileTypes?: string;
  wordLimit?: number;
  dueDate?: Date;
  onSubmit: (submission: ReflectionSubmission) => Promise<void>;
  onSaveDraft?: (submission: ReflectionSubmission) => Promise<void>;
  existingSubmission?: ReflectionSubmission;
  disabled?: boolean;
}

interface ReflectionSubmission {
  id?: string;
  lessonId: string;
  studentId: string;
  type: 'text' | 'file' | 'link';
  content: string;
  attachments?: UploadedFile[];
  submittedAt: Date;
  isDraft?: boolean;
  feedback?: string;
  grade?: number;
  reviewedAt?: Date;
  reviewedBy?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export const ReflectionSubmission: React.FC<ReflectionSubmissionProps> = ({
  lessonId,
  title,
  description,
  submissionType = 'both',
  maxFiles = 5,
  allowedFileTypes = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mp3',
  wordLimit,
  dueDate,
  onSubmit,
  onSaveDraft,
  existingSubmission,
  disabled = false
}) => {
  const [activeSubmissionType, setActiveSubmissionType] = useState<'text' | 'file' | 'link'>('text');
  const [textContent, setTextContent] = useState(existingSubmission?.content || '');
  const [linkUrl, setLinkUrl] = useState(existingSubmission?.type === 'link' ? existingSubmission.content : '');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(existingSubmission?.attachments || []);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingSubmission && !existingSubmission.isDraft);
  const [isDraft, setIsDraft] = useState(existingSubmission?.isDraft ?? false);
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save draft functionality
  useEffect(() => {
    if (onSaveDraft && textContent && !submitting) {
      const timeoutId = setTimeout(() => {
        handleSaveDraft();
      }, 5000); // Auto-save every 5 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [textContent, uploadedFiles]);

  // Update word count
  useEffect(() => {
    const text = textContent.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [textContent]);

  const handleSubmit = async () => {
    let content = '';
    let attachments: UploadedFile[] = [];

    switch (activeSubmissionType) {
      case 'text':
        if (!textContent.trim()) {
          toast.error('Please enter your reflection');
          return;
        }
        if (wordLimit && wordCount > wordLimit) {
          toast.error(`Your reflection exceeds the word limit of ${wordLimit} words`);
          return;
        }
        content = textContent;
        break;
      case 'file':
        if (uploadedFiles.length === 0) {
          toast.error('Please upload a file');
          return;
        }
        content = `File submission: ${uploadedFiles.map(f => f.name).join(', ')}`;
        attachments = uploadedFiles;
        break;
      case 'link':
        if (!linkUrl.trim()) {
          toast.error('Please enter a valid URL');
          return;
        }
        if (!isValidUrl(linkUrl)) {
          toast.error('Please enter a valid URL');
          return;
        }
        content = linkUrl;
        break;
    }

    setSubmitting(true);
    try {
      const submission: ReflectionSubmission = {
        id: existingSubmission?.id,
        lessonId,
        studentId: 'current-user-id', // TODO: Get from auth context
        type: activeSubmissionType,
        content,
        attachments: attachments.length > 0 ? attachments : undefined,
        submittedAt: new Date(),
        isDraft: false
      };

      await onSubmit(submission);
      setSubmitted(true);
      setIsDraft(false);
      toast.success('Reflection submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit reflection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setSavingDraft(true);
    try {
      const submission: ReflectionSubmission = {
        id: existingSubmission?.id,
        lessonId,
        studentId: 'current-user-id', // TODO: Get from auth context
        type: activeSubmissionType,
        content: textContent,
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        submittedAt: new Date(),
        isDraft: true
      };

      await onSaveDraft(submission);
      setIsDraft(true);
      setLastSaved(new Date());
      toast.success('Draft saved successfully!');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      // Mock file upload - replace with real API
      const newFiles: UploadedFile[] = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file) // Mock URL
      }));

      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
    }
  };

  const handleFileRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOverdue = dueDate && new Date() > dueDate;
  const canEdit = !submitted && !disabled;

  if (submitted && !existingSubmission) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Reflection Submitted!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your reflection has been submitted successfully. Your instructor will review it and provide feedback.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              {dueDate && (
                <div className={`flex items-center space-x-1 ${
                  isOverdue ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  <ClockIcon className="h-4 w-4" />
                  <span>
                    Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}
                  </span>
                </div>
              )}
              {wordLimit && (
                <div className="text-gray-600 dark:text-gray-400">
                  Word limit: {wordLimit} words
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {submitted && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Submitted</span>
              </div>
            )}
            {isDraft && !submitted && (
              <div className="flex items-center space-x-1 text-orange-600">
                <ExclamationCircleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Draft</span>
              </div>
            )}
            {isOverdue && !submitted && (
              <div className="flex items-center space-x-1 text-red-600">
                <ExclamationCircleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Overdue</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {existingSubmission ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                Submission Completed
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Submitted on {existingSubmission.submittedAt.toLocaleDateString()}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Your Submission:
              </h4>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {existingSubmission.content}
                </p>
              </div>
            </div>

            {existingSubmission.feedback && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Instructor Feedback:
                </h4>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-800 dark:text-blue-200">
                    {existingSubmission.feedback}
                  </p>
                  {existingSubmission.grade && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      Grade: {existingSubmission.grade}/100
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Submission Type Selector */}
            {(submissionType === 'both' || submissionType === 'text') && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  How would you like to submit your reflection?
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveSubmissionType('text')}
                    disabled={!canEdit}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      activeSubmissionType === 'text'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <PencilSquareIcon className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Write Text
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSubmissionType('file')}
                    disabled={!canEdit}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      activeSubmissionType === 'file'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <DocumentArrowUpIcon className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Upload File
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSubmissionType('link')}
                    disabled={!canEdit}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      activeSubmissionType === 'link'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <LinkIcon className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Share Link
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Submission Content */}
            <div>
              {activeSubmissionType === 'text' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Your Reflection
                    </label>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      {wordLimit && (
                        <span className={wordCount > wordLimit ? 'text-red-600' : ''}>
                          {wordCount} / {wordLimit} words
                        </span>
                      )}
                      {lastSaved && (
                        <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>
                  <RichTextEditor
                    value={textContent}
                    onChange={setTextContent}
                    placeholder="Share your thoughts, insights, and reflections on this lesson..."
                    disabled={!canEdit}
                    minHeight="300px"
                  />
                </div>
              )}

              {activeSubmissionType === 'file' && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Document
                  </label>
                  <FileUploader
                    legacyMode={true}
                    accept={allowedFileTypes}
                    maxFiles={maxFiles}
                    multiple={maxFiles > 1}
                    onUpload={handleFileUpload}
                    onRemove={handleFileRemove}
                    disabled={!canEdit}
                    uploadedFiles={uploadedFiles.map(file => ({
                      file: new File([new Blob()], file.name, { type: file.type }),
                      url: file.url,
                      progress: 100
                    }))}
                  />
                </div>
              )}

              {activeSubmissionType === 'link' && (
                <div className="space-y-1">
                  <Input
                    label="Share a Link"
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com/my-reflection"
                    helpText="Share a link to your reflection (blog post, video, presentation, etc.)"
                    disabled={!canEdit}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            {canEdit && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {onSaveDraft && (
                    <Button
                      variant="outline"
                      onClick={handleSaveDraft}
                      loading={savingDraft}
                      disabled={!textContent && uploadedFiles.length === 0 && !linkUrl}
                    >
                      Save Draft
                    </Button>
                  )}
                </div>
                
                <Button 
                  onClick={handleSubmit} 
                  loading={submitting}
                  disabled={!textContent.trim() && uploadedFiles.length === 0 && !linkUrl.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Reflection
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};