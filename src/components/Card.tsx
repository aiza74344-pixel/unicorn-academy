import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = true,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-[12px] border border-slate-100 shadow-xs transition-all duration-200 overflow-hidden ${
        interactive ? 'hover:-translate-y-0.5 hover:shadow-md' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
