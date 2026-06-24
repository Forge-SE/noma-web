import * as React from 'react';
import { format } from 'date-fns';
import { RiWalletLine } from '@remixicon/react';

import * as Modal from '@/components/ui/modal';
import * as Badge from '@/components/ui/badge';
import * as Divider from '@/components/ui/divider';
import * as FancyButton from '@/components/ui/fancy-button';
import { formatMoney } from '@/utils/currency';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-4 py-3'>
      <span className='w-[120px] shrink-0 text-paragraph-sm text-text-soft-400'>{label}</span>
      <div className='flex-1 text-right'>{children}</div>
    </div>
  );
}

function getWalletStatusColor(status: string): 'green' | 'orange' | 'red' | 'gray' {
  switch (status) {
    case 'ACTIVE': return 'green';
    case 'FROZEN': return 'red';
    case 'CLOSED': return 'gray';
    default: return 'gray';
  }
}

function getOwnerLabel(type: string, departmentId: string | null): string {
  if (type === 'MASTER') return 'Organization';
  if (type === 'DEPARTMENT' && departmentId) return `Dept. ${departmentId.slice(0, 8)}`;
  if (type === 'EMPLOYEE') return 'Employee';
  return '—';
}

interface WalletViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: any;
}

export function WalletViewModal({ isOpen, onClose, wallet }: WalletViewModalProps) {
  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className='max-w-[480px]'>
        <Modal.Header
          icon={RiWalletLine}
          title={wallet?.name || ''}
          description='Wallet details and information.'
        />
        <Modal.Body className='p-0'>
          <div className='px-5 py-3'>
            <DetailRow label='Type'>
              <span className='text-paragraph-sm text-text-strong-950'>{wallet?.type}</span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label='Owner'>
              <span className='text-paragraph-sm text-text-strong-950'>
                {getOwnerLabel(wallet?.type, wallet?.departmentId)}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label='Balance'>
              <span className='text-paragraph-sm font-medium text-text-strong-950'>
                {formatMoney(wallet?.balance || 0, 'GHS')}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label='Status'>
              <Badge.Root variant='lighter' color={getWalletStatusColor(wallet?.status)} size='medium'>
                {wallet?.status}
              </Badge.Root>
            </DetailRow>
            <Divider.Root />
            <DetailRow label='Currency'>
              <span className='text-paragraph-sm text-text-strong-950'>GHS</span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label='Created'>
              <span className='text-paragraph-sm text-text-sub-600'>
                {wallet?.createdAt ? format(new Date(wallet.createdAt), 'MMM d, yyyy') : '—'}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label='Wallet ID'>
              <span className='text-paragraph-sm font-mono text-text-sub-600'>
                {wallet?.id?.slice(0, 16)}...
              </span>
            </DetailRow>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <FancyButton.Root type='button' variant='basic' onClick={onClose}>
            Close
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
