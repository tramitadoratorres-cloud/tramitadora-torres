import Link from "next/link";
import { db } from "@/lib/db";
import { KanbanBoard } from "./kanban-board";

export default async function CrmPage() {
  const casos = await db.caso.findMany({
    where: { archivadoEn: null },
    include: {
      cliente: true,
      tramiteCatalogo: true,
      expediente: { include: { _count: { select: { casos: true } } } },
    },
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
          registrados en la bitácora del cliente. Los casos entregados se
          archivan solos a las 48 h (siguen en la base de datos, búscalos en{" "}
          <Link href="/crm/buscar" className="underline hover:text-navy-700">
            Buscar
          </Link>
          ).
        </p>
      </div>
      <KanbanBoard casos={casos} />
    </div>
  );
}
