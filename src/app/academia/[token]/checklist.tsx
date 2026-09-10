"use client";

import { useEffect, useState } from "react";

function clave(token: string, modulo: number) {
  return `academia:${token}:modulo-visto:${modulo}`;
}

export function ChecklistModulo({
  token,
  modulo,
}: {
  token: string;
  modulo: number;
}) {
  const [visto, setVisto] = useState(false);
  const [listo, setListo] = useState(false);

  // localStorage no existe en el servidor: se lee en un efecto, después de
  // montar, para no romper el renderizado inicial (SSR).
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisto(localStorage.getItem(clave(token, modulo)) === "1");
    } catch {
      // localStorage no disponible: el checklist simplemente no persiste.
    }
    setListo(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function alternar() {
    const nuevo = !visto;
    setVisto(nuevo);
    try {
      if (nuevo) localStorage.setItem(clave(token, modulo), "1");
      else localStorage.removeItem(clave(token, modulo));
    } catch {
      // sin persistencia local disponible
    }
  }

  if (!listo) return null;

  return (
    <button
      type="button"
      onClick={alternar}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wide transition ${
        visto
          ? "bg-gold text-navy-900"
          : "border border-ink/20 text-ink/50 hover:border-navy-700"
      }`}
    >
      {visto ? "✓ Repasado" : "Marcar como repasado"}
    </button>
  );
}
