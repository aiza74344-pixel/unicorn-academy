import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  ...props
}) => {
  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
  }[variant];

  return (
    <div
      aria-hidden="true"
      className={`bg-slate-200 animate-pulse motion-reduce:animate-none ${variantClasses} ${className}`}
      {...props}
    />
  );
};
