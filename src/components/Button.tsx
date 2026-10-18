import React from 'react';
import { Link } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  to?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  to,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg text-base min-h-[44px] px-5 py-2.5 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]';

  const variantClasses = {
    primary:
      'bg-[#312E81] text-white hover:bg-[#1E1B4B] focus-visible:ring-[#312E81] shadow-xs hover:shadow',
    secondary:
      'bg-transparent border-2 border-[#312E81] text-[#312E81] hover:bg-[#312E81]/5 focus-visible:ring-[#312E81]',
    accent:
      'bg-[#F59E0B] text-[#0F172A] font-semibold hover:bg-[#D97706] focus-visible:ring-[#F59E0B] shadow-xs hover:shadow',
    danger:
      'bg-[#DC2626] text-white hover:bg-[#B91C1C] focus-visible:ring-[#DC2626] shadow-xs hover:shadow',
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-[#312E81]',
  }[variant];


  const content = (
    <>
      {loading ? (
        <svg
          className="animate-spin -ms-1 me-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : icon ? (
        <span className="me-2 inline-flex items-center">{icon}</span>
      ) : null}
      <span>{children}</span>
    </>
  );

  if (to && !disabled && !loading) {
    return (
      <Link
        to={to}
        className={`${baseClasses} ${variantClasses} ${className}`}
        {...(rest as any)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {content}
    </button>
  );
};
