# CONTEXT.md — Lenguaje del dominio

Glosario de términos canónicos del proyecto. Si un término de una conversación
o PR contradice esto, gana el glosario (o se actualiza acá primero).

## Términos

### Fuente de verdad
PostgreSQL. Todo dato de pedidos, clientes, direcciones, repartidores y
calificaciones nace y se valida en Postgres (ADR-012). Las demás bases derivan
de él para su caso de uso.

### Proyección
Escritura derivada hacia Cassandra que ocurre **después** del commit en
Postgres, disparada por un Server Action (crear pedido, cambiar estado, claim,
calificar). Es best-effort: si falla, se loguea y la acción del usuario no se
bloquea. Vive en `lib/db/cassandra/projections.ts` (ADR-025). No confundir con
"sync" de Redis (estado vivo, ADR-024) ni con el catálogo Mongo (fuente
documental propia, ADR-014/023).

### Historial
Lecturas de pedidos pasados por rol, servidas por Cassandra
(`pedidos_por_cliente`, `pedidos_por_repartidor`, `pedidos_por_local*`). Los
listados de `/usuario/pedidos` y `/repartidor/pedidos` leen el historial; el
**detalle** `[idPedido]` sigue leyendo Postgres porque necesita los ítems del
snapshot transaccional.

### Bucket
Partition key de `metricas_globales_diarias`. Canónicamente es el **mes** en
formato `YYYY-MM` (ej. `2026-05`). El valor `'global'` fue un bug del seed,
corregido.

### Calificación
Puntaje 1–5 que el cliente da a un pedido **entregado**, una sola vez, en dos
dimensiones: local y repartidor. Verdad en Postgres (`calificacion`), proyectada
a `calificaciones_local` y `calificaciones_repartidor`.
