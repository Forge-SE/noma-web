import { RiCheckboxCircleLine } from '@remixicon/react';

import Header from '@/components/header';

export function ApprovalsPage() {
  return (
    <>
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiCheckboxCircleLine className='size-6 text-text-sub-600' />
          </div>
        }
        title='Approvals'
        description='Review and approve pending requests.'
      />
      <div className='flex flex-1 items-center justify-center px-4 py-12'>
        <p className='text-paragraph-md text-text-sub-600'>Approval queue coming soon.</p>
      </div>
    </>
  );
}
