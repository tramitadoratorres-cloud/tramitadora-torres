import { db } from "@/lib/db";
import { ClienteForm } from "./cliente-form";

export default async function NuevoClientePage() {
  const tramites = await db.tramiteCatalogo.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
  });

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 font-serif text-2xl font-semibold text-ink">
        Nuevo cliente
      </h1>
      <p className="mb-6 text-sm text-ink/60">
        Para contactos que llegan por WhatsApp u otro medio y aún no están en
        el CRM. Si ya sabes el trámite y ya pagó, agrégalo aquí mismo.
      </p>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <ClienteForm tramites={tramites} />
      </div>
    </div>
  );
}
