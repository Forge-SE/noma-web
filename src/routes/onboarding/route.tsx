import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMutation } from '@apollo/client/react';

import { currentOrganizationAtom, sessionAtom } from '@/store/auth.store';
import { COMPLETE_ONBOARDING_MUTATION } from '@/graphql/onboarding.graphql';
import { AuthHeader } from '@/components/layout/auth-header';
import * as HorizontalStepper from '@/components/ui/horizontal-stepper';

import { OrgDetailsStep } from './-components/org-details-step';
import { DepartmentsStep } from './-components/departments-step';
import { UsersStep } from './-components/users-step';
import { WalletStep } from './-components/wallet-step';
import { useToast } from '@/components/ui/toaster';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingRoute,
});

function OnboardingRoute() {
  const router = useRouter();
  const { toast } = useToast();
  const org = useAtomValue(currentOrganizationAtom);
  const session = useAtomValue(sessionAtom);
  const setSession = useSetAtom(sessionAtom);

  const [currentStep, setCurrentStep] = React.useState(1);
  const [completeOnboarding, { loading: completing }] = useMutation(COMPLETE_ONBOARDING_MUTATION);

  React.useEffect(() => {
    // If somehow reached here and already onboarded, redirect
    if (session?.onboarded) {
      router.navigate({ to: '/' });
    }
  }, [session, router]);

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleFinish = async () => {
    if (!org) return;
    try {
      await completeOnboarding({ variables: { organizationId: org.id } });
      // Update local session atom immediately so route guard passes
      if (session) {
        setSession({ ...session, onboarded: true });
      }
      toast({ title: 'Setup complete!', description: 'Welcome to Noma.', status: 'success' });
      router.navigate({ to: '/' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  const steps = ['Organization details', 'Create departments', 'Invite users', 'Master wallet'];

  return (
    <div className='flex min-h-screen flex-col bg-bg-weak-50'>
      <AuthHeader />
      <div className='flex flex-1 flex-col items-center p-6 md:p-10'>
        <div className='w-full max-w-3xl space-y-8'>
          <div className='text-center'>
            <h1 className='text-title-h4 mb-2'>Welcome to Noma</h1>
            <p className='text-paragraph-md text-text-sub-600'>Let's get your organization set up.</p>
          </div>

          <HorizontalStepper.Root>
            {steps.map((label, idx) => {
              const stepNumber = idx + 1;
              const state = currentStep > stepNumber ? 'completed' : currentStep === stepNumber ? 'active' : 'default';
              return (
                <React.Fragment key={stepNumber}>
                  <HorizontalStepper.Item state={state}>
                    <HorizontalStepper.ItemIndicator>{stepNumber}</HorizontalStepper.ItemIndicator>
                    {label}
                  </HorizontalStepper.Item>
                  {idx < steps.length - 1 && <HorizontalStepper.SeparatorIcon />}
                </React.Fragment>
              );
            })}
          </HorizontalStepper.Root>

          <div className='rounded-20 bg-bg-white-0 p-6 shadow-regular-sm ring-1 ring-inset ring-stroke-soft-200 md:p-8'>
            {currentStep === 1 && <OrgDetailsStep org={org} onNext={handleNext} />}
            {currentStep === 2 && <DepartmentsStep org={org} onNext={handleNext} onBack={handleBack} />}
            {currentStep === 3 && <UsersStep org={org} onNext={handleNext} onBack={handleBack} />}
            {currentStep === 4 && <WalletStep org={org} onFinish={handleFinish} onBack={handleBack} loading={completing} />}
          </div>
        </div>
      </div>
    </div>
  );
}
