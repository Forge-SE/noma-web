import * as React from 'react';
import { format } from 'date-fns';
import { RiOrganizationChart } from '@remixicon/react';

import * as Modal from '@/components/ui/modal';
import * as Divider from '@/components/ui/divider';
import * as FancyButton from '@/components/ui/fancy-button';
import { type Department } from './departments-table';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-paragraph-sm text-text-soft-400 shrink-0 w-[120px]">{label}</span>
      <div className="flex-1 text-right">{children}</div>
    </div>
  );
}

interface DepartmentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
  onEdit: (dept: Department) => void;
}

export function DepartmentViewModal({ isOpen, onClose, department, onEdit }: DepartmentViewModalProps) {
  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className="max-w-[480px]">
        <Modal.Header
          icon={RiOrganizationChart}
          title={department?.name || ''}
          description="Department details"
        />
        <Modal.Body className="p-0">
          <div className="px-5 py-3">
            <DetailRow label="Department Name">
              <span className="text-paragraph-sm text-text-strong-950">
                {department?.name || '—'}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Parent">
              <span className="text-paragraph-sm text-text-strong-950">
                {department?.parentDept?.name || 'None (Top Level)'}
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Members">
              <span className="text-paragraph-sm text-text-strong-950">
                {department?.memberCount ?? 0} members
              </span>
            </DetailRow>
            <Divider.Root />
            <DetailRow label="Created">
              <span className="text-paragraph-sm text-text-sub-600">
                {department?.createdAt
                  ? format(new Date(department.createdAt), 'MMM d, yyyy')
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
              if (department) onEdit(department);
            }}
          >
            Edit Department
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
