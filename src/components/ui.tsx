import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Reusable Components

export const Badge = ({ children, className, variant = 'default' }: { 
  children: React.ReactNode, 
  className?: string,
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'priority'
}) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
    priority: '', // Custom handled in component
  };

  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variants[variant as keyof typeof variants] || "",
      className
    )}>
      {children}
    </div>
  );
};

export const Avatar = ({ initials, color, className, size = 'sm' }: { 
  initials: string, 
  color: string, 
  className?: string,
  size?: 'sm' | 'md' | 'lg'
}) => {
  const sizes = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-full font-medium text-white ring-2 ring-background",
        sizes[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
};

export const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variants[variant as keyof typeof variants] || "",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
