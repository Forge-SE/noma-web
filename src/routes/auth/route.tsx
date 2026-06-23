import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AuthHeader } from '@/components/layout/auth-header';
import { AuthFooter } from '@/components/layout/auth-footer';

export const Route = createFileRoute('/auth')({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className='flex min-h-screen flex-col'>
      <AuthHeader />
      <div className='relative isolate flex w-full flex-1 flex-col items-center justify-center'>
        <img
          src='/images/auth-pattern.svg'
          alt=''
          className='pointer-events-none absolute left-1/2 top-1/2 -z-10 w-full max-w-[1140px] -translate-x-1/2 -translate-y-1/2 object-contain'
          width='824'
          height='318'
        />
        <Outlet />
      </div>
      <AuthFooter />
    </div>
  );
}
