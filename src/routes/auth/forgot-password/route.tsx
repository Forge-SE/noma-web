import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { RiDoorLockFill, RiMailLine } from '@remixicon/react';
import { useToast } from '@/components/ui/toaster';

import { cn } from '@/utils/cn';
import * as Divider from '@/components/ui/divider';
import * as FancyButton from '@/components/ui/fancy-button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as LinkButton from '@/components/ui/link-button';

export const Route = createFileRoute('/auth/forgot-password')({
  component: PageForgotPassword,
});

function PageForgotPassword() {
  const [email, setEmail] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In Phase 1 we mock the forgot password
    toast({
      title: 'Not Implemented',
      description: 'Forgot Password functionality is not yet available in the backend.',
      status: 'warning',
    });
    console.log('Reset password link sent to', email);
    setSuccess(true);
  };

  return (
    <div className='w-full max-w-[472px] px-4'>
      <form onSubmit={handleSubmit} className='flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 md:p-8'>
        <div className='flex flex-col items-center gap-2'>
          <div
            className={cn(
              'relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-24',
              'before:absolute before:inset-0 before:rounded-full',
              'before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10',
            )}
          >
            <div className='relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 lg:size-16'>
              <RiDoorLockFill className='size-6 text-text-sub-600 lg:size-8' />
            </div>
          </div>

          <div className='space-y-1 text-center'>
            <div className='text-title-h6 lg:text-title-h5'>Forgot Password</div>
            <div className='text-paragraph-sm text-text-sub-600 lg:text-paragraph-md'>
              Enter your email to reset your password.
            </div>
          </div>
        </div>

        <Divider.Root />

        {success ? (
          <div className='text-center text-paragraph-sm text-text-sub-600'>
            If an account exists for {email}, a reset link has been sent.
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            <div className='flex flex-col gap-1'>
              <Label.Root htmlFor='email'>
                Email Address <Label.Asterisk />
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={RiMailLine} />
                  <Input.Input
                    id='email'
                    type='email'
                    placeholder='hello@noma.com'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
          </div>
        )}

        {!success && (
          <FancyButton.Root variant='primary' size='medium' type='submit'>
            Reset Password
          </FancyButton.Root>
        )}

        <div className='flex flex-col items-center gap-1 text-center text-paragraph-sm text-text-sub-600'>
          Remembered your password?
          <LinkButton.Root variant='black' size='medium' underline asChild>
            <Link to='/auth/login'>Go to Login</Link>
          </LinkButton.Root>
        </div>
      </form>
    </div>
  );
}
