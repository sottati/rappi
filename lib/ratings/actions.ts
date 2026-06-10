"use server"

import { revalidatePath } from "next/cache"

import { getSession } from "@/lib/auth/session"
import { cassandra, postgres } from "@/lib/db"
import type { OrderActionState } from "@/lib/orders/actions"
import { EstadoPedido, TipoCalificacion, type Calificacion } from "@/types/domain"

function parseId(formData: FormData, key: string): number | null {
  const value = Number.parseInt(String(formData.get(key) ?? ""), 10)
  return Number.isNaN(value) ? null : value
}

function parsePuntaje(formData: FormData, key: string): number | null {
  const value = Number.parseInt(String(formData.get(key) ?? ""), 10)
  if (Number.isNaN(value) || value < 1 || value > 5) return null
  return value
}

export async function calificarPedidoAction(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const session = await getSession()
  if (!session || session.role !== "usuario") {
    return { error: "Tenés que iniciar sesión como usuario." }
  }

  const idPedido = parseId(formData, "idPedido")
  if (idPedido == null) return { error: "Pedido inválido." }

  const puntajeLocal = parsePuntaje(formData, "puntajeLocal")
  const puntajeRepartidor = parsePuntaje(formData, "puntajeRepartidor")
  if (puntajeLocal == null || puntajeRepartidor == null) {
    return { error: "Puntaje inválido (1 a 5)." }
  }

  const pedido = await postgres.queries.getPedidoById(idPedido)
  if (pedido.error) return { error: pedido.error }
  if (!pedido.data || pedido.data.idCliente !== session.userId) {
    return { error: "Pedido no encontrado." }
  }
  if (pedido.data.estado !== EstadoPedido.Entregado) {
    return { error: "Solo podés calificar pedidos entregados." }
  }

  const existentes = await postgres.queries.getCalificacionesByPedido(idPedido)
  if (existentes.error) return { error: existentes.error }
  if (existentes.data && existentes.data.length > 0) {
    return { error: "Este pedido ya fue calificado." }
  }

  const creadas: Calificacion[] = []

  const calificacionLocal = await postgres.queries.createCalificacion({
    idPedido,
    tipo: TipoCalificacion.Establecimiento,
    puntaje: puntajeLocal,
  })
  if (calificacionLocal.error || !calificacionLocal.data) {
    return { error: calificacionLocal.error ?? "No se pudo registrar la calificación." }
  }
  creadas.push(calificacionLocal.data)

  if (pedido.data.idRepartidor != null) {
    const calificacionRepartidor = await postgres.queries.createCalificacion({
      idPedido,
      tipo: TipoCalificacion.Repartidor,
      puntaje: puntajeRepartidor,
    })
    if (calificacionRepartidor.error || !calificacionRepartidor.data) {
      return {
        error: calificacionRepartidor.error ?? "No se pudo registrar la calificación.",
      }
    }
    creadas.push(calificacionRepartidor.data)
  }

  await cassandra.projections.projectCalificaciones(pedido.data, creadas)

  revalidatePath(`/usuario/pedidos/${idPedido}`)
  revalidatePath("/usuario/pedidos")

  return { success: "¡Gracias por calificar tu pedido!" }
}
