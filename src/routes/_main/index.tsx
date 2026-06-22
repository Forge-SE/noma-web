import { createFileRoute } from '@tanstack/react-router';

import { FinanceHomePage } from '@/pages/finance/home-page';

export const Route = createFileRoute('/_main/')({
  component: FinanceHomePage,
});
