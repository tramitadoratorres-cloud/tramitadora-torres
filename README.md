# Tramitadora Torres — Sitio + CRM + Recibos

Proyecto completo para la gestoría: sitio público con catálogo de trámites y
pago en línea, CRM interno para el equipo (tablero kanban, bitácora de
actividad, catálogo editable) y generación de recibos en PDF.

Construido con Next.js 16 (App Router), Prisma + SQLite, y Mercado Pago
(Checkout Pro) para pagos en línea.

## Requisitos

- Node.js 20.9 o superior (recomendado: la versión LTS más reciente).

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` (si no existe ya) y revisa estos valores:

- `DATABASE_URL`: ya viene configurado para SQLite local (`file:./dev.db`), no
  necesitas cambiarlo para desarrollo.
- `SESSION_SECRET`: clave para cifrar la cookie de sesión del CRM. Ya trae una
  generada, pero **genera una nueva y distinta antes de usar esto en
  producción** con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `NEXT_PUBLIC_SITE_URL`: la URL pública del sitio. En local déjala como
  `http://localhost:3000`. En producción, cámbiala por tu dominio real
  (`https://tudominio.com`), sin `/` al final — Mercado Pago la necesita para
  redirigir al cliente después de pagar.
- `MERCADOPAGO_ACCESS_TOKEN`: ver la sección de pagos en línea abajo. Mientras
  esté vacío, el botón "Pagar en línea" del sitio muestra un aviso amigable en
  vez de fallar.

## Base de datos

La primera vez (y cada vez que cambie el esquema):

```bash
npx prisma migrate dev
npx prisma db seed
```

El seed crea:
- El catálogo de los 6 trámites del brief (editable después desde el CRM).
- Un usuario inicial para entrar al CRM:
  - **Correo:** `alonso260483@gmail.com`
  - **Contraseña:** `torres2026`

  **Cambia esta contraseña en cuanto entres** (por ahora no hay pantalla de
  "cambiar contraseña" en el CRM; para cambiarla a mano, genera un hash nuevo
  y actualiza el registro en la base de datos, o pide que se agregue esa
  pantalla como mejora futura).

## Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para el sitio público, y
[http://localhost:3000/login](http://localhost:3000/login) para entrar al CRM.

## Estructura del proyecto

- `src/app/page.tsx` — sitio público (hero, catálogo de trámites, formulario
  de contacto).
- `src/app/pagar/[tramiteId]` — checkout de pago en línea por trámite.
- `src/app/login`, `src/app/crm/*` — CRM interno (protegido, requiere sesión).
- `src/app/api/recibos/[reciboId]` — genera y descarga el PDF de un recibo.
- `src/app/api/pagos/mercadopago` — webhook que confirma pagos en línea.
- `prisma/schema.prisma` — modelo de datos.
- `prisma/seed.ts` — catálogo inicial + usuario admin.
- `src/lib/receipts.ts` — diseño del PDF del recibo.

## Pagos en línea (Mercado Pago)

El sitio permite pagar cada trámite en línea (tarjeta u OXXO) al precio de
catálogo fijo, sin descuentos — los descuentos solo se aplican en el flujo
manual por WhatsApp desde el CRM. Al confirmarse el pago, el sistema crea el
cliente en el CRM, marca el pago como recibido y genera el recibo
automáticamente.

Para activarlo con tu cuenta real de Mercado Pago:

1. Entra a [mercadopago.com.mx/developers/panel](https://www.mercadopago.com.mx/developers/panel).
2. Crea una aplicación (o usa la que ya tengas).
3. En "Credenciales de prueba" copia el **Access Token** de prueba — te sirve
   para probar todo el flujo sin mover dinero real (Mercado Pago te da
   tarjetas y usuarios de prueba en su documentación de sandbox).
4. Pégalo en `.env` como `MERCADOPAGO_ACCESS_TOKEN`.
5. Cuando quieras cobrar de verdad, cambia a las **credenciales de
   producción** de la misma pantalla.

**Importante sobre el webhook en local:** Mercado Pago necesita poder llamar
a tu servidor por internet para avisar que un pago se confirmó
(`/api/pagos/mercadopago`). En `localhost` eso no es posible directamente —
para probarlo en desarrollo usa una herramienta de túnel como
[ngrok](https://ngrok.com) (`ngrok http 3000`) y usa esa URL temporal como
`NEXT_PUBLIC_SITE_URL` mientras pruebas. En producción, con un dominio real
públicamente accesible, funciona sin nada adicional.

## Desplegar en producción

Antes de desplegar, ten en cuenta que la base de datos es un archivo SQLite
(`dev.db`) que vive en el disco del servidor. Esto funciona bien en un
servidor con disco persistente (una VPS, Railway, Fly.io, Render con volumen,
etc.), pero **no funciona en hosting serverless como Vercel**, donde el
sistema de archivos no persiste entre peticiones. Si planeas usar Vercel (u
otro hosting serverless), lo más simple es migrar la base de datos a Postgres
(Prisma lo soporta cambiando el `provider` en `schema.prisma` y el
`DATABASE_URL`; el resto del código no cambia).

Pasos generales para producción:

1. Configura `DATABASE_URL`, `SESSION_SECRET` (uno nuevo) y
   `NEXT_PUBLIC_SITE_URL` (tu dominio real) en el entorno del hosting.
2. `npm run build`
3. `npx prisma migrate deploy` (aplica las migraciones sin generar nuevas)
4. `npx prisma db seed` (solo la primera vez, para crear el catálogo y el
   usuario admin)
5. `npm run start`

## Notas de diseño

- Todos los agentes ven todos los clientes (sin permisos por agente), según
  se definió para la primera versión.
- El logo se integró como un ícono circular junto al nombre de la marca
  (su azul celeste no formaba parte de la paleta navy/dorado ya validada, así
  que se usó como acento pequeño en vez de cambiar los colores del sitio).
