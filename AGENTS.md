# AGENTS.md

Fuente de verdad para agentes de IA y colaboradores del repo. Cursor la carga automaticamente como reglas del workspace. Leer esto antes de tocar codigo.

Documentacion complementaria: `README.md` (overview), `docs/ARQUITECTURA.md` (estructura), `docs/MODELO_DATOS.md` (reparto por motor), `docs/POSTGRES_MODELO_FISICO.md`, `docs/CASSANDRA_MODELO_FISICO.cql`, `docs/MONGODB_MODELO_FISICO.md`, `docs/REDIS_MODELO_FISICO.md`, `docs/GAPS.md` (pendientes), `docs/DECISIONES.md` (ADRs).

## Proyecto

Trabajo practico obligatorio de Ingenieria de Datos II.

La tematica asignada es Rappi. El repositorio esta orientado a implementar una aplicacion web que permita conectar, consultar, renderizar y mostrar datos provenientes de distintas bases de datos usadas en el trabajo practico.

Objetivo inmediato: dejar clara la arquitectura, el reparto de datos y el flujo de consumo para luego pasar a produccion/desarrollo de pantallas e integraciones reales.

## Estado actual del repo

Lo que ya existe (usar como referencia, no reinventar):

| Area                       | Estado                                              |
| -------------------------- | --------------------------------------------------- |
| `app/page.tsx`             | Landing con links a los 3 roles                     |
| `app/admin/`               | Layout + resumen + listado de establecimientos      |
| `app/repartidor/`          | Layout + resumen + disponibilidad (placeholder)     |
| `app/usuario/`             | Layout + resumen (placeholder)                      |
| `lib/db/*`                 | Clientes, queries y mocks por motor                 |
| `lib/auth/mock-session.ts` | Sesion mock por rol (auth real pendiente)           |
| `types/domain.ts`          | Tipos del DLR en TypeScript                         |
| `components/shared/`       | `RoleShell`, `ErrorState`, `EmptyState`, `StatCard` |
| `components/ui/`           | shadcn instalados (sidebar, button, input, etc.)    |

Lo que el layout ya navega pero **aun no tiene pagina** (crear siguiendo el patron existente):

- `/admin/productos`, `/admin/pedidos`, `/admin/analytics`
- `/admin/establecimientos/[idEstablecimiento]` y subrutas
- `/repartidor/pedidos`, `/repartidor/pedidos/[idPedido]`
- `/usuario/establecimientos`, `/usuario/pedidos`, `/usuario/direcciones` y detalles

Auth publica (sin logica aun): `/login`, `/signin` — ver ADR-017 en `docs/DECISIONES.md`. No crear `/clientes` salvo decision explicita del equipo.

## Referencia canonica

Antes de implementar una pantalla nueva, leer estos archivos:

1. `app/admin/establecimientos/page.tsx` — patron minimo: query → error → empty → render
2. `app/admin/page.tsx` — orquestacion de multiples queries con `Promise.all`
3. `app/admin/layout.tsx` — layout por rol con `RoleShell` + `getMockSession`
4. `lib/db/postgres/queries.ts` — patron de query con mock/real
5. `types/domain.ts` — tipos compartidos del dominio

## Stack

- Next.js 16 con App Router.
- React 19.
- TypeScript.
- pnpm como package manager.
- shadcn/ui inicializado con `components.json`.
- Tailwind CSS 4.
- Hugeicons como libreria de iconos configurada en shadcn.

## Comandos

- Instalar dependencias: `pnpm install`
- Desarrollo: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Format: `pnpm format`

## UI

- Usar componentes shadcn en `components/ui`.
- Importar utilidades desde `@/lib/utils`.
- Respetar aliases definidos en `components.json`.
- Mantener Server Components por defecto y usar Client Components solo cuando haga falta estado, efectos o interaccion del navegador.
- La UI debe estar enfocada en explorar y visualizar datos relacionados con la operatoria tipo Rappi.
- Organizar rutas por rol visible: `/admin`, `/repartidor`, `/usuario`.
- No crear una seccion navegable `/clientes`; `Cliente` existe como dato interno del usuario consumidor.
- Usar paginas dinamicas para detalle: `[idPedido]`, `[idEstablecimiento]`, `[idProducto]`.
- Compartir componentes en `components/features`, filtrando datos por rol desde Server Components.
- Layouts por rol usan `RoleShell` (`components/shared/role-shell.tsx`) con sidebar + nav. No duplicar ese shell.
- Errores y vacios: `ErrorState` y `EmptyState` de `components/shared/query-state.tsx`.
- Metricas en dashboards: `StatCard` de `components/shared/stat-card.tsx`.
- Iconos: `@hugeicons/react` + `@hugeicons/core-free-icons` (ver `role-shell.tsx`).

## Datos y bases

El proyecto debe quedar preparado para integrar 4 sistemas de datos:

- PostgreSQL via Supabase como base relacional.
- Redis via Upstash o Redis cloud compatible para cache, estados temporales y tracking rapido.
- MongoDB Atlas para proyecciones documentales enriquecidas: catalogos, perfiles, snapshots de pedidos, reviews y actividad.
- Cassandra via DataStax Astra DB para eventos, tracking historico o datos de alta escritura.

Las conexiones seran contra servicios cloud de bases de datos. No hardcodear credenciales, URLs privadas, tokens ni passwords.

Usar variables de entorno locales para configurar conexiones. Agregar ejemplos seguros en `.env.example` cuando se incorporen drivers o clientes reales.

Mientras las bases cloud no esten conectadas, las queries usan mocks por defecto (`shouldUseMockData()` en `lib/db/helpers.ts` devuelve `true` salvo `MOCK_DB=false`). Copiar `.env.example` a `.env.local` y dejar `MOCK_DB=true` para desarrollo local sin credenciales.

Import centralizado de motores:

```ts
import { postgres, mongodb, redis, cassandra } from "@/lib/db"
```

## Reparto de datos por motor

Respetar este reparto al agregar queries o pantallas. El DLR vive en PostgreSQL; los demas motores complementan con datos de acceso distinto.

| Motor                 | Modulo             | Datos                                                                | Queries existentes                                                                                                                 |
| --------------------- | ------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| PostgreSQL (Supabase) | `lib/db/postgres`  | Entidades del DLR: establecimientos, pedidos, detalles, repartidores | `getEstablecimientos`, `getPedidos`, `getPedidoById`, `getPedidosByEstado`, `getRepartidoresDisponibles`, `getPedidosByRepartidor` |
| MongoDB Atlas         | `lib/db/mongodb`   | Proyecciones documentales enriquecidas: catalogos, perfiles, snapshots de pedidos, reviews y actividad | `getRestaurantReviews`, `createReview`, `getUserActivity`; pendientes: catalogos/perfiles/snapshots |
| Redis (Upstash)       | `lib/db/redis`     | Estado vivo: ubicacion de repartidor, cache de estado de pedido      | `setDeliveryLocation`, `getDeliveryLocation`, `cacheOrderStatus`, `getCachedOrderStatus`                                           |
| Cassandra (Astra DB)  | `lib/db/cassandra` | Historicos, metricas y lecturas por patron de acceso                 | `getPedidosPorCliente`, `getPedidosPorLocal`, `getPedidosPorRepartidor`, `getMetricasGlobalesDiarias`, `getRankingLocalesPorMes`   |

Tipos del dominio relacional en `types/domain.ts` (camelCase). En SQL/Supabase usar snake_case (`id_pedido`, `fecha_hora`).

Detalle canonico extendido: `docs/MODELO_DATOS.md`.

Modelos fisicos por motor:

- PostgreSQL/Supabase: `docs/POSTGRES_MODELO_FISICO.md`
- Cassandra/Astra DB: `docs/CASSANDRA_MODELO_FISICO.cql`
- MongoDB Atlas: `docs/MONGODB_MODELO_FISICO.md`
- Redis/Upstash: `docs/REDIS_MODELO_FISICO.md`

## Auth temporal

No hay Supabase Auth integrado todavia. Cada layout de rol usa `getMockSession(role)` de `lib/auth/mock-session.ts` para obtener usuario mock (`userId`, `displayName`, `email`).

Al implementar pantallas filtradas por usuario, usar el `userId` de la sesion mock en el Server Component y pasarlo como parametro a la query. Cuando llegue auth real, solo cambia la fuente de sesion; las queries filtradas no deberian moverse al cliente.

## Convenciones para integraciones

- Centralizar clientes de DB en `lib/db` o una carpeta equivalente.
- Separar cada motor en su propio modulo.
- Evitar acoplar consultas directamente a componentes de UI.
- Crear funciones de acceso a datos reutilizables y tipadas.
- Validar errores de conexion y devolver estados claros para renderizar en la UI.
- Mantener los datos sensibles fuera del repositorio.

## PostgreSQL

- PostgreSQL via Supabase sera la base relacional del trabajo.
- Modelar las consultas respetando el DLR definido por el equipo: `ESTABLECIMIENTO`, `PRODUCTO`, `CLIENTE`, `DIRECCION_ENTREGA`, `REPARTIDOR`, `PEDIDO`, `DETALLE_PEDIDO`, `CALIFICACION`.
- Preferir queries tipadas y funciones pequenas de acceso a datos.

## No relacionales

- Cada base no relacional debe tener su cliente y consultas separadas.
- Redis vive en `lib/db/redis`.
- MongoDB vive en `lib/db/mongodb`.
- Cassandra/DataStax Astra DB vive en `lib/db/cassandra`.
- MongoDB puede duplicar datos del DLR como documentos derivados, pero PostgreSQL sigue siendo la fuente de verdad para integridad, estado vigente y transacciones.
- Documentar brevemente que datos aporta cada motor cuando se agregue la implementacion.
- Mantener una capa comun de normalizacion si la UI necesita combinar datos entre motores.

## Data flow — patron obligatorio

Toda pagina o seccion que muestre datos de DB debe seguir este flujo exacto:

```
Server Component (async) → lib/db/<motor>/queries → pasa data como props
    ↓
Client Component → renderiza con shadcn/ui, estado local para interactividad
```

**NO usar Redux, Zustand, Context global ni ningun store de estado global.** Los datos viajan server → cliente por props. Para interactividad (filtros, tabs, paginacion) alcanza con `useState`, `URLSearchParams` o Server Actions.

**Ejemplo concreto del patron:**

```tsx
// app/admin/pedidos/page.tsx — Server Component (sin "use client")
import { ErrorState } from "@/components/shared/query-state"
import { postgres } from "@/lib/db"
import { PedidoList } from "@/components/features/PedidoList"

export default async function AdminPedidosPage() {
  const result = await postgres.queries.getPedidos()
  if (result.error) return <ErrorState message={result.error} />
  return <PedidoList pedidos={result.data ?? []} />
}
```

```tsx
// components/features/PedidoList.tsx — Client Component
"use client"
import type { PedidoConDetalle } from "@/types/domain"
import { useState } from "react"

export function PedidoList({ pedidos }: { pedidos: PedidoConDetalle[] }) {
  const [estadoFilter, setEstadoFilter] = useState("all")
  // Logica de filtrado local, sin fetch adicional
  // ...
}
```

**Reglas que todo agente debe cumplir:**

1. Server Component llama a `lib/db/<motor>/queries` — nunca llamar a DB desde un Client Component.
2. Cada funcion en `queries.ts` devuelve `QueryResult<T>` (tipo `{ data | error }`), no lanza excepciones.
3. El Server Component maneja el caso error antes de renderizar.
4. El Client Component solo recibe props, no hace fetching.
5. Si un componente necesita datos de multiples motores, el Server Component orquesta las llamadas y combina los resultados.
6. Los mocks viven junto al motor (`lib/db/<motor>/mock.ts`) y se activan por defecto; desactivar con `MOCK_DB=false`.
7. Las rutas protegidas por rol deben consultar solo datos permitidos para ese rol; no filtrar permisos solo en el cliente.
8. Usar helpers `ok()` y `fail()` de `lib/db/helpers.ts` al escribir queries nuevas.
9. No crear `app/api/*` para lecturas internas; reservar para webhooks, health checks o integraciones externas.

## Como agregar una pantalla nueva

Checklist obligatorio:

1. Crear `app/<rol>/.../page.tsx` como Server Component async (sin `"use client"`).
2. Si la query no existe, agregarla en `lib/db/<motor>/queries.ts` devolviendo `QueryResult<T>`.
3. Agregar datos mock tipados en `lib/db/<motor>/mock.ts` si el motor usa mocks.
4. Tipos de dominio compartidos van en `types/domain.ts`; tipos especificos del motor en `lib/db/<motor>/types.ts`.
5. Manejar `result.error` con `ErrorState`, listas vacias con `EmptyState`, recurso inexistente con `notFound()` de `next/navigation`.
6. Si la UI necesita interactividad (filtros, tabs), extraer a `components/features/<Nombre>.tsx` con `"use client"` y recibir datos por props.
7. Agregar link en el `layout.tsx` del rol solo si la ruta es nueva (los layouts ya tienen nav parcial).
8. Correr `pnpm typecheck` y `pnpm lint` antes de terminar.

## Objetivo del codigo

La prioridad es dejar una base clara para conectar los motores cloud, consultar datos y renderizarlos en pantallas del proyecto. Implementar de forma incremental, manteniendo el codigo simple, tipado y facil de explicar para la entrega del trabajo practico.
