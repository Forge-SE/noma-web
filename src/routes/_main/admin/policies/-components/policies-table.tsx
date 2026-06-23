'use client';

import * as React from 'react';
import {
  RiArrowDownSFill,
  RiArrowUpSFill,
  RiExpandUpDownFill,
  RiMore2Line,
  RiShieldCheckLine,
  RiAddLine,
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
import * as Button from '@/components/ui/button';
import * as Checkbox from '@/components/ui/checkbox';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';

const getSortingIcon = (state: 'asc' | 'desc' | false) => {
  if (state === 'asc')
    return <RiArrowUpSFill className='size-5 text-text-sub-600' />;
  if (state === 'desc')
    return <RiArrowDownSFill className='size-5 text-text-sub-600' />;
  return <RiExpandUpDownFill className='size-5 text-text-sub-600' />;
};

function ActionCell({ row, onEdit, onDelete }: { row: any; onEdit: (p: any) => void; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center gap-2 justify-end">
      <Button.Root variant='neutral' mode='stroke' size='xsmall' onClick={() => onEdit(row.original)}>
        Edit
      </Button.Root>
      <Button.Root variant='neutral' mode='stroke' size='xsmall' onClick={() => onDelete(row.original.id)} className="text-text-error-600">
        Delete
      </Button.Root>
    </div>
  );
}

export interface PoliciesTableProps {
  data: any[];
  isLoading?: boolean;
  onEdit: (policy: any) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function PoliciesTable({ data, isLoading, onEdit, onDelete, onCreate }: PoliciesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox.Root
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox.Root
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        className: 'pr-0 w-0',
      },
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <div className='flex items-center gap-0.5'>
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
        <div className='text-paragraph-sm font-medium text-text-strong-950'>
          {row.original.name}
        </div>
      ),
    },
    {
      id: 'priority',
      accessorKey: 'priority',
      header: ({ column }) => (
        <div className='flex items-center gap-0.5'>
          Priority
          <button
            type='button'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {getSortingIcon(column.getIsSorted())}
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <div className='text-paragraph-sm text-text-sub-600'>
          {row.original.priority}
        </div>
      ),
    },
    {
      id: 'action',
      accessorKey: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const actionType = row.original.actions?.[0]?.type;
        return (
          <Badge.Root 
            variant="filled" 
            color={
              actionType === 'BLOCK' ? 'red' :
              actionType === 'REQUIRE_APPROVAL' ? 'orange' :
              actionType === 'NOTIFY' ? 'blue' : 'green'
            }
          >
            {actionType || 'UNKNOWN'}
          </Badge.Root>
        );
      },
    },
    {
      id: 'status',
      accessorKey: 'enabled',
      header: 'Status',
      cell: ({ row }) => {
        return row.original.enabled ? (
          <Badge.Root variant="filled" color="green">Enabled</Badge.Root>
        ) : (
          <Badge.Root variant="filled" color="gray">Disabled</Badge.Root>
        );
      },
    },
    {
      id: 'actionsColumn',
      enableHiding: false,
      cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />,
      meta: {
        className: 'px-5 w-0',
      },
    },
  ], [onEdit, onDelete]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      sorting: [
        {
          id: 'priority',
          desc: false,
        },
      ],
    },
  });

  return (
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
            <Table.Cell colSpan={columns.length} className="h-[500px]">
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
                  <RiShieldCheckLine className="size-6 text-text-sub-600" />
                </div>
                <div>
                  <p className="text-label-md text-text-strong-950">No policies found</p>
                  <p className="text-paragraph-sm text-text-sub-600 mt-1">Get started by creating a new policy to manage approvals.</p>
                </div>
                <Button.Root variant="neutral" mode="stroke" onClick={onCreate} className="ring-1 ring-inset ring-stroke-soft-200 hover:ring-stroke-soft-200">
                  <Button.Icon as={RiAddLine} />
                  Create Policy
                </Button.Root>
              </div>
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
  );
}
