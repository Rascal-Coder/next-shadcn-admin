'use client';

import { FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { BaseFormFieldProps } from '@/types/base-form';
import { cn } from '@/lib/utils';

interface FormSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps<TFieldValues, TName> {
  showDescription?: boolean;
  /**
   * card：标签与开关包在带边框容器内（默认，适合独立开关块）
   * field：标签在 FormItem 顶层；开关在里层，使用与 Input 一致的边框容器以保持与表单项对齐
   */
  variant?: 'card' | 'field';
  /** 仅 variant=card 时生效：横向或纵向排布 */
  orientation?: 'horizontal' | 'vertical';
}

function FormSwitch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  required,
  showDescription = true,
  disabled,
  className,
  variant = 'card',
  orientation = 'horizontal'
}: FormSwitchProps<TFieldValues, TName>) {
  const isVertical = orientation === 'vertical';

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) =>
        variant === 'field' ? (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                {label}
                {required && <span className='ml-1 text-red-500'>*</span>}
              </FormLabel>
            )}
            <FormControl>
              {/* 与 Input 同系边框，与并排 FormInput 高度、圆角一致 */}
              <div
                className={cn(
                  'border-input flex h-9 w-full min-w-0 items-center rounded-md border bg-transparent px-3 shadow-xs',
                  'dark:bg-input/30'
                )}
              >
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </div>
            </FormControl>
            {showDescription && description && (
              <FormDescription>{description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        ) : (
          <FormItem className={cn('rounded-lg border p-4', className)}>
            <div
              className={cn(
                isVertical
                  ? 'flex flex-col gap-2'
                  : 'flex flex-row items-center justify-between'
              )}
            >
              <div className='space-y-0.5'>
                <FormLabel className={isVertical ? undefined : 'text-base'}>
                  {label}
                  {required && <span className='ml-1 text-red-500'>*</span>}
                </FormLabel>
                {showDescription && description && (
                  <FormDescription>{description}</FormDescription>
                )}
              </div>
              <FormControl className={isVertical ? 'self-start' : undefined}>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )
      }
    />
  );
}

export { FormSwitch };
