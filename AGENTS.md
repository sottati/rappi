# AGENTS.md

## Proyecto

Trabajo practico obligatorio de Ingenieria de Datos II.

La tematica asignada es Rappi. El repositorio estara orientado a implementar una aplicacion web que permita conectar, consultar, renderizar y mostrar datos provenientes de distintas bases de datos usadas en el trabajo practico.

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

## Datos y bases

El proyecto debe quedar preparado para integrar 4 sistemas de datos:

- PostgreSQL via Supabase como base relacional.
- Redis via Upstash o Redis cloud compatible para cache, estados temporales y tracking rapido.
- MongoDB Atlas para documentos flexibles como reviews, actividad o catalogos enriquecidos.
- Cassandra via DataStax Astra DB para eventos, tracking historico o datos de alta escritura.

Las conexiones seran contra servicios cloud de bases de datos. No hardcodear credenciales, URLs privadas, tokens ni passwords.

Usar variables de entorno locales para configurar conexiones. Agregar ejemplos seguros en `.env.example` cuando se incorporen drivers o clientes reales.

Mientras las bases cloud no esten conectadas, usar `MOCK_DB=true` para que `lib/db/<motor>/queries` devuelva datos mock tipados sin inicializar clientes reales.

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
// app/pedidos/page.tsx — Server Component (sin "use client")
import { postgres } from '@/lib/db'
import { PedidoList } from '@/components/features/PedidoList'

export default async function PedidosPage() {
  const result = await postgres.queries.getPedidos()
  if (result.error) return <div>Error: {result.error}</div>
  return <PedidoList pedidos={result.data} />
}
```

```tsx
// components/features/PedidoList.tsx — Client Component
'use client'
import type { PedidoConDetalle } from '@/types/domain'
import { useState } from 'react'

export function PedidoList({ pedidos }: { pedidos: PedidoConDetalle[] }) {
  const [estadoFilter, setEstadoFilter] = useState('all')
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
6. Los mocks viven junto al motor (`lib/db/<motor>/mock.ts`) y solo se activan con `MOCK_DB=true`.
7. Las rutas protegidas por rol deben consultar solo datos permitidos para ese rol; no filtrar permisos solo en el cliente.

## Objetivo del codigo

La prioridad es dejar una base clara para conectar los motores cloud, consultar datos y renderizarlos en pantallas del proyecto. Implementar de forma incremental, manteniendo el codigo simple, tipado y facil de explicar para la entrega del trabajo practico.
