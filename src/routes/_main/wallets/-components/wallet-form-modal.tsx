import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import { RiWalletLine } from '@remixicon/react';

import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as FancyButton from '@/components/ui/fancy-button';
import { useToast } from '@/components/ui/toaster';
import { currentOrganizationAtom } from '@/store/auth.store';

import {
  CREATE_WALLET_MUTATION,
  GET_WALLETS,
} from '@/graphql/wallets.graphql';

const TYPE_OPTIONS = [
  { value: 'MASTER', label: 'Master' },
  { value: 'DEPARTMENT', label: 'Department' },
  { value: 'EMPLOYEE', label: 'Employee' },
];

interface WalletFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletFormModal({ isOpen, onClose }: WalletFormModalProps) {
  const currentOrganization = useAtomValue(currentOrganizationAtom);
  const { toast } = useToast();
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState('DEPARTMENT');

  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setType('DEPARTMENT');
    }
  }, [isOpen]);

  const [createWallet, { loading }] = useMutation(CREATE_WALLET_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;
    try {
      await createWallet({
        variables: {
          input: {
            organizationId: currentOrganization.id,
            name,
            type,
          },
        },
        refetchQueries: [
          {
            query: GET_WALLETS,
            variables: { organizationId: currentOrganization.id },
          },
        ],
      });
      toast({ title: 'Success', description: 'Wallet created successfully.', status: 'success' });
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className='max-w-[480px]'>
        <Modal.Header>
          <Modal.Title>Create Wallet</Modal.Title>
          <Modal.Description>Add a new wallet to your organization.</Modal.Description>
        </Modal.Header>

        <form onSubmit={handleSubmit}>
          <Modal.Body className='flex flex-col gap-5'>
            <div className='flex flex-col gap-1.5'>
              <Label.Root>
                Wallet Name <Label.Asterisk />
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={RiWalletLine} />
                  <Input.Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='e.g. Marketing Dept Wallet'
                    required
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div className='flex flex-col gap-1.5'>
              <Label.Root>
                Type <Label.Asterisk />
              </Label.Root>
              <Select.Root value={type} onValueChange={setType}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {TYPE_OPTIONS.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <FancyButton.Root type='submit' variant='primary' disabled={loading}>
              {loading ? 'Creating...' : 'Create Wallet'}
            </FancyButton.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
