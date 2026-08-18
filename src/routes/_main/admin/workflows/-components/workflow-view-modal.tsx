import * as React from 'react';
import { format } from 'date-fns';
import { RiGitBranchLine } from '@remixicon/react';

import * as Modal from '@/components/ui/modal';
import * as StatusBadge from '@/components/ui/status-badge';
import * as Divider from '@/components/ui/divider';
import * as FancyButton from '@/components/ui/fancy-button';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-paragraph-sm text-text-soft-400 shrink-0 w-[120px]">{label}</span>
      <div className="flex-1 text-right">{children}</div>
    </div>
  );
}

const ACTION_STATUS: Record<string, 'completed' | 'failed' | 'pending' | 'disabled'> = {
  APPROVE: 'completed',
  REJECT: 'failed',
  REVIEW: 'pending',
  NOTIFY: 'disabled',
};

interface WorkflowViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: any;
  onEdit: (workflow: any) => void;
}

export function WorkflowViewModal({ isOpen, onClose, workflow, onEdit }: WorkflowViewModalProps) {
  const steps = workflow?.steps || [];

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className="max-w-[480px]">
        <Modal.Header
          icon={RiGitBranchLine}
          title={workflow?.name || ''}
          description="Workflow details"
        />
        <Modal.Body className="p-0">
          <div className="px-5 py-3">
            <DetailRow label="Created">
              <span className="text-paragraph-sm text-text-sub-600">
                {workflow?.createdAt
                  ? format(new Date(workflow.createdAt), 'MMM d, yyyy')
                  : '—'}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label={`Steps (${steps.length})`}>
              <div className="flex flex-col gap-2 items-end">
                {steps.length > 0 ? (
                  [...steps]
                    .sort((a: any, b: any) => a.stepOrder - b.stepOrder)
                    .map((step: any) => (
                      <div key={step.id} className="flex items-center gap-2">
                        <span className="text-paragraph-xs text-text-soft-400 tabular-nums">
                          #{step.stepOrder}
                        </span>
                        <StatusBadge.Root
                          variant="stroke"
                          status={ACTION_STATUS[step.action] || 'disabled'}
                        >
                          {step.action}
                        </StatusBadge.Root>
                        <span className="text-paragraph-xs text-text-sub-600">
                          {step.assigneeRole}
                        </span>
                      </div>
                    ))
                ) : (
                  <span className="text-paragraph-sm text-text-sub-600">No steps defined</span>
                )}
              </div>
            </DetailRow>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <FancyButton.Root type="button" variant="basic" onClick={onClose}>
            Cancel
          </FancyButton.Root>
          <FancyButton.Root
            type="button"
            variant="primary"
            onClick={() => {
              onClose();
              onEdit(workflow);
            }}
          >
            Edit Workflow
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
