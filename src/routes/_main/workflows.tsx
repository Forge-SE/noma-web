import { createFileRoute } from '@tanstack/react-router';

import { WorkflowsPage } from '@/pages/noma/workflows-page';

export const Route = createFileRoute('/_main/workflows')({
  component: WorkflowsPage,
});
