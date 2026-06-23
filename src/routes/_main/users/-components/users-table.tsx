import * as React from 'react';
import {
  RiArrowDownSFill,
  RiArrowUpSFill,
  RiExpandUpDownFill,
  RiTeamLine,
  RiEditLine,
  RiMailSendLine,
  RiProhibitedLine,
  RiCheckLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
} from '@remixicon/react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';

import { cn } from '@/utils/cn';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as Avatar from '@/components/ui/avatar';
import * as Pagination from '@/components/ui/pagination';
import * as Select from '@/components/ui/select';
import * as Tooltip from '@/components/ui/tooltip';
import { Loader } from '@/components/ui/loader';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  department?: { id: string; name: string } | null;
  status: string;
  lastActive?: string | null;
}

export interface UsersTableProps {
  data: User[];
  isLoading?: boolean;
  onEdit: (user: User) => void;
  onDeactivate: (user: User) => void;
  onReactivate: (user: User) => void;
  onResendInvite: (user: User) => void;
}

const getSortingIcon = (state: 'asc' | 'desc' | false) => {
  if (state === 'asc')
    return <RiArrowUpSFill className='size-5 text-text-sub-600' />;
  if (state === 'desc')
    return <RiArrowDownSFill className='size-5 text-text-sub-600' />;
  return <RiExpandUpDownFill className='size-5 text-text-sub-600' />;
};

function ActionCell({
  row,
  onEdit,
  onDeactivate,
  onReactivate,
  onResendInvite,
}: {
  row: any;
  onEdit: (user: User) => void;
  onDeactivate: (user: User) => void;
  onReactivate: (user: User) => void;
  onResendInvite: (user: User) => void;
}) {
  const user = row.original as User;
  const isActive = user.status === 'ACTIVE';
  const isPending = user.status === 'PENDING' || user.status === 'INVITED';

  return (
    <Tooltip.Provider>
      <div className='flex items-center gap-1.5'>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => onEdit(user)}
              className='flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus:outline-none focus:ring-2 focus:ring-stroke-strong-950'
            >
              <RiEditLine className='size-5' />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content>Edit User</Tooltip.Content>
        </Tooltip.Root>

        {isPending && (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={() => onResendInvite(user)}
                className='flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus:outline-none focus:ring-2 focus:ring-stroke-strong-950'
              >
                <RiMailSendLine className='size-5' />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content>Resend Invite</Tooltip.Content>
          </Tooltip.Root>
        )}

        {isActive ? (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={() => onDeactivate(user)}
                className='flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-danger-600 focus:outline-none focus:ring-2 focus:ring-stroke-strong-950'
              >
                <RiProhibitedLine className='size-5' />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content>Deactivate User</Tooltip.Content>
          </Tooltip.Root>
        ) : !isPending ? (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={() => onReactivate(user)}
                className='flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-success-600 focus:outline-none focus:ring-2 focus:ring-stroke-strong-950'
              >
                <RiCheckLine className='size-5' />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content>Reactivate User</Tooltip.Content>
          </Tooltip.Root>
        ) : null}
      </div>
    </Tooltip.Provider>
  );
}

export function UsersTable({
  data,
  isLoading,
  onEdit,
  onDeactivate,
  onReactivate,
  onResendInvite,
}: UsersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

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
        <div className="flex items-center gap-3">
          <Avatar.Root size="40" color="gray">
            {row.original.name.charAt(0)}
          </Avatar.Root>
          <div className="flex flex-col">
            <span className="text-paragraph-sm font-medium text-text-strong-950">
              {row.original.name}
            </span>
            <span className="text-paragraph-xs text-text-sub-600">
              {row.original.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'roles',
      accessorKey: 'roles',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Role(s)</span>,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role: string) => (
            <Badge.Root key={role} variant="stroke" color="gray">
              {role}
            </Badge.Root>
          ))}
        </div>
      ),
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Department</span>,
      cell: ({ row }) => (
        <div className='text-paragraph-sm text-text-sub-600'>
          {row.original.department?.name || '—'}
        </div>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Status</span>,
      cell: ({ row }) => {
        const status = row.original.status;
        const isPending = status === 'PENDING' || status === 'INVITED';
        return (
          <Badge.Root
            variant="stroke"
            color={status === 'ACTIVE' ? 'green' : isPending ? 'orange' : 'gray'}
          >
            {status}
          </Badge.Root>
        );
      },
    },
    {
      id: 'lastActive',
      accessorKey: 'lastActive',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Last Active</span>,
      cell: ({ row }) => (
        <div className='text-paragraph-sm text-text-sub-600'>
          {row.original.lastActive
            ? formatDistanceToNow(new Date(row.original.lastActive), { addSuffix: true })
            : 'Never'}
        </div>
      ),
    },
    {
      id: 'actionsColumn',
      enableHiding: false,
      cell: ({ row }) => (
        <ActionCell
          row={row}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
          onReactivate={onReactivate}
          onResendInvite={onResendInvite}
        />
      ),
      meta: {
        className: 'px-5 w-px whitespace-nowrap',
      },
    },
  ], [onEdit, onDeactivate, onReactivate, onResendInvite]);

  // Compute paginated data
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [data.length, pageSize, totalPages, currentPage]);

  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <>
      <Table.Root className='[&>table]:min-w-[860px]'>
        <Table.Header className='whitespace-nowrap'>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Table.Head
                    key={header.id}
                    className={header.column.columnDef.meta?.className}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </Table.Head>
                );
              })}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            <Table.Row>
              <Table.Cell colSpan={columns.length} className="h-48">
                <Loader />
              </Table.Cell>
            </Table.Row>
          ) : table.getRowModel().rows?.length > 0 ? (
            table.getRowModel().rows.map((row, i, arr) => (
              <React.Fragment key={row.id}>
                <Table.Row data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell
                      key={cell.id}
                      className={cn(
                        'h-12',
                        cell.column.columnDef.meta?.className,
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
                {i < arr.length - 1 && <Table.RowDivider />}
              </React.Fragment>
            ))
          ) : (
            <Table.Row>
              <Table.Cell colSpan={columns.length} className='h-[500px]'>
                <div className='flex h-full flex-col items-center justify-center gap-4 text-center'>
                  <div className='flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
                    <RiTeamLine className='size-6 text-text-sub-600' />
                  </div>
                  <div>
                    <p className='text-label-md text-text-strong-950'>
                      No users found
                    </p>
                    <p className='text-paragraph-sm text-text-sub-600 mt-1'>
                      Invite members to get started.
                    </p>
                  </div>
                </div>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>

      {/* Pagination Footer */}
      {!isLoading && data.length > 0 && (
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
    </>
  );
}
