import { AppHeader } from "./organisms/AppHeader";
import { EncryptionPage } from "./pages/EncryptionPage";

function App() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <AppHeader />
      <EncryptionPage />
      <footer className="relative overflow-hidden bg-cyber-900 border-t-2 border-cyan-500/40 mt-auto py-8">
        <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-6 py-6 text-center flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-slate-300">
            Seguridad <span className="neon-text">Informática</span>
          </p>
          <p className="text-xs text-slate-500">
            Implementación de Sistemas de Cifrado · AES-256 &amp; RSA-2048 ·
            ITSQMET
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
