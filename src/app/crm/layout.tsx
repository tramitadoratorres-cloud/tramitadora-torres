import Link from "next/link";
import { requireAgent } from "@/lib/session";
import { logoutAction } from "@/app/login/actions";
import { archivarEntregadosVencidos } from "@/lib/archivado";

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAgent();
  await archivarEntregadosVencidos();

  return (
    <div className="min-h-screen bg-paper-dim text-ink">
      <header className="border-b border-ink/10 bg-navy-900 text-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/crm" className="font-serif text-lg font-semibold">
              <span className="text-gold-bright">✦</span> Tramitadora Torres
            </Link>
            <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-wide text-cream-dim">
              <Link href="/crm" className="transition hover:text-gold-bright">
                Tablero
              </Link>
              <Link
                href="/crm/pendientes"
                className="transition hover:text-gold-bright"
              >
                Pendientes
              </Link>
              <Link
                href="/crm/clientes/nuevo"
                className="transition hover:text-gold-bright"
              >
                Nuevo cliente
              </Link>
              <Link
                href="/crm/catalogo"
                className="transition hover:text-gold-bright"
              >
                Catálogo
              </Link>
              <Link
                href="/crm/buscar"
                className="transition hover:text-gold-bright"
              >
                Buscar
              </Link>
              <Link
                href="/crm/errores"
                className="transition hover:text-gold-bright"
              >
                Errores
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-cream-dim">
              {session.nombre}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded border border-cream/20 px-3 py-1.5 font-mono text-xs transition hover:border-gold-bright hover:text-gold-bright"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
