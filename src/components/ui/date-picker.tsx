import * as React from 'react';
import { RiCalendarLine, RiCloseLine } from '@remixicon/react';
import { format } from 'date-fns';
import { cnExt as cn } from '@/utils/cn';
import * as Button from '@/components/ui/button';
import * as Popover from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface DatePickerProps {
  date?: Date | null;
  onDateChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDays?: (date: Date) => boolean;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  disabled,
  disabledDays,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-label-sm text-text-sub-600 outline-none transition duration-200 ease-out',
            'hover:border-stroke-strong-950',
            'focus:border-stroke-strong-950',
            'disabled:cursor-not-allowed disabled:opacity-50',
            date && 'text-text-strong-950',
          )}
        >
          <RiCalendarLine className="size-4 shrink-0" />
          <span className="flex-1 text-left">
            {date ? format(date, 'MMM d, yyyy') : placeholder}
          </span>
          {date && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDateChange(null);
              }}
              className="flex items-center justify-center text-text-sub-600 hover:text-text-strong-950"
            >
              <RiCloseLine className="size-4" />
            </button>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Content align="start" className="w-auto p-0" showArrow={false}>
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={(d) => {
            onDateChange(d ?? null);
            setOpen(false);
          }}
          disabled={disabledDays}
          initialFocus
        />
      </Popover.Content>
    </Popover.Root>
  );
}
