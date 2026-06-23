import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ToastProvider } from '@/components/ui/toaster';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ToastProvider>
      <Outlet />
      {/* {import.meta.env.DEV ? (
        <TanStackRouterDevtools position='bottom-right' />
      ) : null} */}
    </ToastProvider>
  );
}
