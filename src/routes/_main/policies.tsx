import { createFileRoute } from '@tanstack/react-router';

import { PoliciesPage } from '@/pages/noma/policies-page';

export const Route = createFileRoute('/_main/policies')({
  component: PoliciesPage,
});
