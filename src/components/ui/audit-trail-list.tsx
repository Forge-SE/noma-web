import * as React from 'react';
import { format } from 'date-fns';
import { RiArrowDownSLine, RiArrowUpSLine, RiHistoryLine } from '@remixicon/react';

interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  changes: any;
  createdAt: string;
}

interface AuditTrailListProps {
  entries: AuditLogEntry[];
  isLoading?: boolean;
}

export function AuditTrailList({ entries, isLoading }: AuditTrailListProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (isLoading) return null;
  if (!entries || entries.length === 0) return null;

  return (
    <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex w-full items-center justify-between p-5 text-left hover:bg-bg-weak-50 transition-colors rounded-xl'
      >
        <div className='flex items-center gap-2'>
          <RiHistoryLine className='size-4 text-text-sub-600' />
          <h3 className='text-label-sm font-semibold text-text-strong-950'>
            Audit Trail
          </h3>
          <span className='text-paragraph-xs text-text-sub-600'>
            ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
          </span>
        </div>
        {isExpanded ? (
          <RiArrowUpSLine className='size-5 text-text-sub-600' />
        ) : (
          <RiArrowDownSLine className='size-5 text-text-sub-600' />
        )}
      </button>

      {isExpanded && (
        <div className='border-t border-stroke-soft-200 px-5 pb-5'>
          <div className='divide-y divide-stroke-soft-200'>
            {entries.map((entry) => (
              <div key={entry.id} className='flex items-start gap-3 py-3 first:pt-4'>
                <div className='mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-weak-50'>
                  <div className='size-1.5 rounded-full bg-text-sub-600' />
                </div>
                <div className='flex-1'>
                  <p className='text-paragraph-xs font-medium text-text-strong-950'>
                    {formatAuditAction(entry.action)}
                  </p>
                  {entry.changes && (
                    <p className='text-paragraph-xs text-text-sub-600 mt-0.5'>
                      {typeof entry.changes === 'string' ? entry.changes : JSON.stringify(entry.changes)}
                    </p>
                  )}
                  <p className='text-paragraph-xs text-text-soft-400 mt-0.5'>
                    {format(new Date(entry.createdAt), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatAuditAction(action: string): string {
  return action
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
