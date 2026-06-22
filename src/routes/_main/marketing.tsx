import { createFileRoute } from '@tanstack/react-router';

import { MarketingHomePage } from '@/pages/marketing/home-page';

export const Route = createFileRoute('/_main/marketing')({
  component: MarketingHomePage,
});
