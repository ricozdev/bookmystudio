import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'darkOutline' | 'white' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'right',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#09090B] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-lg gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold active:scale-[0.98] shadow-sm',
    secondary: 'bg-zinc-100 hover:bg-zinc-200 dark:bg-[#18181E] dark:hover:bg-[#22222B] text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-800 font-semibold',
    outline: 'border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#121216] text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-[#18181E] hover:border-zinc-400 dark:hover:border-zinc-700 shadow-xs',
    darkOutline: 'border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900/60 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600',
    white: 'bg-white text-zinc-950 hover:bg-zinc-100 font-bold shadow-sm',
    pill: 'rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm px-5 py-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
}

