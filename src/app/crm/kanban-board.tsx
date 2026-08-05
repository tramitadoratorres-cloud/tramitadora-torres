"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { db } from "@/lib/db";
import { ETAPAS, ETAPA_LABEL, formatMXN, type Etapa } from "@/lib/constants";
import { archivarCasoAction, moverEtapaAction } from "./actions";

type CasoConRelaciones = Awaited<ReturnType<typeof db.caso.findMany<{
  include: {
    cliente: true;
    tramiteCatalogo: true;
    expediente: { include: { _count: { select: { casos: true } } } };
  };
}>>>[number];

type OptimisticAction =
  | { type: "mover"; casoId: string; etapa: Etapa }
  | { type: "archivar"; casoId: string };

export function KanbanBoard({ casos }: { casos: CasoConRelaciones[] }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCasos, setOptimisticCasos] = useOptimistic(
    casos,
    (state, action: OptimisticAction) => {
      if (action.type === "mover") {
        return state.map((c) =>
          c.id === action.casoId ? { ...c, etapa: action.etapa } : c
        );
      }
      return state.filter((c) => c.id !== action.casoId);
    }
  );

  function handleDragEnd(result: DropResult) {
    const { destination, draggableId } = result;
    if (!destination) return;
    const nuevaEtapa = destination.droppableId as Etapa;

    startTransition(() => {
      setOptimisticCasos({ type: "mover", casoId: draggableId, etapa: nuevaEtapa });
      moverEtapaAction(draggableId, nuevaEtapa);
    });
  }

  function handleArchivar(casoId: string, nombre: string) {
    if (
      !confirm(
        `¿Sacar del tablero el caso de ${nombre}? Se conserva en la base de datos y lo puedes encontrar después en Buscar.`
      )
    )
      return;

    startTransition(() => {
      setOptimisticCasos({ type: "archivar", casoId });
      archivarCasoAction(casoId);
    });
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {ETAPAS.map((etapa) => {
          const casosEtapa = optimisticCasos.filter((c) => c.etapa === etapa);
          return (
            <div key={etapa} className="flex flex-col">
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="font-mono text-[11px] font-medium uppercase tracking-wide text-ink/60">
                  {ETAPA_LABEL[etapa]}
                </h2>
                <span className="rounded-full bg-ink/10 px-1.5 py-0.5 font-mono text-[10px] text-ink/60">
                  {casosEtapa.length}
                </span>
              </div>
              <Droppable droppableId={etapa}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex min-h-[200px] flex-1 flex-col gap-2 rounded-md p-2 transition ${
                      snapshot.isDraggingOver ? "bg-gold/15" : "bg-ink/5"
                    }`}
                  >
                    {casosEtapa.map((caso, index) => (
                      <Draggable
                        key={caso.id}
                        draggableId={caso.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`group relative rounded border border-ink/10 bg-white shadow-sm transition hover:shadow-md ${
                              snapshot.isDragging ? "opacity-90 shadow-lg" : ""
                            } ${isPending ? "opacity-80" : ""}`}
                          >
                            <Link
                              href={`/crm/clientes/${caso.id}`}
                              className="block p-3 pr-7"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-sans text-sm font-semibold text-ink">
                                  {caso.paraQuien || caso.cliente.nombre}
                                </p>
                                {caso.expediente._count.casos > 1 && (
                                  <span
                                    title="Este contacto tiene más trámites en su expediente"
                                    className="shrink-0 rounded-full bg-navy-900/10 px-1.5 py-0.5 font-mono text-[10px] text-navy-800"
                                  >
                                    👪 {caso.expediente._count.casos}
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-ink/60">
                                {caso.tramiteCatalogo?.nombre ?? "Sin trámite asignado"}
                              </p>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="font-mono text-xs text-navy-700">
                                  {caso.precioCobrado != null
                                    ? formatMXN(caso.precioCobrado)
                                    : "—"}
                                </span>
                                {caso.pagado && (
                                  <span className="rounded-full bg-gold/20 px-2 py-0.5 font-mono text-[10px] text-navy-800">
                                    Pagado
                                  </span>
                                )}
                              </div>
                            </Link>
                            <button
                              type="button"
                              title="Sacar del tablero (se conserva y se puede buscar después)"
                              aria-label="Sacar del tablero"
                              onClick={() =>
                                handleArchivar(
                                  caso.id,
                                  caso.paraQuien || caso.cliente.nombre
                                )
                              }
                              className="absolute right-1.5 top-1.5 rounded px-1 font-mono text-xs text-ink/40 transition hover:bg-red-50 hover:text-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
