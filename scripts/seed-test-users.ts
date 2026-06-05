/**
 * Carga el dataset demo canonico en PostgreSQL y proyecciones en motores NoSQL.
 * Uso recomendado: MOCK_DB=false pnpm db:seed
 *
 * Contraseña de todas las cuentas demo: test123
 */
import { eq } from 'drizzle-orm'
import {
  disconnect as disconnectCassandra,
  getTable,
} from '../lib/db/cassandra'
import {
  disconnect as disconnectMongo,
  getDb as getMongoDb,
} from '../lib/db/mongodb'
import { disconnectDrizzle, getDrizzleDb } from '../lib/db/postgres/drizzle'
import { mockTestPassword } from '../lib/db/postgres/mock'
import {
  calificacion,
  cliente,
  cuentaApp,
  detallePedido,
  direccionEntrega,
  establecimiento,
  pedido,
  producto,
  repartidor,
} from '../lib/db/postgres/schema'
import { getClient as getRedisClient } from '../lib/db/redis'
import { loadDotEnv } from '../lib/env'
import { EstadoPedido, TipoCalificacion } from '../types/domain'

loadDotEnv()

const TEST_PASSWORD = mockTestPassword
const DEMO_DATE = new Date('2026-05-20T17:45:00Z')
const DEMO_DAY = '2026-05-20'
const DEMO_MONTH = '2026-05'

interface SeedContext {
  establecimiento: typeof establecimiento.$inferSelect
  repartidor: typeof repartidor.$inferSelect
  cliente: typeof cliente.$inferSelect
  direccion: typeof direccionEntrega.$inferSelect
  productos: (typeof producto.$inferSelect)[]
  pedido: typeof pedido.$inferSelect
}

function hasEnv(...keys: string[]) {
  return keys.every((key) => Boolean(process.env[key]))
}

async function seedPostgres(): Promise<SeedContext> {
  const db = getDrizzleDb()

  await db
    .insert(establecimiento)
    .values([
      {
        nombre: 'Burger Palermo',
        tipo: 'restaurante',
        direccion: 'Av. Santa Fe 3200, CABA',
        email: 'palermo@burger.example',
        telefono: '+54 11 5555-2001',
      },
      {
        nombre: 'Sushi Centro',
        tipo: 'restaurante',
        direccion: 'Florida 650, CABA',
        email: 'centro@sushi.example',
        telefono: '+54 11 5555-2002',
      },
    ])
    .onConflictDoNothing({ target: establecimiento.email })

  const establecimientos = await db.query.establecimiento.findMany()
  const burger = establecimientos.find(
    (item) => item.email === 'palermo@burger.example'
  )
  const sushi = establecimientos.find(
    (item) => item.email === 'centro@sushi.example'
  )

  if (!burger || !sushi) {
    throw new Error('No se pudieron resolver los establecimientos demo.')
  }

  const productosBurger = await db.query.producto.findMany({
    where: eq(producto.idEstablecimiento, burger.idEstablecimiento),
  })

  if (productosBurger.length === 0) {
    await db.insert(producto).values([
      {
        idEstablecimiento: burger.idEstablecimiento,
        nombre: 'Doble Smash Palermo',
        descripcion:
          'Doble carne, cheddar, pickles y salsa house en pan brioche.',
        precio: 9200,
        promocionPorcentaje: 0,
        disponible: true,
        foto: 'https://images.rappi.com.ar/rests_taxonomy/3b2189f4-54bc-47e5-8e69-ad8073de60a8.png?e=webp&d=200x200&q=50',
      },
      {
        idEstablecimiento: burger.idEstablecimiento,
        nombre: 'Papas cheddar',
        descripcion: 'Papas fritas con cheddar fundido y verdeo.',
        precio: 2800,
        promocionPorcentaje: 15,
        disponible: true,
        foto: 'https://images.rappi.com.ar/rests_taxonomy/8756fb49-2a56-477d-b7d8-3e533c4b3641.png?e=webp&d=200x200&q=50',
      },
    ])
  }

  const productos = await db.query.producto.findMany({
    where: eq(producto.idEstablecimiento, burger.idEstablecimiento),
  })

  if (productos.length < 2) {
    throw new Error(
      'El dataset demo requiere al menos dos productos de Burger Palermo.'
    )
  }

  await db
    .insert(repartidor)
    .values({
      nombre: 'Lucia',
      apellido: 'Gomez',
      email: 'lucia.gomez@example.com',
      telefono: '+54 11 5555-1001',
      disponible: true,
      coordenadaActual: -34.5889,
    })
    .onConflictDoNothing({ target: repartidor.email })

  const lucia = await db.query.repartidor.findFirst({
    where: eq(repartidor.email, 'lucia.gomez@example.com'),
  })

  if (!lucia) throw new Error('No se pudo resolver el repartidor demo.')

  await db
    .insert(cliente)
    .values({
      nombre: 'Ana',
      apellido: 'Perez',
      email: 'ana.perez@example.com',
      telefono: '+54 11 5555-3001',
    })
    .onConflictDoNothing({ target: cliente.email })

  const ana = await db.query.cliente.findFirst({
    where: eq(cliente.email, 'ana.perez@example.com'),
  })

  if (!ana) throw new Error('No se pudo resolver el cliente demo.')

  const direccionExistente = await db.query.direccionEntrega.findFirst({
    where: eq(direccionEntrega.idCliente, ana.idCliente),
  })

  const direccion =
    direccionExistente ??
    (
      await db
        .insert(direccionEntrega)
        .values({
          idCliente: ana.idCliente,
          calle: 'Av. Corrientes',
          numero: '1234',
          ciudad: 'CABA',
          codigoPostal: 'C1043',
        })
        .returning()
    )[0]

  const pedidosAna = await db.query.pedido.findMany({
    where: eq(pedido.idCliente, ana.idCliente),
  })

  if (pedidosAna.length === 0) {
    await db.insert(pedido).values({
      idCliente: ana.idCliente,
      idEstablecimiento: burger.idEstablecimiento,
      idRepartidor: lucia.idRepartidor,
      idDireccion: direccion.idDireccion,
      fechaHora: DEMO_DATE,
      estado: EstadoPedido.EnCamino,
      total: 12000,
    })
  }

  const pedidoAna = await db.query.pedido.findFirst({
    where: eq(pedido.idCliente, ana.idCliente),
    orderBy: (table, { desc }) => [desc(table.fechaHora)],
  })

  if (!pedidoAna) throw new Error('No se pudo resolver el pedido demo.')

  const detallesExistentes = await db.query.detallePedido.findMany({
    where: eq(detallePedido.idPedido, pedidoAna.idPedido),
  })

  if (detallesExistentes.length === 0) {
    await db.insert(detallePedido).values([
      {
        idPedido: pedidoAna.idPedido,
        idProducto: productos[0].idProducto,
        cantidad: 1,
        precioUnitario: productos[0].precio,
      },
      {
        idPedido: pedidoAna.idPedido,
        idProducto: productos[1].idProducto,
        cantidad: 1,
        precioUnitario: productos[1].precio,
      },
    ])
  }

  const calificacionesExistentes = await db.query.calificacion.findMany({
    where: eq(calificacion.idPedido, pedidoAna.idPedido),
  })

  if (calificacionesExistentes.length === 0) {
    await db.insert(calificacion).values([
      {
        idPedido: pedidoAna.idPedido,
        tipo: TipoCalificacion.Establecimiento,
        puntaje: 5,
      },
      {
        idPedido: pedidoAna.idPedido,
        tipo: TipoCalificacion.Repartidor,
        puntaje: 4,
      },
    ])
  }

  await db
    .insert(cuentaApp)
    .values({
      email: 'admin@burger.example',
      contrasenia: TEST_PASSWORD,
      rol: 'admin',
      nombreVisible: 'Duenio Burger Palermo',
      idCliente: null,
      idRepartidor: null,
      idEstablecimiento: burger.idEstablecimiento,
    })
    .onConflictDoUpdate({
      target: cuentaApp.email,
      set: {
        contrasenia: TEST_PASSWORD,
        rol: 'admin',
        nombreVisible: 'Duenio Burger Palermo',
        idCliente: null,
        idRepartidor: null,
        idEstablecimiento: burger.idEstablecimiento,
      },
    })

  await db
    .insert(cuentaApp)
    .values({
      email: 'lucia.gomez@example.com',
      contrasenia: TEST_PASSWORD,
      rol: 'repartidor',
      nombreVisible: 'Lucia Gomez',
      idCliente: null,
      idRepartidor: lucia.idRepartidor,
      idEstablecimiento: null,
    })
    .onConflictDoUpdate({
      target: cuentaApp.email,
      set: {
        contrasenia: TEST_PASSWORD,
        rol: 'repartidor',
        nombreVisible: 'Lucia Gomez',
        idCliente: null,
        idRepartidor: lucia.idRepartidor,
        idEstablecimiento: null,
      },
    })

  await db
    .insert(cuentaApp)
    .values({
      email: 'ana.perez@example.com',
      contrasenia: TEST_PASSWORD,
      rol: 'usuario',
      nombreVisible: 'Ana Perez',
      idCliente: ana.idCliente,
      idRepartidor: null,
      idEstablecimiento: null,
    })
    .onConflictDoUpdate({
      target: cuentaApp.email,
      set: {
        contrasenia: TEST_PASSWORD,
        rol: 'usuario',
        nombreVisible: 'Ana Perez',
        idCliente: ana.idCliente,
        idRepartidor: null,
        idEstablecimiento: null,
      },
    })

  return {
    establecimiento: burger,
    repartidor: lucia,
    cliente: ana,
    direccion,
    productos,
    pedido: pedidoAna,
  }
}

async function seedMongo(context: SeedContext) {
  if (!hasEnv('MONGODB_URI')) {
    console.log('MongoDB omitido: MONGODB_URI no configurado.')
    return
  }

  const db = await getMongoDb()
  const items = context.productos.slice(0, 2).map((item) => ({
    idProducto: item.idProducto,
    nombre: item.nombre,
    descripcion: item.descripcion,
    cantidad: 1,
    precioUnitario: item.precio,
    foto: item.foto,
  }))

  await db.collection('restaurant_catalogs').updateOne(
    { idEstablecimiento: context.establecimiento.idEstablecimiento },
    {
      $set: {
        idEstablecimiento: context.establecimiento.idEstablecimiento,
        nombre: context.establecimiento.nombre,
        tipo: context.establecimiento.tipo,
        categorias: [
          {
            nombre: 'Hamburguesas y acompanamientos',
            orden: 1,
            productos: context.productos.map((item) => ({
              idProducto: item.idProducto,
              nombre: item.nombre,
              descripcion: item.descripcion,
              precio: item.precio,
              promocionPorcentaje: item.promocionPorcentaje,
              disponible: item.disponible,
              foto: item.foto,
              tags: ['demo'],
            })),
          },
        ],
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  )

  await db.collection('restaurant_profiles').updateOne(
    { idEstablecimiento: context.establecimiento.idEstablecimiento },
    {
      $set: {
        idEstablecimiento: context.establecimiento.idEstablecimiento,
        nombre: context.establecimiento.nombre,
        descripcionComercial: 'Local demo para validar catalogo y pedidos.',
        horarios: [{ dia: 'lunes-domingo', abre: '11:00', cierra: '23:30' }],
        zonasEntrega: ['Palermo', 'Recoleta'],
        mediosPago: ['tarjeta', 'efectivo'],
        metadata: { dataset: 'demo' },
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  )

  await db.collection('order_documents').updateOne(
    { idPedido: context.pedido.idPedido },
    {
      $set: {
        idPedido: context.pedido.idPedido,
        idCliente: context.cliente.idCliente,
        idEstablecimiento: context.establecimiento.idEstablecimiento,
        idRepartidor: context.repartidor.idRepartidor,
        estadoSnapshot: context.pedido.estado,
        fechaHora: context.pedido.fechaHora,
        total: context.pedido.total,
        cliente: {
          nombre: `${context.cliente.nombre} ${context.cliente.apellido}`,
          telefono: context.cliente.telefono,
        },
        establecimiento: {
          nombre: context.establecimiento.nombre,
          tipo: context.establecimiento.tipo,
        },
        direccionEntrega: {
          calle: context.direccion.calle,
          numero: context.direccion.numero,
          ciudad: context.direccion.ciudad,
          codigoPostal: context.direccion.codigoPostal,
          instrucciones: 'Tocar timbre 2B',
        },
        items,
        metadata: { dataset: 'demo' },
        createdAt: context.pedido.fechaHora,
      },
    },
    { upsert: true }
  )

  await db.collection('user_profiles').updateOne(
    { idCliente: context.cliente.idCliente },
    {
      $set: {
        idCliente: context.cliente.idCliente,
        favoritos: {
          establecimientos: [context.establecimiento.idEstablecimiento],
          productos: context.productos
            .slice(0, 1)
            .map((item) => item.idProducto),
        },
        preferencias: {
          categorias: ['hamburguesas'],
          contactoPreferido: 'app',
        },
        direccionesMetadata: [
          {
            idDireccion: context.direccion.idDireccion,
            alias: 'Casa',
            instrucciones: 'Tocar timbre 2B',
          },
        ],
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  )

  await db.collection('reviews').updateOne(
    {
      restaurantId: String(context.establecimiento.idEstablecimiento),
      userId: String(context.cliente.idCliente),
    },
    {
      $set: {
        restaurantId: String(context.establecimiento.idEstablecimiento),
        userId: String(context.cliente.idCliente),
        rating: 5,
        comment: 'Pedido demo recibido correctamente.',
        createdAt: DEMO_DATE,
      },
    },
    { upsert: true }
  )

  await db.collection('user_activity').updateOne(
    {
      userId: String(context.cliente.idCliente),
      action: 'order_created',
      'metadata.idPedido': context.pedido.idPedido,
    },
    {
      $set: {
        userId: String(context.cliente.idCliente),
        action: 'order_created',
        metadata: {
          idPedido: context.pedido.idPedido,
          idEstablecimiento: context.establecimiento.idEstablecimiento,
        },
        createdAt: DEMO_DATE,
      },
    },
    { upsert: true }
  )

  console.log('MongoDB seed completado.')
}

async function seedRedis(context: SeedContext) {
  if (!hasEnv('UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN')) {
    console.log('Redis omitido: variables Upstash no configuradas.')
    return
  }

  const redis = getRedisClient()
  const deliveryPersonId = `del_00${context.repartidor.idRepartidor}`
  await redis.geoadd('delivery:locations', {
    latitude: Number(context.repartidor.coordenadaActual),
    longitude: -58.4306,
    member: deliveryPersonId,
  })
  await redis.set(
    `order:status:${context.pedido.idPedido}`,
    context.pedido.estado,
    {
      ex: 3600,
    }
  )

  console.log('Redis seed completado.')
}

async function seedCassandra(context: SeedContext) {
  if (
    !hasEnv(
      'ASTRA_DB_API_ENDPOINT',
      'ASTRA_DB_APPLICATION_TOKEN',
      'ASTRA_DB_KEYSPACE'
    )
  ) {
    console.log('Cassandra omitido: variables Astra no configuradas.')
    return
  }

  const nombreCliente = `${context.cliente.nombre} ${context.cliente.apellido}`
  const direccion = `${context.direccion.calle} ${context.direccion.numero}, ${context.direccion.ciudad}`

  await getTable('pedidos_por_cliente').insertOne({
    id_cliente: context.cliente.idCliente,
    fecha_hora: context.pedido.fechaHora,
    id_pedido: context.pedido.idPedido,
    estado: context.pedido.estado,
    id_establecimiento: context.establecimiento.idEstablecimiento,
    id_repartidor: context.repartidor.idRepartidor,
    nombre_establecimiento: context.establecimiento.nombre,
    total: context.pedido.total,
  })

  await getTable('pedidos_por_local').insertOne({
    id_establecimiento: context.establecimiento.idEstablecimiento,
    fecha_hora: context.pedido.fechaHora,
    id_pedido: context.pedido.idPedido,
    estado: context.pedido.estado,
    id_cliente: context.cliente.idCliente,
    nombre_cliente: nombreCliente,
    total: context.pedido.total,
  })

  await getTable('pedidos_por_local_estado').insertOne({
    id_establecimiento: context.establecimiento.idEstablecimiento,
    estado: context.pedido.estado,
    fecha_hora: context.pedido.fechaHora,
    id_pedido: context.pedido.idPedido,
    id_cliente: context.cliente.idCliente,
    nombre_cliente: nombreCliente,
    total: context.pedido.total,
  })

  await getTable('pedidos_por_repartidor').insertOne({
    id_repartidor: context.repartidor.idRepartidor,
    fecha_hora: context.pedido.fechaHora,
    id_pedido: context.pedido.idPedido,
    direccion_entrega: direccion,
    estado: context.pedido.estado,
    id_cliente: context.cliente.idCliente,
    id_establecimiento: context.establecimiento.idEstablecimiento,
    nombre_cliente: nombreCliente,
    nombre_establecimiento: context.establecimiento.nombre,
    telefono_cliente: context.cliente.telefono,
    total: context.pedido.total,
  })

  await getTable('metricas_diarias_local').insertOne({
    id_establecimiento: context.establecimiento.idEstablecimiento,
    fecha: DEMO_DAY,
    ingresos_del_dia: context.pedido.total,
    pedidos_aceptados: 1,
    pedidos_cancelados: 0,
    total_pedidos: 1,
  })

  await getTable('metricas_diarias_repartidor').insertOne({
    id_repartidor: context.repartidor.idRepartidor,
    fecha: DEMO_DAY,
    ingresos_del_dia: 2500,
    pedidos_cancelados: 0,
    pedidos_entregados: 1,
  })

  await getTable('metricas_globales_diarias').insertOne({
    bucket: 'global',
    fecha: DEMO_DAY,
    ingresos_totales: context.pedido.total,
    locales_activos: 1,
    pedidos_cancelados: 0,
    pedidos_entregados: 1,
    repartidores_activos: 1,
    total_pedidos: 1,
  })

  await getTable('ranking_locales_por_mes').insertOne({
    mes: DEMO_MONTH,
    total_pedidos: 1,
    id_establecimiento: context.establecimiento.idEstablecimiento,
    ingresos: context.pedido.total,
    nombre_establecimiento: context.establecimiento.nombre,
    promedio_calificacion: 5,
  })

  console.log('Cassandra seed completado.')
}

async function seed() {
  const context = await seedPostgres()
  await seedMongo(context)
  await seedRedis(context)
  await seedCassandra(context)

  console.log('Seed completado.')
  console.log('Cuentas de test (contraseña: test123):')
  console.log('  admin@burger.example      → /admin')
  console.log('  lucia.gomez@example.com   → /repartidor')
  console.log('  ana.perez@example.com     → /usuario')
}

seed()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDrizzle()
    await disconnectMongo()
    await disconnectCassandra()
  })
