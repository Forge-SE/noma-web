import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import { RiGitBranchLine, RiAddLine, RiSearch2Line, RiDownloadLine } from '@remixicon/react';

import * as FancyButton from '@/components/ui/fancy-button';
import * as Input from '@/components/ui/input';
import * as Divider from '@/components/ui/divider';
import Header from '@/components/header';
import { useToast } from '@/components/ui/toaster';
import { useModalParams } from '@/hooks/use-modal-params';
import { currentOrganizationAtom } from '@/store/auth.store';

import { GET_WORKFLOW_TEMPLATES_QUERY } from '@/graphql/workflows.graphql';
import { WorkflowsTable } from './-components/workflows-table';
import { WorkflowFormModal } from './-components/workflow-form-modal';
import { WorkflowViewModal } from './-components/workflow-view-modal';

export const Route = createFileRoute('/_main/admin/workflows')({
  component: WorkflowsPage,
});

function WorkflowsPage() {
  const currentOrganization = useAtomValue(currentOrganizationAtom);
  const { toast } = useToast();
  const { activeModal, modalId, openModal, closeModal } = useModalParams();
  
  const [search, setSearch] = React.useState('');

  const { data, loading, error, refetch } = useQuery(GET_WORKFLOW_TEMPLATES_QUERY, {
    variables: { organizationId: currentOrganization?.id },
    skip: !currentOrganization?.id,
  });

  if (error) {
    toast({ title: 'Error', description: 'Failed to load workflows', status: 'error' });
  }

  const workflows = (data as any)?.workflowTemplates || [];
  
  const filteredWorkflows = (workflows as any[]).filter((w: any) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const viewingWorkflow = activeModal === 'view-workflow' && modalId
    ? workflows.find((w: any) => w.id === modalId) ?? null
    : null;

  const editingWorkflow = activeModal === 'edit-workflow' && modalId
    ? workflows.find((w: any) => w.id === modalId) ?? null
    : null;

  const handleView = (workflow: any) => {
    openModal('view-workflow', workflow.id);
  };

  const handleCreate = () => {
    openModal('create-workflow');
  };

  const handleEdit = (workflow: any) => {
    openModal('edit-workflow', workflow.id);
  };

  const handleModalSuccess = () => {
    closeModal();
    refetch();
  };

  return (
    <>
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiGitBranchLine className='size-6 text-text-sub-600' />
          </div>
        }
        title='Workflows'
        description='Design and manage custom approval workflows.'
      >
        <FancyButton.Root onClick={handleCreate} variant='primary'>
          <FancyButton.Icon as={RiAddLine} />
          Create Workflow
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
                placeholder='Search workflows...' 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Input.Wrapper>
          </Input.Root>

          <div className='flex items-center gap-3'>
            <FancyButton.Root variant='basic' size='small'>
              <FancyButton.Icon as={RiDownloadLine} />
              Export
            </FancyButton.Root>
          </div>
        </div>

        <WorkflowsTable 
          data={filteredWorkflows} 
          isLoading={loading} 
          onView={handleView}
          onEdit={handleEdit} 
          onCreate={handleCreate}
          onRefetch={refetch}
        />
      </div>

      <WorkflowViewModal
        isOpen={activeModal === 'view-workflow'}
        onClose={closeModal}
        workflow={viewingWorkflow}
        onEdit={handleEdit}
      />

      <WorkflowFormModal 
        isOpen={activeModal === 'create-workflow' || activeModal === 'edit-workflow'}
        onClose={closeModal}
        initialData={editingWorkflow}
        onSuccess={handleModalSuccess}
      />
    </>
  );
}
