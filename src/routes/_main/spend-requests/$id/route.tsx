import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import { sessionAtom } from '@/store/auth.store';
import { format } from 'date-fns';
import {
  RiArrowLeftSLine,
  RiFilePaperLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowUpLine,
  RiTimeFill,
} from '@remixicon/react';

import Header from '@/components/header';
import * as Badge from '@/components/ui/badge';
import * as StatusBadge from '@/components/ui/status-badge';
import * as Avatar from '@/components/ui/avatar';
import * as Button from '@/components/ui/button';
import * as FancyButton from '@/components/ui/fancy-button';
import * as Modal from '@/components/ui/modal';
import * as Textarea from '@/components/ui/textarea';
import * as Select from '@/components/ui/select';
import * as Divider from '@/components/ui/divider';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/components/ui/toaster';
import { useModalParams } from '@/hooks/use-modal-params';
import { formatMoney } from '@/utils/currency';

import {
  GET_SPEND_REQUEST_DETAIL,
  APPROVE_SPEND_REQUEST,
  REJECT_SPEND_REQUEST,
  ESCALATE_WORKFLOW_INSTANCE,
  RETRY_DISBURSEMENT,
} from '@/graphql/requests.graphql';
import { GET_USERS_QUERY } from '@/graphql/users.graphql';

import { BudgetImpactPanel } from './-components/budget-impact-panel';
import { WorkflowPanel } from './-components/workflow-panel';
import { ReceiptViewer } from './-components/receipt-viewer';
import { PaymentStatusPanel } from './-components/payment-status-panel';

export const Route = createFileRoute('/_main/spend-requests/$id')({
  component: SpendRequestDetailPage,
});

/* ── Helpers ─────────────────────────────────────────── */

function mapRequestStatus(status: string): 'completed' | 'pending' | 'failed' | 'disabled' {
  switch (status) {
    case 'APPROVED':
    case 'DISBURSED':
      return 'completed';
    case 'UNDER_REVIEW':
    case 'SUBMITTED':
      return 'pending';
    case 'REJECTED':
      return 'failed';
    default:
      return 'disabled';
  }
}

function getStatusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

function statusToBadgeColor(
  status: 'completed' | 'pending' | 'failed' | 'disabled',
): 'green' | 'orange' | 'red' | 'gray' {
  switch (status) {
    case 'completed':
      return 'green';
    case 'pending':
      return 'orange';
    case 'failed':
      return 'red';
    default:
      return 'gray';
  }
}

interface OrgUser {
  id: string;
  name: string;
}

/* ── Page ────────────────────────────────────────────── */

function SpendRequestDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const session = useAtomValue(sessionAtom);
  const { toast } = useToast();

  const { activeModal, openModal, closeModal } = useModalParams();
  const [approveComment, setApproveComment] = React.useState('');
  const [rejectComment, setRejectComment] = React.useState('');
  const [escalateToUserId, setEscalateToUserId] = React.useState('');

  const { data, loading, refetch } = useQuery(GET_SPEND_REQUEST_DETAIL, {
    variables: { id },
  });
  const currentPaymentStatus = (data as any)?.spendRequest?.paymentTransaction?.status;
  const isPaymentInFlight = currentPaymentStatus === 'PENDING' || currentPaymentStatus === 'PROCESSING';
  React.useEffect(() => {
    if (!isPaymentInFlight) return;
    const timer = setInterval(() => refetch(), 5000);
    return () => clearInterval(timer);
  }, [isPaymentInFlight, refetch]);

  const [approveRequest, { loading: approving }] = useMutation(APPROVE_SPEND_REQUEST);
  const [rejectRequest, { loading: rejecting }] = useMutation(REJECT_SPEND_REQUEST);
  const [escalateInstance, { loading: escalating }] = useMutation(ESCALATE_WORKFLOW_INSTANCE);
  const [retryDisbursement, { loading: retrying }] = useMutation(RETRY_DISBURSEMENT);

  const { data: orgUsersData } = useQuery<{ users: OrgUser[] }>(GET_USERS_QUERY, {
    variables: { organizationId: session?.organizationId },
    skip: !session?.organizationId,
  });
  const orgUsers = orgUsersData?.users || [];

  const request = (data as any)?.spendRequest;

  if (loading) return <Loader fullScreen />;
  if (!request) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <p className='text-paragraph-md text-text-sub-600'>Spend request not found.</p>
      </div>
    );
  }

  const requester = request.requester;
  const requesterName = requester?.name ?? 'Unknown User';
  const requesterInitials = requester?.name
    ? requester.name
        .split(' ')
        .map((part: string) => part[0])
        .join('')
    : '?';

  const workflowInstance = request.workflowInstance;
  const isUnderReview = request.status === 'UNDER_REVIEW';
  const isPendingApprover =
    isUnderReview &&
    workflowInstance?.pendingApproverId === session?.userId;
  const canAct =
    isUnderReview &&
    workflowInstance &&
    (isPendingApprover || session?.role === 'ADMIN' || session?.role === 'FINANCE');

  /* ── Actions ─────────────────────────────────────── */

  const handleApprove = async () => {
    if (!workflowInstance) return;
    try {
      await approveRequest({
        variables: { instanceId: workflowInstance.id, comment: approveComment || null },
      });
      toast({ title: 'Request approved', description: 'The spend request has been approved.' });
      setApproveComment('');
      refetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message });
    }
  };

  const handleReject = async () => {
    if (!workflowInstance || !rejectComment.trim()) return;
    try {
      await rejectRequest({
        variables: { instanceId: workflowInstance.id, comment: rejectComment },
      });
      toast({ title: 'Request rejected', description: 'The spend request has been rejected.' });
      setRejectComment('');
      closeModal();
      refetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message });
    }
  };

  const handleEscalate = async () => {
    if (!workflowInstance || !escalateToUserId) return;
    try {
      await escalateInstance({
        variables: { instanceId: workflowInstance.id, newApproverId: escalateToUserId },
      });
      toast({ title: 'Escalated', description: 'The workflow step has been escalated.' });
      closeModal();
      setEscalateToUserId('');
      refetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message });
    }
  };

  return (
    <>
      {/* Back button + Header */}
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiFilePaperLine className='size-6 text-text-sub-600' />
          </div>
        }
        title='Spend Request'
        description={`Request #${id.slice(0, 8).toUpperCase()}`}
      >
        <Button.Root
          variant='neutral'
          mode='stroke'
          size='small'
          onClick={() => navigate({ to: '/spend-requests' })}
        >
          <Button.Icon as={RiArrowLeftSLine} />
          Back
        </Button.Root>
      </Header>

      <div className='px-4 lg:px-8'>
        <Divider.Root />
      </div>

      <div className='flex flex-1 flex-col gap-6 px-4 pb-8 pt-6 lg:px-8'>
        {/* ── Money Display + Status Header ─────────── */}
        <div className='flex flex-col gap-4 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex items-center gap-4'>
            <Avatar.Root size='48' color='purple'>
              {requesterInitials}
            </Avatar.Root>
            <div>
              <p className='text-title-h4 font-semibold text-text-strong-950'>
                {formatMoney(request.amount)}
              </p>
              <p className='text-paragraph-sm text-text-sub-600'>
                Requested by <span className='font-medium'>{requesterName}</span>
              </p>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <Badge.Root
              variant='lighter'
              color={statusToBadgeColor(mapRequestStatus(request.status))}
              size='medium'
            >
              <Badge.Dot />
              {getStatusLabel(request.status)}
            </Badge.Root>
            {isUnderReview && workflowInstance && (
              <StatusBadge.Root variant='stroke' status={isPendingApprover ? 'pending' : 'disabled'}>
                <StatusBadge.Icon as={RiTimeFill} />
                {isPendingApprover ? 'Waiting on you' : 'Waiting on approver'}
              </StatusBadge.Root>
            )}
          </div>
        </div>

        {/* ── Two-column layout ─────────────────────── */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Left column — details + budget impact */}
          <div className='flex flex-col gap-6 lg:col-span-2'>
            {/* Detail Fields Grid */}
            <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5'>
              <h3 className='text-label-sm font-semibold text-text-strong-950 mb-4'>
                Request Details
              </h3>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <DetailField label='Category' value={request.category} />
                <DetailField label='Purpose' value={request.purpose} />
                <DetailField
                  label='Submitted'
                  value={
                    request.submittedAt
                      ? format(new Date(request.submittedAt), 'MMM d, yyyy · h:mm a')
                      : 'Not yet submitted'
                  }
                />
                <DetailField
                  label='Department'
                  value={request.department?.name || '—'}
                />
                <DetailField label='Wallet'>
                  <div className='flex items-center gap-2'>
                    <span className='text-paragraph-sm text-text-strong-950'>
                      {request.wallet?.name || '—'}
                    </span>
                    {request.wallet?.type && (
                      <StatusBadge.Root variant='stroke'>
                        {request.wallet.type}
                      </StatusBadge.Root>
                    )}
                  </div>
                </DetailField>
                <DetailField
                  label='Created'
                  value={format(new Date(request.createdAt), 'MMM d, yyyy · h:mm a')}
                />
              </div>
            </div>

            {/* Budget Impact Panel */}
            {request.budgetImpact && request.department && (
              <BudgetImpactPanel
                budgetImpact={request.budgetImpact}
                departmentName={request.department.name}
              />
            )}

            {/* Receipt */}
            <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5'>
              <h3 className='text-label-sm font-semibold text-text-strong-950 mb-4'>
                Receipt
              </h3>
              <ReceiptViewer receiptUrl={null} />
            </div>

            {/* Payment Status */}
            {request.paymentTransaction &&
              (request.status === 'APPROVED' || request.status === 'DISBURSED') && (
                <PaymentStatusPanel
                  paymentTransaction={request.paymentTransaction}
                  isFinanceManager={session?.role === 'FINANCE' || session?.role === 'ADMIN'}
                  retrying={retrying}
                  onRetryDisbursement={async () => {
                    try {
                      await retryDisbursement({
                        variables: {
                          input: {
                            paymentTransactionId: request.paymentTransaction.id,
                          },
                        },
                      });
                      toast({ title: 'Disbursement retried', description: 'The disbursement has been re-submitted for processing.' });
                      refetch();
                    } catch (e: any) {
                      toast({ title: 'Retry failed', description: e.message });
                    }
                  }}
                />
              )}
          </div>

          {/* Right column — workflow + actions */}
          <div className='flex flex-col gap-6'>
            {/* Approval Actions */}
            {canAct && (
              <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5'>
                <h3 className='text-label-sm font-semibold text-text-strong-950 mb-4'>
                  Your Action Required
                </h3>

                <Textarea.Root 
                  className='mb-5'
                  placeholder='Add a comment (optional for approval)...'
                  value={approveComment}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setApproveComment(e.target.value)}
                  rows={2}
                />

                <div className='flex flex-col gap-2'>
                  <FancyButton.Root
                    variant='primary'
                    className='w-full'
                    onClick={handleApprove}
                    disabled={approving}
                  >
                    <FancyButton.Icon as={RiCheckLine} />
                    {approving ? 'Approving...' : 'Approve'}
                  </FancyButton.Root>

                  <Button.Root
                    variant='error'
                    mode='stroke'
                    className='w-full'
                    onClick={() => openModal('reject-request')}
                  >
                    <Button.Icon as={RiCloseLine} />
                    Reject
                  </Button.Root>

                  <Button.Root
                    variant='neutral'
                    mode='stroke'
                    className='w-full'
                    onClick={() => openModal('escalate-request')}
                  >
                    <Button.Icon as={RiArrowUpLine} />
                    Escalate
                  </Button.Root>
                </div>
              </div>
            )}

            {/* Workflow Panel */}
            {workflowInstance && (
              <WorkflowPanel workflowInstance={workflowInstance} />
            )}
          </div>
        </div>
      </div>

      {/* ── Reject Modal ───────────────────────────── */}
      <Modal.Root open={activeModal === 'reject-request'} onOpenChange={(open) => !open && closeModal()}>
        <Modal.Content className='sm:max-w-md'>
          <Modal.Header>
            <Modal.Title>Reject Spend Request</Modal.Title>
            <Modal.Description>
              Please provide a reason for rejecting this request. This comment is required.
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            <Textarea.Root
              placeholder='Reason for rejection...'
              value={rejectComment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectComment(e.target.value)}
              rows={3}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button.Root
              variant='neutral'
              mode='stroke'
              onClick={closeModal}
            >
              Cancel
            </Button.Root>
            <Button.Root
              variant='error'
              onClick={handleReject}
              disabled={rejecting || !rejectComment.trim()}
            >
              {rejecting ? 'Rejecting...' : 'Reject Request'}
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {/* ── Escalate Modal ─────────────────────────── */}
      <Modal.Root open={activeModal === 'escalate-request'} onOpenChange={(open) => !open && closeModal()}>
        <Modal.Content className='sm:max-w-md'>
          <Modal.Header>
            <Modal.Title>Escalate Workflow Step</Modal.Title>
            <Modal.Description>
              Select a user to escalate this approval step to.
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            <Select.Root value={escalateToUserId} onValueChange={setEscalateToUserId}>
              <Select.Trigger>
                <Select.Value placeholder='Select approver...' />
              </Select.Trigger>
              <Select.Content>
                {orgUsers.length > 0 ? (
                  orgUsers.map((user) => (
                    <Select.Item key={user.id} value={user.id}>
                      {user.name}
                      {user.id === workflowInstance?.pendingApproverId ? ' (current)' : ''}
                    </Select.Item>
                  ))
                ) : (
                  <Select.Item value='placeholder'>
                    Organization users (coming soon)
                  </Select.Item>
                )}
              </Select.Content>
            </Select.Root>
          </Modal.Body>
          <Modal.Footer>
            <Button.Root
              variant='neutral'
              mode='stroke'
              onClick={closeModal}
            >
              Cancel
            </Button.Root>
            <FancyButton.Root
              variant='primary'
              onClick={handleEscalate}
              disabled={escalating || !escalateToUserId}
            >
              {escalating ? 'Escalating...' : 'Escalate'}
            </FancyButton.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}

/* ── Detail Field ────────────────────────────────────── */

function DetailField({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className='text-paragraph-xs text-text-sub-600 mb-1'>{label}</p>
      {children || (
        <p className='text-paragraph-sm text-text-strong-950'>{value}</p>
      )}
    </div>
  );
}
