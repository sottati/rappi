# Arquitectura

## Stack

| Capa | Tecnologia |
|------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| UI | shadcn/ui + Tailwind CSS 4 |
| Iconos | Hugeicons |
| Package manager | pnpm |

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
└── db/                     # Clientes y acceso a datos
    ├── index.ts            # Re-export centralizado
    ├── helpers.ts          # QueryResult, ok, fail
    ├── postgres/           # PostgreSQL via Supabase
    ├── mongodb/            # MongoDB Atlas
    ├── redis/              # Upstash Redis o Redis cloud compatible
    └── cassandra/          # Cassandra via DataStax Astra DB
types/
└── domain.ts               # Tipos compartidos del dominio Rappi
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

| Motor | Proveedor elegido | Uso previsto |
|------|-------------------|--------------|
| PostgreSQL | Supabase | Entidades relacionales: pedidos, usuarios, restaurantes, pagos |
| Redis | Upstash o Redis cloud compatible | Cache, estados temporales, ubicaciones actuales |
| MongoDB | MongoDB Atlas | Documentos flexibles: reviews, actividad de usuario, metadata |
| Cassandra | DataStax Astra DB | Eventos de pedido, tracking historico, datos de alta escritura |

## Modelo relacional

El dominio relacional base sale del DLR del equipo:

| Tabla | Responsabilidad |
|------|-----------------|
| `ESTABLECIMIENTO` | Comercios/restaurantes que ofrecen productos |
| `PRODUCTO` | Productos ofrecidos por cada establecimiento |
| `CLIENTE` | Usuarios compradores |
| `DIRECCION_ENTREGA` | Direcciones asociadas a clientes |
| `REPARTIDOR` | Personas que entregan pedidos |
| `PEDIDO` | Orden principal con cliente, establecimiento, direccion y repartidor opcional |
| `DETALLE_PEDIDO` | Items de cada pedido |
| `CALIFICACION` | Puntaje asociado a un pedido |

En TypeScript se usan nombres en PascalCase/camelCase (`Pedido`, `idPedido`, `fechaHora`) y en SQL se espera snake_case (`pedido`, `id_pedido`, `fecha_hora`).

## Patron de integracion por motor

Cada modulo en `lib/db/<motor>/` sigue la misma interfaz:

```
index.ts          → exporta funciones publicas
client.ts         → inicializa y exporta el cliente (singleton)
queries.ts        → funciones de consulta tipadas
types.ts          → tipos especificos del motor (opcional)
```

## Diseño de rutas

La aplicacion se organiza por rol visible en URL. No se usa una seccion publica `/clientes`: el consumidor final se modela como `usuario`.

```
app/
├── login/
│   └── page.tsx
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

| Rol | Alcance |
|-----|---------|
| `admin` | Duenio/gestor de establecimiento. Ve sus establecimientos, productos, pedidos y analiticas. |
| `repartidor` | Ve pedidos asignados y administra disponibilidad/estado. |
| `usuario` | Consumidor final. Ve establecimientos, productos, sus pedidos y direcciones. |

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

## Modo mock

Hasta conectar los servicios cloud, se puede usar `MOCK_DB=true`.

- Cada motor puede tener un `mock.ts` con datos tipados.
- `queries.ts` revisa `MOCK_DB` antes de crear clientes reales.
- La UI usa el mismo contrato que usara con datos reales.
- Al conectar una DB, se cambia `MOCK_DB=false` o se elimina la variable local.
