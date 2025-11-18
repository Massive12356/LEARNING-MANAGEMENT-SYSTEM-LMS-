import React from 'react';
import { Button } from './Button';

type SwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  loading = false,
  size = 'md',
}) => {
  const sizes = {
    sm: 'w-10 h-5',
    md: 'w-12 h-6',
    lg: 'w-16 h-8',
  };

  const handleClick = () => {
    if (disabled || loading) return;
    onChange(!checked);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center ${
        sizes[size]
      } cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div
        className={`absolute inset-0 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
        }`}
      />
      <span
        className={`relative inline-block bg-white rounded-full shadow transform transition-transform ${
          checked ? 'translate-x-full' : 'translate-x-0'
        } ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}`}
      >
        {loading && (
          <svg className="animate-spin h-full w-full text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              fill="currentColor"
              className="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </span>
    </div>
  );
};
