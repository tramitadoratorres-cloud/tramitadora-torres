import { db } from "@/lib/db";
import { TramiteRow } from "./tramite-row";
import { NuevoTramiteForm } from "./nuevo-tramite-form";

export default async function CatalogoPage() {
  const tramites = await db.tramiteCatalogo.findMany({
    orderBy: { orden: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 font-serif text-2xl font-semibold text-ink">
        Catálogo de trámites
      </h1>
      <p className="mb-6 text-sm text-ink/60">
        El honorario base es solo referencia — en cada venta se puede ajustar
        el precio real cobrado. Los cambios aquí se reflejan en el sitio
        público.
      </p>
      <div className="flex flex-col gap-4">
        {tramites.map((tramite) => (
          <TramiteRow key={tramite.id} tramite={tramite} />
        ))}
        <NuevoTramiteForm />
      </div>
    </div>
  );
}
