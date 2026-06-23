import * as React from 'react';
import { RiImageLine, RiCloseLine } from '@remixicon/react';

interface ReceiptViewerProps {
  receiptUrl?: string | null;
}

export function ReceiptViewer({ receiptUrl }: ReceiptViewerProps) {
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

  if (!receiptUrl) {
    return (
      <div className='rounded-xl border border-dashed border-stroke-soft-200 bg-bg-weak-50 p-6'>
        <div className='flex flex-col items-center justify-center gap-2 text-center'>
          <div className='flex size-10 items-center justify-center rounded-lg bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200'>
            <RiImageLine className='size-5 text-text-soft-400' />
          </div>
          <p className='text-paragraph-sm text-text-sub-600'>No receipt attached</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsLightboxOpen(true)}
        className='group relative overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 transition-shadow hover:shadow-regular-xs'
      >
        <img
          src={receiptUrl}
          alt='Receipt'
          className='h-32 w-full object-cover transition-transform group-hover:scale-105'
        />
        <div className='absolute inset-0 flex items-center justify-center bg-static-black/0 transition-colors group-hover:bg-static-black/40'>
          <span className='text-label-xs text-static-white opacity-0 transition-opacity group-hover:opacity-100'>
            Click to view
          </span>
        </div>
      </button>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-static-black/80 p-6'
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className='absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-static-white/10 text-static-white hover:bg-static-white/20 transition-colors'
          >
            <RiCloseLine className='size-5' />
          </button>
          <img
            src={receiptUrl}
            alt='Receipt full view'
            className='max-h-[85vh] max-w-[85vw] rounded-lg object-contain'
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
