'use client';

import { Inbox } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export type EmptyContentProps = {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  /** 用于表格单元格等窄区域 */
  compact?: boolean;
  className?: string;
};

function EmptyContent({
  title = 'No results',
  description,
  icon,
  compact = false,
  className
}: EmptyContentProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 text-center',
        compact ? 'py-1' : 'py-8',
        className
      )}
    >
      {icon ?? (
        <Inbox
          className={cn(
            'text-muted-foreground/80',
            compact ? 'size-8' : 'size-10'
          )}
          aria-hidden
        />
      )}
      <div className={cn('space-y-1', compact && 'max-w-sm')}>
        <p
          className={cn(
            'text-foreground font-medium',
            compact ? 'text-sm' : 'text-base'
          )}
        >
          {title}
        </p>
        {description ? (
          <p
            className={cn(
              'text-muted-foreground',
              compact ? 'text-xs' : 'text-sm'
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default EmptyContent;
