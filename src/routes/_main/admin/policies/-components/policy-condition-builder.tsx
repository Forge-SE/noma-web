import * as React from 'react';
import * as Select from '@/components/ui/select';
import * as Input from '@/components/ui/input';
import * as FancyButton from '@/components/ui/fancy-button';
import { RiAddLine, RiDeleteBinLine } from '@remixicon/react';

export interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface PolicyConditionBuilderProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
}

const FIELD_OPTIONS = [
  { value: 'amount', label: 'Amount' },
  { value: 'category', label: 'Category' },
  { value: 'departmentId', label: 'Department' },
];

const OPERATORS_FOR_FIELD: Record<string, { value: string; label: string }[]> = {
  amount: [
    { value: '>', label: 'Greater than' },
    { value: '<', label: 'Less than' },
    { value: '>=', label: 'Greater or equal' },
    { value: '<=', label: 'Less or equal' },
    { value: '=', label: 'Equals' },
  ],
  category: [
    { value: '=', label: 'Equals' },
    { value: 'in', label: 'In list' },
  ],
  departmentId: [
    { value: '=', label: 'Equals' },
    { value: 'in', label: 'In list' },
  ],
};

export function PolicyConditionBuilder({ conditions, onChange }: PolicyConditionBuilderProps) {
  const addCondition = () => {
    onChange([...conditions, { field: 'amount', operator: '>', value: '' }]);
  };

  const removeCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    
    // Reset operator if field changes and current operator is invalid for new field
    if (updates.field) {
      const allowedOperators = OPERATORS_FOR_FIELD[updates.field].map(o => o.value);
      if (!allowedOperators.includes(newConditions[index].operator)) {
        newConditions[index].operator = OPERATORS_FOR_FIELD[updates.field][0].value;
      }
    }
    
    onChange(newConditions);
  };

  return (
    <div className="flex flex-col gap-3">
      {conditions.map((condition, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className="flex-1">
            <Select.Root value={condition.field} onValueChange={(val) => updateCondition(idx, { field: val })}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {FIELD_OPTIONS.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>

          <div className="flex-1">
            <Select.Root value={condition.operator} onValueChange={(val) => updateCondition(idx, { operator: val })}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {OPERATORS_FOR_FIELD[condition.field || 'amount']?.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>

          <div className="flex-1">
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  value={condition.value}
                  onChange={(e) => updateCondition(idx, { value: e.target.value })}
                  placeholder={condition.field === 'amount' ? 'e.g. 500' : 'Value'}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <button
            type="button"
            onClick={() => removeCondition(idx)}
            className="p-2 text-text-sub-600 hover:text-text-error-600 transition-colors"
          >
            <RiDeleteBinLine className="size-5" />
          </button>
        </div>
      ))}

      <div className="pt-2">
        <FancyButton.Root type="button" variant="neutral" size="small" onClick={addCondition}>
          <FancyButton.Icon as={RiAddLine} />
          Add Condition
        </FancyButton.Root>
      </div>
    </div>
  );
}
