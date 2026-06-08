# Rappi data console

Trabajo practico de Ingenieria de Datos II. La app simula una operatoria tipo Rappi y sirve para consultar/renderizar datos repartidos entre varias bases cloud.

La prioridad actual es mostrar una base funcional con datos reales en clouds,
manteniendo documentado que dato vive en cada motor y como se consume desde la
UI.

## Funcionamiento

La aplicacion esta separada por rol:

- `/admin`: duenio/gestor de establecimiento. Ve establecimientos, productos, pedidos y analiticas.
- `/repartidor`: repartidor. Ve perfil operativo, disponibilidad, ubicacion y pedidos asignados.
- `/usuario`: consumidor final. Ve perfil, establecimientos, pedidos propios y direcciones.

No hay ruta navegable `/clientes`. El cliente existe como dato interno del usuario consumidor.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- pnpm
- Tailwind CSS 4
- shadcn/ui
- Hugeicons

## Bases de datos

| Motor                       | Uso en el sistema                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| Supabase/PostgreSQL         | Fuente de verdad relacional/transaccional + `cuenta_app` para identidad interna.                        |
| MongoDB Atlas               | Fuente documental: catalogos publicos, perfiles, documentos de pedidos, reviews y actividad.            |
| Redis/Upstash               | Estado vivo: ubicacion actual de repartidor y cache de estado de pedidos.                               |
| Cassandra/DataStax Astra DB | Historicos, metricas y lecturas desnormalizadas por patron de consulta.                                 |

El DLR define el dominio conceptual. Para la implementacion NoSQL, los datos se pueden desnormalizar segun patrones de acceso.

Detalle de almacenamiento y consumo: [`docs/MODELO_DATOS.md`](docs/MODELO_DATOS.md).
Gaps actuales y roadmap: [`docs/GAPS.md`](docs/GAPS.md).
Guia operativa de handoff: [`docs/HANDOFF.md`](docs/HANDOFF.md).

Modelos fisicos:

- [`docs/POSTGRES_MODELO_FISICO.md`](docs/POSTGRES_MODELO_FISICO.md)
- [`docs/CASSANDRA_MODELO_FISICO.cql`](docs/CASSANDRA_MODELO_FISICO.cql)
- [`docs/MONGODB_MODELO_FISICO.md`](docs/MONGODB_MODELO_FISICO.md)
- [`docs/REDIS_MODELO_FISICO.md`](docs/REDIS_MODELO_FISICO.md)

## Flujo de datos

```txt
Server Component async
  -> lib/db/<motor>/queries
  -> QueryResult<T>
  -> props hacia Client Component
  -> render con shadcn/ui
```

Reglas:

- No consultar DB desde Client Components.
- No usar Redux/Zustand/store global.
- No crear endpoints HTTP internos para lecturas si alcanza con Server Components.
- `app/api` queda para webhooks, integraciones externas, exports o health checks.
- Cada query devuelve `QueryResult<T>` y maneja errores sin lanzar excepciones a la UI.

## Rutas base

```txt
app/
├── admin/
│   ├── page.tsx
│   ├── establecimientos/
│   ├── productos/
│   ├── pedidos/
│   └── analytics/
├── repartidor/
│   ├── page.tsx
│   ├── pedidos/
│   └── disponibilidad/
└── usuario/
    ├── page.tsx
    ├── establecimientos/
    ├── pedidos/
    └── direcciones/
```

Las paginas de detalle usan ids:

```txt
/admin/establecimientos/[idEstablecimiento]
/admin/productos/[idProducto]
/admin/pedidos/[idPedido]
/repartidor/pedidos/[idPedido]
/usuario/establecimientos/[idEstablecimiento]
/usuario/pedidos/[idPedido]
```

Estado actual: estan implementadas las rutas publicas principales
(`/restaurantes`, carrito, login/signin) y las bases por rol. Las rutas que ya
consumen datos reales/scoped incluyen `/admin/productos`, `/admin/pedidos`,
`/usuario` y `/repartidor/disponibilidad`. Algunas rutas de detalle y listados
por rol siguen usando mocks o integraciones parciales.

## Modo mock

Mientras no esten conectadas las DB reales, las queries usan mocks por defecto.

```env
MOCK_DB=true
```

Para usar credenciales reales:

```env
MOCK_DB=false
```

Los mocks viven junto a cada motor:

```txt
lib/db/postgres/mock.ts
lib/db/mongodb/mock.ts
lib/db/cassandra/mock.ts
```

## Seed demo multibase

Con credenciales cloud en `.env.local`:

```bash
pnpm db:migrate
MOCK_DB=false pnpm db:seed
```

El seed carga primero PostgreSQL y despues proyecta datos a MongoDB, Redis y
Cassandra. Si falta una env de algun motor no relacional, ese motor se omite.

Cuentas demo:

| Email                     | Rol          | Password  |
| ------------------------- | ------------ | --------- |
| `admin@burger.example`    | `admin`      | `test123` |
| `lucia.gomez@example.com` | `repartidor` | `test123` |
| `ana.perez@example.com`   | `usuario`    | `test123` |

## Comandos

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

## DLR

```mermaid
erDiagram
  ESTABLECIMIENTO {
    int id_establecimiento PK
    string nombre
    string tipo
    string direccion
    string email
    string telefono
  }
  PRODUCTO {
    int id_producto PK
    int id_establecimiento FK
    string nombre
    string descripcion
    float precio
    float promocion_porcentaje
    boolean disponible
    string foto
  }
  CLIENTE {
    int id_cliente PK
    string nombre
    string apellido
    string email
    string telefono
  }
  DIRECCION_ENTREGA {
    int id_direccion PK
    int id_cliente FK
    string calle
    string numero
    string ciudad
    string codigo_postal
  }
  REPARTIDOR {
    int id_repartidor PK
    string nombre
    string apellido
    string email
    string telefono
    boolean disponible
    float coordenada_actual
  }
  PEDIDO {
    int id_pedido PK
    int id_cliente FK
    int id_establecimiento FK
    int id_repartidor FK "nullable"
    int id_direccion FK
    datetime fecha_hora
    string estado
    float total
  }
  DETALLE_PEDIDO {
    int id_detalle PK
    int id_pedido FK
    int id_producto_catalogo
    string nombre_producto
    int cantidad
    float precio_unitario
  }
  CALIFICACION {
    int id_calificacion PK
    int id_pedido FK
    string tipo
    int puntaje
  }
  CUENTA_APP {
    int id_cuenta PK
    string email
    string contrasenia
    string rol
    string nombre_visible
    int id_cliente FK "nullable"
    int id_repartidor FK "nullable"
    int id_establecimiento FK "nullable"
  }

  ESTABLECIMIENTO ||--o{ PRODUCTO : "ofrece"
  ESTABLECIMIENTO ||--o{ PEDIDO : "gestiona"
  CLIENTE ||--o{ DIRECCION_ENTREGA : "tiene"
  CLIENTE ||--o{ PEDIDO : "realiza"
  REPARTIDOR ||--o{ PEDIDO : "entrega"
  PEDIDO ||--o{ DETALLE_PEDIDO : "contiene"
  PEDIDO ||--o| CALIFICACION : "recibe"
  DIRECCION_ENTREGA ||--o{ PEDIDO : "recibe"
  CLIENTE ||--o| CUENTA_APP : "autentica"
  REPARTIDOR ||--o| CUENTA_APP : "autentica"
  ESTABLECIMIENTO ||--o| CUENTA_APP : "autentica"
```

## Documentacion interna

- **`AGENTS.md`**: fuente de verdad para agentes de IA y colaboradores. Reglas obligatorias, estado del repo, patrones y checklist.
- `docs/HANDOFF.md`: como levantar, seedear y continuar el proyecto.
- `docs/ARQUITECTURA.md`: estructura, rutas, motores y flujo de datos.
- `docs/MODELO_DATOS.md`: que dato vive en que motor y como se consume.
- `docs/GAPS.md`: pendientes para pasar de base documental a produccion.
- `docs/DECISIONES.md`: ADRs del proyecto.
