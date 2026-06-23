import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { RiAddLine, RiCloseLine } from '@remixicon/react';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as FancyButton from '@/components/ui/fancy-button';
import { useToast } from '@/components/ui/toaster';
import { CREATE_DEPARTMENT_MUTATION } from '@/graphql/onboarding.graphql';
import type { CurrentOrganization } from '@/store/auth.store';

export function DepartmentsStep({ org, onNext, onBack }: { org: CurrentOrganization | null; onNext: () => void; onBack: () => void }) {
  const [departments, setDepartments] = React.useState([{ name: '' }]);
  const [createDepartment, { loading }] = useMutation(CREATE_DEPARTMENT_MUTATION);
  const { toast } = useToast();

  const handleAdd = () => setDepartments([...departments, { name: '' }]);
  const handleRemove = (index: number) => setDepartments(departments.filter((_, i) => i !== index));
  const handleChange = (index: number, val: string) => {
    const newDeps = [...departments];
    newDeps[index].name = val;
    setDepartments(newDeps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;

    const validDeps = departments.filter((d) => d.name.trim());
    if (validDeps.length === 0) {
      // Treat as skip
      onNext();
      return;
    }

    try {
      await Promise.all(
        validDeps.map((d) =>
          createDepartment({ variables: { input: { organizationId: org.id, name: d.name } } })
        )
      );
      onNext();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="text-title-h6">Create Departments</h2>
        <p className="text-paragraph-sm text-text-sub-600">Set up the structure of your organization. You can add more later.</p>
      </div>

      <div className="flex flex-col gap-4">
        {departments.map((dep, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <Label.Root>Department Name</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    placeholder="e.g. Engineering, Finance"
                    value={dep.name}
                    onChange={(e) => handleChange(index, e.target.value)}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
            {departments.length > 1 && (
              <button type="button" onClick={() => handleRemove(index)} className="mt-6 p-2 text-text-sub-600 hover:text-error-base">
                <RiCloseLine className="size-5" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 text-primary-base text-label-sm hover:underline self-start mt-2"
        >
          <RiAddLine className="size-4" /> Add another department
        </button>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button type="button" onClick={onBack} className="text-label-sm text-text-sub-600 hover:text-text-strong-950">
          Back
        </button>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onNext} className="text-label-sm text-text-sub-600 hover:text-text-strong-950">
            Skip for now
          </button>
          <FancyButton.Root type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Continue'}
          </FancyButton.Root>
        </div>
      </div>
    </form>
  );
}
