import { createFileRoute } from '@tanstack/react-router';

import { HrHomePage } from '@/pages/hr/home-page';

export const Route = createFileRoute('/_main/hr')({
  component: HrHomePage,
});
