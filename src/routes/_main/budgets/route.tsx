import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import {
  RiFundsLine,
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

import { GET_BUDGETS_QUERY, DELETE_BUDGET_MUTATION } from '@/graphql/budgets.graphql';
import { BudgetsTable } from './-components/budgets-table';
import { BudgetFormModal } from './-components/budget-form-modal';

export const Route = createFileRoute('/_main/budgets')({
  component: BudgetsPage,
});

function BudgetsPage() {
  const currentOrganization = useAtomValue(currentOrganizationAtom);
  const { toast } = useToast();
  const { activeModal, modalId, openModal, closeModal } = useModalParams();

  const { data, loading, refetch } = useQuery(GET_BUDGETS_QUERY, {
    variables: { organizationId: currentOrganization?.id },
    skip: !currentOrganization?.id,
  });

  const [deleteBudget] = useMutation(DELETE_BUDGET_MUTATION);

  const budgets = (data as any)?.budgets || [];

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      await deleteBudget({
        variables: { id },
        refetchQueries: [
          { query: GET_BUDGETS_QUERY, variables: { organizationId: currentOrganization?.id } }
        ],
      });
      toast({ title: 'Success', description: 'Budget deleted successfully.', status: 'success' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  const editingBudget = activeModal === 'edit-budget' && modalId
    ? budgets.find((b: any) => b.id === modalId) ?? null
    : null;

  const handleEdit = (budget: any) => {
    openModal('edit-budget', budget.id);
  };

  const handleCreate = () => {
    openModal('create-budget');
  };

  return (
    <>
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiFundsLine className='size-6 text-text-sub-600' />
          </div>
        }
        title='Budgets'
        description='Create and manage departmental budgets.'
      >
        <FancyButton.Root onClick={handleCreate} variant='primary'>
          <FancyButton.Icon as={RiAddLine} />
          Create Budget
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
              <Input.Input placeholder='Search budgets...' />
            </Input.Wrapper>
          </Input.Root>

          <div className='flex flex-wrap gap-3 min-[560px]:flex-nowrap'>
            <Select.Root size='small' defaultValue='all'>
              <Select.Trigger className='w-auto flex-1 min-[560px]:flex-none'>
                <Select.Value placeholder='All Periods' />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='all'>All Periods</Select.Item>
                <Select.Item value='WEEKLY'>Weekly</Select.Item>
                <Select.Item value='MONTHLY'>Monthly</Select.Item>
                <Select.Item value='QUARTERLY'>Quarterly</Select.Item>
                <Select.Item value='YEARLY'>Yearly</Select.Item>
                <Select.Item value='CUSTOM'>Custom</Select.Item>
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

        <BudgetsTable
          data={budgets}
          isLoading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />
      </div>

      <BudgetFormModal
        isOpen={activeModal === 'create-budget' || activeModal === 'edit-budget'}
        onClose={closeModal}
        initialData={editingBudget}
        onSuccess={() => {
          closeModal();
          refetch();
        }}
      />
    </>
  );
}
