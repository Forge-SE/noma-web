import { createFileRoute } from '@tanstack/react-router';

import { MyCardsPage } from '@/pages/finance/my-cards-page';

export const Route = createFileRoute('/_main/my-cards')({
  component: MyCardsPage,
});
