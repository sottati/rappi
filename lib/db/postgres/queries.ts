import { getClient } from './client'
import type {
  EstadoPedido,
  Establecimiento,
  PedidoConDetalle,
  Repartidor,
} from '@/types/domain'
import type { QueryResult } from '../helpers'
import { fail, ok, shouldUseMockData } from '../helpers'
import { mockEstablecimientos, mockPedidos, mockRepartidores } from './mock'

export async function getPedidos(): Promise<QueryResult<PedidoConDetalle[]>> {
  if (shouldUseMockData()) {
    return ok([...mockPedidos].sort((a, b) => b.fechaHora.getTime() - a.fechaHora.getTime()))
  }

  const supabase = getClient()
  const { data, error } = await supabase
    .from('pedido')
    .select('*, detalles:detalle_pedido(*)')
    .order('fecha_hora', { ascending: false })

  if (error) return fail(error.message)
  return ok(data as PedidoConDetalle[])
}

export async function getPedidoById(
  idPedido: number,
): Promise<QueryResult<PedidoConDetalle | null>> {
  if (shouldUseMockData()) {
    return ok(mockPedidos.find((pedido) => pedido.idPedido === idPedido) ?? null)
  }

  const supabase = getClient()
  const { data, error } = await supabase
    .from('pedido')
    .select('*, detalles:detalle_pedido(*)')
    .eq('id_pedido', idPedido)
    .single()

  if (error) return fail(error.message)
  return ok(data as PedidoConDetalle)
}

export async function getPedidosByEstado(
  estado: EstadoPedido,
): Promise<QueryResult<PedidoConDetalle[]>> {
  if (shouldUseMockData()) {
    return ok(mockPedidos.filter((pedido) => pedido.estado === estado))
  }

  const supabase = getClient()
  const { data, error } = await supabase
    .from('pedido')
    .select('*, detalles:detalle_pedido(*)')
    .eq('estado', estado)
    .order('fecha_hora', { ascending: false })

  if (error) return fail(error.message)
  return ok(data as PedidoConDetalle[])
}

export async function getEstablecimientos(): Promise<QueryResult<Establecimiento[]>> {
  if (shouldUseMockData()) {
    return ok(mockEstablecimientos)
  }

  const supabase = getClient()
  const { data, error } = await supabase.from('establecimiento').select('*').order('nombre')

  if (error) return fail(error.message)
  return ok(data as Establecimiento[])
}

export async function getRepartidoresDisponibles(): Promise<QueryResult<Repartidor[]>> {
  if (shouldUseMockData()) {
    return ok(mockRepartidores.filter((repartidor) => repartidor.disponible))
  }

  const supabase = getClient()
  const { data, error } = await supabase
    .from('repartidor')
    .select('*')
    .eq('disponible', true)

  if (error) return fail(error.message)
  return ok(data as Repartidor[])
}

export async function getPedidosByRepartidor(
  idRepartidor: number,
): Promise<QueryResult<PedidoConDetalle[]>> {
  if (shouldUseMockData()) {
    return ok(mockPedidos.filter((pedido) => pedido.idRepartidor === idRepartidor))
  }

  const supabase = getClient()
  const { data, error } = await supabase
    .from('pedido')
    .select('*, detalles:detalle_pedido(*)')
    .eq('id_repartidor', idRepartidor)
    .order('fecha_hora', { ascending: false })

  if (error) return fail(error.message)
  return ok(data as PedidoConDetalle[])
}

export const getOrders = getPedidos
export const getOrderById = getPedidoById
export const getOrdersByStatus = getPedidosByEstado
export const getActiveRestaurants = getEstablecimientos
export const getAvailableDeliveryPersons = getRepartidoresDisponibles
export const getOrdersByDeliveryPerson = getPedidosByRepartidor
