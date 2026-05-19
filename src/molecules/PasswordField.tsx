import { useState } from 'react';
import { Input } from '../atoms/Input';

interface PasswordFieldProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  hint?: string;
  required?: boolean;
  error?: string;
}

const STRENGTH = [
  { label: '',        bar: '',              text: '' },
  { label: 'Débil',   bar: 'bg-red-500',    text: 'text-red-600' },
  { label: 'Moderada',bar: 'bg-amber-400',  text: 'text-amber-600' },
  { label: 'Fuerte',  bar: 'bg-emerald-500',text: 'text-emerald-600' },
];

export const PasswordField = ({ value, onChange, label = 'Contraseña de cifrado', hint, required, error }: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false);
  const level = value.length === 0 ? 0 : value.length < 8 ? 1 : value.length < 16 ? 2 : 3;

  return (
    <div className="flex flex-col gap-2">
      <Input
        id="password-field"
        type={visible ? 'text' : 'password'}
        label={label}
        hint={hint}
        error={error}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        rightElement={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            style={{ color: 'var(--color-text-3)' }}
          >
            {visible ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        }
      />
      {value.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1 flex-1">
            {[1,2,3].map((i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= level ? STRENGTH[level].bar : 'bg-slate-200'}`} />
            ))}
          </div>
          <span className={`text-xs font-semibold ${STRENGTH[level].text}`}>{STRENGTH[level].label}</span>
        </div>
      )}
    </div>
  );
};
