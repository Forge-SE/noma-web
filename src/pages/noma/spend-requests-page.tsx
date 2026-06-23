import { RiFilePaperLine } from '@remixicon/react';

import Header from '@/components/header';

export function SpendRequestsPage() {
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
      <div className='flex flex-1 items-center justify-center px-4 py-12'>
        <p className='text-paragraph-md text-text-sub-600'>Spend requests coming soon.</p>
      </div>
    </>
  );
}
