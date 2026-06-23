import * as React from 'react';
import * as Modal from '@/components/ui/modal';
import * as FancyButton from '@/components/ui/fancy-button';
import { useToast } from '@/components/ui/toaster';
import type { User } from './users-table';

interface ConfirmDeactivateModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
}

// Placeholder – will be replaced with real GraphQL query
const mockAffectedWorkflows = [
  { id: '1', name: 'MacBook Pro Request', amount: 'GHS 15,000' },
  { id: '2', name: 'Q3 Marketing Budget', amount: 'GHS 50,000' },
];

export function ConfirmDeactivateModal({ user, isOpen, onClose, onConfirm }: ConfirmDeactivateModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [affectedWorkflows, setAffectedWorkflows] = React.useState<any[]>([]);
  const [isChecking, setIsChecking] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && user) {
      setIsChecking(true);
      // TODO: replace with activeWorkflowsForApprover(userId) query
      const timer = setTimeout(() => {
        setAffectedWorkflows(mockAffectedWorkflows);
        setIsChecking(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setAffectedWorkflows([]);
    }
  }, [isOpen, user]);

  const handleDeactivate = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await onConfirm(user.id);
      toast({ title: 'User deactivated', description: `${user.name} has been deactivated.`, status: 'success' });
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to deactivate user.', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className="max-w-[440px]">
        <Modal.Header
          title="Deactivate User"
          description={`Deactivate ${user.name}.`}
        />

        <Modal.Body className="flex flex-col gap-4">
          <p className="text-paragraph-sm text-text-sub-600">
            Are you sure you want to deactivate this user? They will immediately lose access to the platform.
          </p>

          {(isChecking || affectedWorkflows.length > 0) && (
            <div>
              {isChecking ? (
                <div className="rounded-lg bg-bg-weak-50 p-4 text-center">
                  <span className="text-paragraph-sm text-text-sub-600">
                    Checking for active workflow dependencies…
                  </span>
                </div>
              ) : (
                <div className="rounded-lg border border-stroke-soft-200 bg-warning-lighter p-4">
                  <p className="text-label-sm text-warning-dark font-medium mb-2">
                    Active Workflows Affected
                  </p>
                  <p className="text-paragraph-xs text-text-sub-600 mb-3">
                    This user is a pending approver on these requests. Deactivating them will auto-escalate to the next approver.
                  </p>
                  <ul className="space-y-1.5">
                    {affectedWorkflows.map((wf) => (
                      <li
                        key={wf.id}
                        className="flex justify-between rounded-lg bg-bg-white-0 px-3 py-2 text-paragraph-sm"
                      >
                        <span className="text-text-strong-950">{wf.name}</span>
                        <span className="text-text-sub-600">{wf.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <FancyButton.Root type="button" variant="basic" onClick={onClose} disabled={isLoading}>
            Cancel
          </FancyButton.Root>
          <FancyButton.Root
            type="button"
            variant="destructive"
            onClick={handleDeactivate}
            disabled={isLoading || isChecking}
          >
            {isLoading ? 'Deactivating…' : 'Yes, Deactivate'}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
