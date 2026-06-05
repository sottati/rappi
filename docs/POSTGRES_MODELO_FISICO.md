# PostgreSQL/Supabase - modelo fisico

PostgreSQL es la fuente de verdad del DLR. Aca viven las entidades
transaccionales y las relaciones que necesitan integridad referencial.

MongoDB puede materializar proyecciones documentales derivadas de estas tablas
para catalogos enriquecidos, perfiles flexibles, snapshots de pedidos, reviews y
actividad. Esas copias no reemplazan las constraints, claves foraneas ni el
estado vigente mantenido en PostgreSQL.

Implementacion actual:

- schema Drizzle: `lib/db/postgres/schema.ts`;
- migraciones generadas:
  - `supabase/migrations/0000_sticky_callisto.sql`;
  - `supabase/migrations/0001_cuenta_app.sql`;
- queries: `lib/db/postgres/queries.ts`.

## Enums

```sql
CREATE TYPE estado_pedido AS ENUM (
  'pendiente',
  'confirmado',
  'preparando',
  'en_camino',
  'entregado',
  'cancelado'
);

CREATE TYPE tipo_calificacion AS ENUM (
  'establecimiento',
  'repartidor'
);

CREATE TYPE app_rol AS ENUM (
  'admin',
  'repartidor',
  'usuario'
);
```

## Tablas

### establecimiento

| Columna              | Tipo     | Restricciones    |
| -------------------- | -------- | ---------------- |
| `id_establecimiento` | `serial` | PK               |
| `nombre`             | `text`   | not null         |
| `tipo`               | `text`   | not null         |
| `direccion`          | `text`   | not null         |
| `email`              | `text`   | not null, unique |
| `telefono`           | `text`   | not null         |

Uso: base de locales visibles por admin/usuario; FK de `producto` y `pedido`.

### producto

| Columna                | Tipo            | Restricciones                  |
| ---------------------- | --------------- | ------------------------------ |
| `id_producto`          | `serial`        | PK                             |
| `id_establecimiento`   | `integer`       | not null, FK `establecimiento` |
| `nombre`               | `text`          | not null                       |
| `descripcion`          | `text`          | not null                       |
| `precio`               | `numeric(12,2)` | not null                       |
| `promocion_porcentaje` | `integer`       | not null, default `0`          |
| `disponible`           | `boolean`       | not null, default `true`       |
| `foto`                 | `text`          | not null, default `''`         |

Uso: catalogo base de cada establecimiento; precio vigente para armar pedidos;
FK de `detalle_pedido`.

### cliente

| Columna      | Tipo     | Restricciones    |
| ------------ | -------- | ---------------- |
| `id_cliente` | `serial` | PK               |
| `nombre`     | `text`   | not null         |
| `apellido`   | `text`   | not null         |
| `email`      | `text`   | not null, unique |
| `telefono`   | `text`   | not null         |

Uso: usuario consumidor final; FK de `direccion_entrega` y `pedido`.

### direccion_entrega

| Columna         | Tipo      | Restricciones          |
| --------------- | --------- | ---------------------- |
| `id_direccion`  | `serial`  | PK                     |
| `id_cliente`    | `integer` | not null, FK `cliente` |
| `calle`         | `text`    | not null               |
| `numero`        | `text`    | not null               |
| `ciudad`        | `text`    | not null               |
| `codigo_postal` | `text`    | not null               |

Uso: direcciones del usuario consumidor; FK de `pedido`.

### repartidor

| Columna             | Tipo            | Restricciones            |
| ------------------- | --------------- | ------------------------ |
| `id_repartidor`     | `serial`        | PK                       |
| `nombre`            | `text`          | not null                 |
| `apellido`          | `text`          | not null                 |
| `email`             | `text`          | not null, unique         |
| `telefono`          | `text`          | not null                 |
| `disponible`        | `boolean`       | not null, default `true` |
| `coordenada_actual` | `numeric(10,6)` | not null                 |

Uso: repartidores asignables a pedidos; disponibilidad base persistida;
ubicacion precisa/actual se complementa con Redis.

### pedido

| Columna              | Tipo                       | Restricciones                    |
| -------------------- | -------------------------- | -------------------------------- |
| `id_pedido`          | `serial`                   | PK                               |
| `id_cliente`         | `integer`                  | not null, FK `cliente`           |
| `id_establecimiento` | `integer`                  | not null, FK `establecimiento`   |
| `id_repartidor`      | `integer`                  | nullable, FK `repartidor`        |
| `id_direccion`       | `integer`                  | not null, FK `direccion_entrega` |
| `fecha_hora`         | `timestamp with time zone` | not null, default `now()`        |
| `estado`             | `estado_pedido`            | not null, default `pendiente`    |
| `total`              | `numeric(12,2)`            | not null                         |

Uso: entidad principal de la operatoria; fuente de verdad del estado persistido;
origen para historicos/metricas en Cassandra.

### detalle_pedido

| Columna           | Tipo            | Restricciones           |
| ----------------- | --------------- | ----------------------- |
| `id_detalle`      | `serial`        | PK                      |
| `id_pedido`       | `integer`       | not null, FK `pedido`   |
| `id_producto`     | `integer`       | not null, FK `producto` |
| `cantidad`        | `integer`       | not null                |
| `precio_unitario` | `numeric(12,2)` | not null                |

Uso: items de cada pedido; conserva precio unitario del momento del pedido.

### calificacion

| Columna           | Tipo                | Restricciones         |
| ----------------- | ------------------- | --------------------- |
| `id_calificacion` | `serial`            | PK                    |
| `id_pedido`       | `integer`           | not null, FK `pedido` |
| `tipo`            | `tipo_calificacion` | not null              |
| `puntaje`         | `integer`           | not null              |

Uso: puntaje sobre establecimiento o repartidor; base para metricas/promedios.

### cuenta_app

| Columna              | Tipo      | Restricciones                  |
| -------------------- | --------- | ------------------------------ |
| `id_cuenta`          | `serial`  | PK                             |
| `email`              | `text`    | not null, unique               |
| `contrasenia`        | `text`    | not null                       |
| `rol`                | `app_rol` | not null                       |
| `nombre_visible`     | `text`    | not null                       |
| `id_cliente`         | `integer` | nullable, FK `cliente`         |
| `id_repartidor`      | `integer` | nullable, FK `repartidor`      |
| `id_establecimiento` | `integer` | nullable, FK `establecimiento` |

Uso: identidad interna de la aplicacion y punto de entrada para login. Cada
cuenta vincula un email de acceso con un rol visible de la app y con la entidad
de dominio que puede operar:

- `admin`: gestiona un `establecimiento`;
- `repartidor`: opera como un `repartidor`;
- `usuario`: consume la app como un `cliente`.

`cuenta_app` queda como parte permanente del modelo fisico del proyecto. No se
planea reemplazarla por Supabase Auth; por lo tanto, las mejoras futuras de
seguridad deben aplicarse sobre esta tabla y su capa de queries.

## Relaciones y deletes

| Relacion                                                              | Regla                |
| --------------------------------------------------------------------- | -------------------- |
| `producto.id_establecimiento -> establecimiento.id_establecimiento`   | `ON DELETE CASCADE`  |
| `direccion_entrega.id_cliente -> cliente.id_cliente`                  | `ON DELETE CASCADE`  |
| `pedido.id_cliente -> cliente.id_cliente`                             | `ON DELETE RESTRICT` |
| `pedido.id_establecimiento -> establecimiento.id_establecimiento`     | `ON DELETE RESTRICT` |
| `pedido.id_repartidor -> repartidor.id_repartidor`                    | `ON DELETE SET NULL` |
| `pedido.id_direccion -> direccion_entrega.id_direccion`               | `ON DELETE RESTRICT` |
| `detalle_pedido.id_pedido -> pedido.id_pedido`                        | `ON DELETE CASCADE`  |
| `detalle_pedido.id_producto -> producto.id_producto`                  | `ON DELETE RESTRICT` |
| `calificacion.id_pedido -> pedido.id_pedido`                          | `ON DELETE CASCADE`  |
| `cuenta_app.id_cliente -> cliente.id_cliente`                         | `ON DELETE SET NULL` |
| `cuenta_app.id_repartidor -> repartidor.id_repartidor`                | `ON DELETE SET NULL` |
| `cuenta_app.id_establecimiento -> establecimiento.id_establecimiento` | `ON DELETE SET NULL` |

## Indices

| Indice                             | Columnas                        | Motivo                    |
| ---------------------------------- | ------------------------------- | ------------------------- |
| `producto_id_establecimiento_idx`  | `producto(id_establecimiento)`  | catalogo por local        |
| `direccion_entrega_id_cliente_idx` | `direccion_entrega(id_cliente)` | direcciones por usuario   |
| `pedido_id_cliente_idx`            | `pedido(id_cliente)`            | pedidos por usuario       |
| `pedido_id_establecimiento_idx`    | `pedido(id_establecimiento)`    | pedidos por local         |
| `pedido_id_repartidor_idx`         | `pedido(id_repartidor)`         | pedidos por repartidor    |
| `pedido_estado_idx`                | `pedido(estado)`                | filtros por estado        |
| `detalle_pedido_id_pedido_idx`     | `detalle_pedido(id_pedido)`     | detalles de pedido        |
| `detalle_pedido_id_producto_idx`   | `detalle_pedido(id_producto)`   | trazabilidad por producto |
| `calificacion_id_pedido_idx`       | `calificacion(id_pedido)`       | calificaciones de pedido  |
| `cuenta_app_email_unique`          | `cuenta_app(email)`             | login por email           |

## Queries que consume la app

| Query TS                        | Tablas                     |
| ------------------------------- | -------------------------- |
| `getEstablecimientos`           | `establecimiento`          |
| `getPedidos`                    | `pedido`, `detalle_pedido` |
| `getPedidoById`                 | `pedido`, `detalle_pedido` |
| `getPedidosByEstado`            | `pedido`, `detalle_pedido` |
| `getPedidosByCliente`           | `pedido`, `detalle_pedido` |
| `getPedidosByEstablecimiento`   | `pedido`, `detalle_pedido` |
| `getRepartidoresDisponibles`    | `repartidor`               |
| `getRepartidorById`             | `repartidor`               |
| `getPedidosByRepartidor`        | `pedido`, `detalle_pedido` |
| `getEstablecimientoById`        | `establecimiento`          |
| `getProductosByEstablecimiento` | `producto`                 |
| `authenticateCuenta`            | `cuenta_app`               |

## Gaps fisicos

- Definir si `calificacion` necesita unique compuesto por `(id_pedido, tipo)`.
- Definir constraints de rango:
  - `calificacion.puntaje` entre 1 y 5;
  - `producto.promocion_porcentaje` entre 0 y 100;
  - `detalle_pedido.cantidad > 0`;
  - montos `>= 0`.
- Agregar constraints por rol en `cuenta_app`:
  - `admin` requiere `id_establecimiento` y no requiere `id_cliente` ni `id_repartidor`;
  - `repartidor` requiere `id_repartidor`;
  - `usuario` requiere `id_cliente`.
- Cambiar `cuenta_app.contrasenia` a un hash de password y validar con comparacion segura.
- Ampliar seeds si se necesitan mas casos de uso, manteniendo PostgreSQL como fuente de ids.
