import { db } from "@/lib/db";
import { KanbanBoard } from "./kanban-board";

export default async function CrmPage() {
  const casos = await db.caso.findMany({
    include: { cliente: true, tramiteCatalogo: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Tablero de trámites
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Arrastra una tarjeta para cambiar de etapa. Los cambios quedan
          registrados en la bitácora del cliente.
        </p>
      </div>
      <KanbanBoard casos={casos} />
    </div>
  );
}
