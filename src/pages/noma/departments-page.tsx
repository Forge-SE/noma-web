import * as React from 'react';
import { RiOrganizationChart, RiAddLine, RiSearch2Line } from '@remixicon/react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAtomValue } from 'jotai';

import Header from '@/components/header';
import * as Divider from '@/components/ui/divider';
import * as FancyButton from '@/components/ui/fancy-button';
import * as Input from '@/components/ui/input';
import { useToast } from '@/components/ui/toaster';
import { useModalParams } from '@/hooks/use-modal-params';
import { currentOrganizationAtom } from '@/store/auth.store';

import { DepartmentsTable, type Department } from '@/routes/_main/departments/-components/departments-table';
import { DepartmentFormModal } from '@/routes/_main/departments/-components/department-form-modal';
import { ConfirmDeleteModal } from '@/routes/_main/departments/-components/confirm-delete-modal';

import {
  GET_DEPARTMENTS_QUERY,
  CREATE_DEPARTMENT_MUTATION,
  UPDATE_DEPARTMENT_MUTATION,
  DELETE_DEPARTMENT_MUTATION,
} from '@/graphql/departments.graphql';

export function DepartmentsPage() {
  const { toast } = useToast();
  const { activeModal, modalId, openModal, closeModal } = useModalParams();
  const currentOrganization = useAtomValue(currentOrganizationAtom);
  const orgId = currentOrganization?.id;
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data, loading, refetch } = useQuery(GET_DEPARTMENTS_QUERY, {
    variables: { organizationId: orgId },
    skip: !orgId,
  });

  const [createDepartment] = useMutation(CREATE_DEPARTMENT_MUTATION);
  const [updateDepartment] = useMutation(UPDATE_DEPARTMENT_MUTATION);
  const [deleteDepartment] = useMutation(DELETE_DEPARTMENT_MUTATION);

  const rawDepts: any[] = (data as any)?.departments || [];

  const departments: Department[] = React.useMemo(() => {
    return rawDepts.map((d: any) => {
      const parent = rawDepts.find((p: any) => p.id === d.parentId);
      return {
        id: d.id,
        name: d.name,
        parentId: d.parentId,
        parentDept: parent ? { id: parent.id, name: parent.name } : null,
        createdAt: d.createdAt,
        memberCount: 0,
      };
    });
  }, [rawDepts]);

  const filteredDepartments = React.useMemo(() => {
    if (!searchQuery) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter(dept =>
      dept.name.toLowerCase().includes(q) ||
      (dept.parentDept?.name && dept.parentDept.name.toLowerCase().includes(q))
    );
  }, [departments, searchQuery]);

  const parentDepartmentOptions = React.useMemo(() => {
    return departments.map((d) => ({ id: d.id, name: d.name }));
  }, [departments]);

  const handleCreateSubmit = async (formData: { name: string; parentId?: string | null }) => {
    try {
      await createDepartment({
        variables: {
          input: {
            organizationId: orgId,
            name: formData.name,
            parentId: formData.parentId || null,
          },
        },
      });
      toast({ title: 'Success', description: 'Department created successfully.', status: 'success' });
      closeModal();
      refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create department.', status: 'error' });
    }
  };

  const handleEditSubmit = async (formData: { name: string; parentId?: string | null }) => {
    if (!modalId) return;
    try {
      await updateDepartment({
        variables: {
          id: modalId,
          name: formData.name,
          parentId: formData.parentId || null,
        },
      });
      toast({ title: 'Success', description: 'Department updated successfully.', status: 'success' });
      closeModal();
      refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update department.', status: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!modalId) return;
    try {
      await deleteDepartment({ variables: { id: modalId } });
      toast({ title: 'Success', description: 'Department deleted successfully.', status: 'success' });
      closeModal();
      refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete department.', status: 'error' });
      throw err;
    }
  };

  return (
    <>
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiOrganizationChart className='size-6 text-text-sub-600' />
          </div>
        }
        title='Departments'
        description='Manage departments and structure.'
      >
        <FancyButton.Root onClick={() => openModal('create-department')} variant='primary'>
          <FancyButton.Icon as={RiAddLine} />
          Add Department
        </FancyButton.Root>
      </Header>

      <div className='px-4 lg:px-8'>
        <Divider.Root />
      </div>

      <div className='flex flex-1 flex-col gap-4 px-4 pb-6 pt-8 lg:px-8'>
        <div className='flex flex-col justify-between gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3'>
          <Input.Root size='small' className='w-[300px]'>
            <Input.Wrapper>
              <Input.Icon as={RiSearch2Line} />
              <Input.Input
                placeholder='Search departments…'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <DepartmentsTable
          data={filteredDepartments}
          isLoading={loading}
          onRefresh={refetch}
          onEdit={(dept) => openModal('edit-department', dept.id)}
          onDelete={(dept) => openModal('delete-department', dept.id)}
        />
      </div>

      <DepartmentFormModal
        department={null}
        isOpen={activeModal === 'create-department'}
        onClose={closeModal}
        onSubmit={handleCreateSubmit}
        parentDepartments={parentDepartmentOptions}
      />

      <DepartmentFormModal
        department={departments.find((d) => d.id === modalId) ?? null}
        isOpen={activeModal === 'edit-department'}
        onClose={closeModal}
        onSubmit={handleEditSubmit}
        parentDepartments={parentDepartmentOptions}
      />

      <ConfirmDeleteModal
        department={departments.find((d) => d.id === modalId) ?? null}
        isOpen={activeModal === 'delete-department'}
        onClose={closeModal}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
