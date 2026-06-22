import { createFileRoute } from '@tanstack/react-router';

import { TransactionsPage } from '@/pages/finance/transactions-page';

export const Route = createFileRoute('/_main/transactions')({
  component: TransactionsPage,
});
