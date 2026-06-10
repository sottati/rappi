/**
 * Bootstrap de cuentas y catálogo base para desarrollo/demo.
 * No inserta pedidos, calificaciones ni proyecciones analíticas:
 * esos datos deben generarse con el flujo real de la app (checkout, estados, calificación).
 *
 * Uso: MOCK_DB=false pnpm db:seed
 * Contraseña de todas las cuentas demo: test123
 */
import { eq } from 'drizzle-orm'
import {
  disconnect as disconnectMongo,
  getDb as getMongoDb,
} from '../lib/db/mongodb'
import { disconnectDrizzle, getDrizzleDb } from '../lib/db/postgres/drizzle'
import { mockTestPassword } from '../lib/db/postgres/mock'
import {
  cliente,
  cuentaApp,
  direccionEntrega,
  establecimiento,
  producto,
  repartidor,
} from '../lib/db/postgres/schema'
import { getClient as getRedisClient } from '../lib/db/redis'
import { loadDotEnv } from '../lib/env'

loadDotEnv()

const TEST_PASSWORD = mockTestPassword

interface SeedContext {
  establecimiento: typeof establecimiento.$inferSelect
  repartidor: typeof repartidor.$inferSelect
  cliente: typeof cliente.$inferSelect
  direccion: typeof direccionEntrega.$inferSelect
  productos: (typeof producto.$inferSelect)[]
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
    (item) => item.email === 'palermo@burger.example',
  )
  const sushi = establecimientos.find(
    (item) => item.email === 'centro@sushi.example',
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
      'El bootstrap requiere al menos dos productos de Burger Palermo.',
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
  }
}

async function seedMongo(context: SeedContext) {
  if (!hasEnv('MONGODB_URI')) {
    console.log('MongoDB omitido: MONGODB_URI no configurado.')
    return
  }

  const db = await getMongoDb()

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
              tags: ['catalogo'],
            })),
          },
        ],
        updatedAt: new Date(),
      },
    },
    { upsert: true },
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
        metadata: { dataset: 'bootstrap' },
        updatedAt: new Date(),
      },
    },
    { upsert: true },
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
    { upsert: true },
  )

  console.log('MongoDB bootstrap completado.')
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

  console.log('Redis bootstrap completado (ubicación inicial del repartidor).')
}

async function seed() {
  const context = await seedPostgres()
  await seedMongo(context)
  await seedRedis(context)

  console.log('Bootstrap completado.')
  console.log('Pedidos, métricas y calificaciones: generarlos con el flujo real de la app.')
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
  })
