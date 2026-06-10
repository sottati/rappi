# Modelo de datos por motor

Este documento fija donde se guarda cada dato de la operatoria tipo Rappi y como
lo consume la aplicacion. El criterio no es "usar varias bases porque si", sino
ubicar cada dato segun consistencia, forma de consulta y frecuencia de escritura.

## Resumen

| Motor               | Rol en la arquitectura          | Motivo                                                            |
| ------------------- | ------------------------------- | ----------------------------------------------------------------- |
| PostgreSQL/Supabase | Fuente de verdad relacional     | Integridad, claves foraneas, transacciones y entidades del pedido |
| MongoDB Atlas       | Fuente de verdad documental     | Catalogos, perfiles, reviews y documentos con estructura flexible |
| Redis/Upstash       | Estado vivo y cache             | Baja latencia, TTL y ubicaciones/estados temporales               |
| Cassandra/Astra DB  | Historico y analitica por query | Alta escritura, datos append-only y tablas modeladas por consulta |

## PostgreSQL/Supabase

Fuente de verdad para el nucleo relacional/transaccional:

- `establecimiento`
- `producto` como referencia transaccional/administrativa cuando haga falta
- `cliente`
- `direccion_entrega`
- `repartidor`
- `pedido`
- `detalle_pedido` como snapshot transaccional de items comprados
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
- `getProductosByEstablecimiento` (uso administrativo o compatibilidad; el
  catalogo publico vive en MongoDB)
- `getPedidos`
- `getPedidoById`
- `getPedidosByEstado`
- `getPedidosByCliente`
- `getPedidosByEstablecimiento`
- `getRepartidoresDisponibles`
- `getRepartidorById`
- `getPedidosByRepartidor`
- `createPedidoFromCartSnapshot`
- `authenticateCuenta`

Regla: si el dato necesita integridad referencial fuerte o participa en la
creacion/estado de un pedido, vive aca. Los datos comerciales/documentales del
catalogo publico no se modelan primero en PostgreSQL: viven en MongoDB. En
particular, `detalle_pedido` no debe depender de una FK fuerte al catalogo: debe
guardar el snapshot del item comprado (`idProducto` del catalogo, nombre,
cantidad y precio unitario de cierre).

### Estado actual de datos cargados

La implementacion ya tiene una primera base para dejar de depender solo de
pantallas mock:

| Dato              | Estado                            | Uso actual                    |
| ----------------- | --------------------------------- | ----------------------------- |
| `cuenta_app`      | 3 cuentas cargadas                | login interno por rol         |
| `establecimiento` | seed demo con locales iniciales   | catalogo, admin y usuario     |
| `producto`        | referencias transaccionales demo  | admin/compatibilidad          |
| `cliente`         | cliente demo `Ana Perez`          | sesion de usuario consumidor  |
| `repartidor`      | repartidor demo `Lucia Gomez`     | sesion de repartidor          |
| `pedido`          | pedido demo inicial               | base para pantallas de pedido |
| `detalle_pedido`  | 2 items demo del pedido principal | detalle/listado de pedidos    |
| `calificacion`    | 2 calificaciones demo             | reviews y metricas derivadas  |

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

### Dataset demo canonico multibase

El comando `pnpm db:seed` carga datos demo en cada motor segun su
responsabilidad. PostgreSQL conserva las entidades relacionales necesarias para
identidad, permisos y pedidos; MongoDB conserva el catalogo/documentos
flexibles; Redis y Cassandra se omiten si sus variables de entorno no estan
presentes.

| Motor      | Datos demo                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| PostgreSQL | cuentas, locales, cliente, direccion, repartidor, pedido, detalles y calificaciones                          |
| MongoDB    | `restaurant_catalogs`, `restaurant_profiles`, `order_documents`, `user_profiles`, `reviews`, `user_activity` |
| Redis      | ubicacion GEO del repartidor y cache `order:status:<idPedido>`                                               |
| Cassandra  | pedidos por cliente/local/repartidor, metricas diarias y ranking mensual                                     |

La regla de vinculacion es no inventar identificadores incompatibles entre
motores. Cuando un documento necesita referenciar una entidad relacional, guarda
el id de esa entidad (`idEstablecimiento`, `idCliente`, `idPedido`, etc.). Eso no
convierte al documento en una proyeccion: solo permite relacionar datos entre
bases cuando la UI o el flujo de negocio lo necesita.

Justificacion teorica: segun la teoria de la materia, las bases relacionales
aportan consistencia fuerte, transacciones, claves foraneas, SQL e indices
secundarios. Por eso PostgreSQL conserva el nucleo ACID del dominio: un pedido
no deberia apuntar a un cliente, direccion, establecimiento o repartidor
inexistente. Tambien se mantiene aca el calculo economico minimo del pedido
(`detalle_pedido.precio_unitario`, cantidades y `pedido.total`), porque forma
parte de la trazabilidad transaccional. El producto del detalle se guarda como
snapshot del item elegido desde MongoDB, no como dependencia operacional del
catalogo vigente.

## MongoDB Atlas

Guarda documentos flexibles donde la estructura natural es anidada o variable.
MongoDB es fuente de verdad para el catalogo publico, perfiles documentales,
reviews enriquecidas y actividad flexible. Se vincula con entidades
relacionales mediante ids externos, pero esos documentos no son simples copias
de PostgreSQL.

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
- queries actuales: `getRestaurantCatalog`, `getRestaurantCatalogProduct`,
  `getRestaurantProfile`, `upsertRestaurantProfile`, `syncCatalogHeader`,
  `addCatalogProduct`, `updateCatalogProduct`, `setCatalogProductAvailability`,
  `getRestaurantReviews`, `createReview`, `getUserActivity`;
- queries sugeridas: `getOrderDocument`, `getUserProfile`.

Regla: usar MongoDB cuando el shape del dato pueda evolucionar, cuando se lea
naturalmente como documento completo o cuando no convenga forzar tablas
relacionales para arrays, metadata variable u objetos embebidos. En particular,
`restaurant_catalogs` es la fuente de verdad del catalogo publico: categorias,
productos visibles, opciones, tags, fotos y disponibilidad comercial. PostgreSQL
no redefine ese catalogo; solo mantiene lo necesario para el flujo
transaccional.

Justificacion teorica: las clases de bases documentales destacan documentos
JSON/BSON con esquema flexible, estructuras anidadas, campos variables y
modelado segun patrones de lectura. Por eso MongoDB conserva catalogos
enriquecidos, perfiles, documentos de pedido, reviews y actividad: son datos que
se leen naturalmente como documentos completos, pueden embeder arreglos u
objetos y pueden evolucionar sin migraciones relacionales. La teoria tambien
marca que se debe decidir entre embebido y enlazado; aca se embeben datos que se
leen juntos y se enlaza por ids externos cuando hay que relacionar el documento
con pedidos, usuarios o establecimientos.

## Redis/Upstash

Guarda estado temporal, cache y datos de baja latencia.

Modelo fisico: `docs/REDIS_MODELO_FISICO.md`.

Claves actuales:

| Dato                 | Key/patron                           | Uso                      |
| -------------------- | ------------------------------------ | ------------------------ |
| ubicacion repartidor | `delivery:locations` con GEO         | obtener posicion actual  |
| estado pedido        | `order:status:<id>` con TTL          | cache de estado visible  |
| pedidos disponibles  | `delivery:available_orders`          | set de ids candidatos    |
| snapshot disponible  | `delivery:available_order:<id>` hash | render rapido repartidor |
| claim pedido         | `order:claim:<id>` con `NX`          | lock atomico temporal    |

Uso desde codigo:

- modulo: `lib/db/redis`;
- queries: `setDeliveryLocation`, `getDeliveryLocation`,
  `cacheOrderStatus`, `getCachedOrderStatus`, `addAvailableOrder`,
  `getAvailableOrders`, `removeAvailableOrder`, `claimAvailableOrder`.

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

Uso desde UI:

- `/admin`: KPIs y charts semanales del local. La base primaria es
  `metricas_diarias_local`; si una metrica diaria esta incompleta o no existe,
  se fusiona `pedidos_por_local` como fallback para derivar pedidos/facturacion
  por dia. La serie se normaliza a los ultimos 7 dias terminando hoy y rellena
  dias sin actividad con cero. El KPI de calificacion usa
  `ranking_locales_por_mes` del mes corriente.
- `/admin/analytics`: metricas globales/locales por mes, ranking mensual y tabla
  de pedidos historicos del local.
- `/usuario/pedidos`: historial por cliente desde `pedidos_por_cliente`.
- `/repartidor/pedidos`: pedidos asignados/historicos desde
  `pedidos_por_repartidor`; pedidos disponibles siguen viniendo de Redis.

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
  -> mongodb: catalogos/perfiles/reviews/documentos si aplica
  -> redis: estado vivo si aplica
```

No hacer fetching desde Client Components. Los Client Components solo manejan
estado local de UI: filtros, tabs, busqueda, paginacion o toggles.

## Sincronizacion entre motores

Para la demo actual, el seed multibase carga datos consistentes entre motores,
pero cada motor mantiene los datos que le corresponden por responsabilidad. Los
mocks siguen existiendo para desarrollo local sin credenciales, pero no deben
tratarse como prueba de sincronizacion entre clouds.

Flujo de coordinacion esperado:

1. MongoDB mantiene el catalogo publico y los documentos flexibles.
2. Al crear un pedido, la app toma el snapshot del carrito armado desde el
   catalogo MongoDB y persiste en PostgreSQL el pedido transaccional con sus
   items e importes de cierre. En esta etapa no se agrega una query extra a
   MongoDB para revalidar productos durante checkout: si el item llego al
   carrito desde el catalogo, se considera valido para la demo.
3. Redis guarda estado vivo o cache temporal.
4. Cassandra recibe eventos/historico para consultas por rol y metricas.

La sincronizacion puede implementarse luego con Server Actions, workers,
webhooks o jobs. Esa decision queda fuera del alcance inicial de pantallas.
