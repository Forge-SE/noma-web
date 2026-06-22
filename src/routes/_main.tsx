import { createFileRoute, Outlet } from '@tanstack/react-router';

import { MainLayout } from '@/components/layout/main-layout';

export const Route = createFileRoute('/_main')({
  component: MainRouteLayout,
});

function MainRouteLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
