"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyLogin } from "@/lib/auth";
import { getSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Escribe tu contraseña"),
});

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Escribe un correo y contraseña válidos." };
  }

  const user = await verifyLogin(parsed.data.email, parsed.data.password);
  if (!user) {
    return { error: "Correo o contraseña incorrectos." };
  }

  const session = await getSession();
  session.userId = user.id;
  session.nombre = user.nombre;
  session.email = user.email;
  await session.save();

  redirect("/crm");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}

