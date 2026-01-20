import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Allows only safe tags and attributes
 */
export const sanitizeHTML = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'ul', 'li', 'strong', 'em', 'a', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};

// For plain text inputs (like emails, names, etc.), use basic sanitization
export const sanitizePlainText = (content: string): string => {
  // Remove potentially harmful characters but preserve regular text
  return content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

/**
 * Creates a sanitized change handler for input/textarea elements
 * Only applies HTML sanitization if the input is likely to contain HTML content
 */
export const createSmartSanitizedChangeHandler = <T extends HTMLInputElement | HTMLTextAreaElement>(
  originalHandler: (e: React.ChangeEvent<T>) => void,
  shouldSanitizeHTML: boolean = false
) => {
  return (e: React.ChangeEvent<T>) => {
    let cleanValue: string;
    
    if (shouldSanitizeHTML) {
      // Apply full HTML sanitization
      cleanValue = sanitizeHTML(e.target.value);
    } else {
      // Apply basic sanitization for plain text
      cleanValue = sanitizePlainText(e.target.value);
    }
    
    const sanitizedEvent = {
      ...e,
      target: {
        ...e.target,
        value: cleanValue,
      },
    };
    originalHandler(sanitizedEvent);
  };
};

/**
 * Creates a sanitized change handler for input/textarea elements
 */
export const createSanitizedChangeHandler = <T extends HTMLInputElement | HTMLTextAreaElement>(
  originalHandler: (e: React.ChangeEvent<T>) => void
) => {
  return (e: React.ChangeEvent<T>) => {
    const cleanValue = sanitizeHTML(e.target.value);
    const sanitizedEvent = {
      ...e,
      target: {
        ...e.target,
        value: cleanValue,
      },
    };
    originalHandler(sanitizedEvent);
  };
};

/**
 * Creates a sanitized change handler for rich text editors
 */
export const createSanitizedEditorChangeHandler = (
  originalHandler: (value: string) => void
) => {
  return (value: string) => {
    const cleanValue = sanitizeHTML(value);
    originalHandler(cleanValue);
  };
};