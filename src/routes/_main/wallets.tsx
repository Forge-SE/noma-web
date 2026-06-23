import { createFileRoute } from '@tanstack/react-router';

import { WalletsPage } from '@/pages/noma/wallets-page';

export const Route = createFileRoute('/_main/wallets')({
  component: WalletsPage,
});
