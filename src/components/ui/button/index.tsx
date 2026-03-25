'use client';

import { Slot } from '@radix-ui/react-slot';
import { type HTMLMotionProps, motion, useReducedMotion } from 'motion/react';
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import { buttonVariants } from '@/components/ui/button/button-variants';
import { cn } from '@/lib/utils';

const MotionSlot = motion.create(Slot);

type Ripple = {
  id: number;
  x: number;
  y: number;
};

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    children?: React.ReactNode;
    /** Material-style click ripple. Ignored when `asChild` is true (Slot cannot host overlay layers). Default: true except `variant="link"`. */
    ripple?: boolean;
    hoverScale?: number;
    tapScale?: number;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      asChild = false,
      ripple: rippleProp = true,
      hoverScale = 1.02,
      tapScale = 0.98,
      style,
      disabled,
      onClick,
      children,
      ...props
    },
    ref
  ) {
    const reduceMotion = useReducedMotion();
    const [ripples, setRipples] = React.useState<Ripple[]>([]);
    const rippleIdRef = React.useRef(0);

    const rippleEnabled =
      rippleProp ?? (!asChild && variant !== 'link');

    const Comp = asChild ? MotionSlot : motion.button;

    const createRipple = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!rippleEnabled || disabled) return;

        const target = event.currentTarget;
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        rippleIdRef.current += 1;
        const id = rippleIdRef.current;
        const newRipple: Ripple = { id, x, y };

        setRipples((prev) => [...prev, newRipple]);

        window.setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      },
      [rippleEnabled, disabled]
    );

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        createRipple(event);
        onClick?.(event);
      },
      [createRipple, onClick]
    );

    const motionScale = reduceMotion
      ? undefined
      : { whileHover: { scale: hoverScale }, whileTap: { scale: tapScale } };

    const rippleLayer =
      rippleEnabled &&
      ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden
          className='pointer-events-none absolute rounded-full bg-foreground/25'
          initial={{ scale: 0, opacity: 0.45 }}
          animate={{ scale: 10, opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={{
            width: 20,
            height: 20,
            top: r.y - 10,
            left: r.x - 10
          }}
        />
      ));

    return (
      <Comp
        ref={ref}
        data-slot='button'
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled}
        style={{
          position: 'relative',
          ...(rippleEnabled ? { overflow: 'hidden' } : null),
          ...style
        }}
        onClick={handleClick}
        {...motionScale}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {rippleLayer}
            {children}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button };
