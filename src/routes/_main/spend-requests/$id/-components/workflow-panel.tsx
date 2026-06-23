import * as React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { RiTimeLine, RiAlertLine, RiCheckLine, RiCloseLine } from '@remixicon/react';

import * as VerticalStepper from '@/components/ui/vertical-stepper';

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

  const getStepState = (step: WorkflowStep): 'completed' | 'active' | 'default' => {
    const approval = getApprovalForStep(step);
    if (approval) return 'completed';
    if (step.stepOrder === currentStep) return 'active';
    return 'default';
  };

  return (
    <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5'>
      <h3 className='text-label-sm font-semibold text-text-strong-950 mb-1'>
        Approval Workflow
      </h3>
      <p className='text-paragraph-xs text-text-sub-600 mb-4'>
        {template.name}
      </p>

      <VerticalStepper.Root>
        {steps.map((step) => {
          const state = getStepState(step);
          const approval = getApprovalForStep(step);

          return (
            <VerticalStepper.Item key={step.id} state={state}>
              <VerticalStepper.ItemIndicator>
                {step.stepOrder}
              </VerticalStepper.ItemIndicator>
              <div className='flex-1'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-paragraph-sm font-medium'>
                    {step.assigneeRole}
                  </span>
                  {state === 'completed' && approval && (
                    <span className={`inline-flex items-center gap-1 text-paragraph-xs ${
                      approval.action === 'APPROVED' ? 'text-success-base' : 'text-error-base'
                    }`}>
                      {approval.action === 'APPROVED' ? (
                        <RiCheckLine className='size-3.5' />
                      ) : (
                        <RiCloseLine className='size-3.5' />
                      )}
                      {approval.action}
                    </span>
                  )}
                  {state === 'active' && timePending && timePending > ESCALATION_THRESHOLD && (
                    <span className='inline-flex items-center gap-1 text-paragraph-xs text-warning-base'>
                      <RiTimeLine className='size-3.5' />
                      Pending {formatTimePending(timePending)}
                    </span>
                  )}
                </div>

                {/* Approval details for completed steps */}
                {state === 'completed' && approval && (
                  <div className='mt-1'>
                    {approval.comment && (
                      <p className='text-paragraph-xs text-text-sub-600 italic'>
                        "{approval.comment}"
                      </p>
                    )}
                    <p className='text-paragraph-xs text-text-sub-600 mt-0.5'>
                      {format(new Date(approval.createdAt), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                )}

                {/* Current step info */}
                {state === 'active' && (
                  <p className='text-paragraph-xs text-text-sub-600 mt-1'>
                    Awaiting {step.action.toLowerCase()} from <span className='font-medium'>{step.assigneeRole}</span>
                  </p>
                )}

                {/* Future step info */}
                {state === 'default' && (
                  <p className='text-paragraph-xs text-text-soft-400 mt-1'>
                    {step.assigneeRole} · {step.action}
                  </p>
                )}
              </div>
            </VerticalStepper.Item>
          );
        })}
      </VerticalStepper.Root>

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
