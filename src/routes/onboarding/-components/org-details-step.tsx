import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as FancyButton from '@/components/ui/fancy-button';
import { useToast } from '@/components/ui/toaster';
import { UPDATE_ORGANIZATION_MUTATION } from '@/graphql/onboarding.graphql';
import type { CurrentOrganization } from '@/store/auth.store';

export function OrgDetailsStep({ org, onNext }: { org: CurrentOrganization | null; onNext: () => void }) {
  const [name, setName] = React.useState(org?.name || '');
  const [updateOrg, { loading }] = useMutation(UPDATE_ORGANIZATION_MUTATION);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    if (name === org.name) {
      onNext();
      return;
    }
    try {
      await updateOrg({ variables: { id: org.id, input: { name } } });
      onNext();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="text-title-h6">Organization Details</h2>
        <p className="text-paragraph-sm text-text-sub-600">Review your organization's core details.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label.Root>Organization Name</Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div className="flex flex-col gap-1">
          <Label.Root>Organization Slug (Identifier)</Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input value={org?.slug || ''} disabled className="bg-bg-weak-50 text-text-sub-600" />
            </Input.Wrapper>
          </Input.Root>
          <p className="text-paragraph-xs text-text-sub-600 mt-1">The slug is auto-generated and cannot be changed here.</p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <FancyButton.Root type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : 'Continue'}
        </FancyButton.Root>
      </div>
    </form>
  );
}
