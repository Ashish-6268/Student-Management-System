import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  variant,
  confirmVariant
}) {
  const finalOnClose = onClose || onCancel;
  const finalConfirmText = confirmText || confirmLabel || 'Confirm';
  const finalCancelText = cancelText || cancelLabel || 'Cancel';
  const finalVariant = variant || confirmVariant || 'danger';

  return (
    <Modal isOpen={isOpen} onClose={finalOnClose} title={title} size="sm">
      <div className="mt-2">
        <p className="text-sm text-gray-500">{message}</p>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="secondary" onClick={finalOnClose}>
          {finalCancelText}
        </Button>
        <Button variant={finalVariant} onClick={onConfirm}>
          {finalConfirmText}
        </Button>
      </div>
    </Modal>
  );
}
