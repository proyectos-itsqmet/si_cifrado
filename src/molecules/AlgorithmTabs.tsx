import type { Algorithm } from '../types/encryption.types';

interface AlgorithmTabsProps {
  value: Algorithm;
  onChange: (value: Algorithm) => void;
}

const tabs = [
  {
    value: 'aes' as Algorithm,
    label: 'Cifrado Simétrico',
    short: 'AES-256',
    desc: 'Una contraseña cifra y descifra',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
    activeClasses: 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-white',
    dotColor: 'bg-cyan-500',
    labelColor: 'text-cyan-700',
    badgeClasses: 'bg-cyan-100 text-cyan-700',
  },
  {
    value: 'rsa' as Algorithm,
    label: 'Cifrado Asimétrico',
    short: 'RSA-2048',
    desc: 'Par de claves pública / privada',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
      </svg>
    ),
    activeClasses: 'border-blue-500 bg-gradient-to-br from-blue-50 to-white',
    dotColor: 'bg-blue-500',
    labelColor: 'text-blue-700',
    badgeClasses: 'bg-blue-100 text-blue-700',
  },
] as const;

export const AlgorithmTabs = ({ value, onChange }: AlgorithmTabsProps) => (
  <div className="grid grid-cols-2 gap-3" role="tablist" aria-label="Seleccionar algoritmo">
    {tabs.map((tab) => {
      const isActive = value === tab.value;
      return (
        <button
          key={tab.value}
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(tab.value)}
          className={`
            group relative p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
            focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2
            ${isActive
              ? tab.activeClasses
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
            }
          `}
          style={{ boxShadow: isActive ? 'var(--shadow-card)' : undefined }}
        >
          {/* Icon + badge */}
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg transition-colors ${
              isActive ? tab.badgeClasses : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.icon}
            </div>
            <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${
              isActive ? tab.badgeClasses : 'bg-slate-100 text-slate-400'
            }`}>
              {tab.short}
            </span>
          </div>

          {/* Label */}
          <p className={`text-sm font-semibold mb-0.5 transition-colors ${
            isActive ? tab.labelColor : 'text-slate-600'
          }`}>
            {tab.label}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
            {tab.desc}
          </p>

          {/* Active indicator dot */}
          {isActive && (
            <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${tab.dotColor}`} />
          )}
        </button>
      );
    })}
  </div>
);
