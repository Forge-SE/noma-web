import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/utils/cn';
import { formatMoney } from '@/utils/currency';
import { formatDistanceToNow, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { RiMore2Fill, RiEyeLine, RiFilePaperLine } from '@remixicon/react';
import {
  RiArrowDownSLine,
  RiCalendarLine,
  RiFilter3Line,
  RiSearch2Line,
  RiShareForwardBoxLine,
} from '@remixicon/react';
import * as DropdownMenu from '@/components/ui/dropdown';
import * as ButtonGroup from '@/components/ui/button-group';
import * as Input from '@/components/ui/input';
import * as Button from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
export function SpendRequestsTableFilters() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const [status, setStatus] = React.useState<string>('All Status');

  const statuses = [
    { label: 'All Status', value: 'All Status' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Disbursed', value: 'DISBURSED' }
  ];

  return (
    <div className='flex flex-col gap-3 pb-6 xl:flex-row'>
      <div className='flex flex-1 flex-col gap-3 sm:flex-row'>
        <Input.Root size='small' className='flex-1 sm:max-w-[352px]'>
          <Input.Wrapper>
            <Input.Icon as={RiSearch2Line} />
            <Input.Input type='text' placeholder='Search spend requests...' />
          </Input.Wrapper>
        </Input.Root>

        <DateRangePicker
          date={date}
          setDate={setDate}
          buttonSize='small'
        />
      </div>

      <div className='flex flex-wrap gap-3 sm:flex-nowrap'>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button.Root
              size='small'
              variant='neutral'
              mode='stroke'
            >
              {status === 'All Status' ? 'All Status' : statuses.find(s => s.value === status)?.label}
              <Button.Icon as={RiArrowDownSLine} />
            </Button.Root>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start" className="w-48">
            {statuses.map((s) => (
              <DropdownMenu.Item key={s.value} onClick={() => setStatus(s.value)}>
                {s.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <Button.Root
          size='small'
          variant='neutral'
          mode='stroke'
        >
          <Button.Icon as={RiFilter3Line} />
          Filter
        </Button.Root>

        <Button.Root
          size='small'
          variant='neutral'
          mode='stroke'
        >
          <Button.Icon as={RiShareForwardBoxLine} />
          Export
        </Button.Root>
      </div>
    </div>
  );
}

export interface SpendRequestsTableProps {
  data: any[];
  isLoading?: boolean;
}

const getSortingIcon = (state: 'asc' | 'desc' | false) => {
  if (state === 'asc')
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 3.33334L3.33334 8H12.6667L8 3.33334Z" fill="currentColor" />
      </svg>
    );
  if (state === 'desc')
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12.6667L12.6667 8H3.33334L8 12.6667Z" fill="currentColor" />
      </svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3.33334L4.66667 6.66667H11.3333L8 3.33334Z" fill="currentColor" opacity="0.3" />
      <path d="M8 12.6667L11.3333 9.33334H4.66667L8 12.6667Z" fill="currentColor" opacity="0.3" />
    </svg>
  );
};

const ActionCell = ({ row }: { row: any }) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className='flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus:outline-none focus:ring-2 focus:ring-stroke-strong-950'>
          <RiMore2Fill className='size-5' />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-48">
        <DropdownMenu.Item onClick={() => navigate({ to: '/spend-requests/$id', params: { id: row.original.id } })}>
          <RiEyeLine className="mr-2 size-4" />
          View Details
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export function SpendRequestsTable({ data, isLoading }: SpendRequestsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const navigate = useNavigate();

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      id: 'category',
      accessorKey: 'category',
      header: ({ column }) => (
        <div className='flex items-center gap-1.5'>
          <span className='text-paragraph-sm font-medium text-text-sub-600'>Category</span>
          <button
            className='text-text-sub-600 hover:text-text-strong-950 focus:outline-none'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {getSortingIcon(column.getIsSorted())}
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <div className='text-paragraph-sm font-medium text-text-strong-950'>
          {row.original.category}
        </div>
      ),
    },
    {
      id: 'purpose',
      accessorKey: 'purpose',
      header: 'Purpose',
      cell: ({ row }) => (
        <div className='text-paragraph-sm text-text-sub-600 truncate max-w-[200px]'>
          {row.original.purpose}
        </div>
      ),
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className='text-paragraph-sm text-text-strong-950'>
          {formatMoney(row.original.amount, row.original.currency || 'GHS')}
        </div>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge.Root 
            variant="lighter" 
            color={
              status === 'APPROVED' ? 'green' :
              status === 'REJECTED' ? 'red' :
              status === 'UNDER_REVIEW' ? 'orange' :
              status === 'DISBURSED' ? 'blue' : 'gray'
            }
            size="medium"
          >
            <Badge.Dot />
            {status.replace('_', ' ')}
          </Badge.Root>
        );
      },
    },
    {
      id: 'submittedAt',
      accessorKey: 'submittedAt',
      header: 'Submitted',
      cell: ({ row }) => (
        <div className='text-paragraph-sm text-text-sub-600'>
          {row.original.submittedAt ? formatDistanceToNow(new Date(row.original.submittedAt), { addSuffix: true }) : 'Not submitted'}
        </div>
      ),
    },
    {
      id: 'actionsColumn',
      enableHiding: false,
      cell: ({ row }) => <ActionCell row={row} />,
      meta: {
        className: 'px-5 w-0',
      },
    },
  ], []);

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
          id: 'submittedAt',
          desc: true,
        },
      ],
    },
  });

  return (
    <div className="flex w-full flex-1 flex-col">
      <SpendRequestsTableFilters />
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
              <Table.Row 
                data-state={row.getIsSelected() && 'selected'} 
                onClick={() => navigate({ to: '/spend-requests/$id', params: { id: row.original.id } })}
                className="cursor-pointer hover:bg-bg-weak-50"
              >
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
                  <RiFilePaperLine className='size-6 text-text-sub-600' />
                </div>
                <div>
                  <p className='text-label-md text-text-strong-950'>
                    No spend requests found
                  </p>
                  <p className='text-paragraph-sm text-text-sub-600 mt-1'>
                    There are no spend requests to display at the moment.
                  </p>
                </div>
              </div>
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
    </div>
  );
}
