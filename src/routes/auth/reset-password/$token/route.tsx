import * as React from 'react';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useToast } from '@/components/ui/toaster';
import { RiDoorLockFill, RiLock2Line, RiEyeLine, RiEyeOffLine } from '@remixicon/react';

import { cn } from '@/utils/cn';
import * as Divider from '@/components/ui/divider';
import * as FancyButton from '@/components/ui/fancy-button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';

function PasswordInput(
  props: React.ComponentPropsWithoutRef<typeof Input.Input>,
) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Input.Root>
      <Input.Wrapper>
        <Input.Icon as={RiLock2Line} />
        <Input.Input
          type={showPassword ? 'text' : 'password'}
          placeholder='••••••••••'
          {...props}
        />
        <button type='button' onClick={() => setShowPassword((s) => !s)}>
          {showPassword ? (
            <RiEyeOffLine className='size-5 text-text-soft-400 group-has-[disabled]:text-text-disabled-300' />
          ) : (
            <RiEyeLine className='size-5 text-text-soft-400 group-has-[disabled]:text-text-disabled-300' />
          )}
        </button>
      </Input.Wrapper>
    </Input.Root>
  );
}

export const Route = createFileRoute('/auth/reset-password/$token')({
  component: PageResetPasswordToken,
});

function PageResetPasswordToken() {
  const { token } = Route.useParams();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        status: 'error',
      });
      return;
    }
    // Mock successful reset
    toast({
      title: 'Success',
      description: `Password reset for token: ${token}`,
      status: 'success',
    });
    router.navigate({ to: '/auth/login' });
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
            <div className='text-title-h6 lg:text-title-h5'>Create New Password</div>
            <div className='text-paragraph-sm text-text-sub-600 lg:text-paragraph-md'>
              Please enter your new password below.
            </div>
          </div>
        </div>

        <Divider.Root />

        <div className='flex flex-col gap-3'>
          <div className='flex flex-col gap-1'>
            <Label.Root htmlFor='password'>
              New Password <Label.Asterisk />
            </Label.Root>
            <PasswordInput
              id='password'
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label.Root htmlFor='confirm-password'>
              Confirm Password <Label.Asterisk />
            </Label.Root>
            <PasswordInput
              id='confirm-password'
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <FancyButton.Root variant='primary' size='medium' type='submit'>
          Update Password
        </FancyButton.Root>
      </form>
    </div>
  );
}
