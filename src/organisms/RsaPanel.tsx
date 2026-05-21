import { useState } from 'react';
import { FileDropzone } from '../molecules/FileDropzone';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { rsaGenerateKeyPair, rsaEncryptFile, rsaDecryptFile } from '../services/rsa.service';
import { downloadFile } from '../utils/file.utils';
import type { Mode, RsaKeyPair } from '../types/encryption.types';

type Feedback = { type: 'success' | 'error'; message: string };

export const RsaPanel = () => {
  const [mode, setMode]                   = useState<Mode>('encrypt');
  const [file, setFile]                   = useState<File | null>(null);
  const [privateKeyFile, setPrivateKeyFile] = useState<File | null>(null);
  const [publicKeyFile, setPublicKeyFile]   = useState<File | null>(null);
  const [generatedKeys, setGeneratedKeys]   = useState<RsaKeyPair | null>(null);
  const [loadingKeys, setLoadingKeys]       = useState(false);
  const [loading, setLoading]               = useState(false);
  const [feedback, setFeedback]             = useState<Feedback | null>(null);

  const handleGenerateKeys = async () => {
    setLoadingKeys(true);
    setFeedback(null);
    try {
      setGeneratedKeys(await rsaGenerateKeyPair());
    } catch {
      setFeedback({ type: 'error', message: 'Error generando el par de claves' });
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleDownloadKey = (type: 'public' | 'private') => {
    if (!generatedKeys) return;
    const content = type === 'public' ? generatedKeys.publicKey : generatedKeys.privateKey;
    downloadFile(new Blob([content], { type: 'text/plain' }), `${type}_key.asc`);
  };

  const handleProcess = async () => {
    setFeedback(null);
    if (!file) { setFeedback({ type: 'error', message: 'Selecciona un archivo' }); return; }
    setLoading(true);
    try {
      if (mode === 'encrypt') {
        const pubKey = publicKeyFile ? await publicKeyFile.text() : generatedKeys?.publicKey;
        if (!pubKey) { setFeedback({ type: 'error', message: 'Genera o carga una clave pública primero' }); return; }
        downloadFile(await rsaEncryptFile(file, pubKey), `${file.name}.gpg`);
        setFeedback({ type: 'success', message: `Cifrado exitoso — descargado como ${file.name}.gpg. Guarda la clave privada.` });
        setFile(null);
      } else {
        if (!privateKeyFile) { setFeedback({ type: 'error', message: 'Carga tu clave privada (.pem)' }); return; }
        const { blob, name } = await rsaDecryptFile(file, await privateKeyFile.text());
        downloadFile(blob, name);
        setFeedback({ type: 'success', message: `Descifrado exitoso — descargado como ${name}` });
        setFile(null);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Error en el proceso' });
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
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-1)' }}>Cifrado Asimétrico</h2>
            <Badge variant="blue">ECC Curve25519</Badge>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
            Clave pública cifra · Clave privada descifra · Cifrado híbrido RSA + AES-GCM
          </p>
        </div>
      </div>

      {/* Toggle cifrar / descifrar */}
      <div className="flex bg-slate-100 rounded-lg p-1 gap-1" role="group">
        {(['encrypt', 'decrypt'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setFeedback(null); setFile(null); }}
            aria-pressed={mode === m}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md text-sm font-semibold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              mode === m ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
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

      {/* ── MODO CIFRAR ─────────────────────────────────────── */}
      {mode === 'encrypt' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-2)' }}>Par de claves RSA</span>
            {generatedKeys && <Badge variant="green">Listas</Badge>}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-3">
            <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
              Genera un par nuevo o carga una clave pública existente
            </p>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" loading={loadingKeys} onClick={handleGenerateKeys} className="text-sm !px-4" style={{ minHeight: '38px' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Generar par de claves
              </Button>

              {generatedKeys && (
                <>
                  <Button variant="secondary" onClick={() => handleDownloadKey('public')} className="text-sm !px-4" style={{ minHeight: '38px' }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    Clave pública
                  </Button>
                  <button
                    onClick={() => handleDownloadKey('private')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 rounded-lg border-2 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all duration-150 active:scale-[.97] cursor-pointer"
                    style={{ minHeight: '38px' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    Clave privada
                  </button>
                </>
              )}
            </div>

            {/* divider + cargar si no hay generadas */}
            {!generatedKeys && (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>o cargar</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-2)' }}>Clave pública (.asc)</span>
                  <FileDropzone file={publicKeyFile} onFileSelect={setPublicKeyFile} onClear={() => setPublicKeyFile(null)} accept=".asc,.pem,.txt" label="Arrastra la clave pública (.asc)" />
                </div>
              </>
            )}

            {generatedKeys && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-xs font-medium text-amber-800">
                  Descarga la clave privada y guárdala de forma segura. Sin ella no podrás descifrar el archivo.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODO DESCIFRAR ─────────────────────────────────── */}
      {mode === 'decrypt' && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-2)' }}>
            Clave privada (.asc) <span className="text-red-600">*</span>
          </span>
          <FileDropzone file={privateKeyFile} onFileSelect={setPrivateKeyFile} onClear={() => setPrivateKeyFile(null)} accept=".asc,.pem,.txt" label="Arrastra tu clave privada (.asc)" />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-2)' }}>
          Archivo a {mode === 'encrypt' ? 'cifrar' : 'descifrar'} <span className="text-red-600">*</span>
        </span>
        <FileDropzone
          file={file}
          onFileSelect={setFile}
          onClear={() => setFile(null)}
          accept={mode === 'decrypt' ? '.gpg,.enc' : undefined}
          label={mode === 'decrypt' ? 'Arrastra el archivo .gpg' : 'Arrastra cualquier archivo'}
        />
      </div>

      {feedback && (
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
      )}

      <Button
        variant={mode === 'encrypt' ? 'primary' : 'success'}
        loading={loading}
        fullWidth
        onClick={handleProcess}
        disabled={!file || (mode === 'encrypt' && !generatedKeys && !publicKeyFile) || (mode === 'decrypt' && !privateKeyFile)}
      >
        {mode === 'encrypt'
          ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> Cifrar y Descargar</>
          : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg> Descifrar y Descargar</>
        }
      </Button>
    </div>
  );
};
