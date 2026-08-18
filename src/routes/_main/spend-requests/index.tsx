import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import { sessionAtom } from '@/store/auth.store';
import { GET_ORG_SPEND_REQUESTS } from '@/graphql/requests.graphql';
import { RiFilePaperLine } from '@remixicon/react';

import Header from '@/components/header';
import * as Divider from '@/components/ui/divider';
import { SpendRequestsTable } from './-components/spend-requests-table';

interface OrgSpendRequest {
  id: string;
  amount: number;
  currency: string;
  category: string;
  purpose: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  department?: { id: string; name: string } | null;
  wallet?: { id: string; name: string; type: string } | null;
}

export const Route = createFileRoute('/_main/spend-requests/')({
  component: SpendRequestsPage,
});

function SpendRequestsPage() {
  const session = useAtomValue(sessionAtom);
  const { data, loading } = useQuery<{ spendRequestsByOrganization: OrgSpendRequest[] }>(
    GET_ORG_SPEND_REQUESTS,
    {
      variables: { organizationId: session?.organizationId },
      skip: !session?.organizationId,
    },
  );

  const spendRequests = data?.spendRequestsByOrganization || [];

  return (
    <>
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiFilePaperLine className='size-6 text-text-sub-600' />
          </div>
        }
        title='Spend Requests'
        description='Create and manage spend requests.'
      />

      <div className='px-4 lg:px-8'>
        <Divider.Root />
      </div>

      <div className='flex flex-1 flex-col gap-4 px-4 pb-6 pt-8 lg:px-8'>
        <SpendRequestsTable data={spendRequests} isLoading={loading} />
      </div>
    </>
  );
}
