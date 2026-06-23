import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';

import { isAuthenticatedAtom, authLoadingAtom, sessionAtom } from '@/store/auth.store';
import { MainLayout } from '@/components/layout/main-layout';

export const Route = createFileRoute('/_main')({
  component: MainRouteLayout,
});

function MainRouteLayout() {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const isLoading = useAtomValue(authLoadingAtom);
  const session = useAtomValue(sessionAtom);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (session && !session.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
