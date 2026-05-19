import { useState } from 'react';
import { PasswordField } from '../molecules/PasswordField';
import { FileDropzone } from '../molecules/FileDropzone';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { aesEncryptFile, aesDecryptFile } from '../services/aes.service';
import { downloadFile } from '../utils/file.utils';
import type { Mode } from '../types/encryption.types';

type Feedback = { type: 'success' | 'error'; message: string };

export const AesPanel = () => {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleProcess = async () => {
    setFeedback(null);
    if (!password) { setPasswordError('La contraseña es requerida'); return; }
    if (!file)     { setFeedback({ type: 'error', message: 'Selecciona un archivo primero' }); return; }
    setPasswordError('');
    setLoading(true);
    try {
      if (mode === 'encrypt') {
        const blob = await aesEncryptFile(file, password);
        downloadFile(blob, `${file.name}.aes.enc`);
        setFeedback({ type: 'success', message: `Cifrado exitoso — descargado como ${file.name}.aes.enc` });
      } else {
        const { blob, name } = await aesDecryptFile(file, password);
        downloadFile(blob, name);
        setFeedback({ type: 'success', message: `Descifrado exitoso — descargado como ${name}` });
      }
      setFile(null);
      setPassword('');
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Error desconocido' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header del panel */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-1)' }}>Cifrado Simétrico</h2>
            <Badge variant="cyan">AES-256</Badge>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
            Misma contraseña para cifrar y descifrar · Advanced Encryption Standard
          </p>
        </div>
      </div>

      {/* Toggle cifrar / descifrar */}
      <div className="flex bg-slate-100 rounded-lg p-1 gap-1" role="group" aria-label="Modo de operación">
        {(['encrypt', 'decrypt'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setFeedback(null); setFile(null); }}
            aria-pressed={mode === m}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md text-sm font-semibold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
              mode === m
                ? 'bg-white shadow-sm text-slate-800'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {m === 'encrypt'
              ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
            }
            {m === 'encrypt' ? 'Cifrar' : 'Descifrar'}
          </button>
        ))}
      </div>

      <PasswordField
        value={password}
        onChange={setPassword}
        label={mode === 'encrypt' ? 'Contraseña para cifrar' : 'Contraseña para descifrar'}
        hint={mode === 'encrypt' ? 'Guarda esta contraseña — la necesitarás para descifrar el archivo' : undefined}
        error={passwordError}
        required
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-2)' }}>
          Archivo <span className="text-red-600">*</span>
        </span>
        <FileDropzone
          file={file}
          onFileSelect={setFile}
          onClear={() => setFile(null)}
          accept={mode === 'decrypt' ? '.enc,.json' : undefined}
          label={mode === 'decrypt' ? 'Arrastra el archivo .aes.enc' : 'Arrastra cualquier archivo'}
        />
      </div>

      {feedback && <FeedbackBanner feedback={feedback} />}

      <Button
        variant={mode === 'encrypt' ? 'primary' : 'success'}
        loading={loading}
        fullWidth
        onClick={handleProcess}
        disabled={!file || !password}
      >
        {mode === 'encrypt'
          ? <><LockIcon /> Cifrar y Descargar</>
          : <><DownloadIcon /> Descifrar y Descargar</>
        }
      </Button>
    </div>
  );
};

/* ── Sub-components ──────────────────────────────────────── */
const FeedbackBanner = ({ feedback }: { feedback: { type: 'success' | 'error'; message: string } }) => (
  <div
    className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm font-medium ${
      feedback.type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-red-50 border-red-200 text-red-800'
    }`}
    role="alert"
  >
    {feedback.type === 'success'
      ? <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      : <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
    }
    <span>{feedback.message}</span>
  </div>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);
const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);
