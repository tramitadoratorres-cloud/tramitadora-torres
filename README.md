# Tramitadora Torres — Sitio + CRM + Recibos

Proyecto completo para la gestoría: sitio público con catálogo de trámites y
pago en línea, CRM interno para el equipo (tablero kanban, bitácora de
actividad, catálogo editable) y generación de recibos en PDF.

Construido con Next.js 16 (App Router), Prisma + SQLite, y Stripe Payment
Links para pagos en línea.

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
  (`https://tudominio.com`), sin `/` al final — se usa para generar los links
  que se comparten con los clientes (ticket virtual, DS-160, etc.).
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`: ver la sección de pagos en
  línea abajo. Un trámite sin link de pago configurado en el catálogo
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

## Pagos en línea (Stripe Payment Links)

El sitio permite pagar cada trámite en línea al precio de catálogo fijo, sin
descuentos — los descuentos solo se aplican en el flujo manual por WhatsApp
desde el CRM. El pago en sí lo procesa una **Payment Link** de Stripe (creada
a mano en su dashboard, sin código ni llamadas a su API desde nuestro
servidor); nuestro sistema solo arma el link con los datos del caso y, cuando
Stripe confirma el pago, un webhook marca el pago como recibido y genera el
recibo automáticamente.

Para activarlo, por cada trámite que quieras vender en línea:

1. Entra a [dashboard.stripe.com/payment-links](https://dashboard.stripe.com/payment-links)
   → "Nuevo link de pago".
2. Crea un producto con el **mismo precio** que el honorario base del trámite
   en el catálogo (en MXN), y activa los métodos de pago que quieras aceptar
   (tarjeta, OXXO, etc.) desde ahí mismo.
3. En "Después del pago", elige "Redirigir a tu web" y usa como URL:
   `https://<tu-dominio>/pagar/estado?session_id={CHECKOUT_SESSION_ID}`
   (Stripe reemplaza `{CHECKOUT_SESSION_ID}` automáticamente).
4. Copia el link generado (`https://buy.stripe.com/...`) y pégalo en
   **CRM → Catálogo → Editar** ese trámite, en el campo "Link de pago".
5. Repite para cada trámite que quieras vender en línea. Los que se dejen sin
   link simplemente no muestran el botón de pago en línea (el cliente puede
   seguir escribiendo por WhatsApp).

Además, una sola vez, configura el webhook para que el pago se marque
automáticamente:

1. Ve a [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
   → "Add endpoint" → como URL pon `<tu-dominio>/api/pagos/stripe`, y
   selecciona los eventos `checkout.session.completed` y
   `checkout.session.async_payment_succeeded`. Copia el **Signing secret**
   (`whsec_...`) del endpoint y pégalo en Railway como `STRIPE_WEBHOOK_SECRET`.
2. También necesitas `STRIPE_SECRET_KEY` (cualquier Secret Key de tu cuenta,
   [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)) — el
   webhook la usa solo para verificar la firma de cada evento y, si puede,
   consultar el método de pago exacto; si esa consulta llegara a fallar, el
   pago se marca igual, solo sin ese detalle.

Si el webhook fallara por cualquier motivo, el pago nunca se pierde: en el
dashboard de Stripe siempre se ve el cobro, y desde el CRM se puede marcar
"Pago recibido" manualmente en el caso correspondiente — el recibo se genera
igual en ese momento.

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