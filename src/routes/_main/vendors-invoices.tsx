import { createFileRoute } from '@tanstack/react-router';

import { VendorsInvoicesPage } from '@/pages/noma/vendors-invoices-page';

export const Route = createFileRoute('/_main/vendors-invoices')({
  component: VendorsInvoicesPage,
});
