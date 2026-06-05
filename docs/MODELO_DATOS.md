# Modelo de datos por motor

Este documento fija donde se guarda cada dato de la operatoria tipo Rappi y como
lo consume la aplicacion. El criterio no es "usar varias bases porque si", sino
ubicar cada dato segun consistencia, forma de consulta y frecuencia de escritura.

## Resumen

| Motor               | Rol en la arquitectura                 | Motivo                                                                            |
| ------------------- | -------------------------------------- | --------------------------------------------------------------------------------- |
| PostgreSQL/Supabase | Fuente de verdad relacional            | Integridad, claves foraneas, transacciones y DLR                                  |
| MongoDB Atlas       | Proyecciones documentales enriquecidas | Catalogos, perfiles, snapshots y reviews con estructura flexible derivada del DLR |
| Redis/Upstash       | Estado vivo y cache                    | Baja latencia, TTL y ubicaciones/estados temporales                               |
| Cassandra/Astra DB  | Historico y analitica por consulta     | Alta escritura, datos append-only y tablas modeladas por query                    |

## PostgreSQL/Supabase

Fuente de verdad para el DLR:

- `establecimiento`
- `producto`
- `cliente`
- `direccion_entrega`
- `repartidor`
- `pedido`
- `detalle_pedido`
- `calificacion`

Tabla auxiliar actual para acceso a la app:

- `cuenta_app`

`cuenta_app` no forma parte del DLR transaccional original de pedidos, pero si
queda como tabla permanente de identidad interna de la aplicacion. Vincula un
email de acceso y un rol visible con la entidad de negocio que puede operar:
`establecimiento` para admin, `repartidor` para repartidor y `cliente` para
usuario consumidor.

Modelo fisico: `docs/POSTGRES_MODELO_FISICO.md`.

Uso desde codigo:

- modulo: `lib/db/postgres`;
- schema Drizzle: `lib/db/postgres/schema.ts`;
- queries: `lib/db/postgres/queries.ts`;
- tipos compartidos: `types/domain.ts`.

Consultas actuales:

- `getEstablecimientos`
- `getEstablecimientoById`
- `getProductosByEstablecimiento`
- `getPedidos`
- `getPedidoById`
- `getPedidosByEstado`
- `getRepartidoresDisponibles`
- `getPedidosByRepartidor`
- `authenticateCuenta`

Regla: si el dato necesita integridad referencial o participa en el flujo
transaccional de un pedido, vive primero aca.

### Estado actual de datos cargados

La implementacion ya tiene una primera base para dejar de depender solo de
pantallas mock:

| Dato              | Estado                               | Uso actual                                     |
| ----------------- | ------------------------------------ | ---------------------------------------------- |
| `cuenta_app`      | 3 cuentas cargadas                   | login interno por rol                          |
| `establecimiento` | seed demo con locales iniciales      | catalogo, admin y usuario                      |
| `producto`        | productos demo para `Burger Palermo` | `/admin/productos`                             |
| `cliente`         | cliente demo `Ana Perez`             | sesion de usuario consumidor                   |
| `repartidor`      | repartidor demo `Lucia Gomez`        | sesion de repartidor                           |
| `pedido`          | pedido demo inicial                  | base para pantallas de pedidos                 |
| `detalle_pedido`  | pendiente en seed real               | items del pedido; hoy se cubre mejor por mocks |

Cuentas actuales en `cuenta_app`:

| Email                     | Rol          | Entidad asociada                 |
| ------------------------- | ------------ | -------------------------------- |
| `admin@burger.example`    | `admin`      | `establecimiento` Burger Palermo |
| `lucia.gomez@example.com` | `repartidor` | repartidor Lucia Gomez           |
| `ana.perez@example.com`   | `usuario`    | cliente Ana Perez                |

Estas cuentas sirven para validar el flujo de sesion y permisos por rol. Como
`cuenta_app` queda como identidad interna permanente, cada pantalla protegida
debe consultar datos filtrados por la entidad asociada a la sesion:

- admin: `id_establecimiento`;
- repartidor: `id_repartidor`;
- usuario: `id_cliente`.

No alcanza con proteger la ruta por rol: las queries tambien deben quedar
acotadas al id de dominio correspondiente.

Justificacion teorica: segun la teoria de la materia, las bases relacionales
aportan consistencia fuerte, transacciones, claves foraneas, SQL e indices
secundarios. Por eso PostgreSQL conserva el nucleo ACID del dominio: un pedido
no deberia apuntar a un cliente, direccion, producto, establecimiento o
repartidor inexistente. Tambien se mantiene aca el calculo economico minimo
(`detalle_pedido.precio_unitario`, cantidades y `pedido.total`), porque forma
parte de la trazabilidad transaccional.

## MongoDB Atlas

Guarda documentos flexibles y proyecciones enriquecidas vinculadas al dominio
relacional por ids externos. No reemplaza el DLR ni valida la operatoria
transaccional; materializa lecturas donde conviene embebido, snapshot y metadata
variable.

Modelo fisico: `docs/MONGODB_MODELO_FISICO.md`.

Colecciones previstas:

| Coleccion             | Documento                                                       | Patron de lectura                                        |
| --------------------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| `restaurant_catalogs` | catalogo enriquecido de establecimiento con productos embebidos | por `idEstablecimiento`, busqueda/listado por categoria  |
| `restaurant_profiles` | perfil operativo/visual flexible del establecimiento            | por `idEstablecimiento`                                  |
| `order_documents`     | snapshot documental del pedido con items, direccion y nombres   | por `idPedido`, por `idCliente`, por `idEstablecimiento` |
| `user_profiles`       | preferencias, favoritos y metadata flexible del consumidor      | por `idCliente`                                          |
| `reviews`             | review enriquecida de pedido/local/repartidor                   | por establecimiento, usuario o pedido                    |
| `user_activity`       | eventos flexibles de actividad de usuario                       | por `idCliente`, ultimos N eventos                       |

Uso desde codigo:

- modulo: `lib/db/mongodb`;
- cliente: `lib/db/mongodb/client.ts`;
- queries actuales: `getRestaurantReviews`, `createReview`, `getUserActivity`;
- queries sugeridas: `getRestaurantCatalog`, `getOrderDocument`,
  `getUserProfile`, `getRestaurantProfile`.

Regla: usar MongoDB cuando el shape del documento pueda evolucionar, cuando la
lectura necesite varios datos embebidos del DLR o cuando no convenga forzar una
tabla relacional para metadata variable. Los ids del DLR se guardan como
referencias (`idPedido`, `idCliente`, `idEstablecimiento`, etc.) y PostgreSQL
sigue siendo la fuente de verdad para integridad, precios transaccionales,
estado vigente y relaciones obligatorias.

Justificacion teorica: las clases de bases documentales destacan documentos
JSON/BSON con esquema flexible, estructuras anidadas, campos variables y
modelado segun patrones de lectura. Por eso MongoDB recibe catalogos
enriquecidos, perfiles, snapshots de pedido, reviews y actividad: son datos que
se leen naturalmente como documentos completos, pueden embeder arreglos u
objetos y pueden evolucionar sin migraciones relacionales. La teoria tambien
marca que se debe decidir entre embebido y enlazado; aca se embeben datos que se
leen juntos y se enlazan por ids del DLR cuando se necesita preservar la verdad
transaccional en PostgreSQL.

## Redis/Upstash

Guarda estado temporal, cache y datos de baja latencia.

Modelo fisico: `docs/REDIS_MODELO_FISICO.md`.

Claves actuales:

| Dato                 | Key/patron                   | Uso                     |
| -------------------- | ---------------------------- | ----------------------- |
| ubicacion repartidor | `delivery:locations` con GEO | obtener posicion actual |
| estado pedido        | `order:status:<id>` con TTL  | cache de estado visible |

Uso desde codigo:

- modulo: `lib/db/redis`;
- queries: `setDeliveryLocation`, `getDeliveryLocation`,
  `cacheOrderStatus`, `getCachedOrderStatus`.

Regla: Redis no es fuente de verdad del pedido. Si se pierde una key, se puede
reconstruir desde PostgreSQL o eventos historicos.

Justificacion teorica: las bases clave-valor se usan cuando la recuperacion por
clave, la baja latencia y la simplicidad son mas importantes que relaciones o
consultas complejas. Redis, ademas, aporta TTL, operaciones atomicas,
estructuras en memoria y soporte GEO. Por eso se usa para estado vivo,
ubicacion actual, disponibilidad rapida, locks, ETA y cache de estado de pedido:
son datos temporales o reconstruibles que deben leerse rapido, no entidades con
integridad relacional propia.

## Cassandra/Astra DB

Guarda datos historicos y tablas desnormalizadas pensadas por consulta. En
Cassandra no se modela igual que en PostgreSQL: se duplica informacion cuando
ayuda a responder una consulta sin joins.

Modelo fisico: `docs/CASSANDRA_MODELO_FISICO.cql`.

Tablas/query models actuales:

| Tabla                         | Query principal                               |
| ----------------------------- | --------------------------------------------- |
| `pedidos_por_cliente`         | historial de pedidos de un cliente            |
| `pedidos_por_local`           | pedidos recibidos por establecimiento         |
| `pedidos_por_local_estado`    | pedidos de un local filtrados por estado      |
| `pedidos_por_repartidor`      | pedidos asignados/historicos de un repartidor |
| `calificaciones_local`        | calificaciones por establecimiento            |
| `calificaciones_repartidor`   | calificaciones por repartidor                 |
| `metricas_diarias_local`      | metricas agregadas por local y fecha          |
| `metricas_diarias_repartidor` | metricas agregadas por repartidor y fecha     |
| `metricas_globales_diarias`   | tablero global por dia                        |
| `ranking_locales_por_mes`     | ranking mensual de locales                    |

Uso desde codigo:

- modulo: `lib/db/cassandra`;
- queries en `lib/db/cassandra/queries.ts`;
- tipos especificos en `lib/db/cassandra/types.ts`.

Regla: Cassandra se usa para lecturas historicas/analiticas orientadas a una
pregunta concreta. No se usa para validar integridad transaccional del pedido.

Justificacion teorica: Cassandra/CQL se modela partiendo de la consulta: la
clave de particion define donde vive el dato y las columnas de clustering
ordenan la lectura. La teoria advierte evitar consultas distribuidas costosas,
`ALLOW FILTERING` y joins; por eso se duplican datos descriptivos en tablas como
`pedidos_por_cliente`, `pedidos_por_local`, `pedidos_por_repartidor` y rankings.
Este motor queda para historicos, metricas y lecturas append-oriented donde
conviene escalar escritura/lectura por patron de acceso, no para controlar el
estado vigente de un pedido.

## Consumo desde UI

Patron obligatorio:

```txt
Server Component async
  -> lib/db/<motor>/queries
  -> QueryResult<T>
  -> props hacia componente visual
  -> render con shadcn/ui
```

Si una pantalla necesita combinar motores, el Server Component orquesta:

```txt
admin/analytics
  -> postgres: establecimientos base
  -> cassandra: metricas/ranking
  -> mongodb: catalogos/perfiles/reviews/snapshots si aplica
  -> redis: estado vivo si aplica
```

No hacer fetching desde Client Components. Los Client Components solo manejan
estado local de UI: filtros, tabs, busqueda, paginacion o toggles.

## Sincronizacion entre motores

Para la demo actual, los mocks ya simulan datos alineados. Para produccion:

1. PostgreSQL crea/actualiza el pedido como fuente de verdad.
2. Redis guarda el estado vivo o cache temporal.
3. Cassandra recibe eventos/historico para consultas por rol y metricas.
4. MongoDB materializa documentos enriquecidos asociados a ids del dominio:
   catalogos, perfiles, snapshots de pedido, reviews y actividad.

La sincronizacion puede implementarse luego con Server Actions, workers,
webhooks o jobs. Esa decision queda fuera del alcance inicial de pantallas.
