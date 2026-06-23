import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import { useToast } from '@/components/ui/toaster';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as Switch from '@/components/ui/switch';
import * as FancyButton from '@/components/ui/fancy-button';
import { currentOrganizationAtom } from '@/store/auth.store';

import { CREATE_POLICY_MUTATION, UPDATE_POLICY_MUTATION } from '@/graphql/policies.graphql';
import { PolicyConditionBuilder, type Condition } from './policy-condition-builder';

interface PolicyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: any | null;
  onSuccess: () => void;
}

const ACTION_OPTIONS = [
  { value: 'BLOCK', label: 'Block' },
  { value: 'REQUIRE_APPROVAL', label: 'Require Approval' },
  { value: 'NOTIFY', label: 'Notify' },
  { value: 'AUTO_APPROVE', label: 'Auto Approve' },
];

export function PolicyFormModal({ isOpen, onClose, initialData, onSuccess }: PolicyFormModalProps) {
  const currentOrganization = useAtomValue(currentOrganizationAtom);
  const { toast } = useToast();
  
  const isEditing = !!initialData;
  const [name, setName] = React.useState('');
  const [priority, setPriority] = React.useState('1');
  const [action, setAction] = React.useState('REQUIRE_APPROVAL');
  const [enabled, setEnabled] = React.useState(true);
  const [conditions, setConditions] = React.useState<Condition[]>([{ field: 'amount', operator: '>', value: '' }]);

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setPriority(initialData.priority?.toString() || '1');
        setAction(initialData.actions?.[0]?.type || 'REQUIRE_APPROVAL');
        setEnabled(initialData.enabled ?? true);
        setConditions(initialData.conditions || [{ field: 'amount', operator: '>', value: '' }]);
      } else {
        setName('');
        setPriority('1');
        setAction('REQUIRE_APPROVAL');
        setEnabled(true);
        setConditions([{ field: 'amount', operator: '>', value: '' }]);
      }
    }
  }, [isOpen, initialData]);

  const [createPolicy, { loading: creating }] = useMutation(CREATE_POLICY_MUTATION);
  const [updatePolicy, { loading: updating }] = useMutation(UPDATE_POLICY_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization?.id) return;
    
    // validation
    if (conditions.length === 0) {
      toast({ title: 'Validation Error', description: 'At least one condition is required.', status: 'error' });
      return;
    }
    
    const hasEmptyCondition = conditions.some(c => !c.value);
    if (hasEmptyCondition) {
      toast({ title: 'Validation Error', description: 'All conditions must have a value.', status: 'error' });
      return;
    }

    try {
      const payload = {
        name,
        priority: parseInt(priority, 10),
        actions: [{ type: action }],
        conditions,
        enabled,
      };

      if (isEditing) {
        await updatePolicy({
          variables: {
            id: initialData.id,
            input: payload,
          },
        });
        toast({ title: 'Success', description: 'Policy updated successfully.', status: 'success' });
      } else {
        await createPolicy({
          variables: {
            input: {
              ...payload,
              organizationId: currentOrganization.id,
            },
          },
        });
        toast({ title: 'Success', description: 'Policy created successfully.', status: 'success' });
      }
      onSuccess();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className="max-w-[600px]">
        <Modal.Header title={isEditing ? 'Edit Policy' : 'Create Policy'} description="Configure policy conditions and actions." />
        <form onSubmit={handleSubmit}>
          <Modal.Body className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <Label.Root>Policy Name</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. High Value Spend Approval" />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <Label.Root>Priority</Label.Root>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Input type="number" min="0" value={priority} onChange={(e) => setPriority(e.target.value)} required />
                  </Input.Wrapper>
                </Input.Root>
                <p className="text-paragraph-xs text-text-sub-600 mt-1">Lower numbers are evaluated first.</p>
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <Label.Root>Action</Label.Root>
                <Select.Root value={action} onValueChange={setAction}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {ACTION_OPTIONS.map((opt) => (
                      <Select.Item key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label.Root>Conditions</Label.Root>
              <PolicyConditionBuilder conditions={conditions} onChange={setConditions} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch.Root checked={enabled} onCheckedChange={setEnabled} />
              <Label.Root>Enable Policy</Label.Root>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <FancyButton.Root type="button" variant="basic" onClick={onClose}>
              Cancel
            </FancyButton.Root>
            <FancyButton.Root type="submit" variant="primary" disabled={creating || updating}>
              {creating || updating ? 'Saving...' : 'Save Policy'}
            </FancyButton.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
