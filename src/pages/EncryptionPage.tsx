import { useState } from "react";
import { AlgorithmTabs } from "../molecules/AlgorithmTabs";
import { AesPanel } from "../organisms/AesPanel";
import { RsaPanel } from "../organisms/RsaPanel";
import type { Algorithm } from "../types/encryption.types";

export const EncryptionPage = () => {
  const [algorithm, setAlgorithm] = useState<Algorithm>("aes");

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-16 flex flex-col gap-6">
      <section aria-label="Selección de algoritmo">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 font-mono">
          Algoritmo de Cifrado
        </h2>
        <AlgorithmTabs value={algorithm} onChange={setAlgorithm} />
      </section>

      <section
        className="cyber-card p-6"
        aria-label={algorithm === "aes" ? "Panel AES" : "Panel RSA"}
        key={algorithm}
      >
        {algorithm === "aes" ? <AesPanel /> : <RsaPanel />}
      </section>
    </main>
  );
};
