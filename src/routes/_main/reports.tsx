import { createFileRoute } from '@tanstack/react-router';

import { ReportsPage } from '@/pages/noma/reports-page';

export const Route = createFileRoute('/_main/reports')({
  component: ReportsPage,
});
