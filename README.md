# GranaBank — challenge técnico

Monorepo con `client/` (Next.js + Tailwind + TypeScript) en Vercel y `server/` (Express + TypeScript + Prisma) y PostgreSQL en Dokploy. El frontend incluye login, inicio, listado y detalle de movimientos conectados a la API.

## Requisitos

- Node.js 22 (también admite 24) y pnpm 12.4.2. Si usás nvm: `nvm use`.
- Una base PostgreSQL en Dokploy, separada de la base interna de Dokploy. **Nunca pegues sus URLs ni contraseñas en el repositorio.**

## Configurar la base

1. Instalá dependencias desde la raíz: `pnpm install`.
2. En Dokploy, configurá `DATABASE_URL` del servicio `server` con la **Internal Connection URL** de tu PostgreSQL. `server/.env.example` muestra el formato sin credenciales; en local, completá `server/.env` con una URL a PostgreSQL local o a un túnel privado. El hostname interno de Dokploy no resuelve desde tu computadora.
3. Completá `DEMO_EMAIL` y `DEMO_PASSWORD` con las credenciales de demostración indicadas en Figma, solo en tu `.env` local. La contraseña debe tener al menos ocho caracteres. En el servicio `server` de producción, configurá `CLIENT_ORIGIN` con el origen HTTPS exacto de Vercel, sin barra final (por ejemplo, `https://mi-app.vercel.app`); en desarrollo por defecto es `http://localhost:3000`.
4. Desde un entorno que pueda acceder a la base (por ejemplo, el contenedor de `server` en Dokploy), ejecutá `pnpm db:migrate` y después `pnpm db:seed`. Después de actualizar, repetí ambos comandos para agregar los datos de la tarjeta de demostración a una cuenta ya sembrada. El seed puede repetirse sin duplicar movimientos; si ya existe ese email con otra contraseña, se detiene para no alterar una cuenta ajena.

`server` y PostgreSQL deben compartir una red en Dokploy; no publiques el puerto de la base. Publicá solo la API por HTTPS, apuntando al puerto interno `3001` de `server` (o al valor que configures en `PORT`). Usamos una sola URL directa para consultas y migraciones, sin pooler externo. Aplicá migraciones y seed de forma explícita, no en cada arranque o build. Configurá `DEMO_EMAIL` y `DEMO_PASSWORD` solo en el entorno donde ejecutes el seed; no son variables públicas del frontend.

## Ejecutar y verificar

- `pnpm dev:server`: API local en `http://localhost:3001`; `GET /health` responde `{ "status": "ok" }`.
- `pnpm dev:client`: web local en `http://localhost:3000`.
- `pnpm test`: pruebas del hash, sesiones, acceso a movimientos, cliente y contrato OpenAPI.
- `pnpm typecheck` y `pnpm build`: verifican ambos proyectos.
- `pnpm db:generate`: regenera el cliente Prisma tras cambios de esquema.

Para probar la API manualmente, importá `GranaBank.postman_collection.json` en Postman. Completá `demoEmail` y `demoPassword` sin guardar credenciales en el archivo; ejecutá las solicitudes en orden. Postman conserva la cookie de login para las rutas privadas y la consulta de movimientos completa el ID para el detalle. Si usás la API desplegada, ajustá `baseUrl` y `origin` (este último debe coincidir con `CLIENT_ORIGIN` del servidor).

## Contrato y cliente tipado

Los esquemas Zod de `server/src/` validan entradas y respuestas de la API y generan `server/openapi.json` con OpenAPI 3.1. Hey API genera los tipos y el SDK de `client/src/generated/` a partir de ese archivo. **Al cambiar una ruta o su respuesta, ejecutá `pnpm gen:api` y guardá el documento y el código generado**; `pnpm test` detecta si `server/openapi.json` quedó desactualizado. Express no descubre las rutas automáticamente: cada ruta nueva debe declararse también en `server/src/openapi.ts` y comprobarse contra sus esquemas.

El servidor organiza `auth`, `movements`, `balance` y `health` bajo `server/src/features/`. Cada feature conserva sus rutas, controladores, servicios y repositorios solo cuando cumplen una función; los archivos `*.dto.ts` contienen los contratos Zod compartidos con OpenAPI. El esquema HTTP de error, usado por varias features, está en `server/src/shared/`. `server/src/index.ts` únicamente compone las rutas y maneja errores HTTP.

Además de `GET /health`, la API ofrece `POST /auth/login` (email, password y `remember` opcional), `GET /auth/me`, `POST /auth/logout`, `GET /balance` (saldo y tarjeta opcional), `GET /movements?q=&type=` y `GET /movements/:id`. La cuenta demo incluye solo emisor, últimos cuatro dígitos y vencimiento de una tarjeta ficticia; no se almacena ni expone el número completo. Los tipos de movimiento admitidos son `RECEIVED`, `SENT` y `DEBIT_AUTO`. Login crea una sesión de hasta siete días con token aleatorio; la base guarda solo su hash. Con `remember: true` (o si se omite para conservar compatibilidad) el navegador recibe una cookie persistente de siete días; con `remember: false`, una cookie de sesión sin vencimiento explícito. Algunos navegadores restauran estas cookies al reabrirse; para terminar la sesión con certeza, usá «Cerrar sesión». Ambas son HttpOnly, Secure en producción y SameSite=Lax. Las rutas privadas exigen sesión vigente, el detalle de otro usuario responde 404 y logout revoca la sesión. Las peticiones de login y logout requieren un encabezado `Origin` igual a `CLIENT_ORIGIN` (o `http://localhost:3000` en desarrollo); una llamada manual a la API debe enviarlo explícitamente.

El cliente generado usa Fetch con base `/api` y cookies de mismo origen en el navegador, sin tokens en `localStorage`. Valida con Zod las respuestas JSON exitosas con cuerpo; una respuesta que no cumple el contrato se rechaza. En desarrollo, Next.js redirige `/api/*` a `http://localhost:3001/*`. En el proyecto Vercel de `client` configurá `API_ORIGIN` con la URL pública del proyecto `server` (sin barra final); **no** es una URL de base de datos ni una variable `NEXT_PUBLIC_`. Sin `API_ORIGIN` en producción no se configura el proxy y `/api/*` no funcionará. Las páginas de Next.js consultan sesión y datos iniciales directamente a `API_ORIGIN` con un cliente aislado por petición y reenvían solo `gb_session`; esas consultas no se cachean.

En `client/src/app/` están las rutas de Next; `client/src/screens/` contiene las pantallas de login, inicio, movimientos y detalle. El encabezado, las filas de movimientos y la navegación inferior se reutilizan desde `client/src/shared/components/`. `client/src/context/AuthContext.tsx` comparte el usuario y las acciones de sesión entre pantallas; saldo y movimientos recientes se cargan en inicio, y el listado con búsqueda y filtros se carga en movimientos. Cada fila abre `/movimientos/[id]`, que consulta el detalle del usuario autenticado. `client/src/generated/` se regenera desde OpenAPI y no se edita a mano.

## Decisiones y siguientes pasos

Usamos pnpm workspaces sin Turborepo, Prisma 7 estable y sesiones/movimientos asociados al usuario en PostgreSQL. Los importes se guardan en centavos. La pantalla de inicio muestra un adelanto de movimientos; el listado completo permite buscar por persona o servicio, filtrar por tipo y abrir el detalle. El registro queda para otra fase. El plan completo está en Obsidian, en `challenge-tecnico/Plan de implementación.md`.
