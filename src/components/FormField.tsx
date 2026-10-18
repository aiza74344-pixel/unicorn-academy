import React, { useId, forwardRef } from 'react';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      hint,
      error,
      required = false,
      id: customId,
      className = '',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    const ariaDescribedBy = [error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="w-full text-start mb-4">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ms-1" aria-hidden="true">*</span>}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy || undefined}
            className={`w-full h-[44px] px-3.5 rounded-lg border text-base text-slate-900 bg-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500 ${
              error
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                : 'border-slate-300 hover:border-slate-400 focus-visible:border-[#312E81] focus-visible:ring-[#312E81]'
            } ${className}`}
            {...props}
          />
        </div>

        {hint && !error && (
          <p id={hintId} className="text-xs text-slate-500 mt-1.5">
            {hint}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
