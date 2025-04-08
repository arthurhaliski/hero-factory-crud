'use client';

import { Modal } from './modal';
import { Button } from './button';
import { Text } from './text';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: 'red' | 'blue' | 'green' | 'zinc';
  isConfirming?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  confirmButtonColor = 'red',
  isConfirming = false,
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <Text>{message}</Text>
        <div className="flex justify-end gap-3 pt-4">
          <Button plain onClick={onClose} disabled={isConfirming}>
            {cancelButtonText}
          </Button>
          <Button 
            color={confirmButtonColor} 
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? 'Confirmando...' : confirmButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
} 