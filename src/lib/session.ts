import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  nombre?: string;
  email?: string;
}

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error(
    "Falta SESSION_SECRET en .env (debe tener al menos 32 caracteres). Revisa .env.example."
  );
}

export const sessionOptions: SessionOptions = {
  password: sessionSecret,
  cookieName: "tt_crm_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14, // 14 días
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

/** Devuelve la sesión activa o redirige a /login si no hay agente autenticado. */
export async function requireAgent() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }
  return session as Required<SessionData>;
}
