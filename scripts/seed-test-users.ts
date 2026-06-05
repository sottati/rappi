/**
 * Carga datos demo + cuentas de prueba en PostgreSQL.
 * Uso: MOCK_DB=false pnpm db:seed
 *
 * Contraseña de todas las cuentas de test: test123
 */
import { eq } from 'drizzle-orm'
import { disconnectDrizzle, getDrizzleDb } from '../lib/db/postgres/drizzle'
import { mockTestPassword } from '../lib/db/postgres/mock'
import {
  cliente,
  cuentaApp,
  direccionEntrega,
  establecimiento,
  pedido,
  producto,
  repartidor,
} from '../lib/db/postgres/schema'
import { loadDotEnv } from '../lib/env'
import { EstadoPedido } from '../types/domain'

loadDotEnv()

const TEST_PASSWORD = mockTestPassword

async function seed() {
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
  const burger = establecimientos.find((item) => item.email === 'palermo@burger.example')
  const sushi = establecimientos.find((item) => item.email === 'centro@sushi.example')

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
        descripcion: 'Doble carne, cheddar, pickles y salsa house en pan brioche.',
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
      fechaHora: new Date('2026-05-20T17:45:00Z'),
      estado: EstadoPedido.EnCamino,
      total: 12000,
    })
  }

  await db
    .insert(cuentaApp)
    .values([
      {
        email: 'admin@burger.example',
        contrasenia: TEST_PASSWORD,
        rol: 'admin',
        nombreVisible: 'Duenio Burger Palermo',
        idEstablecimiento: burger.idEstablecimiento,
      },
      {
        email: 'lucia.gomez@example.com',
        contrasenia: TEST_PASSWORD,
        rol: 'repartidor',
        nombreVisible: 'Lucia Gomez',
        idRepartidor: lucia.idRepartidor,
      },
      {
        email: 'ana.perez@example.com',
        contrasenia: TEST_PASSWORD,
        rol: 'usuario',
        nombreVisible: 'Ana Perez',
        idCliente: ana.idCliente,
      },
    ])
    .onConflictDoNothing({ target: cuentaApp.email })

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
  })
