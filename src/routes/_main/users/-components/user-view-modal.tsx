import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { RiTeamLine } from '@remixicon/react';

import * as Modal from '@/components/ui/modal';
import * as Badge from '@/components/ui/badge';
import * as Divider from '@/components/ui/divider';
import * as FancyButton from '@/components/ui/fancy-button';
import { type User } from './users-table';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-paragraph-sm text-text-soft-400 shrink-0 w-[120px]">{label}</span>
      <div className="flex-1 text-right">{children}</div>
    </div>
  );
}

interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onEdit: (user: User) => void;
}

export function UserViewModal({ isOpen, onClose, user, onEdit }: UserViewModalProps) {
  const isActive = user?.status === 'ACTIVE';
  const isPending = user?.status === 'PENDING' || user?.status === 'INVITED';

  const statusColor = isActive ? 'green' as const : isPending ? 'orange' as const : 'gray' as const;

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className="max-w-[480px]">
        <Modal.Header
          icon={RiTeamLine}
          title={user?.name || ''}
          description="User details"
        />
        <Modal.Body className="p-0">
          <div className="px-5 py-3">
            <DetailRow label="Name">
              <span className="text-paragraph-sm text-text-strong-950">
                {user?.name || '—'}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Email">
              <span className="text-paragraph-sm text-text-strong-950">
                {user?.email || '—'}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Roles">
              <div className="flex flex-wrap gap-1 justify-end">
                {user?.roles?.length ? (
                  user.roles.map((role: string) => (
                    <Badge.Root key={role} variant="stroke" color="gray">
                      {role}
                    </Badge.Root>
                  ))
                ) : (
                  <span className="text-paragraph-sm text-text-sub-600">—</span>
                )}
              </div>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Department">
              <span className="text-paragraph-sm text-text-strong-950">
                {user?.department?.name || '—'}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Status">
              <Badge.Root variant="stroke" color={statusColor}>
                {user?.status || '—'}
              </Badge.Root>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Last Active">
              <span className="text-paragraph-sm text-text-strong-950">
                {user?.lastActive
                  ? formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })
                  : 'Never'}
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
              if (user) onEdit(user);
            }}
          >
            Edit User
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
