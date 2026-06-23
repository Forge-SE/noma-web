import * as React from 'react';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as FancyButton from '@/components/ui/fancy-button';
import { Department } from './departments-table';

interface DepartmentOption {
  id: string;
  name: string;
}

interface DepartmentFormModalProps {
  department?: Department | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; parentId?: string | null }) => Promise<void>;
  parentDepartments: DepartmentOption[];
}

export function DepartmentFormModal({ department, isOpen, onClose, onSubmit, parentDepartments }: DepartmentFormModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditing = !!department;

  const [name, setName] = React.useState('');
  const [parentDeptId, setParentDeptId] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (department) {
        setName(department.name);
        setParentDeptId(department.parentDept?.id || '');
      } else {
        setName('');
        setParentDeptId('');
      }
    }
  }, [isOpen, department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({ name, parentId: parentDeptId || null });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <Modal.Content className="max-w-[440px]">
        <Modal.Header
          title={isEditing ? 'Edit Department' : 'Add Department'}
          description={isEditing ? 'Update department details.' : 'Create a new department.'}
        />
        
        <form onSubmit={handleSubmit}>
          <Modal.Body className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label.Root>Department Name</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input 
                    type="text" 
                    placeholder="e.g. Engineering" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div className="flex flex-col gap-1">
              <Label.Root>Parent Department (Optional)</Label.Root>
              <Select.Root value={parentDeptId} onValueChange={setParentDeptId}>
                <Select.Trigger>
                  <Select.Value placeholder="None (Top Level)" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="">None (Top Level)</Select.Item>
                  {parentDepartments.map((d) => (
                    <Select.Item key={d.id} value={d.id}>
                      {d.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <FancyButton.Root type="button" variant="basic" onClick={onClose} disabled={isLoading}>
              Cancel
            </FancyButton.Root>
            <FancyButton.Root type="submit" variant="primary" disabled={isLoading}>
              {isLoading 
                ? 'Saving…' 
                : isEditing 
                  ? 'Save Changes' 
                  : 'Create Department'}
            </FancyButton.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
