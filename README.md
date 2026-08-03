# Tramitadora Torres — Sitio + CRM + Recibos

Proyecto completo para la gestoría: sitio público con catálogo de trámites y
pago en línea, CRM interno para el equipo (tablero kanban, bitácora de
actividad, catálogo editable) y generación de recibos en PDF.

Construido con Next.js 16 (App Router), Prisma + SQLite, y Stripe Checkout
para pagos en línea.

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
  (`https://tudominio.com`), sin `/` al final — Stripe la necesita para
  redirigir al cliente después de pagar.
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`: ver la sección de pagos en
  línea abajo. Mientras estén vacíos, el botón "Pagar en línea" del sitio
  muestra un aviso amigable en vez de fallar.

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
- `src/app/api/pagos/stripe` — webhook que confirma pagos en línea.
- `prisma/schema.prisma` — modelo de datos.
- `prisma/seed.ts` — catálogo inicial + usuario admin.
- `src/lib/receipts.ts` — diseño del PDF del recibo.

## Pagos en línea (Stripe)

El sitio permite pagar cada trámite en línea (tarjeta u OXXO) al precio de
catálogo fijo, sin descuentos — los descuentos solo se aplican en el flujo
manual por WhatsApp desde el CRM. Al confirmarse el pago, el sistema crea el
cliente en el CRM, marca el pago como recibido y genera el recibo
automáticamente.

Para activarlo:

1. Entra a [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys).
2. En modo **prueba** (toggle "Test mode" arriba a la derecha), copia la
   **Secret key** (`sk_test_...`) — te sirve para probar todo el flujo sin
   mover dinero real, con las [tarjetas de prueba de Stripe](https://stripe.com/docs/testing).
3. Pégala en `.env` como `STRIPE_SECRET_KEY`.
4. Ve a [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
   → "Add endpoint" → como URL pon `<tu-dominio>/api/pagos/stripe`, y
   selecciona los eventos `checkout.session.completed` y
   `checkout.session.async_payment_succeeded`. Copia el **Signing secret**
   (`whsec_...`) del endpoint y pégalo como `STRIPE_WEBHOOK_SECRET`.
5. Cuando quieras cobrar de verdad, repite los pasos 1-4 en modo
   **producción** (mismo dashboard, toggle apagado) y actualiza ambas
   variables con las claves de producción.

**Importante sobre el webhook en local:** Stripe necesita poder llamar a tu
servidor por internet para avisar que un pago se confirmó
(`/api/pagos/stripe`). En `localhost` eso no es posible directamente — para
probarlo en desarrollo usa el [Stripe CLI](https://stripe.com/docs/stripe-cli)
(`stripe listen --forward-to localhost:3000/api/pagos/stripe`, que te da un
`whsec_...` temporal para pruebas) o una herramienta de túnel como
[ngrok](https://ngrok.com). En producción, con un dominio real públicamente
accesible, el endpoint configurado en el paso 4 funciona sin nada adicional.

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