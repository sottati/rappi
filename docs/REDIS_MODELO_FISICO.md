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
ejemplo mock: del_001
```

Decision pendiente:

- alinear `deliveryPersonId` con `repartidor.id_repartidor` numerico o mantener
  ids externos string.

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

## Keys sugeridas pendientes

Estas keys no estan implementadas todavia, pero completan la arquitectura:

| Key                          | Tipo      | TTL             | Uso                             |
| ---------------------------- | --------- | --------------- | ------------------------------- |
| `delivery:available`         | set       | sin TTL o corto | ids de repartidores disponibles |
| `delivery:active-order:<id>` | string    | hasta cierre    | pedido activo del repartidor    |
| `order:lock:<idPedido>`      | string NX | 30s             | evitar doble asignacion         |
| `order:eta:<idPedido>`       | string    | 5m              | ETA temporal                    |

## Gaps fisicos

- Definir formato final de ids: numerico DLR vs string externo.
- Definir TTL para frescura de ubicacion.
- Implementar fallback automatico desde PostgreSQL en las pantallas.
- Definir si disponibilidad vive en PostgreSQL, Redis o ambos:
  - PostgreSQL: persistencia;
  - Redis: lectura/asignacion rapida.
