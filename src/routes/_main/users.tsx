import { createFileRoute } from '@tanstack/react-router';

import { UsersPage } from '@/pages/noma/users-page';

export const Route = createFileRoute('/_main/users')({
  component: UsersPage,
});
