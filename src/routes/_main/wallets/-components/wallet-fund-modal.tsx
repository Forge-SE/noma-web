import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { RiAddLine } from '@remixicon/react';

import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Textarea from '@/components/ui/textarea';
import * as FancyButton from '@/components/ui/fancy-button';
import { useToast } from '@/components/ui/toaster';

import {
  CREATE_LEDGER_ENTRY_MUTATION,
  GET_WALLET_DETAIL,
  GET_LEDGER_ENTRIES,
} from '@/graphql/wallets.graphql';

interface WalletFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletId: string;
}

export function WalletFundModal({ isOpen, onClose, walletId }: WalletFundModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = React.useState('');
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDescription('');
    }
  }, [isOpen]);

  const [createEntry, { loading }] = useMutation(CREATE_LEDGER_ENTRY_MUTATION);

  const numericAmount = parseFloat(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId || isNaN(numericAmount) || numericAmount <= 0) return;
    try {
      await createEntry({
        variables: {
          input: {
            walletId,
            entryType: 'FUND',
            amount: Math.round(numericAmount * 100),
            direction: 'CREDIT',
            description: description || null,
          },
        },
        refetchQueries: [
          { query: GET_WALLET_DETAIL, variables: { id: walletId } },
          { query: GET_LEDGER_ENTRIES, variables: { walletId } },
        ],
      });
      toast({ title: 'Success', description: 'Wallet funded successfully.', status: 'success' });
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content className='max-w-[480px]'>
        <Modal.Header
          title='Fund Wallet'
          description='Add funds to this wallet.'
        />

        <form onSubmit={handleSubmit}>
          <Modal.Body className='flex flex-col gap-5'>
            <div className='flex flex-col gap-1.5'>
              <Label.Root>
                Amount <Label.Asterisk />
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={RiAddLine} />
                  <Input.Input
                    type='number'
                    step='0.01'
                    min='0'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='0.00'
                    required
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div className='flex flex-col gap-1.5'>
              <Label.Root>Description</Label.Root>
              <Textarea.Root
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Optional note...'
                simple
              />
            </div>
          </Modal.Body>

          <Modal.Footer>
            <FancyButton.Root type='button' variant='basic' onClick={onClose}>
              Cancel
            </FancyButton.Root>
            <FancyButton.Root
              type='submit'
              variant='primary'
              disabled={loading || isNaN(numericAmount) || numericAmount <= 0}
            >
              {loading ? 'Funding...' : 'Fund Wallet'}
            </FancyButton.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
