import * as React from 'react';
import {
  RiHistoryLine,
  RiSearch2Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiCodeBoxLine,
} from '@remixicon/react';
import { useQuery } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';

import { cn } from '@/utils/cn';
import Header from '@/components/header';
import * as Divider from '@/components/ui/divider';
import * as Table from '@/components/ui/table';
import * as Avatar from '@/components/ui/avatar';
import * as Badge from '@/components/ui/badge';
import * as Pagination from '@/components/ui/pagination';
import * as Select from '@/components/ui/select';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/components/ui/toaster';
import { currentOrganizationAtom } from '@/store/auth.store';

import { GET_AUDIT_LOGS, GET_USERS } from '@/graphql/audit.graphql';

interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actor: { id: string; name: string } | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface AuditLogResult {
  items: AuditLogEntry[];
  total: number;
}

interface UserOption {
  id: string;
  name: string;
}

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'user.created', label: 'User Created' },
  { value: 'user.updated', label: 'User Updated' },
  { value: 'user.deactivated', label: 'User Deactivated' },
  { value: 'user.reactivated', label: 'User Reactivated' },
  { value: 'department.created', label: 'Department Created' },
  { value: 'department.updated', label: 'Department Updated' },
  { value: 'department.deleted', label: 'Department Deleted' },
  { value: 'budget.created', label: 'Budget Created' },
  { value: 'budget.updated', label: 'Budget Updated' },
  { value: 'wallet.created', label: 'Wallet Created' },
  { value: 'wallet.updated', label: 'Wallet Updated' },
  { value: 'workflow.created', label: 'Workflow Created' },
  { value: 'workflow.updated', label: 'Workflow Updated' },
  { value: 'workflow.deleted', label: 'Workflow Deleted' },
  { value: 'policy.created', label: 'Policy Created' },
  { value: 'policy.updated', label: 'Policy Updated' },
  { value: 'policy.deleted', label: 'Policy Deleted' },
  { value: 'spend_request.submitted', label: 'Request Submitted' },
  { value: 'spend_request.approved', label: 'Request Approved' },
  { value: 'spend_request.rejected', label: 'Request Rejected' },
  { value: 'auth.login', label: 'Login' },
  { value: 'auth.logout', label: 'Logout' },
];

function formatAction(action: string): string {
  const opt = ACTION_OPTIONS.find((o) => o.value === action);
  if (opt) return opt.label;
  return action
    .replace(/_/g, ' ')
    .replace(/\./g, ' · ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getActionColor(action: string) {
  if (action.includes('deleted') || action.includes('deactivated')) return 'red';
  if (action.includes('created') || action.includes('approved') || action.includes('reactivated')) return 'green';
  if (action.includes('updated')) return 'blue';
  if (action.includes('rejected')) return 'red';
  if (action.includes('login') || action.includes('logout')) return 'purple';
  return 'gray';
}

function getEntityColor(entityType: string) {
  switch (entityType) {
    case 'user': return 'blue';
    case 'department': return 'orange';
    case 'budget': return 'green';
    case 'wallet': return 'teal';
    case 'workflow': return 'purple';
    case 'policy': return 'sky';
    case 'spend_request': return 'pink';
    default: return 'gray';
  }
}

function MetadataCell({ metadata }: { metadata: Record<string, unknown> | null }) {
  const [expanded, setExpanded] = React.useState(false);

  if (!metadata) return <span className='text-paragraph-sm text-text-soft-400'>—</span>;

  return (
    <div>
      <button
        type='button'
        onClick={() => setExpanded(!expanded)}
        className='flex items-center gap-1 text-paragraph-xs text-text-sub-600 hover:text-text-strong-950 transition-colors'
      >
        <RiCodeBoxLine className='size-4' />
        {expanded ? 'Hide' : 'View'} JSON
      </button>
      {expanded && (
        <pre className='mt-2 max-h-48 overflow-auto rounded-lg bg-bg-weak-50 p-3 text-paragraph-xs text-text-strong-950 whitespace-pre-wrap break-all ring-1 ring-inset ring-stroke-soft-200'>
          {JSON.stringify(metadata, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function AuditLogPage() {
  const { toast } = useToast();
  const currentOrganization = useAtomValue(currentOrganizationAtom);

  // Filters
  const [actorFilter, setActorFilter] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState('');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  // Fetch users for actor dropdown
  const { data: usersData } = useQuery(GET_USERS, {
    variables: { organizationId: currentOrganization?.id },
    skip: !currentOrganization?.id,
  });
  const users: UserOption[] = (usersData as any)?.users || [];

  // Build filter variables
  const filterVariables = React.useMemo(() => {
    const filter: Record<string, unknown> = {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    };
    if (actorFilter) filter.actorId = actorFilter;
    if (actionFilter) filter.action = actionFilter;
    if (dateRange?.from) filter.dateFrom = dateRange.from.toISOString();
    if (dateRange?.to) filter.dateTo = dateRange.to.toISOString();
    return filter;
  }, [actorFilter, actionFilter, dateRange, currentPage, pageSize]);

  const { data, loading, error, refetch } = useQuery(GET_AUDIT_LOGS, {
    variables: { filter: filterVariables },
    fetchPolicy: 'network-only',
  });

  React.useEffect(() => {
    if (error) {
      toast({ title: 'Error', description: 'Failed to load audit logs', status: 'error' });
    }
  }, [error, toast]);

  const auditLogsData = (data as any)?.auditLogs;
  const result: AuditLogResult = auditLogsData || { items: [], total: 0 };
  const totalPages = Math.ceil(result.total / pageSize) || 1;

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [actorFilter, actionFilter, dateRange, pageSize]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const columns = React.useMemo<ColumnDef<AuditLogEntry>[]>(() => [
    {
      id: 'actor',
      header: () => <span className='text-label-xs font-semibold text-text-sub-600'>Actor</span>,
      cell: ({ row }) => {
        const actor = row.original.actor;
        if (!actor) return <span className='text-paragraph-sm text-text-soft-400'>System</span>;
        return (
          <div className='flex items-center gap-2'>
            <Avatar.Root size='24' color='gray'>
              {actor.name.charAt(0)}
            </Avatar.Root>
            <span className='text-paragraph-sm font-medium text-text-strong-950'>
              {actor.name}
            </span>
          </div>
        );
      },
    },
    {
      id: 'action',
      header: () => <span className='text-label-xs font-semibold text-text-sub-600'>Action</span>,
      cell: ({ row }) => (
        <Badge.Root variant='light' color={getActionColor(row.original.action)}>
          {formatAction(row.original.action)}
        </Badge.Root>
      ),
    },
    {
      id: 'entity',
      header: () => <span className='text-label-xs font-semibold text-text-sub-600'>Entity</span>,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Badge.Root variant='stroke' color={getEntityColor(row.original.entityType)}>
            {row.original.entityType}
          </Badge.Root>
          {row.original.entityId && (
            <span className='font-mono text-paragraph-xs text-text-sub-600'>
              #{row.original.entityId.slice(0, 8)}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'metadata',
      header: () => <span className='text-label-xs font-semibold text-text-sub-600'>Metadata</span>,
      cell: ({ row }) => <MetadataCell metadata={row.original.metadata} />,
    },
    {
      id: 'createdAt',
      header: () => <span className='text-label-xs font-semibold text-text-sub-600'>Timestamp</span>,
      cell: ({ row }) => (
        <span className='text-paragraph-sm text-text-sub-600 whitespace-nowrap'>
          {format(new Date(row.original.createdAt), 'MMM d, yyyy · h:mm a')}
        </span>
      ),
    },
  ], []);

  const table = useReactTable({
    data: result.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const clearFilters = () => {
    setActorFilter('');
    setActionFilter('');
    setDateRange(undefined);
  };

  const hasActiveFilters = actorFilter !== '' || actionFilter !== '' || dateRange?.from != null;

  return (
    <>
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiHistoryLine className='size-6 text-text-sub-600' />
          </div>
        }
        title='Audit Log'
        description='View organization audit trail. This log is append-only and immutable.'
      />

      <div className='px-4 lg:px-8'>
        <Divider.Root />
      </div>

      <div className='flex flex-1 flex-col gap-4 px-4 pb-6 pt-8 lg:px-8'>
        {/* Toolbar / Filters */}
        <div className='flex flex-col justify-between gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3'>
          {/* Left: Search */}
          <Input.Root size='small' className='w-[300px]'>
            <Input.Wrapper>
              <Input.Icon as={RiSearch2Line} />
              <Input.Input placeholder='Search audit log...' />
            </Input.Wrapper>
          </Input.Root>

          {/* Right: Filters */}
          <div className='flex flex-wrap items-center gap-3'>
            <Select.Root size='small' value={actorFilter} onValueChange={setActorFilter}>
              <Select.Trigger className='w-auto min-w-[160px]'>
                <Select.Value placeholder='All Actors' />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value=''>All Actors</Select.Item>
                {users.map((u) => (
                  <Select.Item key={u.id} value={u.id}>
                    {u.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Select.Root size='small' value={actionFilter} onValueChange={setActionFilter}>
              <Select.Trigger className='w-auto min-w-[160px]'>
                <Select.Value placeholder='All Actions' />
              </Select.Trigger>
              <Select.Content>
                {ACTION_OPTIONS.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              buttonSize='small'
            />

            {hasActiveFilters && (
              <Button.Root variant='neutral' mode='stroke' size='small' onClick={clearFilters}>
                Clear Filters
              </Button.Root>
            )}

            <span className='text-paragraph-xs text-text-sub-600 whitespace-nowrap'>
              {result.total} {result.total === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        </div>

        {/* Table */}
        <Table.Root className='[&>table]:min-w-[900px]'>
          <Table.Header className='whitespace-nowrap'>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Head key={header.id}>
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
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, i, arr) => (
                <React.Fragment key={row.id}>
                  <Table.Row>
                    {row.getVisibleCells().map((cell) => (
                      <Table.Cell
                        key={cell.id}
                        className={cn('h-14', cell.column.columnDef.meta?.className)}
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
                      <RiHistoryLine className='size-6 text-text-sub-600' />
                    </div>
                    <div>
                      <p className='text-label-md text-text-strong-950'>
                        No audit entries found
                      </p>
                      <p className='text-paragraph-sm text-text-sub-600 mt-1'>
                        {hasActiveFilters
                          ? 'Try adjusting your filters.'
                          : 'Audit entries will appear here as actions are performed.'}
                      </p>
                    </div>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        {/* Pagination */}
        {!loading && result.total > 0 && (
          <div className='mt-6 flex items-center justify-between gap-3 border-t border-stroke-soft-200 pt-4'>
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <Pagination.NavIcon as={RiArrowLeftSLine} />
              </Pagination.NavButton>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1,
                )
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
                  <Select.Item value='10'>10 / page</Select.Item>
                  <Select.Item value='25'>25 / page</Select.Item>
                  <Select.Item value='50'>50 / page</Select.Item>
                  <Select.Item value='100'>100 / page</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
