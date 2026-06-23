import * as React from 'react';
import { RiTeamLine, RiAddLine, RiSearch2Line, RiFilter3Fill, RiShareForwardBoxFill } from '@remixicon/react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAtomValue } from 'jotai';

import Header from '@/components/header';
import * as Divider from '@/components/ui/divider';
import * as FancyButton from '@/components/ui/fancy-button';
import * as Input from '@/components/ui/input';
import * as Select from '@/components/ui/select';
import * as Button from '@/components/ui/button';
import { useToast } from '@/components/ui/toaster';
import { useModalParams } from '@/hooks/use-modal-params';
import { currentOrganizationAtom } from '@/store/auth.store';

import { UsersTable, type User } from '@/routes/_main/users/-components/users-table';
import { InviteUserModal } from '@/routes/_main/users/-components/invite-user-modal';
import { ConfirmDeactivateModal } from '@/routes/_main/users/-components/confirm-deactivate-modal';

import {
  GET_USERS_QUERY,
  GET_ROLES_QUERY,
  CREATE_USER_MUTATION,
  UPDATE_USER_MUTATION,
  TOGGLE_USER_STATUS_MUTATION,
  ASSIGN_ROLE_MUTATION,
} from '@/graphql/users.graphql';
import { GET_DEPARTMENTS_QUERY } from '@/graphql/departments.graphql';

export function UsersPage() {
  const { toast } = useToast();
  const { activeModal, modalId, openModal, closeModal } = useModalParams();
  const currentOrganization = useAtomValue(currentOrganizationAtom);
  const orgId = currentOrganization?.id;

  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery(GET_USERS_QUERY, {
    variables: { organizationId: orgId },
    skip: !orgId,
  });

  const { data: rolesData } = useQuery(GET_ROLES_QUERY, {
    variables: { organizationId: orgId },
    skip: !orgId,
  });

  const { data: departmentsData } = useQuery(GET_DEPARTMENTS_QUERY, {
    variables: { organizationId: orgId },
    skip: !orgId,
  });

  const [createUser] = useMutation(CREATE_USER_MUTATION);
  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
  const [toggleUserStatus] = useMutation(TOGGLE_USER_STATUS_MUTATION);
  const [assignRole] = useMutation(ASSIGN_ROLE_MUTATION);

  const rawUsers: any[] = (usersData as any)?.users || [];
  const rawRoles: any[] = (rolesData as any)?.roles || [];
  const rawDepts: any[] = (departmentsData as any)?.departments || [];

  const users: User[] = React.useMemo(() => {
    return rawUsers.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      roles: u.roles,
      department: u.department ? { id: u.department.id, name: u.department.name } : null,
      status: u.status,
      lastActive: u.lastActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }, [rawUsers]);

  const roles = React.useMemo(() => {
    return rawRoles.map((r: any) => ({ id: r.id, name: r.name }));
  }, [rawRoles]);

  const departments = React.useMemo(() => {
    return rawDepts.map((d: any) => ({ id: d.id, name: d.name }));
  }, [rawDepts]);

  const editingUser = activeModal === 'edit-user' && modalId
    ? users.find((u) => u.id === modalId) ?? null
    : null;
  const deactivatingUser = activeModal === 'deactivate-user' && modalId
    ? users.find((u) => u.id === modalId) ?? null
    : null;

  const handleEdit = (user: User) => {
    openModal('edit-user', user.id);
  };

  const handleCreate = () => {
    openModal('invite-user');
  };

  const handleInviteSubmit = async (data: { name: string; email: string; roleId: string; departmentId?: string | null }) => {
    try {
      const { data: createResult } = await createUser({
        variables: {
          input: {
            organizationId: orgId,
            name: data.name,
            email: data.email,
            password: 'TemporaryPass123!',
            departmentId: data.departmentId || null,
          },
        },
      });
      const newUserId = (createResult as any)?.createUser?.id;
      if (data.roleId && newUserId) {
        await assignRole({
          variables: {
            input: { userId: newUserId, roleId: data.roleId },
          },
        });
      }
      toast({ title: 'Success', description: 'User invited successfully.', status: 'success' });
      closeModal();
      refetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to invite user.', status: 'error' });
    }
  };

  const handleEditSubmit = async (data: { name: string; email: string; roleId: string; departmentId?: string | null }) => {
    if (!modalId) return;
    try {
      await updateUser({
        variables: {
          id: modalId,
          input: { name: data.name, departmentId: data.departmentId || null },
        },
      });
      if (data.roleId) {
        await assignRole({
          variables: { input: { userId: modalId, roleId: data.roleId } },
        });
      }
      toast({ title: 'Success', description: 'User updated successfully.', status: 'success' });
      closeModal();
      refetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update user.', status: 'error' });
    }
  };

  const handleDeactivate = async (userId: string) => {
    try {
      const user = users.find((u) => u.id === userId);
      const newStatus = user?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await toggleUserStatus({ variables: { id: userId, status: newStatus } });
      toast({ title: 'Success', description: `User ${newStatus === 'ACTIVE' ? 'reactivated' : 'deactivated'} successfully.`, status: 'success' });
      closeModal();
      refetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update user status.', status: 'error' });
      throw err;
    }
  };

  const handleReactivate = async (user: User) => {
    try {
      await toggleUserStatus({ variables: { id: user.id, status: 'ACTIVE' } });
      toast({ title: 'Success', description: `${user.name} has been reactivated.`, status: 'success' });
      refetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to reactivate user.', status: 'error' });
    }
  };

  const handleResendInvite = async (user: User) => {
    toast({ title: 'Invite Resent', description: `A new invite has been sent to ${user.email}.`, status: 'success' });
  };

  return (
    <>
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiTeamLine className='size-6 text-text-sub-600' />
          </div>
        }
        title='Users'
        description='Manage organization members and roles.'
      >
        <FancyButton.Root onClick={handleCreate} variant='primary'>
          <FancyButton.Icon as={RiAddLine} />
          Invite User
        </FancyButton.Root>
      </Header>

      <div className='px-4 lg:px-8'>
        <Divider.Root />
      </div>

      <div className='flex flex-1 flex-col gap-4 px-4 pb-6 pt-8 lg:px-8'>
        {/* Toolbar */}
        <div className='flex flex-col justify-between gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3'>
          <Input.Root size='small' className='w-[300px]'>
            <Input.Wrapper>
              <Input.Icon as={RiSearch2Line} />
              <Input.Input placeholder='Search users…' />
            </Input.Wrapper>
          </Input.Root>

          <div className='flex flex-wrap gap-3 min-[560px]:flex-nowrap'>
            <Select.Root size='small' defaultValue='all'>
              <Select.Trigger className='w-auto flex-1 min-[560px]:flex-none'>
                <Select.Value placeholder='All Status' />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='all'>All Status</Select.Item>
                <Select.Item value='ACTIVE'>Active</Select.Item>
                <Select.Item value='PENDING'>Pending</Select.Item>
                <Select.Item value='INACTIVE'>Inactive</Select.Item>
              </Select.Content>
            </Select.Root>

            <Button.Root variant='neutral' mode='stroke' size='small' className='flex-1 min-[560px]:flex-none'>
              <Button.Icon as={RiFilter3Fill} />
              Filter
            </Button.Root>

            <Button.Root variant='neutral' mode='stroke' size='small' className='flex-1 min-[560px]:flex-none'>
              <Button.Icon as={RiShareForwardBoxFill} />
              Export
            </Button.Root>
          </div>
        </div>

        {/* Table */}
        <UsersTable
          data={users}
          isLoading={usersLoading}
          onEdit={handleEdit}
          onDeactivate={(user) => openModal('deactivate-user', user.id)}
          onReactivate={handleReactivate}
          onResendInvite={handleResendInvite}
        />
      </div>

      <InviteUserModal
        user={editingUser}
        isOpen={activeModal === 'invite-user' || activeModal === 'edit-user'}
        onClose={closeModal}
        onSubmit={editingUser ? handleEditSubmit : handleInviteSubmit}
        departments={departments}
        roles={roles}
      />

      <ConfirmDeactivateModal
        user={deactivatingUser}
        isOpen={activeModal === 'deactivate-user'}
        onClose={closeModal}
        onConfirm={handleDeactivate}
      />
    </>
  );
}
