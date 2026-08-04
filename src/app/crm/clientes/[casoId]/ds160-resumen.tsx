import { SECCIONES_DS160 } from "@/lib/ds160-campos";

export function DS160Resumen({ datos }: { datos: Record<string, string> }) {
  const haRespuestas = Object.keys(datos).length > 0;

  if (!haRespuestas) {
    return (
      <p className="text-sm text-ink/50">
        El cliente todavía no ha llenado su forma DS-160.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {SECCIONES_DS160.map((seccion) => {
        const camposConDatos = seccion.campos.filter((c) => datos[c.nombre]);
        if (camposConDatos.length === 0) return null;
        return (
          <div key={seccion.titulo}>
            <p className="mb-1.5 font-mono text-xs uppercase tracking-wide text-ink/50">
              {seccion.titulo}
            </p>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {camposConDatos.map((campo) => (
                <div key={campo.nombre}>
                  <dt className="text-xs text-ink/50">{campo.etiqueta}</dt>
                  <dd className="text-sm text-ink">{datos[campo.nombre]}</dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}
