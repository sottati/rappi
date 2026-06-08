# Handoff del proyecto

Esta guia es para cualquier integrante que tome el repo despues de un push. Leer
esto antes de tocar codigo o datos.

## Estado actual

La app ya tiene:

- Next.js App Router con rutas visibles por rol: `/admin`, `/repartidor`,
  `/usuario`.
- Login interno funcional contra PostgreSQL, tabla `cuenta_app`.
- Sesion propia con cookie firmada (`lib/auth/session.ts`).
- PostgreSQL como fuente de verdad relacional/transaccional.
- MongoDB como fuente de verdad documental para el catalogo publico y perfiles
  flexibles.
- Seed demo multibase ya probado contra clouds:
  - PostgreSQL/Supabase;
  - MongoDB Atlas;
  - Upstash Redis;
  - Cassandra/DataStax Astra.
- Primeras pantallas consumiendo datos filtrados por sesion:
  - `/admin/local`, `/admin/productos` (Mongo), `/admin/pedidos`;
  - `/usuario`;
  - `/repartidor/disponibilidad`.

## Como levantar local

```bash
pnpm install
pnpm dev
```

La app corre en el puerto que indique Next.js. Para desarrollo sin clouds:

```env
MOCK_DB=true
```

Para consumir datos reales:

```env
MOCK_DB=false
```

## Variables necesarias

Copiar `.env.example` a `.env.local` y completar:

- `AUTH_SECRET`
- `DATABASE_URL`
- `MONGODB_URI`
- `MONGODB_DATABASE`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ASTRA_DB_API_ENDPOINT`
- `ASTRA_DB_APPLICATION_TOKEN`
- `ASTRA_DB_KEYSPACE`

No commitear `.env.local`.

## Como cargar datos demo

Cada motor carga los datos que le corresponden por responsabilidad. Cuando un
dato necesita cruzarse entre motores, se usan ids compartidos
(`idEstablecimiento`, `idCliente`, `idPedido`, etc.).

```bash
pnpm db:migrate
MOCK_DB=false pnpm db:seed
```

Antes de seedear Cassandra, las tablas deben existir. El DDL esta en:

```txt
docs/CASSANDRA_MODELO_FISICO.cql
```

El seed es idempotente para el dataset demo: se puede volver a correr para
reparar cuentas y recrear documentos/catalogos demo.

## Cuentas demo

Todas usan password:

```txt
test123
```

| Email                     | Rol          | Ruta          |
| ------------------------- | ------------ | ------------- |
| `admin@burger.example`    | `admin`      | `/admin`      |
| `lucia.gomez@example.com` | `repartidor` | `/repartidor` |
| `ana.perez@example.com`   | `usuario`    | `/usuario`    |

## Reglas que no se negocian

- No crear ruta navegable `/clientes`; el consumidor final vive como
  `usuario`.
- No usar Supabase Auth; la identidad interna vive en `cuenta_app`.
- No consultar DB desde Client Components.
- No crear `app/api/*` para lecturas internas de la propia app.
- No filtrar permisos solo en el cliente.
- No usar Zustand para datos de DB. La unica excepcion es el carrito publico en
  `lib/cart/store.ts`.
- Toda pantalla protegida debe consultar datos por el id de dominio de la
  sesion:
  - admin: `id_establecimiento`;
  - repartidor: `id_repartidor`;
  - usuario: `id_cliente`.
- Los datos reales viajan asi:

```txt
Server Component -> lib/db/<motor>/queries -> props -> UI
```

## Donde tocar para seguir

| Objetivo              | Archivos principales                                      |
| --------------------- | --------------------------------------------------------- |
| CRUD admin local/catálogo | `lib/admin/actions.ts`, `lib/admin/scope.ts`, `app/admin/local/`, `app/admin/productos/` |
| Nueva query Postgres  | `lib/db/postgres/queries.ts`, `lib/db/postgres/schema.ts` |
| Nueva query MongoDB   | `lib/db/mongodb/queries.ts`, `lib/db/mongodb/types.ts`    |
| Nueva pantalla de rol | `app/<rol>/.../page.tsx`, `components/features/...`       |
| Cambiar login/sesion  | `lib/auth/*`, `components/features/auth/*`                |
| Cambiar seed demo     | `scripts/seed-test-users.ts`, `docs/MODELO_DATOS.md`      |
| Documentar decision   | `docs/DECISIONES.md`                                      |
| Ver modelo por motor  | `docs/*_MODELO_FISICO.*`                                  |

## Checks antes de pushear

```bash
pnpm typecheck
pnpm lint
```

Si se tocaron datos o seeds, correr tambien:

```bash
MOCK_DB=false pnpm db:seed
```

## Riesgos conocidos

- `cuenta_app.contrasenia` todavia guarda password en texto plano para demo.
  Debe migrarse a hash antes de tratarlo como produccion.
- Faltan constraints de negocio en PostgreSQL: rangos, montos positivos y
  checks por rol en `cuenta_app`.
- Algunas rutas de detalle siguen usando mocks o integraciones parciales.
- MongoDB tiene documentos cargados, pero no todos tienen queries/pantallas que
  los consuman todavia.
