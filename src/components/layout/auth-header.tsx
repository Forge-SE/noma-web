import { Link, useLocation } from '@tanstack/react-router';
import * as LinkButton from '@/components/ui/link-button';

const actions = {
  '/auth/login': {
    text: "Can't access your account?",
    link: {
      label: 'Contact support',
      href: '/auth/support',
    },
  },
  '/auth/forgot-password': {
    text: 'Changed your mind?',
    link: {
      label: 'Go Back',
      href: '/auth/login',
    },
  },
};

export function AuthHeader() {
  const location = useLocation();
  const action = actions[location.pathname as keyof typeof actions];

  return (
    <div className='mx-auto flex w-full max-w-[1400px] items-center justify-between p-6'>
      <img
        src='/images/placeholder/apex.svg'
        alt='Noma Logo'
        className='h-10 shrink-0'
      />

      {action && (
        <div className='flex items-center gap-1.5'>
          <div className='text-paragraph-sm text-text-sub-600'>{action.text}</div>
          <LinkButton.Root variant='primary' size='medium' underline asChild>
            <Link to={action.link.href}>{action.link.label}</Link>
          </LinkButton.Root>
        </div>
      )}
    </div>
  );
}
