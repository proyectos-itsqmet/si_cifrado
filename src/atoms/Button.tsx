import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'success' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'cyber-btn-primary',
  secondary: 'cyber-btn-secondary',
  success: 'cyber-btn-success',
  danger: 'flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-500 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
};

export const Button = ({
  variant = 'primary',
  loading = false,
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => (
  <button
    className={`${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <>
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Procesando...
      </>
    ) : children}
  </button>
);
