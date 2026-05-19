import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  rightElement?: ReactNode;
}

export const Input = ({ label, error, hint, rightElement, id, className = '', ...props }: InputProps) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={id} className="text-sm font-semibold" style={{ color: 'var(--color-text-2)' }}>
        {label}
        {props.required && <span className="text-red-600 ml-1" aria-hidden="true">*</span>}
      </label>
    )}
    <div className="relative">
      <input
        id={id}
        className={`cyber-input ${error ? 'error' : ''} ${rightElement ? 'pr-11' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
    {error && (
      <p id={`${id}-error`} className="text-xs font-medium text-red-600 flex items-center gap-1" role="alert">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
    {hint && !error && (
      <p id={`${id}-hint`} className="text-xs" style={{ color: 'var(--color-text-3)' }}>{hint}</p>
    )}
  </div>
);
