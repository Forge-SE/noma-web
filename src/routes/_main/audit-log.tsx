import { createFileRoute } from '@tanstack/react-router';

import { AuditLogPage } from '@/pages/noma/audit-log-page';

export const Route = createFileRoute('/_main/audit-log')({
  component: AuditLogPage,
});
