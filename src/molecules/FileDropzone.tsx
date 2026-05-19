import { useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { formatFileSize } from '../utils/file.utils';

interface FileDropzoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  accept?: string;
  label?: string;
}

export const FileDropzone = ({
  file,
  onFileSelect,
  onClear,
  accept,
  label = 'Arrastra tu archivo aquí',
}: FileDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileSelect(dropped);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onFileSelect(selected);
    e.target.value = '';
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 p-3.5 bg-cyan-50 rounded-xl border border-cyan-200">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>{formatFileSize(file.size)}</p>
        </div>
        <button
          onClick={onClear}
          aria-label="Eliminar archivo seleccionado"
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          style={{ color: 'var(--color-text-3)' }}
        >
          <svg className="w-4 h-4 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      className="flex flex-col items-center justify-center gap-2.5 p-7 rounded-xl border-2 border-dashed border-slate-300 hover:border-cyan-400 bg-slate-50 hover:bg-cyan-50/40 cursor-pointer transition-all duration-200 group"
      role="button"
      tabIndex={0}
      aria-label="Área de carga de archivo — clic o arrastra"
    >
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-cyan-300 group-hover:bg-cyan-50 transition-all duration-200 shadow-sm">
        <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-500 group-hover:text-cyan-700 transition-colors">{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>o haz clic para seleccionar</p>
      </div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="sr-only" aria-hidden="true" />
    </div>
  );
};
