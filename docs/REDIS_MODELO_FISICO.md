# Redis/Upstash - modelo fisico

Redis guarda estado vivo y cache. No es fuente de verdad: si una key expira o se
pierde, la app debe poder reconstruir el dato desde PostgreSQL o Cassandra.

Implementacion actual:

- cliente: `lib/db/redis/client.ts`;
- queries: `lib/db/redis/queries.ts`;
- proveedor previsto: Upstash Redis REST.

## Variables

```env
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

## Cruce con teoria de la cursada

Referencia: PDF de Clase 9 en `docs/teoria/`, sobre BBDD clave-valor.

| Concepto visto en teoria         | Redis teorico                                      | Aplicacion en Rappi                                                                                   |
| -------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Base clave-valor                 | Datos accesibles por una clave directa             | Todas las estructuras usan keys operativas: `order:status:<id>`, `order:claim:<id>`, `delivery:*`     |
| Datos en memoria / baja latencia | Lecturas y escrituras rapidas                      | Estado vivo de pedidos, ubicacion y disponibilidad se leen rapido sin recorrer tablas transaccionales |
| Redis no relacional              | No modela joins ni integridad referencial compleja | Postgres conserva pedidos, clientes, repartidores y relaciones; Redis solo acelera estado operativo   |
| String                           | Valor simple asociado a una key                    | `order:status:<idPedido>` guarda el estado visible del pedido                                         |
| TTL / expiracion                 | Keys temporales con vida limitada                  | `order:status:<idPedido>` expira en 3600s; `order:claim:<idPedido>` expira en 30s                     |
| Set                              | Conjunto sin duplicados                            | `delivery:available_orders` guarda ids de pedidos disponibles; evita duplicados por definicion        |
| `SADD`, `SMEMBERS`, `SREM`       | Alta, lectura y baja de miembros de un Set         | Alta al confirmar/preparar; lectura en `/repartidor/pedidos`; baja al asignar/cancelar/avanzar        |
| Hash                             | Objeto plano con campos clave-valor                | `delivery:available_order:<idPedido>` guarda snapshot operativo del pedido para render rapido         |
| `HSET`, `HGETALL`                | Escritura y lectura completa de un Hash            | Admin publica snapshot; repartidor lista pedidos disponibles sin consultar Postgres por cada pedido   |
| Atomicidad de comandos           | Un comando Redis se ejecuta completo o no          | El claim de pedido usa una escritura atomica para que no ganen dos repartidores                       |
| `SETNX` / `SET ... NX`           | Setear solo si la key no existe                    | `SET order:claim:<idPedido> <idRepartidor> NX EX 30` implementa lock temporal de asignacion           |
| GEO                              | Estructuras para geolocalizacion                   | `delivery:locations` usa `GEOADD` / `GEOPOS` para ultima ubicacion conocida del repartidor            |
| Cache                            | Dato derivado o reconstruible                      | Si Redis pierde una key, se reconstruye desde Postgres usando pedidos confirmados/preparando          |

### Lectura conceptual

Redis se usa para lo que la teoria marca como fuerte: baja latencia, acceso por
clave, TTL, estructuras simples en memoria, operaciones atomicas y
geolocalizacion. No se usa para datos que necesitan integridad relacional ni
historial permanente.

En este proyecto, la fuente de verdad del pedido es PostgreSQL. Redis contiene
proyecciones operativas:

- estado cacheado del pedido;
- ids de pedidos disponibles para tomar;
- snapshot operativo de cada pedido disponible;
- lock temporal de claim;
- ubicacion viva o ultima conocida del repartidor.

Esta separacion permite explicar el diseno asi: PostgreSQL decide que existe y
a quien pertenece un pedido; Redis permite descubrirlo, mostrarlo y reclamarlo
rapido. En el listado del repartidor se prioriza disponibilidad: si el comercio
ya valido y publico el pedido, Redis alcanza para mostrarlo como candidato.

## Key `delivery:locations`

Tipo:

- Redis GEO sorted set.

Escritura:

```ts
geoadd("delivery:locations", {
  latitude,
  longitude,
  member: deliveryPersonId,
})
```

Lectura:

```ts
geopos("delivery:locations", deliveryPersonId)
```

Uso:

- ubicacion actual o ultima conocida de un repartidor;
- pantallas de disponibilidad/tracking;
- asignacion operativa rapida.

Formato miembro actual:

```txt
deliveryPersonId = string
formato usado por la app: del_00<id_repartidor>
ejemplo demo: del_001
```

El id numerico de PostgreSQL sigue siendo la referencia canonica. Redis usa el
prefijo `del_00` solo como key/member operacional.

TTL:

- Redis GEO no aplica TTL por miembro de forma directa.
- Si se necesita expiracion por repartidor, agregar key auxiliar:

```txt
delivery:location:fresh:<deliveryPersonId> -> "1" EX 120
```

Fallback:

- si `geopos` no devuelve posicion, mostrar estado sin ubicacion;
- opcionalmente usar `repartidor.coordenada_actual` de PostgreSQL como fallback.

## Key `order:status:<orderId>`

Tipo:

- string.

Escritura actual:

```ts
set(`order:status:${orderId}`, status, { ex: 3600 })
```

Lectura:

```ts
get(`order:status:${orderId}`)
```

Uso:

- cache rapido del estado visible del pedido;
- evita pegarle a PostgreSQL para estados consultados frecuentemente;
- invalida por TTL o por nueva escritura.

Formato:

```txt
order:status:101 -> "en_camino"
TTL: 3600 segundos
```

Estados validos esperados:

```txt
pendiente
confirmado
preparando
en_camino
entregado
cancelado
```

Fallback:

- si la key no existe, consultar `pedido.estado` en PostgreSQL.

## Key `delivery:available_orders`

Tipo:

- set de strings.

Uso:

- ids de pedidos ya aceptados por el comercio y disponibles para que un
  repartidor los tome;
- indice rapido del read model Redis;
- lectura desde `/repartidor/pedidos` para saber que hashes traer.

Formato:

```txt
delivery:available_orders -> ["101", "102"]
```

Escritura:

- al confirmar o marcar preparando un pedido: `SADD delivery:available_orders <idPedido>`;
- al cancelar, asignar, poner en camino o entregar: `SREM delivery:available_orders <idPedido>`.

## Key `delivery:available_order:<idPedido>`

Tipo:

- hash.

Uso:

- snapshot operativo plano del pedido disponible;
- render directo de `/repartidor/pedidos` sin una query PostgreSQL por cada
  pedido candidato;
- prioriza baja latencia y disponibilidad para repartidores;
- se elimina junto con el id del set cuando el pedido deja de estar disponible.

Formato:

```txt
delivery:available_order:101
  idPedido               "101"
  estado                 "confirmado"
  fechaHora              "2026-06-08T12:30:00.000Z"
  total                  "12500"
  idEstablecimiento      "1"
  establecimientoNombre  "Burger House"
  direccionResumen       "Av. Corrientes 1234, CABA"
  itemCount              "3"
```

Escritura:

```txt
HSET delivery:available_order:<idPedido> idPedido ... itemCount ...
```

Lectura:

```txt
SMEMBERS delivery:available_orders
HGETALL delivery:available_order:<idPedido>
```

Consistencia:

- el snapshot se publica despues de que el comercio confirma/prepara el pedido;
- el listado confia en Redis como read model operativo;
- la asignacion final igualmente persiste en PostgreSQL con condicion
  `id_repartidor IS NULL` y estado `confirmado/preparando`.

## Key `order:claim:<idPedido>`

Tipo:

- string con TTL corto.

Uso:

- lock temporal para que solo el primer repartidor que toca "Tomar pedido" gane
  la asignacion;
- se escribe antes de actualizar `pedido.id_repartidor` en PostgreSQL;
- si la asignacion falla, el TTL permite liberar el claim automaticamente.

Formato:

```txt
order:claim:101 -> "1"
TTL: 30 segundos
```

Escritura esperada:

```txt
SET order:claim:<idPedido> <idRepartidor> NX EX 30
```

## Keys sugeridas pendientes

Estas keys no estan implementadas todavia, pero completan la arquitectura:

| Key                          | Tipo   | TTL             | Uso                             |
| ---------------------------- | ------ | --------------- | ------------------------------- |
| `delivery:available`         | set    | sin TTL o corto | ids de repartidores disponibles |
| `delivery:active-order:<id>` | string | hasta cierre    | pedido activo del repartidor    |
| `order:eta:<idPedido>`       | string | 5m              | ETA temporal                    |

## Gaps fisicos

- Definir TTL para frescura de ubicacion.
- Implementar fallback automatico desde PostgreSQL en las pantallas.
- Definir si disponibilidad vive en PostgreSQL, Redis o ambos:
  - PostgreSQL: persistencia;
  - Redis: lectura/asignacion rapida.
