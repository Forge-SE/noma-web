import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import { useToast } from '@/components/ui/toaster';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as FancyButton from '@/components/ui/fancy-button';
import { DatePicker } from '@/components/ui/date-picker';
import { currentOrganizationAtom } from '@/store/auth.store';

import {
  CREATE_BUDGET_MUTATION,
  UPDATE_BUDGET_MUTATION,
  GET_DEPARTMENT_OPTIONS_QUERY,
} from '@/graphql/budgets.graphql';

const PERIOD_OPTIONS = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'CUSTOM', label: 'Custom' },
];

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
  onSuccess: () => void;
}

export function BudgetFormModal({ isOpen, onClose, initialData, onSuccess }: BudgetFormModalProps) {
  const currentOrganization = useAtomValue(currentOrganizationAtom);
  const { toast } = useToast();

  const isEditing = !!initialData;
  const [name, setName] = React.useState('');
  const [departmentId, setDepartmentId] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState('');
  const [period, setPeriod] = React.useState('MONTHLY');
  const [periodStart, setPeriodStart] = React.useState<Date | null>(null);
  const [periodEnd, setPeriodEnd] = React.useState<Date | null>(null);

  const { data: deptData } = useQuery(GET_DEPARTMENT_OPTIONS_QUERY, {
    variables: { organizationId: currentOrganization?.id },
    skip: !currentOrganization?.id,
  });

  const departments = (deptData as any)?.departments || [];

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setDepartmentId(initialData.departmentId || null);
        setAmount(initialData.amount ? String(initialData.amount / 100) : '');
        setPeriod(initialData.period || 'MONTHLY');
        setPeriodStart(initialData.periodStart ? new Date(initialData.periodStart) : null);
        setPeriodEnd(initialData.periodEnd ? new Date(initialData.periodEnd) : null);
      } else {
        setName('');
        setDepartmentId(null);
        setAmount('');
        setPeriod('MONTHLY');
        setPeriodStart(null);
        setPeriodEnd(null);
      }
    }
  }, [isOpen, initialData]);

  React.useEffect(() => {
    if (period !== 'CUSTOM' && periodStart && !isEditing) {
      const start = new Date(periodStart);
      let end: Date;
      switch (period) {
        case 'WEEKLY':
          end = new Date(start);
          end.setDate(end.getDate() + 6);
          break;
        case 'MONTHLY':
          end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
          break;
        case 'QUARTERLY':
          end = new Date(start.getFullYear(), start.getMonth() + 3, 0);
          break;
        case 'YEARLY':
          end = new Date(start.getFullYear() + 1, 0, 0);
          break;
        default:
          end = new Date(start);
      }
      setPeriodEnd(end);
    }
  }, [period, periodStart, isEditing]);

  const [createBudget, { loading: creating }] = useMutation(CREATE_BUDGET_MUTATION);
  const [updateBudget, { loading: updating }] = useMutation(UPDATE_BUDGET_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization?.id) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: 'Validation Error', description: 'Amount must be a positive number.', status: 'error' });
      return;
    }

    if (!periodStart || !periodEnd) {
      toast({ title: 'Validation Error', description: 'Period start and end dates are required.', status: 'error' });
      return;
    }

    try {
      const payload = {
        name,
        departmentId: departmentId || undefined,
        amount: Math.round(amountNum * 100),
        period,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      };

      if (isEditing) {
        await updateBudget({
          variables: { id: initialData.id, input: payload },
        });
        toast({ title: 'Success', description: 'Budget updated successfully.', status: 'success' });
      } else {
        await createBudget({
          variables: {
            input: {
              ...payload,
              organizationId: currentOrganization.id,
            },
          },
        });
        toast({ title: 'Success', description: 'Budget created successfully.', status: 'success' });
      }
      onSuccess();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  const departmentOptions = [
    { value: '', label: 'Organization-wide' },
    ...departments.map((d: any) => ({ value: d.id, label: d.name })),
  ];

  const loading = creating || updating;

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className="max-w-[560px]">
        <Modal.Header
          title={isEditing ? 'Edit Budget' : 'Create Budget'}
          description="Set a budget to track departmental spending."
        />
        <form onSubmit={handleSubmit}>
          <Modal.Body className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <Label.Root>Budget Name</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Q3 Marketing Budget"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div className="flex flex-col gap-1">
              <Label.Root>Department</Label.Root>
              <Select.Root
                value={departmentId ?? ''}
                onValueChange={(val) => setDepartmentId(val || null)}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Organization-wide" />
                </Select.Trigger>
                <Select.Content>
                  {departmentOptions.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>

            <div className="flex flex-col gap-1">
              <Label.Root>Amount</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="0.00"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div className="flex flex-col gap-1">
              <Label.Root>Period</Label.Root>
              <Select.Root value={period} onValueChange={setPeriod}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {PERIOD_OPTIONS.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <Label.Root>Period Start</Label.Root>
                <DatePicker
                  date={periodStart}
                  onDateChange={setPeriodStart}
                  placeholder="Select start date"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <Label.Root>Period End</Label.Root>
                <DatePicker
                  date={periodEnd}
                  onDateChange={setPeriodEnd}
                  placeholder="Select end date"
                  disabled={period !== 'CUSTOM' && !isEditing}
                  disabledDays={periodStart ? (date) => date < periodStart : undefined}
                />
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <FancyButton.Root type="button" variant="basic" onClick={onClose}>
              Cancel
            </FancyButton.Root>
            <FancyButton.Root type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Budget' : 'Create Budget'}
            </FancyButton.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
