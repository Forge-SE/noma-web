import * as React from 'react';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as FancyButton from '@/components/ui/fancy-button';
import type { User } from './users-table';

interface DepartmentOption {
  id: string;
  name: string;
}

interface RoleOption {
  id: string;
  name: string;
}

interface InviteUserModalProps {
  user?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    roleId: string;
    departmentId?: string | null;
  }) => Promise<void>;
  departments: DepartmentOption[];
  roles: RoleOption[];
}

export function InviteUserModal({ user, isOpen, onClose, onSubmit, departments, roles }: InviteUserModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const isEditing = !!user;

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [roleId, setRoleId] = React.useState('');
  const [departmentId, setDepartmentId] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setRoleId('');
        setDepartmentId(user.department?.id || '');
      } else {
        setName('');
        setEmail('');
        setRoleId('');
        setDepartmentId('');
      }
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({
        name,
        email,
        roleId,
        departmentId: departmentId || null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className="max-w-[440px]">
        <Modal.Header
          title={isEditing ? 'Edit User' : 'Invite User'}
          description={isEditing ? 'Update user details.' : 'Invite a new member.'}
        />
        <form onSubmit={handleSubmit}>
          <Modal.Body className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label.Root>Full Name</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div className="flex flex-col gap-1">
              <Label.Root>Email Address</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    disabled={isEditing}
                    required
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div className="flex flex-col gap-1">
              <Label.Root>Role</Label.Root>
              <Select.Root value={roleId} onValueChange={setRoleId} required>
                <Select.Trigger>
                  <Select.Value placeholder="Select a role…" />
                </Select.Trigger>
                <Select.Content>
                  {roles.map((r) => (
                    <Select.Item key={r.id} value={r.id}>
                      {r.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>

            <div className="flex flex-col gap-1">
              <Label.Root>Department (Optional)</Label.Root>
              <Select.Root value={departmentId} onValueChange={setDepartmentId}>
                <Select.Trigger>
                  <Select.Value placeholder="None" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="">None</Select.Item>
                  {departments.map((d) => (
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
                  : 'Send Invite'}
            </FancyButton.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
