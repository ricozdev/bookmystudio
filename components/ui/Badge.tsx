import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'dark' | 'secondary' | 'green' | 'amber' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'dark',
  size = 'sm',
  className = '',
  dot = false,
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-bold tracking-wider uppercase transition-colors';
  
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 rounded',
    md: 'text-xs px-2.5 py-1 rounded-md',
  };

  const variantStyles = {
    dark: 'bg-black/90 dark:bg-black/80 text-white backdrop-blur-sm border border-white/10',
    secondary: 'bg-slate-800/80 dark:bg-[#262626] text-slate-200 dark:text-[#F5F5F5] backdrop-blur-sm border border-slate-700/50 dark:border-[#383838]',
    green: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40',
    outline: 'border border-slate-200 dark:border-[#303030] text-slate-700 dark:text-[#B3B3B3] bg-white dark:bg-[#181818]',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            variant === 'green'
              ? 'bg-emerald-500'
              : variant === 'amber'
              ? 'bg-amber-500'
              : 'bg-current'
          }`}
        />
      )}
      {children}
    </span>
  );
}

