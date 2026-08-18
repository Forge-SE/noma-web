import * as React from 'react';
import * as Select from '@/components/ui/select';
import * as Input from '@/components/ui/input';
import * as FancyButton from '@/components/ui/fancy-button';
import { useQuery } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import { RiAddLine, RiDeleteBinLine } from '@remixicon/react';
import { currentOrganizationAtom } from '@/store/auth.store';
import { GET_DEPARTMENTS_QUERY } from '@/graphql/departments.graphql';
import { GET_CATEGORIES_QUERY } from '@/graphql/categories.graphql';

export interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface CategoryOption {
  id: string;
  key: string;
  name: string;
  icon: string | null;
  iconFamily: string | null;
  color: string | null;
  enabled: boolean;
}

interface DepartmentOption {
  id: string;
  name: string;
  parentId: string | null;
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
    { value: 'gt', label: 'Greater than' },
    { value: 'lt', label: 'Less than' },
    { value: 'gte', label: 'Greater or equal' },
    { value: 'lte', label: 'Less or equal' },
    { value: 'eq', label: 'Equals' },
  ],
  category: [
    { value: 'eq', label: 'Equals' },
  ],
  departmentId: [
    { value: 'eq', label: 'Equals' },
  ],
};

export function PolicyConditionBuilder({ conditions, onChange }: PolicyConditionBuilderProps) {
  const currentOrganization = useAtomValue(currentOrganizationAtom);

  const { data: categoriesData } = useQuery<{ categories: CategoryOption[] }>(GET_CATEGORIES_QUERY, {
    variables: { organizationId: currentOrganization?.id },
    skip: !currentOrganization?.id,
  });
  const { data: departmentsData } = useQuery<{ departments: DepartmentOption[] }>(GET_DEPARTMENTS_QUERY, {
    variables: { organizationId: currentOrganization?.id },
    skip: !currentOrganization?.id,
  });

  const categories = categoriesData?.categories ?? [];
  const departments = departmentsData?.departments ?? [];

  const addCondition = () => {
    onChange([...conditions, { field: 'amount', operator: 'gt', value: '' }]);
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

  const renderValueEditor = (condition: Condition, idx: number) => {
    if (condition.field === 'category') {
      return (
        <Select.Root value={condition.value} onValueChange={(val) => updateCondition(idx, { value: val })}>
          <Select.Trigger>
            <Select.Value placeholder="Select category" />
          </Select.Trigger>
          <Select.Content>
            {categories.map((cat) => (
              <Select.Item key={cat.key} value={cat.key}>
                {cat.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      );
    }

    if (condition.field === 'departmentId') {
      return (
        <Select.Root value={condition.value} onValueChange={(val) => updateCondition(idx, { value: val })}>
          <Select.Trigger>
            <Select.Value placeholder="Select department" />
          </Select.Trigger>
          <Select.Content>
            {departments.map((dept) => (
              <Select.Item key={dept.id} value={dept.id}>
                {dept.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      );
    }

    return (
      <Input.Root>
        <Input.Wrapper>
          <Input.Input
            value={condition.value}
            onChange={(e) => updateCondition(idx, { value: e.target.value })}
            placeholder="e.g. 500"
            type="number"
          />
        </Input.Wrapper>
      </Input.Root>
    );
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

          <div className="flex-1">{renderValueEditor(condition, idx)}</div>

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