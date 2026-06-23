import * as React from 'react';
import * as Modal from '@/components/ui/modal';
import * as FancyButton from '@/components/ui/fancy-button';
import { Department } from './departments-table';

interface ConfirmDeleteModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteModal({ department, isOpen, onClose, onConfirm }: ConfirmDeleteModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  if (!department) return null;

  return (
    <Modal.Root open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <Modal.Content className="max-w-[440px]">
        <Modal.Header
          title="Delete Department"
          description={`Delete ${department.name}.`}
        />
        
        <Modal.Body className="flex flex-col gap-4">
          <p className="text-paragraph-sm text-text-sub-600">
            Are you sure you want to delete this department? This action cannot be undone.
          </p>
          
          {department.memberCount > 0 && (
            <div className="rounded-lg border border-stroke-soft-200 bg-warning-lighter p-4">
              <p className="text-label-xs text-warning-dark font-medium mb-1">
                Active Members Warning
              </p>
              <p className="text-paragraph-xs text-text-sub-600">
                This department currently has <strong>{department.memberCount}</strong> {department.memberCount === 1 ? 'member' : 'members'}. If you delete this department, these members will no longer be associated with it.
              </p>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <FancyButton.Root type="button" variant="basic" onClick={onClose} disabled={isLoading}>
            Cancel
          </FancyButton.Root>
          <FancyButton.Root type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting…' : 'Yes, Delete'}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
