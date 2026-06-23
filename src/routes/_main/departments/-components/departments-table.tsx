import * as React from 'react';
import {
  RiArrowDownSFill,
  RiArrowUpSFill,
  RiExpandUpDownFill,
  RiOrganizationChart,
  RiEditLine,
  RiDeleteBinLine,
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
import { format } from 'date-fns';

import { cn } from '@/utils/cn';
import * as Table from '@/components/ui/table';
import * as Tooltip from '@/components/ui/tooltip';
import * as Pagination from '@/components/ui/pagination';
import * as Select from '@/components/ui/select';
import { Loader } from '@/components/ui/loader';

export interface Department {
  id: string;
  name: string;
  parentDept?: { id: string; name: string } | null;
  createdAt: string;
  memberCount: number;
}

interface DepartmentsTableProps {
  data: Department[];
  isLoading?: boolean;
  onRefresh: () => void;
  onEdit: (dept: Department) => void;
  onDelete: (dept: Department) => void;
}

function ActionCell({
  row,
  onEdit,
  onDelete,
}: {
  row: any;
  onEdit: (dept: Department) => void;
  onDelete: (dept: Department) => void;
}) {
  const dept = row.original as Department;

  return (
    <Tooltip.Provider>
      <div className='flex items-center gap-1.5'>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => onEdit(dept)}
              className='flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus:outline-none focus:ring-2 focus:ring-stroke-strong-950'
            >
              <RiEditLine className='size-5' />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content>Edit Department</Tooltip.Content>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => onDelete(dept)}
              className='flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-danger-600 focus:outline-none focus:ring-2 focus:ring-stroke-strong-950'
            >
              <RiDeleteBinLine className='size-5' />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content>Delete Department</Tooltip.Content>
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
  );
}

const getSortingIcon = (state: 'asc' | 'desc' | false) => {
  if (state === 'asc')
    return <RiArrowUpSFill className='size-5 text-text-sub-600' />;
  if (state === 'desc')
    return <RiArrowDownSFill className='size-5 text-text-sub-600' />;
  return <RiExpandUpDownFill className='size-5 text-text-sub-600' />;
};

export function DepartmentsTable({ data, isLoading, onRefresh, onEdit, onDelete }: DepartmentsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const columns = React.useMemo<ColumnDef<Department>[]>(() => [
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
      id: 'parentDept',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Parent Department</span>,
      accessorFn: (row) => row.parentDept?.name || '—',
      cell: ({ row }) => (
        <span className="text-paragraph-sm text-text-sub-600">{row.original.parentDept?.name || '—'}</span>
      ),
    },
    {
      id: 'memberCount',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Members</span>,
      accessorKey: 'memberCount',
      cell: ({ row }) => (
        <span className="text-paragraph-sm text-text-sub-600">{row.original.memberCount} members</span>
      ),
    },
    {
      id: 'createdAt',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Created Date</span>,
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <span className="text-paragraph-sm text-text-sub-600">{format(new Date(row.original.createdAt), 'MMM dd, yyyy')}</span>
      ),
    },
    {
      id: 'actionsColumn',
      enableHiding: false,
      cell: ({ row }) => (
        <ActionCell
          row={row}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
      meta: {
        className: 'px-5 w-0',
      },
    },
  ], [onEdit, onDelete]);

  // Compute paginated data
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  
  React.useEffect(() => {
    // Reset to page 1 if data or pageSize changes and we exceed totalPages
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
      <Table.Root className='[&>table]:min-w-[800px]'>
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
                        header.getContext()
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
          ) : (
            <Table.Row>
              <Table.Cell colSpan={columns.length} className='h-[400px]'>
                <div className='flex h-full flex-col items-center justify-center gap-4 text-center'>
                  <div className='flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
                    <RiOrganizationChart className='size-6 text-text-sub-600' />
                  </div>
                  <div>
                    <p className='text-label-md text-text-strong-950'>
                      No departments found
                    </p>
                    <p className='text-paragraph-sm text-text-sub-600 mt-1'>
                      Create a department to get started.
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
