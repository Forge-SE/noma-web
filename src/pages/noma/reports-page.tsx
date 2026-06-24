import * as React from 'react';
import {
  RiFileChartLine,
  RiSearch2Line,
  RiDownload2Line,
  RiFileExcel2Line,
  RiFilePdf2Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
} from '@remixicon/react';
import { useQuery, useMutation } from '@apollo/client/react';
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
import { formatMoney } from '@/utils/currency';
import Header from '@/components/header';
import * as Divider from '@/components/ui/divider';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as Pagination from '@/components/ui/pagination';
import * as Select from '@/components/ui/select';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Tooltip from '@/components/ui/tooltip';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/components/ui/toaster';
import { currentOrganizationAtom } from '@/store/auth.store';

import { GET_REPORT_SUMMARY, GET_REPORT_DATA, EXPORT_REPORT_MUTATION } from '@/graphql/reports.graphql';
import { GET_DEPARTMENT_OPTIONS_QUERY } from '@/graphql/budgets.graphql';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Software', label: 'Software' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Other', label: 'Other' },
];

const STATUS_BADGE_COLORS: Record<string, 'green' | 'red' | 'orange' | 'blue' | 'gray'> = {
  APPROVED: 'green',
  REJECTED: 'red',
  UNDER_REVIEW: 'orange',
  DISBURSED: 'blue',
  SUBMITTED: 'gray',
};

function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
        <Icon className="size-5 text-text-sub-600" />
      </div>
      <div className="text-paragraph-sm text-text-sub-600">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-title-h4 text-text-strong-950">{value}</span>
        {sub && <span className="text-paragraph-xs text-text-soft-400">{sub}</span>}
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { toast } = useToast();
  const currentOrganization = useAtomValue(currentOrganizationAtom);
  const orgId = currentOrganization?.id;

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return { from: d, to: new Date() };
  });
  const [departmentFilter, setDepartmentFilter] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const filterVars = React.useMemo(() => {
    if (!orgId || !dateRange?.from || !dateRange?.to) return null;
    return {
      organizationId: orgId,
      dateFrom: dateRange.from.toISOString(),
      dateTo: dateRange.to.toISOString(),
      departmentId: departmentFilter || undefined,
      category: categoryFilter || undefined,
    };
  }, [orgId, dateRange, departmentFilter, categoryFilter]);

  const { data: deptData } = useQuery(GET_DEPARTMENT_OPTIONS_QUERY, {
    variables: { organizationId: orgId },
    skip: !orgId,
  });
  const departments: { id: string; name: string }[] = (deptData as any)?.departments || [];

  const { data: summaryData, loading: summaryLoading } = useQuery(GET_REPORT_SUMMARY, {
    variables: filterVars || {},
    skip: !filterVars,
  });

  const reportDataVars = React.useMemo(() => {
    if (!filterVars) return null;
    return {
      ...filterVars,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    };
  }, [filterVars, currentPage, pageSize]);

  const { data: reportData, loading: dataLoading, refetch: refetchData } = useQuery(GET_REPORT_DATA, {
    variables: reportDataVars || {},
    skip: !reportDataVars,
  });

  const [exportReport, { loading: exporting }] = useMutation(EXPORT_REPORT_MUTATION);

  const summary = (summaryData as any)?.reportSummary || {};
  const reportResult = (reportData as any)?.reportData || { items: [], total: 0 };
  const items = reportResult.items || [];
  const total = reportResult.total || 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [departmentFilter, categoryFilter, dateRange]);

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const handleExport = async (format: 'CSV' | 'PDF') => {
    if (!filterVars) {
      toast({ title: 'Validation Error', description: 'Please select a date range before exporting.', status: 'error' });
      return;
    }
    try {
      const result = await exportReport({
        variables: { ...filterVars, format },
      });
      const jobId = (result.data as any)?.exportReport?.jobId;
      if (jobId) {
        toast({
          title: 'Export Started',
          description: `Your ${format} export has been queued. You will receive an email when it is ready.`,
          status: 'success',
        });
      } else {
        toast({
          title: 'Export Initiated',
          description: `Your ${format} export is being generated.`,
          status: 'success',
        });
      }
    } catch (err: any) {
      toast({ title: 'Export Error', description: err.message || 'Failed to start export.', status: 'error' });
    }
  };

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      id: 'category',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Category</span>,
      cell: ({ row }) => (
        <span className="text-paragraph-sm font-medium text-text-strong-950">{row.original.category}</span>
      ),
    },
    {
      id: 'purpose',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Purpose</span>,
      cell: ({ row }) => (
        <span className="text-paragraph-sm text-text-sub-600 truncate max-w-[200px]">{row.original.purpose}</span>
      ),
    },
    {
      id: 'department',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Department</span>,
      cell: ({ row }) => (
        <span className="text-paragraph-sm text-text-sub-600">{row.original.department?.name || '—'}</span>
      ),
    },
    {
      id: 'amount',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Amount</span>,
      cell: ({ row }) => (
        <span className="text-paragraph-sm font-medium text-text-strong-950">
          {formatMoney(row.original.amount, row.original.currency || 'GHS')}
        </span>
      ),
    },
    {
      id: 'status',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Status</span>,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge.Root variant="filled" color={STATUS_BADGE_COLORS[status] || 'gray'}>
            {status?.replace(/_/g, ' ') || '—'}
          </Badge.Root>
        );
      },
    },
    {
      id: 'submittedAt',
      header: () => <span className="text-label-xs font-semibold text-text-sub-600">Submitted</span>,
      cell: ({ row }) => (
        <span className="text-paragraph-sm text-text-sub-600 whitespace-nowrap">
          {row.original.submittedAt ? format(new Date(row.original.submittedAt), 'MMM d, yyyy') : '—'}
        </span>
      ),
    },
  ], []);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isLoading = summaryLoading || dataLoading;

  return (
    <>
      <Header
        icon={
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
            <RiFileChartLine className="size-6 text-text-sub-600" />
          </div>
        }
        title="Reports & Export"
        description="View spending reports and export data."
      >
        <div className="flex items-center gap-3">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => handleExport('CSV')} disabled={exporting}>
                <Button.Icon as={RiFileExcel2Line} />
                Export CSV
              </Button.Root>
            </Tooltip.Trigger>
            <Tooltip.Content>Export filtered data as CSV</Tooltip.Content>
          </Tooltip.Root>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button.Root variant="primary" mode="filled" size="small" onClick={() => handleExport('PDF')} disabled={exporting}>
                <Button.Icon as={RiFilePdf2Line} />
                Export PDF
              </Button.Root>
            </Tooltip.Trigger>
            <Tooltip.Content>Export filtered data as PDF</Tooltip.Content>
          </Tooltip.Root>
        </div>
      </Header>

      <div className="px-4 lg:px-8">
        <Divider.Root />
      </div>

      <div className="flex flex-1 flex-col gap-6 px-4 pb-6 pt-8 lg:px-8">
        {/* Filters */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
          <Input.Root size="small" className="w-[300px]">
            <Input.Wrapper>
              <Input.Icon as={RiSearch2Line} />
              <Input.Input placeholder="Search reports..." />
            </Input.Wrapper>
          </Input.Root>

          <div className="flex flex-wrap items-center gap-3">
            <DateRangePicker
              value={dateRange}
              onChange={(range) => {
                setDateRange(range);
                if (range?.from) {
                  (document.querySelector('[data-date-range]') as HTMLElement)?.dataset?.dateRange === 'set';
                }
              }}
              buttonSize="small"
            />

            <Select.Root size="small" value={departmentFilter} onValueChange={setDepartmentFilter}>
              <Select.Trigger className="w-auto min-w-[160px]">
                <Select.Value placeholder="All Departments" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="">All Departments</Select.Item>
                {departments.map((d) => (
                  <Select.Item key={d.id} value={d.id}>{d.name}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Select.Root size="small" value={categoryFilter} onValueChange={setCategoryFilter}>
              <Select.Trigger className="w-auto min-w-[160px]">
                <Select.Value placeholder="All Categories" />
              </Select.Trigger>
              <Select.Content>
                {CATEGORY_OPTIONS.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>{opt.label}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total Spend"
            value={summary.totalSpend != null ? formatMoney(summary.totalSpend) : '—'}
            sub={summary.requestCount != null ? `${summary.requestCount} requests` : undefined}
            icon={RiFileChartLine}
          />
          <SummaryCard
            label="Total Disbursed"
            value={summary.totalDisbursed != null ? formatMoney(summary.totalDisbursed) : '—'}
            sub={summary.disbursedCount != null ? `${summary.disbursedCount} disbursed` : undefined}
            icon={RiDownload2Line}
          />
          <SummaryCard
            label="Avg Request Size"
            value={summary.averageRequestSize != null ? formatMoney(summary.averageRequestSize) : '—'}
            icon={RiFileChartLine}
          />
          <SummaryCard
            label="Approval Rate"
            value={summary.approvalRate != null ? `${Math.round(summary.approvalRate * 100)}%` : '—'}
            icon={RiFileChartLine}
          />
        </div>

        {/* Data Table */}
        <Table.Root className="[&>table]:min-w-[860px]">
          <Table.Header className="whitespace-nowrap">
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Head key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, i, arr) => (
                <React.Fragment key={row.id}>
                  <Table.Row>
                    {row.getVisibleCells().map((cell) => (
                      <Table.Cell
                        key={cell.id}
                        className={cn('h-12', cell.column.columnDef.meta?.className)}
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
                <Table.Cell colSpan={columns.length} className="h-[400px]">
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
                      <RiFileChartLine className="size-6 text-text-sub-600" />
                    </div>
                    <div>
                      <p className="text-label-md text-text-strong-950">No data found</p>
                      <p className="text-paragraph-sm text-text-sub-600 mt-1">
                        Try adjusting your filters or selecting a different date range.
                      </p>
                    </div>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-stroke-soft-200 pt-4">
            <span className="flex-1 whitespace-nowrap text-paragraph-xs text-text-sub-600">
              Page {currentPage} of {totalPages}
            </span>

            <Pagination.Root>
              <Pagination.NavButton onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                <Pagination.NavIcon as={RiArrowLeftDoubleLine} />
              </Pagination.NavButton>
              <Pagination.NavButton onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                <Pagination.NavIcon as={RiArrowLeftSLine} />
              </Pagination.NavButton>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <Pagination.Item disabled>...</Pagination.Item>}
                      <Pagination.Item current={page === currentPage} onClick={() => setCurrentPage(page)}>
                        {page}
                      </Pagination.Item>
                    </React.Fragment>
                  );
                })}

              <Pagination.NavButton onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                <Pagination.NavIcon as={RiArrowRightSLine} />
              </Pagination.NavButton>
              <Pagination.NavButton onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                <Pagination.NavIcon as={RiArrowRightDoubleLine} />
              </Pagination.NavButton>
            </Pagination.Root>

            <div className="flex flex-1 justify-end">
              <Select.Root size="xsmall" value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
                <Select.Trigger className="w-auto">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="10">10 / page</Select.Item>
                  <Select.Item value="25">25 / page</Select.Item>
                  <Select.Item value="50">50 / page</Select.Item>
                  <Select.Item value="100">100 / page</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
