export const AppHeader = () => (
  <header className="relative overflow-hidden border-b border-slate-800 bg-cyber-900">
    <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-60 pointer-events-none" />
    <div className="absolute inset-0 bg-gradient-to-b from-blue-950/50 to-transparent pointer-events-none" />

    <div className="relative max-w-2xl mx-auto px-6 py-10 text-center">
      <div className="inline-flex items-center justify-center gap-3 mb-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shadow-neon">
            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-neon" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight leading-none">
            Seguridad <span className="neon-text">Informática</span>
          </h1>
          <p className="text-xs text-slate-500 tracking-widest uppercase font-mono mt-1">
            Aplicación de cifrado de archivos
          </p>
        </div>
      </div>

      <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed mt-3">
        Cifra y descifra archivos usando algoritmos estándar de la industria.
        Tus datos nunca salen de tu navegador.
      </p>
    </div>
  </header>
);
