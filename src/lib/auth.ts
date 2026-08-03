import "server-only";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function verifyLogin(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return user;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
