import * as React from 'react';
import {
  RiArrowDownSFill,
  RiArrowUpSFill,
  RiExpandUpDownFill,
  RiFundsLine,
  RiAddLine,
  RiBuildingLine,
  RiBankLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
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
import * as Table from '@/components/ui/table';
import * as Tooltip from '@/components/ui/tooltip';
import * as Button from '@/components/ui/button';
import * as ProgressBar from '@/components/ui/progress-bar';
import { Loader } from '@/components/ui/loader';

function getProgressColor(percentage: number): 'green' | 'orange' | 'red' {
  if (percentage >= 100) return 'red';
  if (percentage >= 70) return 'orange';
  return 'green';
}

const getSortingIcon = (state: 'asc' | 'desc' | false) => {
  if (state === 'asc')
    return <RiArrowUpSFill className='size-5 text-text-sub-600' />;
  if (state === 'desc')
    return <RiArrowDownSFill className='size-5 text-text-sub-600' />;
  return <RiExpandUpDownFill className='size-5 text-text-sub-600' />;
};

function ActionCell({ row, onView, onEdit, onDelete }: { row: any; onView: (b: any) => void; onEdit: (b: any) => void; onDelete: (id: string) => void }) {
  const budget = row.original;

  return (
    <Tooltip.Provider>
      <div className="flex items-center gap-1.5 justify-end">
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => onView(budget)}
              className="flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus:outline-none focus:ring-2 focus:ring-stroke-strong-950"
            >
              <RiEyeLine className="size-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content>View Budget</Tooltip.Content>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => onEdit(budget)}
              className="flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus:outline-none focus:ring-2 focus:ring-stroke-strong-950"
            >
              <RiEditLine className="size-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content>Edit Budget</Tooltip.Content>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => onDelete(budget.id)}
              className="flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-danger-600 focus:outline-none focus:ring-2 focus:ring-stroke-strong-950"
            >
              <RiDeleteBinLine className="size-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content>Delete Budget</Tooltip.Content>
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
  );
}

export interface BudgetsTableProps {
  data: any[];
  isLoading?: boolean;
  onView: (budget: any) => void;
  onEdit: (budget: any) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function BudgetsTable({ data, isLoading, onView, onEdit, onDelete, onCreate }: BudgetsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

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
        <span className="text-paragraph-sm font-medium text-text-strong-950">{row.original.name}</span>
      ),
    },
    {
      id: 'department',
      accessorKey: 'departmentId',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Department</span>,
      cell: ({ row }) => {
        const hasDept = !!row.original.department;
        const Icon = hasDept ? RiBuildingLine : RiBankLine;
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
              <Icon className="size-5 text-text-sub-600" />
            </div>
            <span className="text-paragraph-sm text-text-sub-600">{row.original.department?.name || 'Organization-wide'}</span>
          </div>
        );
      },
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Amount</span>,
      cell: ({ row }) => (
        <span className="text-paragraph-sm font-medium text-text-strong-950">{formatMoney(row.original.amount)}</span>
      ),
    },
    {
      id: 'progress',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Progress</span>,
      cell: ({ row }) => {
        const amount = row.original.amount || 1;
        const spent = row.original.spent || 0;
        const percentage = Math.min((spent / amount) * 100, 100);
        const color = getProgressColor(percentage);
        return (
          <div className="flex items-center gap-3 min-w-[140px]">
            <ProgressBar.Root value={percentage} max={100} color={color} className="flex-1" />
            <span className={cn(
              'text-paragraph-xs font-medium tabular-nums w-10 text-right',
              color === 'red' && 'text-text-error-600',
              color === 'orange' && 'text-text-warning-600',
              color === 'green' && 'text-text-success-600',
            )}>
              {Math.round(percentage)}%
            </span>
          </div>
        );
      },
    },
    {
      id: 'actionsColumn',
      enableHiding: false,
      cell: ({ row }) => <ActionCell row={row} onView={onView} onEdit={onEdit} onDelete={onDelete} />,
      meta: {
        className: 'px-5 w-0',
      },
    },
  ], [onView, onEdit, onDelete]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
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
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.Head>
            ))}
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
                      'h-14',
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
                  <RiFundsLine className="size-6 text-text-sub-600" />
                </div>
                <div>
                  <p className="text-label-md text-text-strong-950">No budgets found</p>
                  <p className="text-paragraph-sm text-text-sub-600 mt-1">Get started by creating a new budget to track departmental spending.</p>
                </div>
                <Button.Root variant="neutral" mode="stroke" onClick={onCreate} className="ring-1 ring-inset ring-stroke-soft-200 hover:ring-stroke-soft-200">
                  <Button.Icon as={RiAddLine} />
                  Create Budget
                </Button.Root>
              </div>
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
  );
}
