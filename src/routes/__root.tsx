import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ToastProvider } from '@/components/ui/toaster';
import { ApolloErrorToaster } from '@/components/ui/apollo-error-toaster';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ToastProvider>
      <ApolloErrorToaster />
      <Outlet />
    </ToastProvider>
  );
}
