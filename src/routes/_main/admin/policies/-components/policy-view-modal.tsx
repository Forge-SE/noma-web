import * as React from 'react';
import { format } from 'date-fns';
import { RiShieldCheckLine, RiCheckLine, RiCloseLine } from '@remixicon/react';

import * as Modal from '@/components/ui/modal';
import * as Badge from '@/components/ui/badge';
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

const ACTION_BADGE_COLORS: Record<string, 'red' | 'orange' | 'blue' | 'green'> = {
  BLOCK: 'red',
  REQUIRE_APPROVAL: 'orange',
  NOTIFY: 'blue',
  AUTO_APPROVE: 'green',
};

const ACTION_LABELS: Record<string, string> = {
  BLOCK: 'Block',
  REQUIRE_APPROVAL: 'Require Approval',
  NOTIFY: 'Notify',
  AUTO_APPROVE: 'Auto Approve',
};

const OPERATOR_LABELS: Record<string, string> = {
  '>': 'greater than',
  '<': 'less than',
  '>=': 'greater than or equal',
  '<=': 'less than or equal',
  '==': 'equals',
  '!=': 'not equals',
  CONTAINS: 'contains',
};

interface PolicyViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: any;
  onEdit: (policy: any) => void;
}

export function PolicyViewModal({ isOpen, onClose, policy, onEdit }: PolicyViewModalProps) {
  const actionType = policy?.actions?.[0]?.type;

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className="max-w-[480px]">
        <Modal.Header
          icon={RiShieldCheckLine}
          title={policy?.name || ''}
          description="Policy details"
        />
        <Modal.Body className="p-0">
          <div className="px-5 py-3">
            <DetailRow label="Priority">
              <span className="text-paragraph-sm font-medium text-text-strong-950">
                {policy?.priority ?? '—'}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Action">
              {actionType ? (
                <Badge.Root variant="stroke" color={ACTION_BADGE_COLORS[actionType] || 'gray'}>
                  {ACTION_LABELS[actionType] || actionType.replace(/_/g, ' ')}
                </Badge.Root>
              ) : (
                <span className="text-paragraph-sm text-text-sub-600">—</span>
              )}
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Status">
              {policy?.enabled ? (
                <Badge.Root variant="stroke" color="green">
                  <Badge.Icon as={RiCheckLine} />
                  Enabled
                </Badge.Root>
              ) : (
                <Badge.Root variant="stroke" color="gray">
                  <Badge.Icon as={RiCloseLine} />
                  Disabled
                </Badge.Root>
              )}
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Conditions">
              <div className="flex flex-col gap-1.5 items-end">
                {policy?.conditions?.length > 0 ? (
                  policy.conditions.map((c: any, i: number) => (
                    <span key={i} className="text-paragraph-sm text-text-strong-950">
                      {c.field} <span className="text-text-sub-600">{OPERATOR_LABELS[c.operator] || c.operator}</span> {c.value}
                    </span>
                  ))
                ) : (
                  <span className="text-paragraph-sm text-text-sub-600">No conditions</span>
                )}
              </div>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Created">
              <span className="text-paragraph-sm text-text-sub-600">
                {policy?.createdAt
                  ? format(new Date(policy.createdAt), 'MMM d, yyyy')
                  : '—'}
              </span>
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
              onEdit(policy);
            }}
          >
            Edit Policy
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
