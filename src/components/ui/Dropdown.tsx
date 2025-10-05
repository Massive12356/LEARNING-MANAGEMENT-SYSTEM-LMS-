import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string | number | null;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  maxHeight?: number;
  className?: string;
  error?: string;
  label?: string;
  helpText?: string;
  onChange: (value: string | number | null | (string | number)[]) => void;
  onSearch?: (query: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option...',
  disabled = false,
  clearable = false,
  searchable = false,
  multiple = false,
  maxHeight = 200,
  className = '',
  error,
  label,
  helpText,
  onChange,
  onSearch
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return [];
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Filter options based on search query
  const filteredOptions = options.filter(option => {
    if (!searchQuery) return true;
    return option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
           option.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get selected option(s) for display
  const getSelectedLabel = () => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option?.label || placeholder;
      }
      return `${selectedValues.length} items selected`;
    } else {
      const option = options.find(opt => opt.value === value);
      return option?.label || placeholder;
    }
  };

  // Handle option selection
  const handleOptionClick = (optionValue: string | number) => {
    if (multiple) {
      const newSelectedValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      
      setSelectedValues(newSelectedValues);
      onChange(newSelectedValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Handle clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      setSelectedValues([]);
      onChange([]);
    } else {
      onChange(null);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Check if option is selected
  const isOptionSelected = (optionValue: string | number) => {
    return multiple 
      ? selectedValues.includes(optionValue)
      : value === optionValue;
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      <div ref={dropdownRef} className="relative">
        {/* Dropdown trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            relative w-full bg-white dark:bg-gray-800 border rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm
            ${error 
              ? 'border-red-300 dark:border-red-600' 
              : 'border-gray-300 dark:border-gray-600'
            }
            ${disabled 
              ? 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
              : 'hover:border-gray-400 dark:hover:border-gray-500'
            }
          `}
        >
          <span className={`block truncate ${!value && !selectedValues.length ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {getSelectedLabel()}
          </span>
          
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            {clearable && (value || selectedValues.length > 0) && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 pointer-events-auto"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </span>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {/* Search input */}
            {searchable && (
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search options..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {/* Options list */}
            <div style={{ maxHeight: `${maxHeight}px` }} className="overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                  {searchQuery ? 'No options found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleOptionClick(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full text-left px-3 py-2 flex items-center justify-between transition-colors duration-150
                      ${option.disabled
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : isOptionSelected(option.value)
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                          : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      {option.icon && (
                        <span className="mr-2 flex-shrink-0">
                          {option.icon}
                        </span>
                      )}
                      <div>
                        <div className="font-medium">{option.label}</div>
                        {option.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isOptionSelected(option.value) && (
                      <CheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Help text */}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );
};