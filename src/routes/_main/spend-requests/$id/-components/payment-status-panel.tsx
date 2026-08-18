import * as React from 'react';
import { RiRefreshLine } from '@remixicon/react';
import * as Badge from '@/components/ui/badge';
import * as FancyButton from '@/components/ui/fancy-button';

interface PaymentStatusPanelProps {
  paymentTransaction: {
    id: string;
    provider: string;
    status: string;
    providerReference: string | null;
    failureReason: string | null;
  };
  isFinanceManager?: boolean;
  retrying?: boolean;
  onRetryDisbursement?: () => void;
}

function mapPaymentStatus(status: string): 'completed' | 'pending' | 'failed' | 'disabled' {
  switch (status) {
    case 'SUCCESS': return 'completed';
    case 'PENDING':
    case 'PROCESSING': return 'pending';
    case 'FAILED': return 'failed';
    default: return 'disabled';
  }
}

function statusToBadgeColor(
  status: 'completed' | 'pending' | 'failed' | 'disabled',
): 'green' | 'orange' | 'red' | 'gray' {
  switch (status) {
    case 'completed':
      return 'green';
    case 'pending':
      return 'orange';
    case 'failed':
      return 'red';
    default:
      return 'gray';
  }
}

export function PaymentStatusPanel({ paymentTransaction, isFinanceManager, retrying, onRetryDisbursement }: PaymentStatusPanelProps) {
  const { provider, status, providerReference, failureReason } = paymentTransaction;
  const mappedStatus = mapPaymentStatus(status);

  return (
    <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-label-sm font-semibold text-text-strong-950'>
          Payment Status
        </h3>
        <Badge.Root variant='lighter' color={statusToBadgeColor(mappedStatus)} size='medium'>
          <Badge.Dot />
          {status.replace('_', ' ')}
        </Badge.Root>
      </div>

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='text-paragraph-xs text-text-sub-600'>Provider</span>
          <span className='text-paragraph-xs font-medium text-text-strong-950'>{provider}</span>
        </div>

        {providerReference && (
          <div className='flex items-center justify-between'>
            <span className='text-paragraph-xs text-text-sub-600'>Reference</span>
            <span className='text-paragraph-xs font-mono text-text-strong-950'>{providerReference}</span>
          </div>
        )}
      </div>

      {/* Failure reason */}
      {status === 'FAILED' && failureReason && (
        <div className='mt-4 rounded-lg bg-error-lighter p-3'>
          <p className='text-paragraph-xs text-error-base'>
            <span className='font-medium'>Payment failed:</span> {failureReason}
          </p>
        </div>
      )}

      {/* Retry button for finance managers */}
      {status === 'FAILED' && isFinanceManager && onRetryDisbursement && (
        <div className='mt-4 border-t border-stroke-soft-200 pt-4'>
          <FancyButton.Root variant='primary' size='small' onClick={onRetryDisbursement} disabled={retrying}>
            <FancyButton.Icon as={RiRefreshLine} />
            {retrying ? 'Retrying...' : 'Retry Disbursement'}
          </FancyButton.Root>
        </div>
      )}
    </div>
  );
}
