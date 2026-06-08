'use server'

import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth/session'
import { postgres } from '@/lib/db'

export interface ConfirmCartState {
  error?: string
}

interface ConfirmCartPayloadItem {
  idProducto: number
  idEstablecimiento: number
  name: string
  quantity: number
  unitPrice: number
}

interface ConfirmCartPayload {
  restaurantId: number
  items: ConfirmCartPayloadItem[]
}

function parseConfirmCartPayload(raw: string): ConfirmCartPayload | null {
  try {
    const parsed = JSON.parse(raw) as ConfirmCartPayload
    if (
      typeof parsed.restaurantId !== 'number' ||
      !Array.isArray(parsed.items) ||
      parsed.items.length === 0
    ) {
      return null
    }

    const itemsValid = parsed.items.every(
      (item) =>
        typeof item.idProducto === 'number' &&
        typeof item.idEstablecimiento === 'number' &&
        typeof item.name === 'string' &&
        typeof item.quantity === 'number' &&
        typeof item.unitPrice === 'number' &&
        item.idEstablecimiento === parsed.restaurantId
    )

    return itemsValid ? parsed : null
  } catch {
    return null
  }
}

export async function confirmCartAction(
  _prevState: ConfirmCartState,
  formData: FormData
): Promise<ConfirmCartState> {
  const session = await getSession()
  if (!session) {
    redirect('/login?next=/carrito')
  }

  if (session.role !== 'usuario') {
    return {
      error:
        'Solo las cuentas de consumidor pueden confirmar pedidos. Usá una cuenta de usuario.',
    }
  }

  const payload = parseConfirmCartPayload(String(formData.get('cartPayload') ?? ''))
  if (!payload) {
    return { error: 'El carrito no tiene un formato válido para confirmar.' }
  }

  const direcciones = await postgres.queries.getDireccionesByCliente(session.userId)
  if (direcciones.error) return { error: direcciones.error }

  const direccion = direcciones.data?.[0]
  if (!direccion) {
    return {
      error: 'No tenés una dirección de entrega registrada para confirmar el pedido.',
    }
  }

  const result = await postgres.queries.createPedidoFromCartSnapshot({
    idCliente: session.userId,
    idEstablecimiento: payload.restaurantId,
    idDireccion: direccion.idDireccion,
    items: payload.items.map((item) => ({
      idProductoCatalogo: item.idProducto,
      nombreProducto: item.name.trim(),
      cantidad: item.quantity,
      precioUnitario: item.unitPrice,
    })),
  })

  if (result.error || !result.data) {
    return { error: result.error ?? 'No se pudo crear el pedido.' }
  }

  redirect(`/carrito/confirmacion?idPedido=${result.data.idPedido}`)
}
