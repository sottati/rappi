import { asc, desc, eq } from 'drizzle-orm'
import type {
  DetallePedido,
  EstadoPedido,
  Establecimiento,
  PedidoConDetalle,
  Repartidor,
} from '@/types/domain'
import type { QueryResult } from '../helpers'
import { fail, ok, shouldUseMockData } from '../helpers'
import { getDrizzleDb } from './drizzle'
import { mockEstablecimientos, mockPedidos, mockRepartidores } from './mock'
import { establecimiento, pedido, repartidor } from './schema'
import type {
  DetallePedidoSelect,
  EstablecimientoSelect,
  PedidoSelect,
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
  row: PedidoSelect & { detalles: DetallePedidoSelect[] },
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
    return ok([...mockPedidos].sort((a, b) => b.fechaHora.getTime() - a.fechaHora.getTime()))
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
  idPedido: number,
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
  estado: EstadoPedido,
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
    return fail(e instanceof Error ? e.message : 'Failed to fetch pedidos by estado')
  }
}

export async function getEstablecimientos(): Promise<QueryResult<Establecimiento[]>> {
  if (shouldUseMockData()) {
    return ok(mockEstablecimientos)
  }

  try {
    const rows = await getDrizzleDb().query.establecimiento.findMany({
      orderBy: asc(establecimiento.nombre),
    })
    return ok(rows.map(mapEstablecimiento))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch establecimientos')
  }
}

export async function getRepartidoresDisponibles(): Promise<QueryResult<Repartidor[]>> {
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

export async function getPedidosByRepartidor(
  idRepartidor: number,
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
    return fail(e instanceof Error ? e.message : 'Failed to fetch pedidos by repartidor')
  }
}

export const getOrders = getPedidos
export const getOrderById = getPedidoById
export const getOrdersByStatus = getPedidosByEstado
export const getActiveRestaurants = getEstablecimientos
export const getAvailableDeliveryPersons = getRepartidoresDisponibles
export const getOrdersByDeliveryPerson = getPedidosByRepartidor
