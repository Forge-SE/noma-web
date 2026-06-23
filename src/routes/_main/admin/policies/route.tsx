import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import {
  RiShieldCheckLine,
  RiAddLine,
  RiSearch2Line,
  RiFilter3Fill,
  RiShareForwardBoxFill,
} from '@remixicon/react';

import * as Button from '@/components/ui/button';
import * as FancyButton from '@/components/ui/fancy-button';
import * as Input from '@/components/ui/input';
import * as Select from '@/components/ui/select';
import * as Divider from '@/components/ui/divider';
import Header from '@/components/header';
import { useToast } from '@/components/ui/toaster';
import { useModalParams } from '@/hooks/use-modal-params';
import { currentOrganizationAtom } from '@/store/auth.store';

import { GET_POLICIES_QUERY, DELETE_POLICY_MUTATION } from '@/graphql/policies.graphql';
import { PolicyFormModal } from './-components/policy-form-modal';
import { PoliciesTable } from './-components/policies-table';

export const Route = createFileRoute('/_main/admin/policies')({
  component: PoliciesPage,
});

function PoliciesPage() {
  const currentOrganization = useAtomValue(currentOrganizationAtom);
  const { toast } = useToast();
  const { activeModal, modalId, openModal, closeModal } = useModalParams();

  const { data, loading, refetch } = useQuery(GET_POLICIES_QUERY, {
    variables: { organizationId: currentOrganization?.id },
    skip: !currentOrganization?.id,
  });

  const [deletePolicy] = useMutation(DELETE_POLICY_MUTATION);

  const policies = (data as any)?.policies || [];

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    try {
      await deletePolicy({
        variables: { id },
        refetchQueries: [
          { query: GET_POLICIES_QUERY, variables: { organizationId: currentOrganization?.id } }
        ],
      });
      toast({ title: 'Success', description: 'Policy deleted successfully.', status: 'success' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  const editingPolicy = activeModal === 'edit-policy' && modalId
    ? policies.find((p: any) => p.id === modalId) ?? null
    : null;

  const handleEdit = (policy: any) => {
    openModal('edit-policy', policy.id);
  };

  const handleCreate = () => {
    openModal('create-policy');
  };

  return (
    <>
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiShieldCheckLine className='size-6 text-text-sub-600' />
          </div>
        }
        title='Policies'
        description='Configure policies to automate workflows and manage approvals.'
      >
        <FancyButton.Root onClick={handleCreate} variant='primary'>
          <FancyButton.Icon as={RiAddLine} />
          Create Policy
        </FancyButton.Root>
      </Header>

      <div className='px-4 lg:px-8'>
        <Divider.Root />
      </div>

      <div className='flex flex-1 flex-col gap-4 px-4 pb-6 pt-8 lg:px-8'>
        {/* Toolbar: search + status filter + filter button */}
        <div className='flex flex-col justify-between gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3'>
          <Input.Root size='small' className='w-[300px]'>
            <Input.Wrapper>
              <Input.Icon as={RiSearch2Line} />
              <Input.Input placeholder='Search policies...' />
            </Input.Wrapper>
          </Input.Root>

          <div className='flex flex-wrap gap-3 min-[560px]:flex-nowrap'>
            <Select.Root size='small' defaultValue='all'>
              <Select.Trigger className='w-auto flex-1 min-[560px]:flex-none'>
                <Select.Value placeholder='All Status' />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='all'>All Status</Select.Item>
                <Select.Item value='enabled'>Enabled</Select.Item>
                <Select.Item value='disabled'>Disabled</Select.Item>
              </Select.Content>
            </Select.Root>

            <Button.Root
              variant='neutral'
              mode='stroke'
              size='small'
              className='flex-1 min-[560px]:flex-none'
            >
              <Button.Icon as={RiFilter3Fill} />
              Filter
            </Button.Root>

            <Button.Root
              variant='neutral'
              mode='stroke'
              size='small'
              className='flex-1 min-[560px]:flex-none'
            >
              <Button.Icon as={RiShareForwardBoxFill} />
              Export
            </Button.Root>
          </div>
        </div>

        {/* Table */}
        <PoliciesTable
          data={policies}
          isLoading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />
      </div>

      <PolicyFormModal
        isOpen={activeModal === 'create-policy' || activeModal === 'edit-policy'}
        onClose={closeModal}
        initialData={editingPolicy}
        onSuccess={() => {
          closeModal();
          refetch();
        }}
      />
    </>
  );
}
