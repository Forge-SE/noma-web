import * as React from 'react';
import { format } from 'date-fns';
import { RiFundsLine } from '@remixicon/react';

import * as Modal from '@/components/ui/modal';
import * as StatusBadge from '@/components/ui/status-badge';
import * as Divider from '@/components/ui/divider';
import * as FancyButton from '@/components/ui/fancy-button';
import { ScoreTrackChart } from '@/components/score-track-chart';
import { formatMoney } from '@/utils/currency';

const PERIOD_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
  CUSTOM: 'Custom',
};

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-paragraph-sm text-text-soft-400 shrink-0 w-[120px]">{label}</span>
      <div className="flex-1 text-right">{children}</div>
    </div>
  );
}

interface BudgetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: any;
  onEdit: (budget: any) => void;
}

export function BudgetViewModal({ isOpen, onClose, budget, onEdit }: BudgetViewModalProps) {
  const amount = budget?.amount || 0;
  const spent = budget?.spent || 0;
  const remaining = budget?.remaining ?? (amount - spent);
  const percentage = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className="max-w-[480px]">
        <Modal.Header
          icon={RiFundsLine}
          title={budget?.name || ''}
          description="Budget details"
        />
        <Modal.Body className="p-0">
          <div className="px-5 py-3">
            <DetailRow label="Department">
              <span className="text-paragraph-sm text-text-strong-950">
                {budget?.department?.name || 'Organization-wide'}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Amount">
              <span className="text-paragraph-sm font-medium text-text-strong-950">
                {formatMoney(amount)}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Spent">
              <span className="text-paragraph-sm text-text-strong-950">
                {formatMoney(spent)}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Remaining">
              <span className="text-paragraph-sm font-medium text-text-strong-950">
                {formatMoney(remaining)}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Progress">
              <div className="flex flex-col items-end gap-1 ml-auto w-[200px]">
                <ScoreTrackChart value={percentage} />
                <span className="text-paragraph-xs font-medium tabular-nums text-text-sub-600">
                  {Math.round(percentage)}%
                </span>
              </div>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Period">
              <StatusBadge.Root variant="stroke">
                {PERIOD_LABELS[budget?.period] || budget?.period}
              </StatusBadge.Root>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Period Range">
              <span className="text-paragraph-sm text-text-strong-950">
                {budget?.periodStart
                  ? `${format(new Date(budget.periodStart), 'MMM d, yyyy')} – ${budget?.periodEnd ? format(new Date(budget.periodEnd), 'MMM d, yyyy') : '—'}`
                  : '—'}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Created">
              <span className="text-paragraph-sm text-text-sub-600">
                {budget?.createdAt
                  ? format(new Date(budget.createdAt), 'MMM d, yyyy')
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
              onEdit(budget);
            }}
          >
            Edit Budget
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
