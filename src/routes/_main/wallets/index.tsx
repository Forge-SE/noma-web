import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import {
  RiWalletLine,
  RiSearch2Line,
  RiAddLine,
  RiArrowDownSFill,
  RiArrowUpSFill,
  RiExpandUpDownFill,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiSubtractLine,
  RiEyeLine,
  RiEditLine,
  RiExpandDiagonal2Line,
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
import * as Pagination from '@/components/ui/pagination';
import * as Select from '@/components/ui/select';
import * as Divider from '@/components/ui/divider';
import * as FancyButton from '@/components/ui/fancy-button';
import * as Input from '@/components/ui/input';
import * as Tooltip from '@/components/ui/tooltip';
import { Loader } from '@/components/ui/loader';
import { currentOrganizationAtom } from '@/store/auth.store';
import { useModalParams } from '@/hooks/use-modal-params';

import { GET_WALLETS } from '@/graphql/wallets.graphql';
import { WalletFormModal } from './-components/wallet-form-modal';
import { WalletViewModal } from './-components/wallet-view-modal';

export const Route = createFileRoute('/_main/wallets/')({
  component: WalletsPage,
});

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'MASTER', label: 'Master' },
  { value: 'DEPARTMENT', label: 'Department' },
  { value: 'EMPLOYEE', label: 'Employee' },
];

function getSortingIcon(state: 'asc' | 'desc' | false) {
  if (state === 'asc')
    return <RiArrowUpSFill className='size-5 text-text-sub-600' />;
  if (state === 'desc')
    return <RiArrowDownSFill className='size-5 text-text-sub-600' />;
  return <RiExpandUpDownFill className='size-5 text-text-sub-600' />;
}

function getWalletStatusColor(status: string): 'green' | 'orange' | 'red' | 'gray' {
  switch (status) {
    case 'ACTIVE': return 'green';
    case 'FROZEN': return 'red';
    case 'CLOSED': return 'gray';
    default: return 'gray';
  }
}

function getOwnerLabel(type: string, departmentId: string | null): string {
  if (type === 'MASTER') return 'Organization';
  if (type === 'DEPARTMENT' && departmentId) return `Dept. ${departmentId.slice(0, 8)}`;
  if (type === 'EMPLOYEE') return 'Employee';
  return '—';
}

function WalletsPage() {
  const currentOrganization = useAtomValue(currentOrganizationAtom);
  const navigate = useNavigate();
  const { activeModal, modalId, openModal, closeModal } = useModalParams();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const { data, loading, refetch } = useQuery(GET_WALLETS, {
    variables: { organizationId: currentOrganization?.id },
    skip: !currentOrganization?.id,
  });

  const wallets = (data as any)?.wallets || [];

  const viewingWallet = activeModal === 'view-wallet' && modalId
    ? wallets.find((w: any) => w.id === modalId) ?? null
    : null;

  const filtered = React.useMemo(() => {
    let result = wallets;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((w: any) =>
        w.name?.toLowerCase().includes(q),
      );
    }
    if (typeFilter) {
      result = result.filter((w: any) => w.type === typeFilter);
    }
    return result;
  }, [wallets, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedData = React.useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, pageSize]);

  const handleRowClick = (wallet: any) => {
    navigate({ to: '/wallets/$id', params: { id: wallet.id } });
  };

  const handleViewWallet = (e: React.MouseEvent, wallet: any) => {
    e.stopPropagation();
    openModal('view-wallet', wallet.id);
  };

  const handleExpandWallet = (e: React.MouseEvent, wallet: any) => {
    e.stopPropagation();
    navigate({ to: '/wallets/$id', params: { id: wallet.id } });
  };

  const handleEditWallet = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <div className='flex items-center gap-0.5 text-label-xs font-semibold text-text-sub-600'>
          Name
          <button
            type='button'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {getSortingIcon(column.getIsSorted())}
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <span className='text-paragraph-sm font-medium text-text-strong-950'>
          {row.original.name}
        </span>
      ),
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: () => <span className='text-label-xs font-semibold text-text-sub-600'>Type</span>,
      cell: ({ row }) => (
        <StatusBadge.Root variant='stroke'>
          {row.original.type}
        </StatusBadge.Root>
      ),
    },
    {
      id: 'owner',
      accessorKey: 'owner',
      header: () => <span className='text-label-xs font-semibold text-text-sub-600'>Owner</span>,
      cell: ({ row }) => (
        <span className='text-paragraph-sm text-text-sub-600'>
          {getOwnerLabel(row.original.type, row.original.departmentId)}
        </span>
      ),
    },
    {
      id: 'balance',
      accessorKey: 'balance',
      header: ({ column }) => (
        <div className='flex w-full items-center gap-0.5 justify-end text-label-xs font-semibold text-text-sub-600'>
          Balance
          <button
            type='button'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {getSortingIcon(column.getIsSorted())}
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <span className='text-paragraph-sm font-medium text-text-strong-950'>
          {formatMoney(row.original.balance, 'GHS')}
        </span>
      ),
      meta: { className: 'text-right' },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: () => <span className='text-label-xs font-semibold text-text-sub-600'>Status</span>,
      cell: ({ row }) => {
        const status = row.original.status;
        const isAbsent = status === 'FROZEN' || status === 'CLOSED';
        if (isAbsent) {
          return (
            <Badge.Root variant='lighter' color={getWalletStatusColor(status)} size='medium'>
              <Badge.Icon as={RiSubtractLine} />
              {status}
            </Badge.Root>
          );
        }
        return (
          <Badge.Root variant='lighter' color={getWalletStatusColor(status)} size='medium'>
            <Badge.Dot />
            {status}
          </Badge.Root>
        );
      },
    },
    {
      id: 'currency',
      accessorKey: 'currency',
      header: () => <span className='text-label-xs font-semibold text-text-sub-600'>Currency</span>,
      cell: () => (
        <span className='text-paragraph-sm text-text-sub-600'>GHS</span>
      ),
    },
    {
      id: 'actionsColumn',
      enableHiding: false,
      cell: ({ row }) => {
        const wallet = row.original;
        return (
          <Tooltip.Provider>
            <div className='flex items-center gap-1.5 justify-end'>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    type='button'
                    onClick={(e) => handleViewWallet(e, wallet)}
                    className='flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus:outline-none focus:ring-2 focus:ring-stroke-strong-950'
                  >
                    <RiEyeLine className='size-5' />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content>View Wallet</Tooltip.Content>
              </Tooltip.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    type='button'
                    onClick={(e) => handleExpandWallet(e, wallet)}
                    className='flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus:outline-none focus:ring-2 focus:ring-stroke-strong-950'
                  >
                    <RiExpandDiagonal2Line className='size-5' />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content>Expand</Tooltip.Content>
              </Tooltip.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    type='button'
                    onClick={(e) => handleEditWallet(e)}
                    className='flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus:outline-none focus:ring-2 focus:ring-stroke-strong-950'
                  >
                    <RiEditLine className='size-5' />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content>Edit Wallet</Tooltip.Content>
              </Tooltip.Root>
            </div>
          </Tooltip.Provider>
        );
      },
      meta: { className: 'px-5 w-0' },
    },
  ], [navigate]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <>
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiWalletLine className='size-6 text-text-sub-600' />
          </div>
        }
        title='Wallets'
        description='Manage your organization wallets and balances.'
      >
        <FancyButton.Root
          variant='primary'
          onClick={() => setShowCreateModal(true)}
        >
          <FancyButton.Icon as={RiAddLine} />
          Add Wallet
        </FancyButton.Root>
      </Header>

      <div className='px-4 lg:px-8'>
        <Divider.Root />
      </div>

      <div className='flex flex-1 flex-col gap-4 px-4 pb-6 pt-8 lg:px-8'>
        {/* Filters */}
        <div className='flex flex-col justify-between gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3'>
          <Input.Root size='small' className='w-[300px]'>
            <Input.Wrapper>
              <Input.Icon as={RiSearch2Line} />
              <Input.Input
                placeholder='Search wallets...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Input.Wrapper>
          </Input.Root>

          <div className='flex flex-wrap gap-3'>
            <Select.Root size='small' value={typeFilter} onValueChange={setTypeFilter}>
              <Select.Trigger className='w-auto flex-1 min-[560px]:flex-none'>
                <Select.Value placeholder='All Types' />
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
        </div>

        {/* Table */}
        <Table.Root className='[&>table]:min-w-[1000px]'>
          <Table.Header className='whitespace-nowrap'>
            {table.getHeaderGroups().map((headerGroup) => (
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
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length} className='h-48'>
                  <Loader />
                </Table.Cell>
              </Table.Row>
            ) : table.getRowModel().rows?.length > 0 ? (
              table.getRowModel().rows.map((row, i, arr) => (
                <React.Fragment key={row.id}>
                  <Table.Row
                    data-state={row.getIsSelected() && 'selected'}
                    className='cursor-pointer'
                    onClick={() => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Table.Cell
                        key={cell.id}
                        className={cn(
                          'h-14',
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
            ) : (
              <Table.Row>
                <Table.Cell colSpan={columns.length} className='h-[400px]'>
                  <div className='flex h-full flex-col items-center justify-center gap-4 text-center'>
                    <div className='flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
                      <RiWalletLine className='size-6 text-text-sub-600' />
                    </div>
                    <div>
                      <p className='text-label-md text-text-strong-950'>
                        No wallets found
                      </p>
                      <p className='text-paragraph-sm text-text-sub-600 mt-1'>
                        {typeFilter || search ? 'Try adjusting your filters.' : 'Create your first wallet to get started.'}
                      </p>
                      {!typeFilter && !search && (
                        <FancyButton.Root
                          variant='primary'
                          onClick={() => setShowCreateModal(true)}
                          className='mt-4'
                        >
                          <FancyButton.Icon as={RiAddLine} />
                          Add Wallet
                        </FancyButton.Root>
                      )}
                    </div>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className='mt-2 flex items-center justify-between gap-3 border-t border-stroke-soft-200 pt-4'>
            <span className='flex-1 whitespace-nowrap text-paragraph-xs text-text-sub-600'>
              Page {currentPage} of {totalPages}
            </span>

            <Pagination.Root>
              <Pagination.NavButton
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <Pagination.NavIcon as={RiArrowLeftDoubleLine} />
              </Pagination.NavButton>
              <Pagination.NavButton
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <Pagination.NavIcon as={RiArrowLeftSLine} />
              </Pagination.NavButton>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <Pagination.Item disabled>...</Pagination.Item>}
                      <Pagination.Item
                        current={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    </React.Fragment>
                  );
                })}

              <Pagination.NavButton
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <Pagination.NavIcon as={RiArrowRightSLine} />
              </Pagination.NavButton>
              <Pagination.NavButton
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <Pagination.NavIcon as={RiArrowRightDoubleLine} />
              </Pagination.NavButton>
            </Pagination.Root>

            <div className='flex flex-1 justify-end'>
              <Select.Root
                size='xsmall'
                value={String(pageSize)}
                onValueChange={(val) => setPageSize(Number(val))}
              >
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
      </div>

      <WalletFormModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); refetch(); }}
      />

      <WalletViewModal
        isOpen={activeModal === 'view-wallet'}
        onClose={closeModal}
        wallet={viewingWallet}
      />
    </>
  );
}
