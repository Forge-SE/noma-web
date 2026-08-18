import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import { format } from 'date-fns';
import {
  RiArrowLeftSLine,
  RiAddLine,
  RiWalletLine,
  RiWifiLine,
  RiCheckboxCircleFill,
  RiSnowflakeLine,
  RiSunLine,
  RiArrowDownSFill,
  RiArrowUpSFill,
  RiExpandUpDownFill,
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiExternalLinkLine,
} from '@remixicon/react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';

import { cn } from '@/utils/cn';
import { formatMoney } from '@/utils/currency';
import Header from '@/components/header';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as StatusBadge from '@/components/ui/status-badge';
import * as ButtonGroup from '@/components/ui/button-group';
import * as Tabs from '@/components/ui/tab-menu-horizontal';
import * as Button from '@/components/ui/button';
import * as Divider from '@/components/ui/divider';
import * as FancyButton from '@/components/ui/fancy-button';
import * as Pagination from '@/components/ui/pagination';
import * as Select from '@/components/ui/select';
import * as Tooltip from '@/components/ui/tooltip';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/components/ui/toaster';
import { sessionAtom } from '@/store/auth.store';
import { WalletFundModal } from '../-components/wallet-fund-modal';

import {
  GET_WALLET_DETAIL,
  GET_LEDGER_ENTRIES,
  UPDATE_WALLET_STATUS_MUTATION,
} from '@/graphql/wallets.graphql';

export const Route = createFileRoute('/_main/wallets/$id')({
  component: WalletDetailPage,
});

function getDirectionDisplay(direction: string): { label: string; color: 'green' | 'red' } {
  return direction === 'CREDIT'
    ? { label: 'Credit', color: 'green' }
    : { label: 'Debit', color: 'red' };
}

function getSortingIcon(state: 'asc' | 'desc' | false) {
  if (state === 'asc')
    return <RiArrowUpSFill className='size-5 text-text-sub-600' />;
  if (state === 'desc')
    return <RiArrowDownSFill className='size-5 text-text-sub-600' />;
  return <RiExpandUpDownFill className='size-5 text-text-sub-600' />;
}

function SVGCardBg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='94' height='129' fill='none' viewBox='0 0 94 129' {...props}>
      <path className='stroke-stroke-soft-200' d='M137.386-140.5h159.669c7.952 0 12.866 8.673 8.779 15.494L196.6 57.309A20.966 20.966 0 0 1 178.614 67.5H18.944c-7.951 0-12.865-8.673-8.778-15.494L119.4-130.309a20.966 20.966 0 0 1 17.986-10.191Z' />
      <path className='stroke-stroke-soft-200' d='M175.386-79.5h159.669c7.952 0 12.866 8.673 8.779 15.494L234.6 118.309a20.966 20.966 0 0 1-17.986 10.191H56.944c-7.952 0-12.865-8.673-8.778-15.494L157.4-69.309A20.966 20.966 0 0 1 175.386-79.5Z' />
    </svg>
  );
}

function WalletCard({
  name,
  balance,
  status,
  walletId,
  createdAt,
}: {
  name: string;
  balance: number;
  status: string;
  walletId: string;
  createdAt: string;
}) {
  const [flipped, setFlipped] = React.useState(false);
  const prevRef = React.useRef(0);

  const handleFlip = (direction: 'prev' | 'next') => {
    prevRef.current = flipped ? 1 : 0;
    setFlipped((p) => (direction === 'prev' ? false : true));
  };

  return (
    <div className='relative mx-auto w-full max-w-96 [perspective:1000px] [transform-style:preserve-3d]'>
      <div
        className={cn(
          'relative flex h-[188px] w-full shrink-0 flex-col gap-3 rounded-2xl bg-bg-white-0 p-5 pb-[18px] ring-1 ring-inset ring-stroke-soft-200',
          'transition-all duration-700 [backface-visibility:hidden] [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(0.4,0.2,0.2,1)]',
          flipped ? '[transform:rotateY(180deg)]' : '',
        )}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <RiWifiLine className='size-6 rotate-90 text-text-soft-400' />
            </div>
            {status === 'ACTIVE' ? (
              <StatusBadge.Root variant='stroke' status='completed'>
                <StatusBadge.Icon as={RiCheckboxCircleFill} />
                Active
              </StatusBadge.Root>
            ) : (
              <StatusBadge.Root variant='stroke' status='disabled'>
                <StatusBadge.Icon as={RiSnowflakeLine} />
                Frozen
              </StatusBadge.Root>
            )}
          </div>
          <img
            src='/images/major-brands/mastercard.svg'
            alt=''
            className='size-8'
          />
        </div>

        <div className='mt-auto flex flex-col gap-1'>
          <div className='text-paragraph-sm text-text-sub-600'>{name}</div>
          <div className='text-title-h4'>{formatMoney(balance)}</div>
        </div>

        <SVGCardBg className='absolute right-0 top-0' />

        <ButtonGroup.Root size='xxsmall' className='absolute bottom-4 right-4'>
          <ButtonGroup.Item disabled={!flipped} onClick={() => handleFlip('prev')}>
            <ButtonGroup.Icon as={RiArrowLeftSLine} />
          </ButtonGroup.Item>
          <ButtonGroup.Item disabled={flipped} onClick={() => handleFlip('next')}>
            <ButtonGroup.Icon as={RiArrowRightSLine} />
          </ButtonGroup.Item>
        </ButtonGroup.Root>
      </div>

      {/* Back */}
      <div
        className={cn(
          'absolute inset-0 flex h-[188px] w-full shrink-0 flex-col gap-3 rounded-2xl bg-bg-white-0 p-5 pb-[18px] ring-1 ring-inset ring-stroke-soft-200',
          'transition-all duration-700 [backface-visibility:hidden] [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(0.4,0.2,0.2,1)] [transform:rotateY(180deg)]',
          flipped ? '[transform:rotateY(360deg)]' : '',
        )}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <RiWalletLine className='size-5 text-text-sub-600' />
            <span className='text-label-xs text-text-soft-400 uppercase tracking-wide'>Wallet Details</span>
          </div>
          <img
            src='/images/major-brands/mastercard.svg'
            alt=''
            className='size-8'
          />
        </div>

        <div className='mt-auto flex flex-col gap-1.5'>
          <div className='flex items-center justify-between text-paragraph-xs'>
            <span className='text-text-soft-400'>Wallet ID</span>
            <span className='text-text-sub-600 font-mono'>{walletId.slice(0, 12)}...</span>
          </div>
          <div className='flex items-center justify-between text-paragraph-xs'>
            <span className='text-text-soft-400'>Created</span>
            <span className='text-text-sub-600'>{createdAt ? format(new Date(createdAt), 'MMM d, yyyy') : '—'}</span>
          </div>
          <div className='flex items-center justify-between text-paragraph-xs'>
            <span className='text-text-soft-400'>Currency</span>
            <span className='text-text-sub-600'>GHS</span>
          </div>
        </div>

        <SVGCardBg className='absolute right-0 top-0' />

        <ButtonGroup.Root size='xxsmall' className='absolute bottom-4 right-4'>
          <ButtonGroup.Item disabled={!flipped} onClick={() => handleFlip('prev')}>
            <ButtonGroup.Icon as={RiArrowLeftSLine} />
          </ButtonGroup.Item>
          <ButtonGroup.Item disabled={flipped} onClick={() => handleFlip('next')}>
            <ButtonGroup.Icon as={RiArrowRightSLine} />
          </ButtonGroup.Item>
        </ButtonGroup.Root>
      </div>
    </div>
  );
}

function ReferenceLink({ referenceType, referenceId }: { referenceType: string | null; referenceId: string | null }) {
  if (!referenceType || !referenceId) {
    return <span className='text-paragraph-sm text-text-disabled-300'>—</span>;
  }

  let href = '#';
  let label = `${referenceType} #${referenceId.slice(0, 8)}`;

  if (referenceType === 'SPEND_REQUEST') {
    href = `/spend-requests/${referenceId}`;
    label = `Spend Request #${referenceId.slice(0, 8)}`;
  }

  return (
    <a
      href={href}
      onClick={(e) => { e.stopPropagation(); }}
      className='inline-flex items-center gap-1 text-paragraph-sm text-primary-base hover:text-primary-dark transition-colors'
    >
      {label}
      <RiExternalLinkLine className='size-3.5' />
    </a>
  );
}

function WalletDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const session = useAtomValue(sessionAtom);
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [activeTab, setActiveTab] = React.useState('ledger');
  const [ledgerPage, setLedgerPage] = React.useState(1);
  const [ledgerPageSize, setLedgerPageSize] = React.useState(10);
  const [showFundModal, setShowFundModal] = React.useState(false);

  const { data: walletData, loading: walletLoading } = useQuery(GET_WALLET_DETAIL, {
    variables: { id },
    skip: !id,
  });

  const wallet = (walletData as any)?.wallet;

  const { data: ledgerData, loading: ledgerLoading } = useQuery(GET_LEDGER_ENTRIES, {
    variables: { walletId: id },
    skip: !id,
  });

  const ledgerEntries = (ledgerData as any)?.ledgerEntries || [];

  const [updateStatus, { loading: updatingStatus }] = useMutation(UPDATE_WALLET_STATUS_MUTATION);

  const isAdmin = session?.role === 'ADMIN' || session?.role === 'OWNER';

  const totalLedgerPages = Math.max(1, Math.ceil(ledgerEntries.length / ledgerPageSize));
  const paginatedLedger = ledgerEntries.slice(
    (ledgerPage - 1) * ledgerPageSize,
    ledgerPage * ledgerPageSize,
  );

  const handleLedgerPageChange = (page: number) => setLedgerPage(page);

  const ledgerColumns: ColumnDef<any>[] = [
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <button type='button' className='flex items-center gap-1' onClick={() => column.toggleSorting()}>
          Date
          {getSortingIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => (
        <span className='text-paragraph-sm text-text-sub-600'>
          {row.original.createdAt ? format(new Date(row.original.createdAt), 'MMM d, yyyy HH:mm') : '—'}
        </span>
      ),
    },
    {
      id: 'entryType',
      accessorKey: 'entryType',
      header: 'Type',
      cell: ({ row }) => (
        <StatusBadge.Root variant='stroke'>
          {row.original.entryType?.replace(/_/g, ' ') || '—'}
        </StatusBadge.Root>
      ),
    },
    {
      id: 'direction',
      accessorKey: 'direction',
      header: 'Direction',
      cell: ({ row }) => {
        const dir = getDirectionDisplay(row.original.direction);
        return (
          <Badge.Root variant='lighter' color={dir.color} size='medium'>
            <Badge.Dot />
            {dir.label}
          </Badge.Root>
        );
      },
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: ({ column }) => (
        <button type='button' className='flex items-center gap-1' onClick={() => column.toggleSorting()}>
          Amount
          {getSortingIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => {
        const amount = row.original.amount;
        const dir = row.original.direction;
        return (
          <span className={cn(
            'text-paragraph-sm font-medium',
            dir === 'CREDIT' ? 'text-success-base' : 'text-error-base',
          )}>
            {dir === 'CREDIT' ? '+' : '-'}{formatMoney(amount)}
          </span>
        );
      },
      meta: { className: 'text-right' },
    },
    {
      id: 'reference',
      header: 'Reference',
      cell: ({ row }) => (
        <ReferenceLink
          referenceType={row.original.referenceType}
          referenceId={row.original.referenceId}
        />
      ),
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className='text-paragraph-sm text-text-sub-600'>
          {row.original.description || '—'}
        </span>
      ),
    },
  ];

  const ledgerTable = useReactTable({
    data: paginatedLedger,
    columns: ledgerColumns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  const handleFreezeToggle = async () => {
    if (!wallet) return;
    const newStatus = wallet.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
    try {
      await updateStatus({
        variables: { id: wallet.id, status: newStatus },
        refetchQueries: [
          { query: GET_WALLET_DETAIL, variables: { id: wallet.id } },
        ],
      });
      toast({
        title: 'Success',
        description: `Wallet ${newStatus === 'FROZEN' ? 'frozen' : 'unfrozen'} successfully.`,
        status: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  const handleFundWallet = () => {
    setShowFundModal(true);
  };

  if (walletLoading) {
    return <Loader fullScreen />;
  }

  if (!wallet) {
    return (
      <div className='flex flex-1 items-center justify-center px-4 py-12'>
        <p className='text-paragraph-md text-text-sub-600'>Wallet not found.</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiWalletLine className='size-6 text-text-sub-600' />
          </div>
        }
        title={wallet.name}
        description={`${wallet.type} · ${formatMoney(wallet.balance)}`}
      >
        <StatusBadge.Root variant='stroke'>
          {wallet.status === 'ACTIVE' ? (
            <StatusBadge.Icon as={RiCheckboxCircleFill} />
          ) : (
            <StatusBadge.Icon as={RiSnowflakeLine} />
          )}
          {wallet.status}
        </StatusBadge.Root>
        {isAdmin && (
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button.Root
                  variant='neutral'
                  mode='stroke'
                  disabled={updatingStatus}
                  onClick={handleFreezeToggle}
                >
                  <Button.Icon as={wallet.status === 'ACTIVE' ? RiSnowflakeLine : RiSunLine} />
                  {wallet.status === 'ACTIVE' ? 'Freeze Wallet' : 'Unfreeze'}
                </Button.Root>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {wallet.status === 'ACTIVE' ? 'Freeze this wallet to prevent transactions' : 'Reactivate this wallet'}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}
        <Button.Root
          variant='neutral'
          mode='stroke'
          size='small'
          onClick={() => navigate({ to: '/wallets' })}
        >
          <Button.Icon as={RiArrowLeftSLine} />
          Back
        </Button.Root>
        <FancyButton.Root variant='primary' onClick={handleFundWallet}>
          <FancyButton.Icon as={RiAddLine} />
          Fund Wallet
        </FancyButton.Root>
      </Header>

      <div className='px-4 lg:px-8'>
        <Divider.Root />
      </div>

      <div className='flex flex-col gap-8 px-4 pb-8 pt-6'>
        {/* Wallet Card */}
        <WalletCard
          name={wallet.name}
          balance={wallet.balance}
          status={wallet.status}
          walletId={wallet.id}
          createdAt={wallet.createdAt}
        />

        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value='ledger'>Ledger</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value='ledger' className='pt-4'>
            {/* Ledger Table */}
            <Table.Root className='[&>table]:min-w-[900px]'>
              <Table.Header className='whitespace-nowrap'>
                {ledgerTable.getHeaderGroups().map((headerGroup) => (
                  <Table.Row key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Table.Head
                        key={header.id}
                        className={header.column.columnDef.meta?.className}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </Table.Head>
                    ))}
                  </Table.Row>
                ))}
              </Table.Header>
              <Table.Body>
                {ledgerLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan={ledgerColumns.length} className='h-48'>
                      <Loader />
                    </Table.Cell>
                  </Table.Row>
                ) : ledgerEntries.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={ledgerColumns.length} className='h-48'>
                      <div className='flex h-full flex-col items-center justify-center gap-2'>
                        <RiWalletLine className='size-6 text-text-soft-400' />
                        <p className='text-paragraph-sm text-text-sub-600'>No ledger entries yet.</p>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  ledgerTable.getRowModel().rows.map((row, i, arr) => (
                    <React.Fragment key={row.id}>
                      <Table.Row>
                        {row.getVisibleCells().map((cell) => (
                          <Table.Cell
                            key={cell.id}
                            className={cn(
                              'h-12',
                              cell.column.columnDef.meta?.className,
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Table.Cell>
                        ))}
                      </Table.Row>
                      {i < arr.length - 1 && <Table.RowDivider />}
                    </React.Fragment>
                  ))
                )}
              </Table.Body>
            </Table.Root>

            {/* Ledger Pagination */}
            {!ledgerLoading && ledgerEntries.length > 0 && (
              <div className='mt-4 flex items-center justify-between gap-3 border-t border-stroke-soft-200 pt-4'>
                <span className='flex-1 whitespace-nowrap text-paragraph-xs text-text-sub-600'>
                  Page {ledgerPage} of {totalLedgerPages}
                </span>

                <Pagination.Root>
                  <Pagination.NavButton onClick={() => handleLedgerPageChange(1)} disabled={ledgerPage === 1}>
                    <Pagination.NavIcon as={RiArrowLeftDoubleLine} />
                  </Pagination.NavButton>
                  <Pagination.NavButton onClick={() => handleLedgerPageChange(Math.max(ledgerPage - 1, 1))} disabled={ledgerPage === 1}>
                    <Pagination.NavIcon as={RiArrowLeftSLine} />
                  </Pagination.NavButton>

                  {Array.from({ length: totalLedgerPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalLedgerPages || Math.abs(p - ledgerPage) <= 1)
                    .map((p, idx, arr) => {
                      const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && <Pagination.Item disabled>...</Pagination.Item>}
                          <Pagination.Item current={p === ledgerPage} onClick={() => handleLedgerPageChange(p)}>
                            {p}
                          </Pagination.Item>
                        </React.Fragment>
                      );
                    })}

                  <Pagination.NavButton onClick={() => handleLedgerPageChange(Math.min(ledgerPage + 1, totalLedgerPages))} disabled={ledgerPage === totalLedgerPages}>
                    <Pagination.NavIcon as={RiArrowRightSLine} />
                  </Pagination.NavButton>
                  <Pagination.NavButton onClick={() => handleLedgerPageChange(totalLedgerPages)} disabled={ledgerPage === totalLedgerPages}>
                    <Pagination.NavIcon as={RiArrowRightDoubleLine} />
                  </Pagination.NavButton>
                </Pagination.Root>

                <div className='flex flex-1 justify-end'>
                  <Select.Root size='xsmall' value={String(ledgerPageSize)} onValueChange={(val) => setLedgerPageSize(Number(val))}>
                    <Select.Trigger className='w-auto'>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value='5'>5 / page</Select.Item>
                      <Select.Item value='10'>10 / page</Select.Item>
                      <Select.Item value='25'>25 / page</Select.Item>
                      <Select.Item value='50'>50 / page</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <WalletFundModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
        walletId={id}
      />
    </>
  );
}
