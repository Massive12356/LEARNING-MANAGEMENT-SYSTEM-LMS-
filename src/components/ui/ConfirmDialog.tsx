import React from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger';
  confirmDisabled?: boolean;
  isConfirming?: boolean;
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
  isConfirming = false,
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
            type="button"
            variant="outline" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium"
            disabled={isConfirming}
          >
            {cancelText}
          </Button>
          <Button 
            type="button"
            variant={confirmVariant} 
            onClick={handleConfirm} 
            disabled={confirmDisabled || isConfirming}
            loading={isConfirming}
            className="px-4 py-2 text-sm font-medium"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};