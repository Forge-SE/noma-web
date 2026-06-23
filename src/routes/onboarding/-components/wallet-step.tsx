import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { RiWalletLine, RiCheckboxCircleFill, RiWifiLine } from '@remixicon/react';
import { cnExt } from '@/utils/cn';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as FancyButton from '@/components/ui/fancy-button';
import { useToast } from '@/components/ui/toaster';
import { CREATE_WALLET_MUTATION } from '@/graphql/onboarding.graphql';
import type { CurrentOrganization } from '@/store/auth.store';
import IconChip from '@/icons/icon-chip.svg';

function SVGCardBg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='94' height='129' fill='none' viewBox='0 0 94 129' {...props}>
      <path className='stroke-faded-dark opacity-40' d='M137.386-140.5h159.669c7.952 0 12.866 8.673 8.779 15.494L196.6 57.309A20.966 20.966 0 0 1 178.614 67.5H18.944c-7.951 0-12.865-8.673-8.778-15.494L119.4-130.309a20.966 20.966 0 0 1 17.986-10.191Z' />
      <path className='stroke-faded-dark opacity-40' d='M175.386-79.5h159.669c7.952 0 12.866 8.673 8.779 15.494L234.6 118.309a20.966 20.966 0 0 1-17.986 10.191H56.944c-7.952 0-12.865-8.673-8.778-15.494L157.4-69.309A20.966 20.966 0 0 1 175.386-79.5Z' />
    </svg>
  );
}

type WalletStepProps = {
  org: CurrentOrganization | null;
  onFinish: () => void;
  onBack: () => void;
  loading: boolean;
};

export function WalletStep({ org, onFinish, onBack, loading }: WalletStepProps) {
  const [walletName, setWalletName] = React.useState(org ? `${org.name} Main Wallet` : 'Main Wallet');
  const [walletCreated, setWalletCreated] = React.useState(false);
  const [createWallet, { loading: creating }] = useMutation(CREATE_WALLET_MUTATION);
  const { toast } = useToast();

  // Update default name if org loads late
  React.useEffect(() => {
    if (org && !walletName) setWalletName(`${org.name} Main Wallet`);
  }, [org]);

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    try {
      await createWallet({
        variables: {
          input: {
            organizationId: org.id,
            name: walletName,
            type: 'MASTER',
          },
        },
      });
      setWalletCreated(true);
      toast({ title: 'Master wallet created!', status: 'success' });
    } catch (err: any) {
      toast({ title: 'Error creating wallet', description: err.message, status: 'error' });
    }
  };

  const isLoading = creating || loading;

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-1">
        <h2 className="text-title-h6">Create Master Wallet</h2>
        <p className="text-paragraph-sm text-text-sub-600">
          Your master wallet is the central fund source for all spend in your organization.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left: Form */}
        <form onSubmit={handleCreateWallet} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <Label.Root>Wallet Name <Label.Asterisk /></Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={RiWalletLine} />
                <Input.Input
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="Main Wallet"
                  required
                  disabled={walletCreated}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div className="flex flex-col gap-1">
            <Label.Root>Currency</Label.Root>
            <div className="flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2.5 text-paragraph-sm text-text-sub-600">
              🇬🇭 GHS — Ghana Cedi
              <span className="ml-auto text-label-xs text-text-disabled-300">Default</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label.Root>Type</Label.Root>
            <div className="flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2.5 text-paragraph-sm text-text-sub-600">
              <span className="rounded-full bg-primary-alpha-10 px-2 py-0.5 text-label-xs text-primary-base font-medium">MASTER</span>
              Organization-level wallet
            </div>
          </div>

          {!walletCreated ? (
            <FancyButton.Root type="submit" variant="primary" disabled={isLoading} className="mt-2">
              {creating ? 'Creating wallet...' : 'Create Master Wallet'}
            </FancyButton.Root>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-success-lighter px-4 py-3 text-label-sm text-success-dark">
              <RiCheckboxCircleFill className="size-4 text-success-base" />
              Master wallet ready!
            </div>
          )}
        </form>

        {/* Right: Card Preview */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-label-xs text-text-soft-400 uppercase tracking-wide">Preview</p>

          {/* Master wallet card - dark theme like PhysicalCard */}
          <div
            className={cnExt(
              'relative flex h-[188px] w-full max-w-96 shrink-0 flex-col gap-3 rounded-2xl p-5 pb-[18px]',
              'transition-all duration-500',
              walletCreated
                ? 'bg-primary-dark shadow-lg shadow-primary-base/30 scale-105'
                : 'bg-stroke-strong-950',
            )}
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconChip className="size-8 h-6 shrink-0 text-warning-light" />
                <RiWifiLine className="size-6 rotate-90 text-text-soft-400" />
              </div>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-label-xs text-static-white font-medium">
                MASTER
              </span>
            </div>

            {/* Bottom row */}
            <div className="mt-auto flex flex-col gap-1">
              <div className="text-paragraph-sm text-white/50">
                {org?.name || 'Your Organization'}
              </div>
              <div className="text-title-h5 text-static-white truncate">
                {walletName || 'Main Wallet'}
              </div>
              <div className="text-paragraph-xs text-white/40 mt-0.5">
                {walletCreated ? (
                  <span className="flex items-center gap-1 text-success-light">
                    <RiCheckboxCircleFill className="size-3" /> Active
                  </span>
                ) : (
                  '₵ 0.00 · GHS'
                )}
              </div>
            </div>

            <SVGCardBg className="absolute right-0 top-0" />
          </div>

          <p className="text-paragraph-xs text-text-soft-400 text-center max-w-xs">
            You can fund this wallet from the dashboard after setup is complete.
          </p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t border-stroke-soft-200 pt-6">
        <button type="button" onClick={onBack} className="text-label-sm text-text-sub-600 hover:text-text-strong-950 transition-colors">
          Back
        </button>
        <FancyButton.Root
          variant="primary"
          onClick={onFinish}
          disabled={!walletCreated || isLoading}
        >
          {loading ? 'Finishing setup...' : 'Finish setup →'}
        </FancyButton.Root>
      </div>
    </div>
  );
}
