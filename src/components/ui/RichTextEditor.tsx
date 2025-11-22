import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  PhotoIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  Bars3BottomLeftIcon
} from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Modal } from './Modal';
import { Input } from './Input';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  disabled?: boolean;
  showToolbar?: boolean;
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon: Icon,
  title,
  onClick,
  isActive = false,
  disabled = false
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`
      p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
      ${isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <Icon className="h-4 w-4" />
  </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  minHeight = '200px',
  maxHeight = '500px',
  disabled = false,
  showToolbar = true
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const editorRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  const isComposingRef = useRef(false);
  const skipNextInputRef = useRef(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Update editor content when external value changes
  useEffect(() => {
    if (valueRef.current !== value && editorRef.current) {
      valueRef.current = value;
      // Only update if the content is different to avoid cursor jumps
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  // Save cursor position before updates
  const saveCursorPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(editorRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    return {
      start,
      scrollTop: editorRef.current.scrollTop
    };
  }, []);

  // Restore cursor position after updates
  const restoreCursorPosition = useCallback((position: { start: number; scrollTop: number } | null) => {
    if (!position || !editorRef.current) return;

    const { start, scrollTop } = position;
    
    // Restore scroll position
    editorRef.current.scrollTop = scrollTop;

    // More reliable cursor restoration
    const restore = () => {
      if (!editorRef.current) return;
      
      const selection = window.getSelection();
      if (!selection) return;
      
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      
      // Move to the saved position
      let charCount = 0;
      const moveRange = (node: Node) => {
        if (charCount >= start) return true;
        
        if (node.nodeType === Node.TEXT_NODE) {
          const textLength = node.textContent?.length || 0;
          if (charCount + textLength >= start) {
            // Position is within this text node
            range.setStart(node, start - charCount);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            return true;
          }
          charCount += textLength;
        } else {
          // Element node, traverse children
          for (let i = 0; i < node.childNodes.length; i++) {
            if (moveRange(node.childNodes[i])) {
              return true;
            }
          }
        }
        return false;
      };
      
      moveRange(editorRef.current);
    };

    // Restore cursor position after a short delay to allow DOM updates
    setTimeout(restore, 0);
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    const position = saveCursorPosition();
    
    // Special handling for list commands to ensure they work properly
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      // Ensure we're working with the correct document context
      document.execCommand('styleWithCSS', false, 'false');
    }
    
    document.execCommand(command, false, value);
    
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      valueRef.current = newValue;
      skipNextInputRef.current = true;
      onChange(newValue);
    }
    
    // Restore cursor position after a short delay to allow DOM updates
    setTimeout(() => restoreCursorPosition(position), 0);
  }, [onChange, saveCursorPosition, restoreCursorPosition]);

  const handleInput = useCallback(() => {
    if (editorRef.current && !isComposingRef.current && !skipNextInputRef.current) {
      const newValue = editorRef.current.innerHTML;
      valueRef.current = newValue;
      onChange(newValue);
    }
    skipNextInputRef.current = false;
  }, [onChange]);

  // Handle composition events for IME input (e.g., Chinese, Japanese)
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    // Trigger input handling after composition ends
    handleInput();
  }, [handleInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'k':
          e.preventDefault();
          insertLink();
          break;
      }
    }

    // Handle Enter key for list items
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const listItem = range.startContainer.parentElement?.closest('li');
        if (listItem) {
          // If the list item is empty, remove it and exit the list
          if (!listItem.textContent?.trim()) {
            e.preventDefault();
            
            // Get the parent list
            const list = listItem.closest('ul, ol');
            if (list) {
              // Remove the empty list item
              listItem.remove();
              
              // If this was the last item in the list, remove the empty list
              if (list.children.length === 0) {
                const nextElement = list.nextSibling;
                list.remove();
                
                // Create a new paragraph
                const newP = document.createElement('p');
                newP.innerHTML = '<br>';
                
                // Insert after the list or at the end
                if (nextElement) {
                  nextElement.parentElement?.insertBefore(newP, nextElement);
                } else {
                  editorRef.current?.appendChild(newP);
                }
                
                // Move cursor to the new paragraph
                const newRange = document.createRange();
                newRange.setStart(newP, 0);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              } else {
                // Just move cursor to next line
                const newP = document.createElement('p');
                newP.innerHTML = '<br>';
                list.after(newP);
                
                // Move cursor to the new paragraph
                const newRange = document.createRange();
                newRange.setStart(newP, 0);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
              
              // Update the editor content
              setTimeout(() => {
                if (editorRef.current) {
                  const newValue = editorRef.current.innerHTML;
                  if (newValue !== valueRef.current) {
                    valueRef.current = newValue;
                    onChange(newValue);
                  }
                }
              }, 0);
            }
          }
        }
      }
    }
    
    // Handle Tab key for list items indentation
    if (e.key === 'Tab') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const listItem = range.startContainer.parentElement?.closest('li');
        if (listItem) {
          e.preventDefault();
          if (e.shiftKey) {
            document.execCommand('outdent');
          } else {
            document.execCommand('indent');
          }
          
          // Update the editor content
          setTimeout(() => {
            if (editorRef.current) {
              const newValue = editorRef.current.innerHTML;
              if (newValue !== valueRef.current) {
                valueRef.current = newValue;
                onChange(newValue);
              }
            }
          }, 0);
        }
      }
    }
  }, [execCommand, onChange]);

  const insertLink = useCallback(() => {
    // Instead of using prompt, show our custom modal
    setLinkUrl('');
    setShowLinkModal(true);
  }, []);

  const insertImage = useCallback(() => {
    // Instead of using prompt, show our custom modal
    setImageUrl('');
    setShowImageModal(true);
  }, []);

  const insertVideo = useCallback(() => {
    // Instead of using prompt, show our custom modal
    setVideoUrl('');
    setShowVideoModal(true);
  }, []);

  const handleInsertLink = useCallback(() => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
    }
    setShowLinkModal(false);
    setLinkUrl('');
  }, [execCommand, linkUrl]);

  const handleInsertImage = useCallback(() => {
    if (imageUrl) {
      execCommand('insertImage', imageUrl);
    }
    setShowImageModal(false);
    setImageUrl('');
  }, [execCommand, imageUrl]);

  const handleInsertVideo = useCallback(() => {
    if (videoUrl) {
      let embedUrl = videoUrl;
      
      // Convert YouTube URLs to embed format
      if (videoUrl.includes('youtube.com/watch')) {
        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      
      // Convert Vimeo URLs
      if (videoUrl.includes('vimeo.com/')) {
        const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }

      const iframe = `<iframe src="${embedUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;
      execCommand('insertHTML', iframe);
    }
    setShowVideoModal(false);
    setVideoUrl('');
  }, [execCommand, videoUrl]);

  const handleFormatChange = useCallback((format: string) => {
    execCommand('formatBlock', format);
    setSelectedFormat(format);
  }, [execCommand]);

  const togglePreview = useCallback(() => {
    setIsPreview(!isPreview);
  }, [isPreview]);

  const cleanHTML = useCallback((html: string) => {
    // Basic HTML sanitization - in production, use a proper sanitization library
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      // Remove dir attributes to prevent RTL issues
      .replace(/\sdir="[^"]*"/gi, '')
      .replace(/\sdir='[^']*'/gi, '');
  }, []);

  // Initialize editor content on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  // Fix for list commands - robust implementation that works with manual DOM manipulation
  const toggleUnorderedList = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    // Check if we're inside a list item
    const listItem = container.nodeType === Node.ELEMENT_NODE 
      ? (container as Element).closest('li')
      : container.parentElement?.closest('li');
    
    if (listItem) {
      // We're in a list item, try to toggle off
      try {
        document.execCommand('styleWithCSS', false, 'false');
        document.execCommand('insertUnorderedList', false, undefined);
      } catch (error) {
        // If execCommand fails, manually convert to paragraph
        const parentList = listItem.closest('ul, ol');
        if (parentList) {
          // Create a new paragraph with the list item content
          const newP = document.createElement('p');
          newP.innerHTML = listItem.innerHTML || '<br>';
          
          // Replace the list item with the paragraph
          listItem.replaceWith(newP);
          
          // If the list is now empty, remove it
          if (parentList.children.length === 0) {
            parentList.remove();
          }
          
          // Move cursor to the new paragraph
          const newRange = document.createRange();
          newRange.setStart(newP, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    } else {
      // We're not in a list, try to create one
      try {
        document.execCommand('styleWithCSS', false, 'false');
        document.execCommand('insertUnorderedList', false, undefined);
      } catch (error) {
        // If execCommand fails, manually create a list
        if (range.collapsed) {
          // For collapsed selection, create an empty list
          const list = document.createElement('ul');
          const newItem = document.createElement('li');
          newItem.innerHTML = '<br>';
          list.appendChild(newItem);
          
          range.insertNode(list);
          
          // Move cursor to the new list item
          const newRange = document.createRange();
          newRange.setStart(newItem, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          // For range selection, wrap content in list
          const list = document.createElement('ul');
          const newItem = document.createElement('li');
          
          // Extract selected content
          const fragment = range.extractContents();
          newItem.appendChild(fragment);
          list.appendChild(newItem);
          
          range.insertNode(list);
        }
      }
    }
    
    // Update the editor content
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      valueRef.current = newValue;
      skipNextInputRef.current = true;
      onChange(newValue);
    }
  }, [onChange]);

  const toggleOrderedList = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    // Check if we're inside a list item
    const listItem = container.nodeType === Node.ELEMENT_NODE 
      ? (container as Element).closest('li')
      : container.parentElement?.closest('li');
    
    if (listItem) {
      // We're in a list item, try to toggle off
      try {
        document.execCommand('styleWithCSS', false, 'false');
        document.execCommand('insertOrderedList', false, undefined);
      } catch (error) {
        // If execCommand fails, manually convert to paragraph
        const parentList = listItem.closest('ul, ol');
        if (parentList) {
          // Create a new paragraph with the list item content
          const newP = document.createElement('p');
          newP.innerHTML = listItem.innerHTML || '<br>';
          
          // Replace the list item with the paragraph
          listItem.replaceWith(newP);
          
          // If the list is now empty, remove it
          if (parentList.children.length === 0) {
            parentList.remove();
          }
          
          // Move cursor to the new paragraph
          const newRange = document.createRange();
          newRange.setStart(newP, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    } else {
      // We're not in a list, try to create one
      try {
        document.execCommand('styleWithCSS', false, 'false');
        document.execCommand('insertOrderedList', false, undefined);
      } catch (error) {
        // If execCommand fails, manually create a list
        if (range.collapsed) {
          // For collapsed selection, create an empty list
          const list = document.createElement('ol');
          const newItem = document.createElement('li');
          newItem.innerHTML = '<br>';
          list.appendChild(newItem);
          
          range.insertNode(list);
          
          // Move cursor to the new list item
          const newRange = document.createRange();
          newRange.setStart(newItem, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          // For range selection, wrap content in list
          const list = document.createElement('ol');
          const newItem = document.createElement('li');
          
          // Extract selected content
          const fragment = range.extractContents();
          newItem.appendChild(fragment);
          list.appendChild(newItem);
          
          range.insertNode(list);
        }
      }
    }
    
    // Update the editor content
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      valueRef.current = newValue;
      skipNextInputRef.current = true;
      onChange(newValue);
    }
  }, [onChange]);

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {showToolbar && (
        <div className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-2">
          <div className="flex items-center space-x-1 flex-wrap gap-2">
            {/* Format Selector */}
            <select
              value={selectedFormat}
              onChange={(e) => handleFormatChange(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={disabled}
            >
              <option value="">Normal</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="p">Paragraph</option>
              <option value="blockquote">Quote</option>
            </select>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

            {/* Basic Formatting */}
            <ToolbarButton
              icon={BoldIcon}
              title="Bold (Ctrl+B)"
              onClick={() => execCommand('bold')}
              disabled={disabled}
            />
            <ToolbarButton
              icon={ItalicIcon}
              title="Italic (Ctrl+I)"
              onClick={() => execCommand('italic')}
              disabled={disabled}
            />
            <ToolbarButton
              icon={UnderlineIcon}
              title="Underline (Ctrl+U)"
              onClick={() => execCommand('underline')}
              disabled={disabled}
            />

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

            {/* Lists - Fixed implementation */}
            <ToolbarButton
              icon={ListBulletIcon}
              title="Bullet List"
              onClick={toggleUnorderedList}
              disabled={disabled}
            />
            <ToolbarButton
              icon={NumberedListIcon}
              title="Numbered List"
              onClick={toggleOrderedList}
              disabled={disabled}
            />

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

            {/* Media */}
            <ToolbarButton
              icon={LinkIcon}
              title="Insert Link (Ctrl+K)"
              onClick={insertLink}
              disabled={disabled}
            />
            <ToolbarButton
              icon={PhotoIcon}
              title="Insert Image"
              onClick={insertImage}
              disabled={disabled}
            />
            <ToolbarButton
              icon={VideoCameraIcon}
              title="Insert Video"
              onClick={insertVideo}
              disabled={disabled}
            />

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

            {/* Code */}
            <ToolbarButton
              icon={CodeBracketIcon}
              title="Code"
              onClick={() => execCommand('insertHTML', '<code></code>')}
              disabled={disabled}
            />

            <div className="flex-1" />

            {/* Preview Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={togglePreview}
              disabled={disabled}
            >
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
          </div>
        </div>
      )}

      <div className="relative">
        {isPreview ? (
          <div
            className="p-4 prose prose-sm max-w-none dark:prose-invert"
            style={{ minHeight, maxHeight, direction: 'ltr' }}
            dangerouslySetInnerHTML={{ __html: cleanHTML(value) }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            className={`
              p-4 outline-none overflow-y-auto
              ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-900'}
              text-gray-900 dark:text-white text-left
            `}
            style={{ minHeight, maxHeight, direction: 'ltr' }}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        )}

        {!value && !isPreview && (
          <div 
            className="absolute top-4 left-4 text-gray-400 pointer-events-none"
            style={{ display: value ? 'none' : 'block', direction: 'ltr' }}
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* Link Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setLinkUrl('');
        }}
        title="Insert Link"
      >
        <div className="space-y-4">
          <Input
            label="URL"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowLinkModal(false);
                setLinkUrl('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInsertLink}
              disabled={!linkUrl}
            >
              Insert Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          setImageUrl('');
        }}
        title="Insert Image"
      >
        <div className="space-y-4">
          <Input
            label="Image URL"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowImageModal(false);
                setImageUrl('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInsertImage}
              disabled={!imageUrl}
            >
              Insert Image
            </Button>
          </div>
        </div>
      </Modal>

      {/* Video Modal */}
      <Modal
        isOpen={showVideoModal}
        onClose={() => {
          setShowVideoModal(false);
          setVideoUrl('');
        }}
        title="Insert Video"
      >
        <div className="space-y-4">
          <Input
            label="Video URL"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            autoFocus
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Supports YouTube, Vimeo, and other video platforms
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowVideoModal(false);
                setVideoUrl('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInsertVideo}
              disabled={!videoUrl}
            >
              Insert Video
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Utility component for displaying rich text content (read-only)
interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export const RichTextEditorWithLists: React.FC<RichTextEditorProps> = (props) => {
  // This is just a wrapper to maintain backward compatibility
  return <RichTextEditor {...props} />;
};

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
  content,
  className = ''
}) => {
  const cleanHTML = (html: string) => {
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      // Remove dir attributes to prevent RTL issues
      .replace(/\sdir="[^"]*"/gi, '')
      .replace(/\sdir='[^']*'/gi, '');
  };

  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert ${className}`}
      style={{ direction: 'ltr' }}
      dangerouslySetInnerHTML={{ __html: cleanHTML(content) }}
    />
  );
};