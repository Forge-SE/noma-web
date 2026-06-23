import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  // Use to take up full screen height
  fullScreen?: boolean;
}

export function Loader({ className, fullScreen, ...props }: LoaderProps) {
  return (
    <div
      className={twMerge(
        'flex items-center justify-center w-full',
        fullScreen && 'min-h-screen',
        !fullScreen && 'py-12', // default vertical padding for within cards/tables
        className
      )}
      {...props}
    >
      <div className="loader" />
    </div>
  );
}
