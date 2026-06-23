import { createFileRoute } from '@tanstack/react-router';

import { BudgetsPage } from '@/pages/noma/budgets-page';

export const Route = createFileRoute('/_main/budgets')({
  component: BudgetsPage,
});
