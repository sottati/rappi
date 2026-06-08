import type {
  DireccionEntrega,
  Establecimiento,
  PedidoConDetalle,
  Repartidor,
} from "@/types/domain"
import type { OrderDetailPedido } from "@/components/features/orders/order-detail-view"
import type { OrderListItem } from "@/components/features/orders/order-list"

export function toOrderListItem(
  pedido: PedidoConDetalle,
  establecimientos: Establecimiento[]
): OrderListItem {
  const establecimiento = establecimientos.find(
    (item) => item.idEstablecimiento === pedido.idEstablecimiento
  )

  return {
    idPedido: pedido.idPedido,
    estado: pedido.estado,
    fechaHora: pedido.fechaHora,
    total: pedido.total,
    establecimientoNombre:
      establecimiento?.nombre ?? `Local #${pedido.idEstablecimiento}`,
    lineas: pedido.detalles,
  }
}

export function toOrderDetailPedido({
  pedido,
  establecimiento,
  direccion,
  repartidor,
}: {
  pedido: PedidoConDetalle
  establecimiento: Establecimiento | null
  direccion: DireccionEntrega | null
  repartidor: Repartidor | null
}): OrderDetailPedido {
  return {
    idPedido: pedido.idPedido,
    fechaHora: pedido.fechaHora,
    estado: pedido.estado,
    total: pedido.total,
    establecimientoNombre:
      establecimiento?.nombre ?? `Local #${pedido.idEstablecimiento}`,
    repartidorNombre: repartidor
      ? `${repartidor.nombre} ${repartidor.apellido}`
      : null,
    direccion: {
      label: "Dirección de entrega",
      calle: direccion?.calle ?? "Sin dato",
      numero: direccion?.numero ?? "",
      ciudad: direccion?.ciudad ?? "",
      codigoPostal: direccion?.codigoPostal ?? "",
    },
    lineas: pedido.detalles.map((detalle) => ({
      idDetalle: detalle.idDetalle,
      nombreProducto: detalle.nombreProducto,
      cantidad: detalle.cantidad,
      precioUnitario: detalle.precioUnitario,
    })),
  }
}
