import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { formatDistanceToNow } from 'date-fns';
import { RiCheckboxCircleLine, RiArrowRightLine } from '@remixicon/react';

import Header from '@/components/header';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { PENDING_APPROVALS_BY_ORG } from '@/graphql/requests.graphql';
import { sessionAtom } from '@/store/auth.store';
import { formatMoney } from '@/utils/currency';

interface PendingApprovalItem {
  id: string;
  amount: number;
  currency: string;
  category: string;
  purpose: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  requester?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;
  workflowInstance?: {
    id: string;
    status: string;
    currentStep: number;
    template?: {
      steps?: { stepOrder: number; assigneeRole: string }[];
    } | null;
  } | null;
}

export function ApprovalsPage() {
  const session = useAtomValue(sessionAtom);
  const navigate = useNavigate();

  const { data, loading } = useQuery<{ pendingApprovalsByOrganization: PendingApprovalItem[] }>(
    PENDING_APPROVALS_BY_ORG,
    {
      variables: { organizationId: session?.organizationId },
      skip: !session?.organizationId,
      pollInterval: 8000,
    },
  );

  const approvals = data?.pendingApprovalsByOrganization || [];

  return (
    <>
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiCheckboxCircleLine className='size-6 text-text-sub-600' />
          </div>
        }
        title='Approvals'
        description='Review and approve requests waiting on you.'
      />

      <div className='flex flex-1 flex-col gap-4 px-4 pb-6 pt-8 lg:px-8'>
        <Table.Root>
          <Table.Header className='whitespace-nowrap'>
            <Table.Row>
              <Table.Head>Requester</Table.Head>
              <Table.Head>Category</Table.Head>
              <Table.Head>Purpose</Table.Head>
              <Table.Head>Amount</Table.Head>
              <Table.Head>Step</Table.Head>
              <Table.Head>Submitted</Table.Head>
              <Table.Head />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={7} className='h-48'>
                  <Loader />
                </Table.Cell>
              </Table.Row>
            ) : approvals.length > 0 ? (
              approvals.map((approval, i, arr) => {
                const workflow = approval.workflowInstance;
                const steps = workflow?.template?.steps?.length ?? 0;
                const step = workflow?.currentStep ?? 1;
                return (
                  <React.Fragment key={approval.id}>
                    <Table.Row
                      onClick={() => navigate({ to: '/spend-requests/$id', params: { id: approval.id } })}
                      className='cursor-pointer hover:bg-bg-weak-50'
                    >
                      <Table.Cell className='h-12'>
                        <div className='text-paragraph-sm font-medium text-text-strong-950'>
                          {approval.requester?.name ?? 'Unknown'}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className='text-paragraph-sm text-text-strong-950'>
                          {approval.category}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className='text-paragraph-sm text-text-sub-600 truncate max-w-[220px]'>
                          {approval.purpose}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className='text-paragraph-sm text-text-strong-950'>
                          {formatMoney(approval.amount)}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge.Root variant='lighter' color='orange' size='medium'>
                          <Badge.Dot />
                          {steps ? `Step ${step} of ${steps}` : `Step ${step}`}
                        </Badge.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <div className='text-paragraph-sm text-text-sub-600'>
                          {approval.submittedAt
                            ? formatDistanceToNow(new Date(approval.submittedAt), { addSuffix: true })
                            : '—'}
                        </div>
                      </Table.Cell>
                      <Table.Cell className='w-0 px-5'>
                        <Button.Root
                          size='small'
                          variant='neutral'
                          mode='stroke'
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            navigate({ to: '/spend-requests/$id', params: { id: approval.id } });
                          }}
                        >
                          Review
                          <Button.Icon as={RiArrowRightLine} />
                        </Button.Root>
                      </Table.Cell>
                    </Table.Row>
                    {i < arr.length - 1 && <Table.RowDivider />}
                  </React.Fragment>
                );
              })
            ) : (
              <Table.Row>
                <Table.Cell colSpan={7} className='h-[500px]'>
                  <div className='flex h-full flex-col items-center justify-center gap-4 text-center'>
                    <div className='flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
                      <RiCheckboxCircleLine className='size-6 text-text-sub-600' />
                    </div>
                    <div>
                      <p className='text-label-md text-text-strong-950'>Nothing waiting on you</p>
                      <p className='text-paragraph-sm text-text-sub-600 mt-1'>
                        You&apos;re all caught up — no requests are pending your approval.
                      </p>
                    </div>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>
    </>
  );
}