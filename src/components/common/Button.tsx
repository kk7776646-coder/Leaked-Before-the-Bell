import React from 'react';
import { LoaderCircle } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer whitespace-nowrap transition-all duration-150 ease-out';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 h-8',
    md: 'px-4 py-2 text-sm gap-2 h-9',
    lg: 'px-5 py-2.5 text-base gap-2.5 h-10',
  };

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold border border-blue-700/80 shadow-[0_1px_2px_rgba(0,0,0,0.12)] active:shadow-none',
    secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-700/80 text-slate-800 dark:text-slate-100 font-medium border border-slate-200 dark:border-slate-700 shadow-2xs',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold border border-rose-700/80 shadow-xs active:shadow-none',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 active:bg-slate-200/70 dark:active:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium border border-transparent',
    outline: 'border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="w-4 h-4 animate-spin shrink-0 text-current" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
