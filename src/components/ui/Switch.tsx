import React from 'react';

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
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
    lg: 'px-4 py-2 text-lg',
  };

  const handleClick = () => {
    if (disabled || loading) return;
    onChange(!checked);
  };

  // Determine the correct text
  const buttonText = loading
    ? checked
      ? 'Disabling...'
      : 'Enabling...'
    : checked
    ? 'Enabled'
    : 'Disabled';

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        rounded-md font-semibold 
        ${checked ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}
        ${sizes[size]}
        transition
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {buttonText}
    </button>
  );
};
