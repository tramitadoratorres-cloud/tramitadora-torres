import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

function resolveSqlitePath(): string {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const raw = url.replace(/^file:/, "");
  return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
}

const adapter = new PrismaBetterSqlite3({ url: `file:${resolveSqlitePath()}` });
const db = new PrismaClient({ adapter });

const TRAMITES = [
  {
    orden: 1,
    nombre: "Pasaporte mexicano — primera vez",
    descripcion:
      "Te acompañamos desde la cita hasta la entrega de tu pasaporte.",
    badge: "Nuevo",
    honorarioBase: 500,
    destacado: false,
    requisitos: [
      "Acta de nacimiento certificada",
      "Identificación oficial vigente con foto",
      "Si eres menor de edad: madre, padre o tutor con identificación",
    ].join("\n"),
  },
  {
    orden: 2,
    nombre: "Pasaporte mexicano — renovación",
    descripcion:
      "Renueva tu pasaporte sin perder tiempo averiguando el proceso.",
    badge: "Renovación",
    honorarioBase: 500,
    destacado: false,
    requisitos: [
      "Tu pasaporte anterior (se entrega para cancelación)",
      "Acta de nacimiento certificada",
      "Identificación oficial vigente",
    ].join("\n"),
  },
  {
    orden: 3,
    nombre: "Pasaporte americano — renovación",
    descripcion:
      "Para ciudadanos americanos que ya tuvieron pasaporte previo.",
    badge: "EE.UU.",
    honorarioBase: 1000,
    destacado: false,
    requisitos: [
      "Tu pasaporte americano anterior",
      "Foto tipo pasaporte reciente",
      "Si cambiaste de nombre: acta de matrimonio o documento legal",
    ].join("\n"),
  },
  {
    orden: 4,
    nombre: "Visa de turista B1/B2",
    descripcion:
      "Te ayudamos a preparar tu solicitud y tu cita en la embajada.",
    badge: "Visa",
    honorarioBase: 1000,
    destacado: false,
    requisitos: [
      "Pasaporte mexicano vigente",
      "Comprobantes de arraigo: trabajo, estudios o propiedades",
      "Formulario DS-160 (te ayudamos a llenarlo)",
    ].join("\n"),
  },
  {
    orden: 5,
    nombre: "Pasaporte + visa",
    descripcion:
      "Los dos trámites juntos, con un solo seguimiento de principio a fin.",
    badge: "Paquete",
    honorarioBase: 1500,
    destacado: true,
    requisitos: [
      "Todo lo del pasaporte nuevo o renovación",
      "Todo lo de la visa de turista",
    ].join("\n"),
  },
  {
    orden: 6,
    nombre: "SENTRI",
    descripcion:
      "Para quienes cruzan la frontera con frecuencia. Requiere visa o green card vigente.",
    badge: "Cruce rápido",
    honorarioBase: 1000,
    destacado: false,
    requisitos: [
      "Documento vigente para entrar a EE.UU. (visa B1/B2, láser o green card)",
      "Historial de domicilios y empleos de los últimos 5 años",
      "Datos del vehículo (si aplica)",
    ].join("\n"),
  },
];

async function main() {
  for (const tramite of TRAMITES) {
    const existing = await db.tramiteCatalogo.findFirst({
      where: { nombre: tramite.nombre },
    });
    if (existing) {
      await db.tramiteCatalogo.update({
        where: { id: existing.id },
        data: tramite,
      });
    } else {
      await db.tramiteCatalogo.create({ data: tramite });
    }
  }

  const adminEmail = "alonso260483@gmail.com";
  const adminPasswordInicial = "torres2026";
  const existingAdmin = await db.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existingAdmin) {
    await db.user.create({
      data: {
        nombre: "Alonso",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPasswordInicial, 10),
      },
    });
    console.log(
      `Usuario creado -> email: ${adminEmail} · contraseña inicial: ${adminPasswordInicial} (cámbiala después del primer ingreso)`
    );
  }

  console.log(`Catálogo de trámites listo (${TRAMITES.length} trámites).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
