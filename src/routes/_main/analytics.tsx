import { createFileRoute } from '@tanstack/react-router';

import { AnalyticsPage } from '@/pages/noma/analytics-page';

export const Route = createFileRoute('/_main/analytics')({
  component: AnalyticsPage,
});