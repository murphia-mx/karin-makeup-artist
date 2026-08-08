import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { premiumTransition } from '../../lib/framer/variants';
import { Loader2 } from 'lucide-react';

type OmitMotionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'ref'>;

export interface ButtonProps extends OmitMotionProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      children, 
      variant = 'primary', 
      size = 'md', 
      isLoading = false, 
      leftIcon, 
      rightIcon,
      fullWidth = false,
      className, 
      disabled, 
      ...props 
    }, 
    ref
  ) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 overflow-hidden';
    
    const variants = {
      primary: 'bg-brand-surface-dark text-white hover:bg-brand-surface-dark-hover shadow-premium',
      secondary: 'bg-brand-gray-light text-brand-text hover:bg-[#E0DCD5]',
      outline: 'bg-transparent border border-brand-border text-brand-text hover:border-brand-text',
      ghost: 'bg-transparent text-brand-text-muted hover:text-brand-text hover:bg-brand-gray-light/50',
    };

    const sizes = {
      sm: 'text-xs px-4 py-2 gap-1.5',
      md: 'text-sm px-6 py-3 gap-2',
      lg: 'text-base px-8 py-4 gap-3',
      icon: 'p-3',
    };

    const motionProps: HTMLMotionProps<"button"> = {
      whileHover: !disabled && !isLoading ? { scale: 1.02 } : {},
      whileTap: !disabled && !isLoading ? { scale: 0.98 } : {},
      transition: premiumTransition,
      ...(props as any)
    };

    return (
      <motion.button
        ref={ref as any}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          (disabled || isLoading) && 'opacity-60 cursor-not-allowed',
          className
        )}
        disabled={disabled || isLoading}
        {...motionProps}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin absolute" />}
        <span className={clsx("flex items-center gap-2", isLoading && 'opacity-0')}>
          {leftIcon}
          {children}
          {rightIcon}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
