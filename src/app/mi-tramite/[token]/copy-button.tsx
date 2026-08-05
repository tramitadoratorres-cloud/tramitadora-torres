"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }}
      className="shrink-0 rounded border border-ink/15 px-2 py-0.5 font-mono text-[10px] text-ink/60 hover:border-navy-700 hover:text-navy-700"
    >
      {copiado ? "¡Copiado!" : "Copiar"}
    </button>
  );
}
