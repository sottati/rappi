# MongoDB Atlas - modelo fisico

MongoDB guarda documentos flexibles y proyecciones enriquecidas del dominio
Rappi. No es la fuente de verdad del DLR; usa ids de PostgreSQL para vincular
documentos con entidades transaccionales y optimizar lecturas embebidas.

Implementacion actual:

- cliente: `lib/db/mongodb/client.ts`;
- tipos: `lib/db/mongodb/types.ts`;
- queries: `lib/db/mongodb/queries.ts`;
- DB default: `rappi` (`MONGODB_DATABASE` permite cambiarla).
- seed demo: `scripts/seed-test-users.ts` crea documentos derivados desde ids
  reales de PostgreSQL.

## Variables

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net
MONGODB_DATABASE=rappi
```

## Criterio de modelado

PostgreSQL conserva la integridad del DLR: pedidos, detalles, precios
transaccionales, estados vigentes, clientes, direcciones y relaciones. MongoDB
materializa documentos derivados cuando el dato se consulta mejor embebido o
cuando el shape puede cambiar sin migraciones relacionales.

Reglas:

- usar ids del DLR como referencias (`idPedido`, `idCliente`,
  `idEstablecimiento`, `idProducto`, `idRepartidor`);
- duplicar nombres, fotos, direcciones y precios solo como snapshot de lectura;
- no validar integridad transaccional desde MongoDB;
- regenerar o actualizar documentos desde PostgreSQL mediante jobs, webhooks,
  Server Actions o seeds de demo.

## Coleccion `restaurant_catalogs`

Documento objetivo:

```ts
{
  _id?: ObjectId
  idEstablecimiento: number
  nombre: string
  tipo: string
  categorias: Array<{
    nombre: string
    orden: number
    productos: Array<{
      idProducto: number
      nombre: string
      descripcion: string
      precio: number
      promocionPorcentaje: number
      disponible: boolean
      foto: string
      tags?: string[]
      opciones?: Array<{
        nombre: string
        valores: string[]
      }>
    }>
  }>
  updatedAt: Date
}
```

Uso:

- catalogo de un establecimiento sin joins entre `establecimiento` y
  `producto`;
- enriquecimiento flexible: categorias, tags, opciones, destacados o metadata
  visual;
- lectura para `/usuario/establecimientos/[idEstablecimiento]` y pantallas de
  productos.

Indices recomendados:

```js
db.restaurant_catalogs.createIndex({ idEstablecimiento: 1 }, { unique: true })
db.restaurant_catalogs.createIndex({ tipo: 1, updatedAt: -1 })
db.restaurant_catalogs.createIndex({ "categorias.productos.nombre": "text" })
```

## Coleccion `restaurant_profiles`

Documento sugerido:

```ts
{
  _id?: ObjectId
  idEstablecimiento: number
  nombre: string
  descripcionComercial?: string
  horarios?: Array<{
    dia: string
    abre: string
    cierra: string
  }>
  zonasEntrega?: string[]
  mediosPago?: string[]
  banners?: Array<{
    titulo: string
    imagen: string
    activo: boolean
  }>
  metadata: Record<string, unknown>
  updatedAt: Date
}
```

Uso:

- datos flexibles del local que no pertenecen al DLR minimo;
- contenido comercial y operativo que puede cambiar de forma frecuente;
- complemento documental de `establecimiento`.

Indices recomendados:

```js
db.restaurant_profiles.createIndex({ idEstablecimiento: 1 }, { unique: true })
```

## Coleccion `order_documents`

Documento sugerido:

```ts
{
  _id?: ObjectId
  idPedido: number
  idCliente: number
  idEstablecimiento: number
  idRepartidor?: number
  estadoSnapshot: string
  fechaHora: Date
  total: number
  cliente: {
    nombre: string
    telefono?: string
  }
  establecimiento: {
    nombre: string
    tipo: string
  }
  direccionEntrega: {
    calle: string
    numero: string
    ciudad: string
    codigoPostal: string
    instrucciones?: string
  }
  items: Array<{
    idProducto: number
    nombre: string
    cantidad: number
    precioUnitario: number
    foto?: string
  }>
  metadata: Record<string, unknown>
  createdAt: Date
}
```

Uso:

- comprobante/documento de pedido para detalle de usuario, admin o repartidor;
- snapshot historico de nombres, direccion e items sin depender de joins;
- campos variables como instrucciones, canal, cupones, notas o preferencias.

Importante: `pedido.estado` vigente vive en PostgreSQL y puede cachearse en
Redis. `estadoSnapshot` solo describe el estado al momento de materializar el
documento.

Indices recomendados:

```js
db.order_documents.createIndex({ idPedido: 1 }, { unique: true })
db.order_documents.createIndex({ idCliente: 1, fechaHora: -1 })
db.order_documents.createIndex({ idEstablecimiento: 1, fechaHora: -1 })
db.order_documents.createIndex({ idRepartidor: 1, fechaHora: -1 })
```

## Coleccion `user_profiles`

Documento sugerido:

```ts
{
  _id?: ObjectId
  idCliente: number
  favoritos: {
    establecimientos: number[]
    productos: number[]
  }
  preferencias: {
    categorias?: string[]
    restriccionesAlimentarias?: string[]
    contactoPreferido?: string
  }
  direccionesMetadata?: Array<{
    idDireccion: number
    alias: string
    instrucciones?: string
    referencia?: string
  }>
  updatedAt: Date
}
```

Uso:

- preferencias y favoritos del usuario consumidor;
- metadata flexible sobre direcciones sin mover `direccion_entrega` fuera de
  PostgreSQL;
- personalizacion de pantallas de usuario.

Indices recomendados:

```js
db.user_profiles.createIndex({ idCliente: 1 }, { unique: true })
```

## Coleccion `reviews`

Documento sugerido:

```ts
{
  _id?: ObjectId
  idEstablecimiento: number
  idPedido?: number
  idCliente: number
  idRepartidor?: number
  rating: number
  comment: string
  tags?: string[]
  fotos?: string[]
  respuestaEstablecimiento?: {
    mensaje: string
    createdAt: Date
  }
  createdAt: Date
}
```

Ejemplo:

```json
{
  "idEstablecimiento": 1,
  "idPedido": 101,
  "idCliente": 1,
  "idRepartidor": 3,
  "rating": 5,
  "comment": "Llego rapido y caliente.",
  "tags": ["rapido", "buena_temperatura"],
  "createdAt": "2026-05-20T16:20:00.000Z"
}
```

Queries:

- `getRestaurantReviews(restaurantId)`: implementado hoy con filtro
  `{ restaurantId }`, donde `restaurantId = String(idEstablecimiento)`.
- `createReview(review)`: inserta un documento.

Nota: el modelo objetivo usa `idEstablecimiento`/`idCliente` numericos. Las
queries actuales usan `restaurantId`/`userId` string por compatibilidad con el
primer contrato de `lib/db/mongodb/types.ts`. Si se migra, actualizar tipos,
mocks, seed y queries al mismo tiempo.

Indices recomendados:

```js
db.reviews.createIndex({ idEstablecimiento: 1, createdAt: -1 })
db.reviews.createIndex({ idCliente: 1, createdAt: -1 })
db.reviews.createIndex({ idPedido: 1 }, { sparse: true })
db.reviews.createIndex({ idRepartidor: 1, createdAt: -1 }, { sparse: true })
```

Validacion recomendada:

```js
db.createCollection("reviews", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "idEstablecimiento",
        "idCliente",
        "rating",
        "comment",
        "createdAt",
      ],
      properties: {
        idEstablecimiento: { bsonType: "int" },
        idPedido: { bsonType: "int" },
        idCliente: { bsonType: "int" },
        idRepartidor: { bsonType: "int" },
        rating: { bsonType: "int", minimum: 1, maximum: 5 },
        comment: { bsonType: "string", maxLength: 500 },
        tags: { bsonType: "array" },
        fotos: { bsonType: "array" },
        createdAt: { bsonType: "date" },
      },
    },
  },
})
```

## Coleccion `user_activity`

Documento sugerido:

```ts
{
  _id?: ObjectId
  idCliente: number
  action: string
  metadata: Record<string, unknown>
  createdAt: Date
}
```

Ejemplo:

```json
{
  "idCliente": 1,
  "action": "order_created",
  "metadata": {
    "idPedido": 101,
    "channel": "web"
  },
  "createdAt": "2026-05-20T17:45:00.000Z"
}
```

Queries:

- `getUserActivity(userId, limit)`: implementado hoy con filtro `{ userId }`,
  donde `userId = String(idCliente)`.

Indices recomendados:

```js
db.user_activity.createIndex({ idCliente: 1, createdAt: -1 })
db.user_activity.createIndex({ action: 1, createdAt: -1 })
```

Validacion recomendada:

```js
db.createCollection("user_activity", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["idCliente", "action", "metadata", "createdAt"],
      properties: {
        idCliente: { bsonType: "int" },
        action: { bsonType: "string" },
        metadata: { bsonType: "object" },
        createdAt: { bsonType: "date" },
      },
    },
  },
})
```

## Script inicial sugerido

```js
use rappi

db.restaurant_catalogs.createIndex({ idEstablecimiento: 1 }, { unique: true })
db.restaurant_catalogs.createIndex({ tipo: 1, updatedAt: -1 })
db.restaurant_catalogs.createIndex({ "categorias.productos.nombre": "text" })

db.restaurant_profiles.createIndex({ idEstablecimiento: 1 }, { unique: true })

db.order_documents.createIndex({ idPedido: 1 }, { unique: true })
db.order_documents.createIndex({ idCliente: 1, fechaHora: -1 })
db.order_documents.createIndex({ idEstablecimiento: 1, fechaHora: -1 })
db.order_documents.createIndex({ idRepartidor: 1, fechaHora: -1 })

db.user_profiles.createIndex({ idCliente: 1 }, { unique: true })

db.reviews.createIndex({ idEstablecimiento: 1, createdAt: -1 })
db.reviews.createIndex({ idCliente: 1, createdAt: -1 })
db.reviews.createIndex({ idPedido: 1 }, { sparse: true })
db.reviews.createIndex({ idRepartidor: 1, createdAt: -1 }, { sparse: true })

db.user_activity.createIndex({ idCliente: 1, createdAt: -1 })
db.user_activity.createIndex({ action: 1, createdAt: -1 })
```

## Gaps fisicos

- Implementar queries/mocks para `restaurant_catalogs`, `restaurant_profiles`,
  `order_documents` y `user_profiles`.
- Unificar naming de ids en `reviews` y `user_activity` si se abandona
  `restaurantId`/`userId` string.
- Definir si el snapshot de `order_documents` se actualiza en cada cambio de
  estado o queda fijo como comprobante inicial.
- Agregar query de reviews por usuario si se muestra perfil/historial.
- Definir politica de retencion para `user_activity`.
