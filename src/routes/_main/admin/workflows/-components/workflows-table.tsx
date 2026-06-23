import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/toaster';
import * as Table from '@/components/ui/table';
import * as Button from '@/components/ui/button';
import * as FancyButton from '@/components/ui/fancy-button';
import { Loader } from '@/components/ui/loader';
import { RiEdit2Line, RiDeleteBinLine, RiGitBranchLine, RiAddLine } from '@remixicon/react';
import { DELETE_WORKFLOW_TEMPLATE_MUTATION } from '@/graphql/workflows.graphql';

interface WorkflowsTableProps {
  data: any[];
  isLoading: boolean;
  onEdit: (workflow: any) => void;
  onCreate: () => void;
  onRefetch: () => void;
}

export function WorkflowsTable({ data, isLoading, onEdit, onCreate, onRefetch }: WorkflowsTableProps) {
  const { toast } = useToast();
  const [deleteTemplate] = useMutation(DELETE_WORKFLOW_TEMPLATE_MUTATION);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        await deleteTemplate({ variables: { id } });
        toast({ title: 'Success', description: 'Workflow deleted successfully.', status: 'success' });
        onRefetch();
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, status: 'error' });
      }
    }
  };

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Steps',
      accessorKey: 'steps',
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
    },
    {
      header: '',
      accessorKey: 'actions',
    },
  ];

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          {columns.map((col) => (
            <Table.Head key={col.accessorKey}>{col.header}</Table.Head>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {isLoading ? (
          <Table.Row>
            <Table.Cell colSpan={columns.length} className="h-48">
              <Loader />
            </Table.Cell>
          </Table.Row>
        ) : data.length > 0 ? (
          data.map((workflow) => (
            <Table.Row key={workflow.id} onClick={() => onEdit(workflow)} className="cursor-pointer">
              <Table.Cell>
                <span className="text-label-sm text-text-strong-950">{workflow.name}</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-paragraph-sm text-text-sub-600">
                  {workflow.steps?.length || 0} {workflow.steps?.length === 1 ? 'step' : 'steps'}
                </span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-paragraph-sm text-text-sub-600">
                  {format(new Date(workflow.createdAt), 'MMM d, yyyy')}
                </span>
              </Table.Cell>
              <Table.Cell>
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <FancyButton.Root variant="basic" size="small" onClick={() => onEdit(workflow)}>
                    <FancyButton.Icon as={RiEdit2Line} />
                  </FancyButton.Root>
                  <FancyButton.Root variant="basic" size="small" onClick={() => handleDelete(workflow.id)}>
                    <FancyButton.Icon as={RiDeleteBinLine} className="text-text-error-600" />
                  </FancyButton.Root>
                </div>
              </Table.Cell>
            </Table.Row>
          ))
        ) : (
          <Table.Row>
            <Table.Cell colSpan={columns.length} className="h-[500px]">
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
                  <RiGitBranchLine className="size-6 text-text-sub-600" />
                </div>
                <div>
                  <p className="text-label-md text-text-strong-950">No workflows found</p>
                  <p className="text-paragraph-sm text-text-sub-600 mt-1">Get started by creating a new approval workflow.</p>
                </div>
                <Button.Root 
                  variant="neutral" 
                  mode="stroke"
                  onClick={onCreate}
                  className="ring-1 ring-inset ring-stroke-soft-200 hover:ring-stroke-soft-200"
                >
                  <Button.Icon as={RiAddLine} />
                  Create Workflow
                </Button.Root>
              </div>
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
  );
}
