import { createFileRoute } from '@tanstack/react-router';

import { DepartmentsPage } from '@/pages/noma/departments-page';

export const Route = createFileRoute('/_main/departments')({
  component: DepartmentsPage,
});
