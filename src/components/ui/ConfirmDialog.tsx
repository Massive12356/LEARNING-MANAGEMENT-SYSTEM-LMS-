import React from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger';
  confirmDisabled?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  confirmDisabled = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
          {message}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium"
          >
            {cancelText}
          </Button>
          <Button 
            variant={confirmVariant} 
            onClick={handleConfirm} 
            disabled={confirmDisabled}
            className="px-4 py-2 text-sm font-medium"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};