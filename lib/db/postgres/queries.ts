import { asc, desc, eq } from 'drizzle-orm'
import type {
  CuentaApp,
  DetallePedido,
  EstadoPedido,
  Establecimiento,
  PedidoConDetalle,
  Producto,
  Repartidor,
} from '@/types/domain'
import type { QueryResult } from '../helpers'
import { fail, ok, shouldUseMockData } from '../helpers'
import { getDrizzleDb } from './drizzle'
import {
  mockCuentasApp,
  mockEstablecimientos,
  mockPedidos,
  mockProductos,
  mockRepartidores,
} from './mock'
import {
  cuentaApp,
  establecimiento,
  pedido,
  producto,
  repartidor,
} from './schema'
import type {
  CuentaAppSelect,
  DetallePedidoSelect,
  EstablecimientoSelect,
  PedidoSelect,
  ProductoSelect,
  RepartidorSelect,
} from './schema'

function mapDetalle(row: DetallePedidoSelect): DetallePedido {
  return {
    idDetalle: row.idDetalle,
    idPedido: row.idPedido,
    idProducto: row.idProducto,
    cantidad: row.cantidad,
    precioUnitario: row.precioUnitario,
  }
}

function mapPedido(
  row: PedidoSelect & { detalles: DetallePedidoSelect[] }
): PedidoConDetalle {
  return {
    idPedido: row.idPedido,
    idCliente: row.idCliente,
    idEstablecimiento: row.idEstablecimiento,
    idRepartidor: row.idRepartidor,
    idDireccion: row.idDireccion,
    fechaHora: row.fechaHora,
    estado: row.estado,
    total: row.total,
    detalles: row.detalles.map(mapDetalle),
  }
}

function mapEstablecimiento(row: EstablecimientoSelect): Establecimiento {
  return {
    idEstablecimiento: row.idEstablecimiento,
    nombre: row.nombre,
    tipo: row.tipo,
    direccion: row.direccion,
    email: row.email,
    telefono: row.telefono,
  }
}

function mapProducto(row: ProductoSelect): Producto {
  return {
    idProducto: row.idProducto,
    idEstablecimiento: row.idEstablecimiento,
    nombre: row.nombre,
    descripcion: row.descripcion,
    precio: row.precio,
    promocionPorcentaje: row.promocionPorcentaje,
    disponible: row.disponible,
    foto: row.foto,
  }
}

function mapRepartidor(row: RepartidorSelect): Repartidor {
  return {
    idRepartidor: row.idRepartidor,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    telefono: row.telefono,
    disponible: row.disponible,
    coordenadaActual: row.coordenadaActual,
  }
}

export async function getPedidos(): Promise<QueryResult<PedidoConDetalle[]>> {
  if (shouldUseMockData()) {
    return ok(
      [...mockPedidos].sort(
        (a, b) => b.fechaHora.getTime() - a.fechaHora.getTime()
      )
    )
  }

  try {
    const rows = await getDrizzleDb().query.pedido.findMany({
      with: { detalles: true },
      orderBy: desc(pedido.fechaHora),
    })
    return ok(rows.map(mapPedido))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch pedidos')
  }
}

export async function getPedidoById(
  idPedido: number
): Promise<QueryResult<PedidoConDetalle | null>> {
  if (shouldUseMockData()) {
    return ok(mockPedidos.find((p) => p.idPedido === idPedido) ?? null)
  }

  try {
    const row = await getDrizzleDb().query.pedido.findFirst({
      with: { detalles: true },
      where: eq(pedido.idPedido, idPedido),
    })
    return ok(row ? mapPedido(row) : null)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch pedido')
  }
}

export async function getPedidosByEstado(
  estado: EstadoPedido
): Promise<QueryResult<PedidoConDetalle[]>> {
  if (shouldUseMockData()) {
    return ok(mockPedidos.filter((p) => p.estado === estado))
  }

  try {
    const rows = await getDrizzleDb().query.pedido.findMany({
      with: { detalles: true },
      where: eq(pedido.estado, estado),
      orderBy: desc(pedido.fechaHora),
    })
    return ok(rows.map(mapPedido))
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : 'Failed to fetch pedidos by estado'
    )
  }
}

export async function getPedidosByCliente(
  idCliente: number
): Promise<QueryResult<PedidoConDetalle[]>> {
  if (shouldUseMockData()) {
    return ok(mockPedidos.filter((p) => p.idCliente === idCliente))
  }

  try {
    const rows = await getDrizzleDb().query.pedido.findMany({
      with: { detalles: true },
      where: eq(pedido.idCliente, idCliente),
      orderBy: desc(pedido.fechaHora),
    })
    return ok(rows.map(mapPedido))
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : 'Failed to fetch pedidos by cliente'
    )
  }
}

export async function getPedidosByEstablecimiento(
  idEstablecimiento: number
): Promise<QueryResult<PedidoConDetalle[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockPedidos.filter((p) => p.idEstablecimiento === idEstablecimiento)
    )
  }

  try {
    const rows = await getDrizzleDb().query.pedido.findMany({
      with: { detalles: true },
      where: eq(pedido.idEstablecimiento, idEstablecimiento),
      orderBy: desc(pedido.fechaHora),
    })
    return ok(rows.map(mapPedido))
  } catch (e) {
    return fail(
      e instanceof Error
        ? e.message
        : 'Failed to fetch pedidos by establecimiento'
    )
  }
}

export async function getEstablecimientos(): Promise<
  QueryResult<Establecimiento[]>
> {
  if (shouldUseMockData()) {
    return ok(mockEstablecimientos)
  }

  try {
    const rows = await getDrizzleDb().query.establecimiento.findMany({
      orderBy: asc(establecimiento.nombre),
    })
    return ok(rows.map(mapEstablecimiento))
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : 'Failed to fetch establecimientos'
    )
  }
}

export async function getEstablecimientoById(
  idEstablecimiento: number
): Promise<QueryResult<Establecimiento | null>> {
  if (shouldUseMockData()) {
    return ok(
      mockEstablecimientos.find(
        (item) => item.idEstablecimiento === idEstablecimiento
      ) ?? null
    )
  }

  try {
    const row = await getDrizzleDb().query.establecimiento.findFirst({
      where: eq(establecimiento.idEstablecimiento, idEstablecimiento),
    })
    return ok(row ? mapEstablecimiento(row) : null)
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : 'Failed to fetch establecimiento'
    )
  }
}

export async function getProductosByEstablecimiento(
  idEstablecimiento: number
): Promise<QueryResult<Producto[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockProductos.filter(
        (item) => item.idEstablecimiento === idEstablecimiento
      )
    )
  }

  try {
    const rows = await getDrizzleDb().query.producto.findMany({
      where: eq(producto.idEstablecimiento, idEstablecimiento),
      orderBy: asc(producto.nombre),
    })
    return ok(rows.map(mapProducto))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch productos')
  }
}

export async function getRepartidoresDisponibles(): Promise<
  QueryResult<Repartidor[]>
> {
  if (shouldUseMockData()) {
    return ok(mockRepartidores.filter((r) => r.disponible))
  }

  try {
    const rows = await getDrizzleDb().query.repartidor.findMany({
      where: eq(repartidor.disponible, true),
    })
    return ok(rows.map(mapRepartidor))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch repartidores')
  }
}

export async function getRepartidorById(
  idRepartidor: number
): Promise<QueryResult<Repartidor | null>> {
  if (shouldUseMockData()) {
    return ok(
      mockRepartidores.find((r) => r.idRepartidor === idRepartidor) ?? null
    )
  }

  try {
    const row = await getDrizzleDb().query.repartidor.findFirst({
      where: eq(repartidor.idRepartidor, idRepartidor),
    })
    return ok(row ? mapRepartidor(row) : null)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch repartidor')
  }
}

export async function getPedidosByRepartidor(
  idRepartidor: number
): Promise<QueryResult<PedidoConDetalle[]>> {
  if (shouldUseMockData()) {
    return ok(mockPedidos.filter((p) => p.idRepartidor === idRepartidor))
  }

  try {
    const rows = await getDrizzleDb().query.pedido.findMany({
      with: { detalles: true },
      where: eq(pedido.idRepartidor, idRepartidor),
      orderBy: desc(pedido.fechaHora),
    })
    return ok(rows.map(mapPedido))
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : 'Failed to fetch pedidos by repartidor'
    )
  }
}

function mapCuentaApp(row: CuentaAppSelect): CuentaApp {
  return {
    idCuenta: row.idCuenta,
    email: row.email,
    contrasenia: row.contrasenia,
    rol: row.rol,
    nombreVisible: row.nombreVisible,
    idCliente: row.idCliente,
    idRepartidor: row.idRepartidor,
    idEstablecimiento: row.idEstablecimiento,
  }
}

export async function authenticateCuenta(
  email: string,
  password: string
): Promise<QueryResult<CuentaApp>> {
  const normalizedEmail = email.trim().toLowerCase()

  if (shouldUseMockData()) {
    const cuenta = mockCuentasApp.find(
      (item) =>
        item.email.toLowerCase() === normalizedEmail &&
        item.contrasenia === password
    )
    if (!cuenta) return fail('Email o contraseña incorrectos.')
    return ok(cuenta)
  }

  try {
    const row = await getDrizzleDb().query.cuentaApp.findFirst({
      where: eq(cuentaApp.email, normalizedEmail),
    })
    if (!row || row.contrasenia !== password) {
      return fail('Email o contraseña incorrectos.')
    }
    return ok(mapCuentaApp(row))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Error al autenticar')
  }
}

export const getOrders = getPedidos
export const getOrderById = getPedidoById
export const getOrdersByStatus = getPedidosByEstado
export const getActiveRestaurants = getEstablecimientos
export const getAvailableDeliveryPersons = getRepartidoresDisponibles
export const getOrdersByDeliveryPerson = getPedidosByRepartidor
