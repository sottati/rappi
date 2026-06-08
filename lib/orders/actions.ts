"use server"

import { revalidatePath } from "next/cache"

import { getAdminScope } from "@/lib/admin/scope"
import { postgres, redis } from "@/lib/db"
import type { AvailableOrderSnapshot } from "@/lib/db/redis/types"
import { getSession } from "@/lib/auth/session"
import { EstadoPedido, type PedidoConDetalle } from "@/types/domain"

export interface OrderActionState {
  error?: string
  success?: string
}

function parseId(formData: FormData, key: string): number | null {
  const value = Number.parseInt(String(formData.get(key) ?? ""), 10)
  return Number.isNaN(value) ? null : value
}

function parseEstado(formData: FormData): EstadoPedido | null {
  const value = String(formData.get("estado") ?? "")
  return Object.values(EstadoPedido).includes(value as EstadoPedido)
    ? (value as EstadoPedido)
    : null
}

function canAdminMove(from: EstadoPedido, to: EstadoPedido) {
  if (from === EstadoPedido.Pendiente) {
    return to === EstadoPedido.Confirmado || to === EstadoPedido.Cancelado
  }

  if (from === EstadoPedido.Confirmado) {
    return to === EstadoPedido.Preparando
  }

  return false
}

function canRepartidorMove(from: EstadoPedido, to: EstadoPedido) {
  if (
    (from === EstadoPedido.Confirmado || from === EstadoPedido.Preparando) &&
    to === EstadoPedido.EnCamino
  ) {
    return true
  }

  return from === EstadoPedido.EnCamino && to === EstadoPedido.Entregado
}

async function buildAvailableOrderSnapshot(
  pedido: PedidoConDetalle
): Promise<AvailableOrderSnapshot> {
  const [establecimiento, direccion] = await Promise.all([
    postgres.queries.getEstablecimientoById(pedido.idEstablecimiento),
    postgres.queries.getDireccionEntregaById(
      pedido.idDireccion,
      pedido.idCliente
    ),
  ])

  const direccionData = direccion.data

  return {
    idPedido: pedido.idPedido,
    estado: pedido.estado,
    fechaHora: pedido.fechaHora,
    total: pedido.total,
    idEstablecimiento: pedido.idEstablecimiento,
    establecimientoNombre:
      establecimiento.data?.nombre ?? `Local #${pedido.idEstablecimiento}`,
    direccionResumen: direccionData
      ? `${direccionData.calle} ${direccionData.numero}, ${direccionData.ciudad}`
      : "Sin direccion",
    itemCount: pedido.detalles.reduce((acc, item) => acc + item.cantidad, 0),
  }
}

async function syncPedidoStatus(
  pedido: PedidoConDetalle,
  estado: EstadoPedido
) {
  const idPedido = pedido.idPedido

  await redis.queries.cacheOrderStatus(String(idPedido), estado)

  if (
    estado === EstadoPedido.Confirmado ||
    estado === EstadoPedido.Preparando
  ) {
    const snapshot = await buildAvailableOrderSnapshot({ ...pedido, estado })
    await redis.queries.addAvailableOrder(snapshot)
  }

  if (
    estado === EstadoPedido.Cancelado ||
    estado === EstadoPedido.EnCamino ||
    estado === EstadoPedido.Entregado
  ) {
    await redis.queries.removeAvailableOrder(String(idPedido))
  }
}

export async function updateAdminPedidoEstadoAction(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const scope = await getAdminScope()
  if (!scope.ok) return { error: scope.error }

  const idPedido = parseId(formData, "idPedido")
  const estado = parseEstado(formData)

  if (idPedido == null || estado == null) {
    return { error: "Datos de pedido inválidos." }
  }

  const pedido = await postgres.queries.getPedidoById(idPedido)
  if (pedido.error) return { error: pedido.error }
  if (
    !pedido.data ||
    pedido.data.idEstablecimiento !== scope.idEstablecimiento
  ) {
    return { error: "Pedido no encontrado para este establecimiento." }
  }

  if (!canAdminMove(pedido.data.estado, estado)) {
    return { error: "Transición de estado no permitida para el comercio." }
  }

  const updated = await postgres.queries.updatePedidoEstado(idPedido, estado)
  if (updated.error || !updated.data) {
    return { error: updated.error ?? "No se pudo actualizar el pedido." }
  }

  await syncPedidoStatus(updated.data, estado)
  // Cassandra futuro: proyectar order_confirmed/order_rejected/order_preparing.

  revalidatePath("/admin/pedidos")
  revalidatePath(`/admin/pedidos/${idPedido}`)
  revalidatePath("/repartidor/pedidos")

  return { success: "Estado del pedido actualizado." }
}

export async function claimPedidoAction(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const session = await getSession()
  if (!session || session.role !== "repartidor") {
    return { error: "Tenés que iniciar sesión como repartidor." }
  }

  const idPedido = parseId(formData, "idPedido")
  if (idPedido == null) return { error: "Pedido inválido." }

  const claimed = await redis.queries.claimAvailableOrder(
    String(idPedido),
    String(session.userId)
  )
  if (claimed.error) return { error: claimed.error }
  if (!claimed.data)
    return { error: "El pedido ya fue tomado por otro repartidor." }

  const assigned = await postgres.queries.assignPedidoToRepartidor(
    idPedido,
    session.userId
  )
  if (assigned.error || !assigned.data) {
    return { error: assigned.error ?? "No se pudo asignar el pedido." }
  }

  await redis.queries.removeAvailableOrder(String(idPedido))
  // Cassandra futuro: proyectar courier_assigned en pedidos_por_repartidor.

  revalidatePath("/repartidor/pedidos")
  revalidatePath(`/repartidor/pedidos/${idPedido}`)
  revalidatePath("/admin/pedidos")
  revalidatePath(`/admin/pedidos/${idPedido}`)

  return { success: "Pedido asignado a tu cuenta." }
}

export async function updateRepartidorPedidoEstadoAction(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const session = await getSession()
  if (!session || session.role !== "repartidor") {
    return { error: "Tenés que iniciar sesión como repartidor." }
  }

  const idPedido = parseId(formData, "idPedido")
  const estado = parseEstado(formData)

  if (idPedido == null || estado == null) {
    return { error: "Datos de pedido inválidos." }
  }

  const pedido = await postgres.queries.getPedidoById(idPedido)
  if (pedido.error) return { error: pedido.error }
  if (!pedido.data || pedido.data.idRepartidor !== session.userId) {
    return { error: "Pedido no asignado a este repartidor." }
  }

  if (!canRepartidorMove(pedido.data.estado, estado)) {
    return { error: "Transición de estado no permitida para el repartidor." }
  }

  const updated = await postgres.queries.updatePedidoEstado(idPedido, estado)
  if (updated.error || !updated.data) {
    return { error: updated.error ?? "No se pudo actualizar el pedido." }
  }

  await syncPedidoStatus(updated.data, estado)
  // Cassandra futuro: proyectar order_in_transit/order_delivered.

  revalidatePath("/repartidor/pedidos")
  revalidatePath(`/repartidor/pedidos/${idPedido}`)
  revalidatePath("/admin/pedidos")
  revalidatePath(`/admin/pedidos/${idPedido}`)

  return { success: "Estado del pedido actualizado." }
}
