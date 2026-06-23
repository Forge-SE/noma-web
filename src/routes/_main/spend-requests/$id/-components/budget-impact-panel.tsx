import * as React from 'react';
import { formatMoney } from '@/utils/currency';
import * as ProgressBar from '@/components/ui/progress-bar';

interface BudgetImpactPanelProps {
  budgetImpact: {
    totalBudget: number;
    spent: number;
    requestAmount: number;
    currency: string;
  };
  departmentName: string;
}

export function BudgetImpactPanel({ budgetImpact, departmentName }: BudgetImpactPanelProps) {
  const { totalBudget, spent, requestAmount, currency } = budgetImpact;
  const currentPercent = Math.round((spent / totalBudget) * 100);
  const projectedPercent = Math.round(((spent + requestAmount) / totalBudget) * 100);

  // Determine severity color based on projected usage
  let severity: 'blue' | 'orange' | 'red' = 'blue';
  let severityTextColor = 'text-information-base';
  let severityBgColor = 'bg-information-lighter';

  if (projectedPercent >= 90) {
    severity = 'red';
    severityTextColor = 'text-error-base';
    severityBgColor = 'bg-error-lighter';
  } else if (projectedPercent >= 70) {
    severity = 'orange';
    severityTextColor = 'text-warning-base';
    severityBgColor = 'bg-warning-lighter';
  }

  return (
    <div className={`rounded-xl border border-stroke-soft-200 ${severityBgColor} p-5`}>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h3 className='text-label-sm font-semibold text-text-strong-950'>
            Budget Impact
          </h3>
          <p className={`mt-1 text-paragraph-sm ${severityTextColor}`}>
            This will bring <span className='font-semibold'>{departmentName}</span> to{' '}
            <span className='font-semibold'>{projectedPercent}%</span> of its budget.
          </p>
        </div>
        <div className='text-right'>
          <p className='text-label-sm font-semibold text-text-strong-950'>
            {formatMoney(spent + requestAmount, currency)}
          </p>
          <p className='text-paragraph-xs text-text-sub-600'>
            of {formatMoney(totalBudget, currency)}
          </p>
        </div>
      </div>

      <div className='mt-4 space-y-2'>
        {/* Current spend bar */}
        <div>
          <div className='mb-1 flex items-center justify-between'>
            <span className='text-paragraph-xs text-text-sub-600'>Current spend</span>
            <span className='text-paragraph-xs text-text-sub-600'>{currentPercent}%</span>
          </div>
          <ProgressBar.Root value={currentPercent} max={100} color={severity === 'red' ? 'orange' : 'blue'} />
        </div>

        {/* Projected spend bar (includes this request) */}
        <div>
          <div className='mb-1 flex items-center justify-between'>
            <span className='text-paragraph-xs font-medium text-text-strong-950'>
              After this request
            </span>
            <span className={`text-paragraph-xs font-medium ${severityTextColor}`}>
              {projectedPercent}%
            </span>
          </div>
          <ProgressBar.Root value={projectedPercent} max={100} color={severity} />
        </div>
      </div>

      {/* Breakdown */}
      <div className='mt-4 flex items-center gap-4 border-t border-stroke-soft-200 pt-3'>
        <div className='flex-1'>
          <p className='text-paragraph-xs text-text-sub-600'>Already spent</p>
          <p className='text-label-xs font-medium text-text-strong-950'>{formatMoney(spent, currency)}</p>
        </div>
        <div className='flex-1'>
          <p className='text-paragraph-xs text-text-sub-600'>This request</p>
          <p className={`text-label-xs font-medium ${severityTextColor}`}>
            +{formatMoney(requestAmount, currency)}
          </p>
        </div>
        <div className='flex-1'>
          <p className='text-paragraph-xs text-text-sub-600'>Remaining</p>
          <p className='text-label-xs font-medium text-text-strong-950'>
            {formatMoney(Math.max(0, totalBudget - spent - requestAmount), currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
