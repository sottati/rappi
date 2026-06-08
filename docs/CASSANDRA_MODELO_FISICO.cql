-- Cassandra/Astra DB - modelo fisico
--
-- Cassandra se modela por consulta. Estas tablas duplican datos descriptivos
-- para evitar joins y resolver lecturas historicas/analiticas por rol.
--
-- Keyspace esperado por la app:
--   ASTRA_DB_KEYSPACE=db_uade
--
-- El seed demo (`MOCK_DB=false pnpm db:seed`) inserta filas historicas y
-- denormalizadas para estas consultas. Primero crear el keyspace/tablas en Astra.
--
-- En Astra DB el keyspace se crea desde el panel/proveedor. Si se ejecuta en
-- Cassandra local, crear un keyspace equivalente antes de correr estas tablas.
--
-- Cruce con teoria de la cursada
-- Referencia: Clase 5 CQL, sobre Apache Cassandra y CQL.
--
-- | Concepto visto en teoria        | Cassandra/CQL teorico                         | Aplicacion en Rappi                                      |
-- | ------------------------------- | --------------------------------------------- | -------------------------------------------------------- |
-- | Keyspace                        | Contenedor logico de tablas y configuracion   | `db_uade` agrupa las tablas historicas del proyecto      |
-- | Modelado por consulta           | La tabla se disena desde la query a resolver  | `pedidos_por_cliente`, `pedidos_por_local`, rankings     |
-- | Primary key compuesta           | Partition key + clustering columns            | `PRIMARY KEY ((id_cliente), fecha_hora, id_pedido)`      |
-- | Partition key                   | Define donde vive el dato en el cluster       | `id_cliente`, `id_establecimiento`, `id_repartidor`, mes |
-- | Clustering columns              | Ordenan filas dentro de una particion         | `fecha_hora`, `id_pedido`, `total_pedidos`               |
-- | CLUSTERING ORDER BY             | Orden fisico/logico para lecturas ordenadas   | Historial DESC por fecha; ranking DESC por pedidos       |
-- | Denormalizacion                 | Duplicar datos para evitar joins              | Se repiten nombres, totales, telefonos y estados         |
-- | Sin joins como patron normal    | No se consulta como SQL relacional            | Cada pregunta tiene su tabla lista para leer             |
-- | Evitar ALLOW FILTERING          | Filtrar fuera de la key degrada performance   | Las queries usan columnas de particion/clustering        |
-- | Alta escritura / historico      | Bueno para eventos y lecturas append-oriented | Pedidos historicos, metricas diarias y calificaciones    |
--
-- Lectura conceptual:
-- Cassandra no replica el modelo relacional de PostgreSQL. Se modela por
-- pregunta: "pedidos de un cliente", "pedidos de un local", "pedidos de un
-- repartidor", "metricas por dia" o "ranking mensual". Por eso hay tablas
-- parecidas con datos repetidos. Esa duplicacion es intencional: evita joins y
-- permite lecturas directas por particion.

USE db_uade;

-- Query: getPedidosPorCliente(idCliente, limit)
CREATE TABLE IF NOT EXISTS pedidos_por_cliente (
  id_cliente int,
  fecha_hora timestamp,
  id_pedido int,
  estado text,
  id_establecimiento int,
  id_repartidor int,
  nombre_establecimiento text,
  total decimal,
  PRIMARY KEY ((id_cliente), fecha_hora, id_pedido)
) WITH CLUSTERING ORDER BY (fecha_hora DESC, id_pedido DESC);

-- Query: getPedidosPorLocal(idEstablecimiento, limit)
CREATE TABLE IF NOT EXISTS pedidos_por_local (
  id_establecimiento int,
  fecha_hora timestamp,
  id_pedido int,
  estado text,
  id_cliente int,
  nombre_cliente text,
  total decimal,
  PRIMARY KEY ((id_establecimiento), fecha_hora, id_pedido)
) WITH CLUSTERING ORDER BY (fecha_hora DESC, id_pedido DESC);

-- Query: getPedidosPorLocalEstado(idEstablecimiento, estado, limit)
CREATE TABLE IF NOT EXISTS pedidos_por_local_estado (
  id_establecimiento int,
  estado text,
  fecha_hora timestamp,
  id_pedido int,
  id_cliente int,
  nombre_cliente text,
  total decimal,
  PRIMARY KEY ((id_establecimiento, estado), fecha_hora, id_pedido)
) WITH CLUSTERING ORDER BY (fecha_hora DESC, id_pedido DESC);

-- Query: getPedidosPorRepartidor(idRepartidor, limit)
CREATE TABLE IF NOT EXISTS pedidos_por_repartidor (
  id_repartidor int,
  fecha_hora timestamp,
  id_pedido int,
  direccion_entrega text,
  estado text,
  id_cliente int,
  id_establecimiento int,
  nombre_cliente text,
  nombre_establecimiento text,
  telefono_cliente text,
  total decimal,
  PRIMARY KEY ((id_repartidor), fecha_hora, id_pedido)
) WITH CLUSTERING ORDER BY (fecha_hora DESC, id_pedido DESC);

-- Query: getCalificacionesLocal(idEstablecimiento, limit)
CREATE TABLE IF NOT EXISTS calificaciones_local (
  id_establecimiento int,
  fecha_hora timestamp,
  id_calificacion int,
  id_pedido int,
  puntaje int,
  tipo text,
  PRIMARY KEY ((id_establecimiento), fecha_hora, id_calificacion)
) WITH CLUSTERING ORDER BY (fecha_hora DESC, id_calificacion DESC);

-- Query: getCalificacionesRepartidor(idRepartidor, limit)
CREATE TABLE IF NOT EXISTS calificaciones_repartidor (
  id_repartidor int,
  fecha_hora timestamp,
  id_calificacion int,
  id_pedido int,
  puntaje int,
  PRIMARY KEY ((id_repartidor), fecha_hora, id_calificacion)
) WITH CLUSTERING ORDER BY (fecha_hora DESC, id_calificacion DESC);

-- Query: getMetricasDiariasLocal(idEstablecimiento, limit)
CREATE TABLE IF NOT EXISTS metricas_diarias_local (
  id_establecimiento int,
  fecha date,
  ingresos_del_dia decimal,
  pedidos_aceptados int,
  pedidos_cancelados int,
  total_pedidos int,
  PRIMARY KEY ((id_establecimiento), fecha)
) WITH CLUSTERING ORDER BY (fecha DESC);

-- Query: getMetricasDiariasRepartidor(idRepartidor, limit)
CREATE TABLE IF NOT EXISTS metricas_diarias_repartidor (
  id_repartidor int,
  fecha date,
  ingresos_del_dia decimal,
  pedidos_cancelados int,
  pedidos_entregados int,
  PRIMARY KEY ((id_repartidor), fecha)
) WITH CLUSTERING ORDER BY (fecha DESC);

-- Query: getMetricasGlobalesDiarias(bucket, limit)
CREATE TABLE IF NOT EXISTS metricas_globales_diarias (
  bucket text,
  fecha date,
  ingresos_totales decimal,
  locales_activos int,
  pedidos_cancelados int,
  pedidos_entregados int,
  repartidores_activos int,
  total_pedidos int,
  PRIMARY KEY ((bucket), fecha)
) WITH CLUSTERING ORDER BY (fecha DESC);

-- Query: getRankingLocalesPorMes(mes, limit)
CREATE TABLE IF NOT EXISTS ranking_locales_por_mes (
  mes text,
  total_pedidos int,
  id_establecimiento int,
  ingresos decimal,
  nombre_establecimiento text,
  promedio_calificacion decimal,
  PRIMARY KEY ((mes), total_pedidos, id_establecimiento)
) WITH CLUSTERING ORDER BY (total_pedidos DESC, id_establecimiento ASC);

-- Gaps:
-- - Confirmar ejecucion en Astra: CQL directo vs Data API/admin UI.
-- - Definir proceso de escritura desde PostgreSQL hacia estas tablas.
-- - Decidir retencion/TTL para historicos si el dataset crece.
