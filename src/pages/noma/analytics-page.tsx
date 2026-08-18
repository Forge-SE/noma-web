import * as React from 'react';
import {
  RiBarChart2Line,
  RiExchangeDollarLine,
  RiRefreshLine,
  RiTeamLine,
  RiUserLine,
  RiShieldCheckLine,
} from '@remixicon/react';
import { useQuery } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import { format } from 'date-fns';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  type BarProps,
} from 'recharts';

import { formatMoney } from '@/utils/currency';
import Header from '@/components/header';
import * as Divider from '@/components/ui/divider';
import * as Button from '@/components/ui/button';
import * as Badge from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { ChartContainer, type ChartConfig } from '@/components/chart';
import { GaugeChart } from '@/components/chart-gauge';
import { CategoryBarChart, COLORS as CATEGORY_BAR_COLORS } from '@/components/chart-category-bar';
import { sessionAtom } from '@/store/auth.store';

import { GET_ANALYTICS } from '@/graphql/analytics.graphql';

type CategoryItem = { category: string; amount: number; count: number };
type DepartmentItem = { departmentId: string | null; name: string; amount: number; count: number };
type TrendItem = { month: string; amount: number; count: number; approved: number; pending: number; rejected: number };
type BudgetRow = { departmentId: string | null; name: string; total: number; spent: number; utilization: number };

interface AnalyticsResult {
  analytics: {
    scope: string;
    asOf: string;
    requests: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      totalSpend: number;
      approvedSpend: number;
      disbursedSpend: number;
      averageRequestSize: number;
      approvalRate: number;
      byCategory: CategoryItem[];
      byDepartment: DepartmentItem[];
      monthlyTrend: TrendItem[];
    };
    budgets: {
      totalBudget: number;
      totalSpent: number;
      utilization: number;
      budgetCount: number;
      atRiskCount: number;
      exceededCount: number;
      byDepartment: BudgetRow[];
    };
    wallets: {
      totalBalance: number;
      totalWallets: number;
      activeCount: number;
      frozenCount: number;
    };
    payments: {
      totalTransactions: number;
      successful: number;
      failed: number;
      pending: number;
      totalDisbursed: number;
      failedAmount: number;
    };
  };
}

const SCOPE_LABELS: Record<string, string> = {
  ORG: 'Organization-wide',
  DEPARTMENT: 'Your department',
  SELF: 'Your activity',
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  ADMIN: RiShieldCheckLine,
  FINANCE: RiExchangeDollarLine,
  MANAGER: RiTeamLine,
  EMPLOYEE: RiUserLine,
};

const MONTH_CONFIG = {
  approved: { label: 'Approved', color: 'hsl(var(--verified-base))' },
  pending: { label: 'Pending', color: 'hsl(var(--warning-base))' },
  rejected: { label: 'Rejected', color: 'hsl(var(--error-base))' },
} satisfies ChartConfig;

const DONUT_COLORS = [
  'hsl(var(--information-base))',
  'hsl(var(--verified-base))',
  'hsl(var(--warning-base))',
  'hsl(var(--feature-base))',
  'hsl(var(--error-base))',
  'hsl(var(--bg-soft-200))',
];

const CIRCLE_SIZE = 248;
const INNER_RADIUS = 99;
const OUTER_RADIUS = 124;

const BAR_GAP = 2;

function pct(value: number): number {
  return Math.round(value * 100);
}

function compactNum(value: number): string {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function SectionCard({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 ${className ?? ''}`}>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <h3 className='text-label-md text-text-strong-950'>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyChart() {
  return <div className='py-6 text-center text-paragraph-sm text-text-soft-400'>No data yet.</div>;
}

function LegendDot({ color }: { color: string }) {
  return <span className='size-2.5 shrink-0 rounded-full' style={{ backgroundColor: color }} />;
}

function MonthlySpendChart({ items }: { items: TrendItem[] }) {
  const data = items.map((item) => ({
    label: format(new Date(`${item.month}-01`), 'MMM'),
    approved: item.approved,
    pending: item.pending,
    rejected: item.rejected,
  }));

  if (items.length === 0) return <EmptyChart />;

  const keys = Object.keys(MONTH_CONFIG) as (keyof typeof MONTH_CONFIG)[];
  const legend = keys.map((key) => ({
    key,
    label: MONTH_CONFIG[key].label,
    color: MONTH_CONFIG[key].color!,
    value: data.reduce((s, d) => s + d[key], 0),
  }));

  return (
    <div className='flex flex-col gap-5'>
      <ChartContainer config={MONTH_CONFIG} className='h-[212px] w-full'>
        <BarChart
          data={data}
          barCategoryGap={12}
          margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <XAxis
            dataKey='label'
            tickLine={false}
            tickMargin={12}
            axisLine={false}
          />
          <YAxis
            width={40}
            tickLine={false}
            axisLine={false}
            tickMargin={0}
            tickFormatter={(value) => compactNum(value)}
          />
          {keys.map((dataKey, i) => {
            const isLast = i === keys.length - 1;
            return (
              <Bar
                key={dataKey}
                stackId='a'
                fill={MONTH_CONFIG[dataKey].color}
                dataKey={dataKey}
                shape={(props: BarProps) => {
                  const { fill, x, y, width, height } = props;
                  const yN = Number(y);
                  const computedHeight = Math.max(
                    0,
                    isLast || i === 0 ? height! - BAR_GAP / 2 : height! - BAR_GAP,
                  );
                  return (
                    <>
                      {isLast && (
                        <rect
                          fill='hsl(var(--bg-weak-50))'
                          x={x}
                          y={0}
                          width={width}
                          height={Math.max(0, yN - BAR_GAP)}
                        />
                      )}
                      <rect
                        fill={fill}
                        x={x}
                        y={isLast ? yN : yN + BAR_GAP / 2}
                        width={width}
                        height={computedHeight}
                      />
                    </>
                  );
                }}
              />
            );
          })}
        </BarChart>
      </ChartContainer>
      <div className='flex flex-col divide-y divide-stroke-soft-200'>
        {legend.map((item) => (
          <div key={item.key} className='flex items-center gap-2 py-2 first:pt-0 last:pb-0'>
            <span className='size-2.5 shrink-0 rounded-full' style={{ backgroundColor: item.color }} />
            <span className='flex-1 text-paragraph-sm text-text-sub-600'>{item.label}</span>
            <span className='text-label-sm font-medium text-text-strong-950'>{formatMoney(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HalfDonut({
  items,
  centerLabel,
  centerValue,
}: {
  items: { name: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  return (
    <>
      <div className='mx-auto grid w-fit justify-center'>
        <div style={{ width: CIRCLE_SIZE }} className='[grid-area:1/1]'>
          <ChartContainer config={{}} className='h-[124px] w-full'>
            <PieChart
              width={CIRCLE_SIZE}
              height={124}
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
            >
              <Pie
                dataKey='value'
                width={CIRCLE_SIZE}
                height={CIRCLE_SIZE}
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                innerRadius={INNER_RADIUS}
                outerRadius={OUTER_RADIUS}
                data={items}
                startAngle={180}
                endAngle={0}
                paddingAngle={1}
                strokeWidth={0}
              >
                {items.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
        <div className='pointer-events-none relative z-10 flex flex-col items-center justify-end gap-1 pb-2 text-center [grid-area:1/1]'>
          <span className='pointer-events-auto text-subheading-xs text-text-sub-600'>{centerLabel}</span>
          <span className='pointer-events-auto text-title-h5 text-text-strong-950'>{centerValue}</span>
        </div>
      </div>
      <div className='mt-4 flex flex-col divide-y divide-stroke-soft-200'>
        {items.map((item) => (
          <div key={item.name} className='flex w-full items-center gap-2 py-2 first:pt-0 last:pb-0'>
            <LegendDot color={item.color} />
            <span className='flex-1 truncate text-paragraph-sm text-text-sub-600'>{item.name}</span>
            <span className='text-label-sm font-medium text-text-strong-950'>{formatMoney(item.value)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function BudgetUtilizationChart({ items }: { items: BudgetRow[] }) {
  const data = items.map((item) => ({
    label: item.name.length > 10 ? `${item.name.slice(0, 9)}…` : item.name,
    value: Math.round(item.utilization * 100),
  }));

  if (items.length === 0) return <EmptyChart />;

  return (
    <ChartContainer config={{ utilization: { label: 'Utilization' } }} className='h-[180px] w-full'>
      <BarChart data={data} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
        <XAxis dataKey='label' tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis hide />
        <Bar dataKey='value' fill='hsl(var(--information-base))' radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

function DonutLegendList({ items }: { items: { name: string; value: number; color: string }[] }) {
  return (
    <div className='flex flex-col gap-2.5'>
      {items.map((item) => (
        <div key={item.name} className='flex items-center gap-2'>
          <LegendDot color={item.color} />
          <span className='flex-1 truncate text-paragraph-sm text-text-sub-600'>{item.name}</span>
          <span className='text-label-sm font-medium text-text-strong-950'>{formatMoney(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsPage() {
  const session = useAtomValue(sessionAtom);
  const { data, loading, error, refetch } = useQuery<AnalyticsResult>(GET_ANALYTICS);
  const role = session?.role || 'EMPLOYEE';
  const a = data?.analytics;

  if (loading || !a) {
    return (
      <div className='flex h-full min-h-[60vh] items-center justify-center'>
        <Loader />
      </div>
    );
  }

  const req = a.requests;
  const isMoneyRole = role === 'ADMIN' || role === 'FINANCE';
  const isManager = role === 'MANAGER';
  const scopeLabel = SCOPE_LABELS[a.scope] || 'Analytics';
  const HeaderIcon = ROLE_ICONS[role] || RiBarChart2Line;

  const categoryDonut = req.byCategory.slice(0, 4).map((c, i) => ({
    name: c.category.replace(/_/g, ' '),
    value: c.amount,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));
  const restCategories = req.byCategory.slice(4);
  if (restCategories.length > 0) {
    categoryDonut.push({
      name: 'Others',
      value: restCategories.reduce((s, c) => s + c.amount, 0),
      color: DONUT_COLORS[4],
    });
  }

  const deptShares = req.byDepartment.map((d) => ({ label: d.name, value: d.amount }));
  const deptTotal = req.byDepartment.reduce((s, d) => s + d.amount, 0);

  const walletShares = [
    { label: 'Active', value: a.wallets.activeCount },
    { label: 'Frozen', value: a.wallets.frozenCount },
  ];

  const paymentDonut = [
    { name: 'Successful', value: a.payments.successful, color: 'hsl(var(--verified-base))' },
    { name: 'Failed', value: a.payments.failed, color: 'hsl(var(--error-base))' },
    { name: 'Pending', value: a.payments.pending, color: 'hsl(var(--warning-base))' },
  ];

  return (
    <>
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <HeaderIcon className='size-6 text-text-sub-600' />
          </div>
        }
        title='Analytics'
        description={`${scopeLabel} · updated ${format(new Date(a.asOf), 'h:mm a')}`}
      >
        <Button.Root variant='neutral' mode='stroke' size='small' onClick={() => refetch()}>
          <Button.Icon as={RiRefreshLine} />
          Refresh
        </Button.Root>
      </Header>

      <div className='px-4 lg:px-8'>
        <Divider.Root />
      </div>

      <div className='flex flex-1 flex-col gap-6 px-4 pb-6 pt-8 lg:px-8'>
        {error && (
          <div className='rounded-lg bg-error-lighter p-3 text-paragraph-xs text-error-base'>
            {error.message}
          </div>
        )}

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <SectionCard title='Spend over time' className='lg:col-span-2'>
            <MonthlySpendChart items={req.monthlyTrend} />
          </SectionCard>

          <SectionCard title='Approval rate'>
            <div className='flex flex-col items-center gap-2 py-2'>
              <div className='mx-auto grid w-[208px]'>
                <GaugeChart
                  data={{ name: 'approval', value: pct(req.approvalRate) }}
                  className='[grid-area:1/1]'
                />
                <div className='pointer-events-none relative z-10 flex flex-col items-center justify-end gap-1 text-center [grid-area:1/1]'>
                  <span className='pointer-events-auto text-title-h4 text-text-strong-950'>
                    {pct(req.approvalRate)}%
                  </span>
                  <span className='pointer-events-auto text-subheading-xs text-text-sub-600'>
                    {req.approved} OF {req.total} REQUESTS
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-4 text-paragraph-xs text-text-soft-400'>
                <span className='flex items-center gap-1'>
                  <span className='size-2 rounded-full bg-error-base' /> {req.rejected} rejected
                </span>
                <span className='flex items-center gap-1'>
                  <span className='size-2 rounded-full bg-warning-base' /> {req.pending} pending
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title='Spend by category'>
            <HalfDonut
              items={categoryDonut}
              centerLabel='TOTAL SPEND'
              centerValue={formatMoney(req.totalSpend)}
            />
          </SectionCard>

          <SectionCard title='Spend by department'>
            <div className='flex flex-col gap-5'>
              <CategoryBarChart data={deptShares} />
              <div className='flex flex-col gap-2.5'>
                {req.byDepartment.map((d, i) => (
                  <div key={d.name} className='flex items-center gap-2'>
                    <LegendDot color={CATEGORY_BAR_COLORS[i % CATEGORY_BAR_COLORS.length]} />
                    <span className='flex-1 truncate text-paragraph-sm text-text-sub-600'>{d.name}</span>
                    <span className='text-label-sm font-medium text-text-strong-950'>
                      {deptTotal > 0 ? pct(d.amount / deptTotal) : 0}%
                    </span>
                    <span className='w-24 text-right text-label-sm font-medium text-text-strong-950'>
                      {formatMoney(d.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {(isMoneyRole || isManager) && (
            <SectionCard
              title='Budget utilization'
              action={
                a.budgets.atRiskCount > 0 ? (
                  <Badge.Root variant='lighter' color='orange' size='medium'>
                    <Badge.Dot />
                    {a.budgets.atRiskCount} at risk
                  </Badge.Root>
                ) : undefined
              }
            >
              <div className='flex flex-col gap-5'>
                <BudgetUtilizationChart items={a.budgets.byDepartment} />
                <div className='flex flex-col gap-2.5'>
                  {a.budgets.byDepartment.map((d) => (
                    <div key={d.name} className='flex items-center justify-between gap-2'>
                      <span className='flex-1 truncate text-paragraph-sm text-text-sub-600'>{d.name}</span>
                      <span className='text-label-sm font-medium text-text-strong-950'>
                        {pct(d.utilization)}%
                      </span>
                      <span className='w-28 text-right text-paragraph-xs text-text-soft-400'>
                        {formatMoney(d.spent)} / {formatMoney(d.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          )}

          <SectionCard title='Wallets'>
            <div className='flex flex-col gap-5'>
              <div className='flex flex-col'>
                <div className='text-paragraph-sm text-text-sub-600'>Total balance</div>
                <div className='mt-1 text-title-h5 text-text-strong-950'>
                  {formatMoney(a.wallets.totalBalance)}
                </div>
                <div className='mt-0.5 text-paragraph-xs text-text-soft-400'>
                  {a.wallets.activeCount} active · {a.wallets.frozenCount} frozen/closed
                </div>
              </div>
              <CategoryBarChart data={walletShares} />
              <DonutLegendList
                items={[
                  { name: 'Active', value: a.wallets.activeCount, color: 'hsl(var(--verified-base))' },
                  { name: 'Frozen / closed', value: a.wallets.frozenCount, color: 'hsl(var(--warning-base))' },
                ]}
              />
            </div>
          </SectionCard>

          {isMoneyRole && (
            <SectionCard title='Payments'>
              <HalfDonut
                items={paymentDonut}
                centerLabel='DISBURSED'
                centerValue={formatMoney(a.payments.totalDisbursed)}
              />
              <div className='mt-4 rounded-md bg-bg-white-0 py-1.5 pl-2.5 pr-1.5 text-paragraph-xs text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200'>
                {a.payments.totalTransactions} payouts · {formatMoney(a.payments.failedAmount)} failed
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </>
  );
}