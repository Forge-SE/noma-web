import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import { useToast } from '@/components/ui/toaster';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as FancyButton from '@/components/ui/fancy-button';
import { currentOrganizationAtom } from '@/store/auth.store';

import { 
  CREATE_WORKFLOW_TEMPLATE_MUTATION, 
  UPDATE_WORKFLOW_TEMPLATE_MUTATION,
  SAVE_WORKFLOW_STEPS_MUTATION
} from '@/graphql/workflows.graphql';

import { WorkflowStepBuilder, type WorkflowStepData } from './workflow-step-builder';

interface WorkflowFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: any | null;
  onSuccess: () => void;
}

export function WorkflowFormModal({ isOpen, onClose, initialData, onSuccess }: WorkflowFormModalProps) {
  const currentOrganization = useAtomValue(currentOrganizationAtom);
  const { toast } = useToast();
  
  const isEditing = !!initialData;
  const [name, setName] = React.useState('');
  const [steps, setSteps] = React.useState<WorkflowStepData[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setSteps(initialData.steps?.map((s: any) => ({
          id: s.id,
          stepOrder: s.stepOrder,
          assigneeRole: s.assigneeRole,
          action: s.action
        })) || []);
      } else {
        setName('');
        setSteps([]);
      }
    }
  }, [isOpen, initialData]);

  const [createTemplate, { loading: creating }] = useMutation(CREATE_WORKFLOW_TEMPLATE_MUTATION);
  const [updateTemplate, { loading: updating }] = useMutation(UPDATE_WORKFLOW_TEMPLATE_MUTATION);
  const [saveSteps, { loading: savingSteps }] = useMutation(SAVE_WORKFLOW_STEPS_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization?.id) return;
    
    if (steps.length === 0) {
      toast({ title: 'Validation Error', description: 'At least one step is required.', status: 'error' });
      return;
    }

    try {
      let templateId = initialData?.id;

      if (isEditing) {
        await updateTemplate({
          variables: {
            id: templateId,
            input: { name },
          },
        });
      } else {
        const { data } = await createTemplate({
          variables: {
            input: {
              name,
              organizationId: currentOrganization.id,
            },
          },
        });
        templateId = (data as any).createWorkflowTemplate.id;
      }

      // Save steps
      const stepsPayload = steps.map(s => ({
        stepOrder: s.stepOrder,
        assigneeRole: s.assigneeRole,
        action: s.action
      }));

      await saveSteps({
        variables: {
          templateId,
          steps: stepsPayload
        }
      });

      toast({ 
        title: 'Success', 
        description: isEditing ? 'Workflow updated successfully.' : 'Workflow created successfully.', 
        status: 'success' 
      });
      onSuccess();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  const isSaving = creating || updating || savingSteps;

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className="max-w-[600px]">
        <Modal.Header title={isEditing ? 'Edit Workflow' : 'Create Workflow'} description="Configure workflow template and steps." />
        <form onSubmit={handleSubmit}>
          <Modal.Body className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <Label.Root>Workflow Name</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Standard Expenses" />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div className="flex flex-col gap-2">
              <Label.Root>Approval Steps</Label.Root>
              <WorkflowStepBuilder steps={steps} onChange={setSteps} />
            </div>
          </Modal.Body>

          <Modal.Footer>
            <FancyButton.Root type="button" variant="basic" onClick={onClose}>
              Cancel
            </FancyButton.Root>
            <FancyButton.Root type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Workflow'}
            </FancyButton.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
