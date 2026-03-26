'use client';

import { Icons } from '@/components/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

export type BreadcrumbsProps = {
  /** 仅有当前一级时是否隐藏（默认隐藏） */
  hideOnSingleItem?: boolean;
};

export function Breadcrumbs({ hideOnSingleItem = true }: BreadcrumbsProps) {
  const items = useBreadcrumbs();
  const currentPath = usePathname();

  if (items.length === 0) return null;
  if (items.length === 1 && hideOnSingleItem) return null;

  return (
    <Card className='bg-card/50 size-fit rounded-md border py-0 shadow-none'>
      <CardContent className='px-3 py-2'>
        <Breadcrumb>
          <BreadcrumbList className='flex flex-nowrap items-center gap-1 sm:gap-2'>
            <AnimatePresence mode='popLayout'>
              {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const IconComponent = Icons[item.icon];
                const delay = index * 0.05;
                const crumbKey = `${currentPath}-${index}-${item.link}-${item.title}`;

                return (
                  <Fragment key={crumbKey}>
                    <BreadcrumbItem
                      className={cn(
                        'items-center gap-1.5',
                        !isLast && 'hidden md:inline-flex',
                        isLast && 'inline-flex'
                      )}
                    >
                      <motion.div
                        className='inline-flex items-center gap-2'
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2, delay }}
                        layout
                      >
                        <IconComponent
                          className={cn(
                            'size-3.5 shrink-0',
                            isLast ? 'text-foreground' : 'text-muted-foreground'
                          )}
                          aria-hidden
                        />
                        {isLast ? (
                          <BreadcrumbPage>{item.title}</BreadcrumbPage>
                        ) : item.link !== '#' ? (
                          <BreadcrumbLink asChild>
                            <Link
                              href={item.link}
                              className='inline-flex items-center gap-2'
                            >
                              {item.title}
                            </Link>
                          </BreadcrumbLink>
                        ) : (
                          <span className='text-muted-foreground text-sm'>
                            {item.title}
                          </span>
                        )}
                      </motion.div>
                    </BreadcrumbItem>

                    {!isLast && (
                      <BreadcrumbSeparator className='hidden md:flex'>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className='flex'
                        >
                          <ChevronRight className='size-3.5' aria-hidden />
                        </motion.span>
                      </BreadcrumbSeparator>
                    )}
                  </Fragment>
                );
              })}
            </AnimatePresence>
          </BreadcrumbList>
        </Breadcrumb>
      </CardContent>
    </Card>
  );
}
