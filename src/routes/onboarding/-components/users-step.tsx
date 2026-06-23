import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { RiAddLine, RiCloseLine } from '@remixicon/react';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as FancyButton from '@/components/ui/fancy-button';
import { useToast } from '@/components/ui/toaster';
import * as Select from '@/components/ui/select';
import { CREATE_USER_MUTATION, ASSIGN_ROLE_MUTATION, GET_ROLES_QUERY } from '@/graphql/onboarding.graphql';
import type { CurrentOrganization } from '@/store/auth.store';

export function UsersStep({ org, onNext, onBack }: { org: CurrentOrganization | null; onNext: () => void; onBack: () => void }) {
  const [users, setUsers] = React.useState([{ email: '', name: '', roleId: '' }]);
  const { data: rolesData, loading: rolesLoading } = useQuery(GET_ROLES_QUERY, {
    variables: { organizationId: org?.id },
    skip: !org,
  });

  const [createUser, { loading: creatingUser }] = useMutation(CREATE_USER_MUTATION);
  const [assignRole, { loading: assigningRole }] = useMutation(ASSIGN_ROLE_MUTATION);
  const { toast } = useToast();

  const handleAdd = () => setUsers([...users, { email: '', name: '', roleId: '' }]);
  const handleRemove = (index: number) => setUsers(users.filter((_, i) => i !== index));
  const handleChange = (index: number, field: keyof typeof users[0], val: string) => {
    const newUsers = [...users];
    newUsers[index][field] = val;
    setUsers(newUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;

    const validUsers = users.filter((u) => u.email.trim() && u.name.trim() && u.roleId);
    if (validUsers.length === 0) {
      onNext();
      return;
    }

    try {
      for (const u of validUsers) {
        // We assume users are added directly for now
        const res = await createUser({
          variables: {
            input: {
              organizationId: org.id,
              email: u.email,
              name: u.name,
              password: 'temporaryPassword123!', // Required by schema, should be auto-generated in real app
            },
          },
        });
        const createdUserId = res.data?.createUser?.id;
        if (createdUserId) {
          await assignRole({ variables: { input: { userId: createdUserId, roleId: u.roleId } } });
        }
      }
      onNext();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  const roles = rolesData?.roles || [];
  const loading = creatingUser || assigningRole;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="text-title-h6">Invite Team Members</h2>
        <p className="text-paragraph-sm text-text-sub-600">Add users to your organization and assign their roles.</p>
      </div>

      <div className="flex flex-col gap-6">
        {users.map((user, index) => (
          <div key={index} className="flex flex-col md:flex-row items-end gap-3 rounded-xl border border-stroke-soft-200 p-4 relative bg-bg-white-0">
            {users.length > 1 && (
              <button type="button" onClick={() => handleRemove(index)} className="absolute top-2 right-2 text-text-sub-600 hover:text-error-base p-1">
                <RiCloseLine className="size-4" />
              </button>
            )}
            <div className="flex-1 w-full flex flex-col gap-1">
              <Label.Root>Name</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input placeholder="John Doe" value={user.name} onChange={(e) => handleChange(index, 'name', e.target.value)} />
                </Input.Wrapper>
              </Input.Root>
            </div>
            <div className="flex-1 w-full flex flex-col gap-1">
              <Label.Root>Email</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input type="email" placeholder="john@example.com" value={user.email} onChange={(e) => handleChange(index, 'email', e.target.value)} />
                </Input.Wrapper>
              </Input.Root>
            </div>
            <div className="flex-1 w-full flex flex-col gap-1">
              <Label.Root>Role</Label.Root>
              <Select.Root value={user.roleId} onValueChange={(val) => handleChange(index, 'roleId', val)}>
                <Select.Trigger className="w-full">
                  <Select.Value placeholder={rolesLoading ? "Loading..." : "Select role"} />
                </Select.Trigger>
                <Select.Content>
                  {roles.map((r: any) => (
                    <Select.Item key={r.id} value={r.id}>{r.name}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 text-primary-base text-label-sm hover:underline self-start"
        >
          <RiAddLine className="size-4" /> Add another user
        </button>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button type="button" onClick={onBack} className="text-label-sm text-text-sub-600 hover:text-text-strong-950">
          Back
        </button>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onNext} className="text-label-sm text-text-sub-600 hover:text-text-strong-950">
            Skip for now
          </button>
          <FancyButton.Root type="submit" variant="primary" disabled={loading}>
            {loading ? 'Inviting...' : 'Continue'}
          </FancyButton.Root>
        </div>
      </div>
    </form>
  );
}
