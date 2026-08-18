import * as React from 'react';
import { format } from 'date-fns';
import { RiTimeLine, RiAlertLine, RiCheckLine, RiCloseLine, RiCircleLine } from '@remixicon/react';

import { cn } from '@/utils/cn';

interface WorkflowStep {
  id: string;
  stepOrder: number;
  assigneeRole: string;
  action: string;
}

interface WorkflowApproval {
  id: string;
  stepId: string;
  approverId: string;
  action: string;
  comment: string | null;
  createdAt: string;
}

interface WorkflowPanelProps {
  workflowInstance: {
    id: string;
    status: string;
    currentStep: number;
    pendingApproverId: string | null;
    escalatedAt: string | null;
    timePending: number | null;
    template: {
      id: string;
      name: string;
      steps: WorkflowStep[];
    };
    approvals: WorkflowApproval[];
  };
}

// 24 hours in milliseconds
const ESCALATION_THRESHOLD = 24 * 60 * 60 * 1000;

function formatTimePending(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function WorkflowPanel({ workflowInstance }: WorkflowPanelProps) {
  const { template, approvals, currentStep, timePending, escalatedAt } = workflowInstance;
  const steps = [...template.steps].sort((a, b) => a.stepOrder - b.stepOrder);

  const getApprovalForStep = (step: WorkflowStep) =>
    approvals.find((a) => a.stepId === step.id);

  return (
    <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5'>
      <h3 className='text-label-sm font-semibold text-text-strong-950 mb-1'>
        Approval Workflow
      </h3>
      <p className='text-paragraph-xs text-text-sub-600 mb-4'>
        {template.name}
      </p>

      <div className='flex flex-col gap-6'>
        {steps.map((step, index) => {
          const approval = getApprovalForStep(step);
          const isCompleted = Boolean(approval);
          const isActive = step.stepOrder === currentStep;
          const isLast = index === steps.length - 1;
          const isRejected = approval?.action === 'REJECTED';

          const NodeIcon = isCompleted
            ? isRejected
              ? RiCloseLine
              : RiCheckLine
            : isActive
              ? RiTimeLine
              : RiCircleLine;
          const nodeColor = isCompleted
            ? isRejected
              ? 'text-error-base'
              : 'text-success-base'
            : isActive
              ? 'text-warning-base'
              : 'text-text-soft-400';

          return (
            <div key={step.id} className='relative flex items-start gap-4'>
              {/* line */}
              {!isLast && (
                <div className='absolute -bottom-4 left-3.5 top-9 w-px bg-stroke-soft-200' />
              )}

              {/* node */}
              <div className='flex size-7 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
                <NodeIcon className={cn('size-4', nodeColor)} />
              </div>

              {/* content */}
              <div className='flex-1'>
                <div className='flex items-center justify-between gap-1.5'>
                  <div className='text-label-sm text-text-strong-950'>
                    {step.assigneeRole}
                  </div>
                  <div className='text-right text-subheading-2xs uppercase text-text-soft-400'>
                    {isCompleted && approval
                      ? format(new Date(approval.createdAt), 'MMM d')
                      : `Step ${step.stepOrder}`}
                  </div>
                </div>

                <div className='mt-1 text-paragraph-xs text-text-sub-600'>
                  {isCompleted && approval
                    ? approval.action === 'APPROVED'
                      ? 'Approved'
                      : 'Rejected'
                    : isActive
                      ? 'Awaiting approval'
                      : 'Upcoming'}
                </div>

                {(isCompleted && approval?.comment) ||
                (isActive && timePending && timePending > ESCALATION_THRESHOLD) ? (
                  <div className='mt-1 text-label-xs text-text-sub-600'>
                    {isCompleted && approval?.comment
                      ? `"${approval.comment}"`
                      : isActive && timePending && timePending > ESCALATION_THRESHOLD
                        ? `Pending ${formatTimePending(timePending)}`
                        : null}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Escalation banner */}
      {escalatedAt && (
        <div className='mt-4 flex items-start gap-2 rounded-lg bg-warning-lighter p-3'>
          <RiAlertLine className='size-4 text-warning-base shrink-0 mt-0.5' />
          <p className='text-paragraph-xs text-warning-base'>
            This step was escalated on{' '}
            <span className='font-medium'>
              {format(new Date(escalatedAt), 'MMM d, yyyy · h:mm a')}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}