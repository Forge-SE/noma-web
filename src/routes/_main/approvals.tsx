import { createFileRoute } from '@tanstack/react-router';

import { ApprovalsPage } from '@/pages/noma/approvals-page';

export const Route = createFileRoute('/_main/approvals')({
  component: ApprovalsPage,
});
