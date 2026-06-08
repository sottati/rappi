# Arquitectura

Este documento define como se organiza la app del TPO de Ingenieria de Datos II.
La tematica asignada es Rappi: una consola web para visualizar datos de pedidos,
establecimientos, usuarios y repartidores repartidos entre bases relacionales y no
relacionales.

## Stack

| Capa            | Tecnologia                 |
| --------------- | -------------------------- |
| Framework       | Next.js 16 (App Router)    |
| Lenguaje        | TypeScript                 |
| UI              | shadcn/ui + Tailwind CSS 4 |
| Iconos          | Hugeicons                  |
| Package manager | pnpm                       |

## Objetivo del sistema

La aplicacion no busca replicar todo Rappi. Busca demostrar, con una interfaz
simple, como una operatoria tipo delivery puede repartir sus datos entre motores
distintos segun el patron de acceso:

- datos transaccionales y entidades relacionales en PostgreSQL;
- catalogos y documentos flexibles en MongoDB;
- estado vivo y cache en Redis;
- historico, tracking y analiticas append-oriented en Cassandra/Astra.

La UI sirve como capa de exploracion: permite consultar esos datos por rol
(`admin`, `repartidor`, `usuario`) y renderizarlos de forma entendible para la
entrega.

## Estructura de directorios

```
app/                        # App Router (paginas y layouts)
├── api/                    # Route handlers solo si hacen falta
└── layout.tsx
components/
├── ui/                     # Componentes shadcn
├── shared/                 # Componentes reutilizables del dominio
└── features/               # Componentes especificos por funcionalidad
lib/
├── utils.ts                # Utilidades (cn, etc.)
├── auth/                   # Login, sesion y proteccion por rol
└── db/                     # Clientes y acceso a datos
    ├── index.ts            # Re-export centralizado
    ├── helpers.ts          # QueryResult, ok, fail
    ├── postgres/           # PostgreSQL via Supabase
    ├── mongodb/            # MongoDB Atlas
    ├── redis/              # Upstash Redis o Redis cloud compatible
    └── cassandra/          # Cassandra via DataStax Astra DB
types/
└── domain.ts               # Tipos compartidos del dominio Rappi
scripts/
└── seed-test-users.ts      # Dataset demo canonico multibase
```

## Flujo de datos

```
[Nube: DB cloud]
     ↓
[lib/db/<motor>/]  →  Cliente + funciones de acceso tipadas
     ↓
[Server Component]  →  Llama a lib/db, recibe datos, los pasa a clientes
     ↓
[Client Component]  →  Renderiza datos con shadcn/ui
```

- Los componentes de UI **nunca** llaman directamente a la DB.
- `lib/db/` es la unica capa que conoce los detalles de conexion.
- Los Server Components obtienen datos y los pasan como props a Client Components.
- No se crean endpoints HTTP internos para lecturas de DB salvo necesidad concreta.
- `app/api/` queda reservado para webhooks, integraciones externas, exports o health checks.

## Motores de datos

| Motor      | Proveedor elegido                | Uso previsto                                                                                                                          |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| PostgreSQL | Supabase                         | Consistencia relacional/transaccional: establecimientos, clientes, direcciones, repartidores, pedidos, detalles, calificaciones       |
| MongoDB    | MongoDB Atlas                    | Fuente documental: catalogos publicos, perfiles flexibles, documentos de pedidos, reviews y actividad                                |
| Redis      | Upstash o Redis cloud compatible | Estado vivo: ubicacion de repartidores, disponibilidad rapida y cache de estado de pedido                                             |
| Cassandra  | DataStax Astra DB                | Consultas historicas por rol, tracking, metricas diarias y rankings                                                                   |

Detalle completo: `docs/MODELO_DATOS.md`.

## Modelo relacional

El dominio relacional base sale del DLR del equipo:

| Tabla               | Responsabilidad                                                               |
| ------------------- | ----------------------------------------------------------------------------- |
| `ESTABLECIMIENTO`   | Comercios/restaurantes que ofrecen productos                                  |
| `PRODUCTO`          | Referencia transaccional/administrativa; el catalogo publico vive en MongoDB  |
| `CLIENTE`           | Usuarios compradores                                                          |
| `DIRECCION_ENTREGA` | Direcciones asociadas a clientes                                              |
| `REPARTIDOR`        | Personas que entregan pedidos                                                 |
| `PEDIDO`            | Orden principal con cliente, establecimiento, direccion y repartidor opcional |
| `DETALLE_PEDIDO`    | Items de cada pedido                                                          |
| `CALIFICACION`      | Puntaje asociado a un pedido                                                  |

En TypeScript se usan nombres en PascalCase/camelCase (`Pedido`, `idPedido`,
`fechaHora`) y en SQL se espera snake_case (`pedido`, `id_pedido`, `fecha_hora`).

Las credenciales de acceso no viven en `cliente`, `repartidor` ni
`establecimiento`. La app usa una tabla permanente `cuenta_app`, que vincula
email/password, rol y entidad de dominio (`id_cliente`, `id_repartidor` o
`id_establecimiento`). No se va a integrar Supabase Auth.

## Patron de integracion por motor

Cada modulo en `lib/db/<motor>/` sigue la misma interfaz:

```
index.ts          → exporta funciones publicas
client.ts         → inicializa y exporta el cliente (singleton)
queries.ts        → funciones de consulta tipadas
types.ts          → tipos especificos del motor (opcional)
```

## Diseño de rutas

La aplicacion se organiza por rol visible en URL. No se usa una seccion publica
`/clientes`: el consumidor final se modela como `usuario`.

```
app/
├── admin/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── establecimientos/
│   │   ├── page.tsx
│   │   └── [idEstablecimiento]/
│   │       ├── page.tsx
│   │       └── productos/
│   │           └── page.tsx
│   ├── productos/
│   │   ├── page.tsx
│   │   └── [idProducto]/
│   │       └── page.tsx
│   ├── pedidos/
│   │   ├── page.tsx
│   │   └── [idPedido]/
│   │       └── page.tsx
│   └── analytics/
│       └── page.tsx
├── repartidor/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── pedidos/
│   │   ├── page.tsx
│   │   └── [idPedido]/
│   │       └── page.tsx
│   └── disponibilidad/
│       └── page.tsx
└── usuario/
    ├── layout.tsx
    ├── page.tsx
    ├── establecimientos/
    │   ├── page.tsx
    │   └── [idEstablecimiento]/
    │       └── page.tsx
    ├── pedidos/
    │   ├── page.tsx
    │   └── [idPedido]/
    │       └── page.tsx
    └── direcciones/
        └── page.tsx
```

Estado actual:

| Ruta                         | Estado                                                    |
| ---------------------------- | --------------------------------------------------------- |
| `/`                          | Implementada: landing con accesos a roles y flujo publico |
| `/login`                     | Implementada: login contra `cuenta_app`                   |
| `/signin`                    | Implementada visualmente; registro real pendiente         |
| `/restaurantes`              | Implementada con contenido publico/mock                   |
| `/carrito`                   | Implementada con contenido publico/mock                   |
| `/admin`                     | Implementada: resumen (mock KPIs)                         |
| `/admin/local`               | Implementada: CRUD datos operativos + perfil comercial    |
| `/admin/establecimientos`    | Redirect a `/admin/local`                                 |
| `/admin/productos`           | Implementada: catálogo Mongo scoped + CRUD                |
| `/admin/productos/[idProducto]`, `/nuevo` | Implementadas: edición/alta producto      |
| `/admin/pedidos`             | Implementada con query scoped por establecimiento         |
| `/repartidor`                | Implementada: resumen                                     |
| `/repartidor/disponibilidad` | Implementada con repartidor de sesion + Redis             |
| `/usuario`                   | Implementada con pedidos scoped por cliente               |
| Rutas de detalle/listados    | Varias siguen con mocks o integracion parcial             |

| Rol          | Alcance                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------- |
| `admin`      | Duenio/gestor de un establecimiento (`id_establecimiento`). CRUD de su local, catálogo Mongo y pedidos. |
| `repartidor` | Ve pedidos asignados y administra disponibilidad/estado.                                    |
| `usuario`    | Consumidor final. Ve establecimientos, productos, sus pedidos y direcciones.                |

Todas las rutas son Server Components por defecto. Solo se convierten a Client Components cuando requieren estado, efectos o interaccion del navegador.

Las rutas de detalle usan segmentos dinamicos (`[idPedido]`, `[idEstablecimiento]`, `[idProducto]`). Si el recurso no existe o no pertenece al rol actual, la pagina debe resolver con `notFound()` o un estado de error controlado.

Los componentes visuales se comparten entre roles desde `components/features`. La diferencia entre roles se resuelve en la pagina Server Component: cada ruta llama a la query adecuada y pasa props filtradas al componente cliente.

Ejemplo:

```
admin/pedidos/page.tsx       → pedidos del establecimiento administrado
repartidor/pedidos/page.tsx  → pedidos asignados al repartidor actual
usuario/pedidos/page.tsx     → pedidos del usuario actual
```

## Manejo de errores

Cada funcion de acceso a datos:

- Valida la conexion antes de ejecutar queries.
- Devuelve `QueryResult<T>` (`{ data: T; error: null } | { data: null; error: string }`).
- Nunca lanza errores no controlados hacia la UI.
- La pagina Server Component decide si renderiza datos, `ErrorState`,
  `EmptyState` o `notFound()`.

## Modo mock

Hasta conectar los servicios cloud, se puede usar `MOCK_DB=true`.

- Cada motor puede tener un `mock.ts` con datos tipados.
- `queries.ts` revisa `MOCK_DB` antes de crear clientes reales.
- La UI usa el mismo contrato que usara con datos reales.
- Al usar clouds reales, se cambia `MOCK_DB=false`.

## Dataset demo multibase

El seed canónico vive en `scripts/seed-test-users.ts`.

```bash
pnpm db:migrate
MOCK_DB=false pnpm db:seed
```

Primero escribe PostgreSQL, resuelve los ids reales y luego proyecta esos ids a
MongoDB, Redis y Cassandra. Esta regla evita que cada motor tenga datos
incompatibles.

## Gaps conocidos

Los gaps se documentan en `docs/GAPS.md`. Resumen:

- completar pantallas navegadas desde layouts;
- migrar rutas de detalle/listados que todavia usan mocks;
- hashear passwords de `cuenta_app`;
- agregar constraints de negocio en PostgreSQL;
- decidir que lecturas Cassandra reemplazan o complementan lecturas PostgreSQL;
- implementar queries/pantallas para consumir mas documentos MongoDB.
