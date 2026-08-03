import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session.userId) {
    redirect("/crm");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-900 px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-serif text-xl font-semibold text-cream"
          >
            <span className="text-gold-bright">✦</span> Tramitadora Torres
          </Link>
          <p className="mt-2 font-mono text-xs uppercase tracking-wide text-cream-dim">
            Acceso del equipo
          </p>
        </div>

        <div className="rounded-lg bg-paper p-8 text-ink shadow-2xl">
          <h1 className="mb-6 font-serif text-2xl font-semibold text-ink">
            Entrar al CRM
          </h1>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-cream-dim">
          <Link href="/" className="hover:text-gold-bright">
            ← Volver al sitio público
          </Link>
        </p>
      </div>
    </main>
  );
}
