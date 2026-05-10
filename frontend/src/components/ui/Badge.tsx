import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const Badge = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300',
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
