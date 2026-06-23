import { RiFileChartLine } from '@remixicon/react';

import Header from '@/components/header';

export function ReportsPage() {
  return (
    <>
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiFileChartLine className='size-6 text-text-sub-600' />
          </div>
        }
        title='Reports'
        description='View spending and disbursement reports.'
      />
      <div className='flex flex-1 items-center justify-center px-4 py-12'>
        <p className='text-paragraph-md text-text-sub-600'>Reports coming soon.</p>
      </div>
    </>
  );
}
