"use client";

import { useState } from "react";

export default function CopiarTexto({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="space-y-3">
      <textarea readOnly value={texto} rows={16} className="input font-mono text-xs" />
      <button type="button" onClick={copiar} className="btn-primary w-full">
        {copiado ? "Copiado!" : "Copiar texto"}
      </button>
    </div>
  );
}
