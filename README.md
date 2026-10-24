# GranaBank — challenge técnico

Aplicación de movimientos bancarios basada en el diseño de Figma. Incluye inicio de sesión, saldo y tarjetas, búsqueda y filtros de movimientos, y detalle de cada operación.

- [Aplicación desplegada](https://challenge-repo-ruby.vercel.app/)
- [Repositorio en GitHub](https://github.com/GioZulber/challenge-repo)

## Cómo correr el proyecto

Requiere Node.js 22, pnpm 12.4.2 y PostgreSQL.

1. Instalá las dependencias con `pnpm install`.
2. Copiá `server/.env.example` a `server/.env`. Configurá `DATABASE_URL` y `CLIENT_ORIGIN=http://localhost:3000`. Para cargar la cuenta demo, agregá `DEMO_EMAIL` y `DEMO_PASSWORD` con las credenciales indicadas en Figma; la contraseña debe tener al menos ocho caracteres.
3. Ejecutá `pnpm db:migrate` y `pnpm db:seed` desde un entorno que pueda acceder a la base.
4. Iniciá la API con `pnpm dev:server` y el cliente con `pnpm dev:client`, en terminales separadas.

El cliente queda en `http://localhost:3000` y la API en `http://localhost:3001`. Migraciones y seed se ejecutan explícitamente, no durante el build.

Para verificar el proyecto: `pnpm typecheck`, `pnpm test` y `pnpm build`. La [colección de Postman](GranaBank.postman_collection.json) permite probar la API manualmente.

## Despliegue

Importá el repositorio en Vercel como un único proyecto, con la raíz del repositorio como Root Directory. `vercel.json` publica `client` y mantiene `server` como servicio interno; Next.js reenvía `/api/*` al servidor mediante el binding `SERVER_URL`. Vercel inyecta esa variable: no la configures manualmente.

Configurá `DATABASE_URL` y `CLIENT_ORIGIN` en Vercel. Este último debe ser el origen HTTPS exacto del deploy, sin barra final. Aplicá `pnpm db:migrate` y `pnpm db:seed` desde un entorno con acceso a PostgreSQL. Las URLs Preview requieren su propio origen permitido para que el login funcione.

## Decisiones técnicas

- **Arquitectura:** monorepo con pnpm workspaces. `client/` usa Next.js, React, TypeScript y Tailwind CSS; `server/` usa Express y TypeScript. El backend se organiza por funcionalidades y el frontend separa rutas, pantallas, componentes y hooks.
- **Datos:** PostgreSQL y Prisma relacionan usuarios, tarjetas, sesiones y movimientos. Los importes se guardan en centavos para evitar errores de precisión.
- **Contrato de API:** Zod valida entradas y respuestas; `zod-openapi` genera OpenAPI 3.1 y `@hey-api/openapi-ts` genera tipos, SDK y validadores para el cliente. Las rutas se declaran en `server/src/openapi.ts`; después de cambiarlas, ejecutá `pnpm gen:api` y guardá los archivos generados.
- **Autenticación:** la contraseña se hashea con scrypt. El login crea un token aleatorio; la base guarda su hash y el navegador lo recibe en una cookie HttpOnly. No se usa JWT ni se guardan tokens en `localStorage`.

## Qué mejoraría con más tiempo

- Paginar el historial de movimientos cuando aumente el volumen de datos.
- Ejecutar pruebas de extremo a extremo de login, listado, filtros y detalle en un workflow de GitHub Actions.
- Agregar el registro de usuarios y su flujo de alta.
- Si las reglas de negocio identifican la tarjeta de cada operación, relacionar los movimientos con esa tarjeta y permitir consultar su historial.
- Limitar intentos de login y evaluar JWT solo si surgiera una necesidad de autenticación sin estado entre servicios.
