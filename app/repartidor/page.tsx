import { RepartidorHub } from "@/components/features/repartidor/repartidor-hub"
import { ErrorState } from "@/components/shared/query-state"
import { requireSession } from "@/lib/auth/require-session"
import { postgres, redis } from "@/lib/db"
import { EstadoPedido, type PedidoConDetalle } from "@/types/domain"

function isPedidoActivo(pedido: PedidoConDetalle) {
  return (
    pedido.estado === EstadoPedido.Confirmado ||
    pedido.estado === EstadoPedido.Preparando ||
    pedido.estado === EstadoPedido.EnCamino
  )
}

export default async function RepartidorPage() {
  const session = await requireSession("repartidor")
  const [repartidor, pedidos, establecimientos, location] = await Promise.all([
    postgres.queries.getRepartidorById(session.userId),
    postgres.queries.getPedidosByRepartidor(session.userId),
    postgres.queries.getEstablecimientos(),
    redis.queries.getDeliveryLocation(`del_00${session.userId}`),
  ])

  if (repartidor.error) return <ErrorState message={repartidor.error} />
  if (pedidos.error) return <ErrorState message={pedidos.error} />
  if (establecimientos.error)
    return <ErrorState message={establecimientos.error} />
  if (location.error) return <ErrorState message={location.error} />
  if (!repartidor.data)
    return <ErrorState message="Repartidor no encontrado." />

  const pedidosData = pedidos.data ?? []
  const activePedido =
    pedidosData.find((pedido) => pedido.estado === EstadoPedido.EnCamino) ??
    pedidosData.find(isPedidoActivo) ??
    null

  const direccionActiva =
    activePedido == null
      ? null
      : await postgres.queries.getDireccionEntregaById(
          activePedido.idDireccion,
          activePedido.idCliente
        )

  if (direccionActiva?.error)
    return <ErrorState message={direccionActiva.error} />

  const getNombreLocal = (idEstablecimiento: number) =>
    establecimientos.data?.find(
      (item) => item.idEstablecimiento === idEstablecimiento
    )?.nombre ?? `Local #${idEstablecimiento}`

  const pedidosActivos = pedidosData.filter(isPedidoActivo)
  const pedidosEntregados = pedidosData.filter(
    (pedido) => pedido.estado === EstadoPedido.Entregado
  )

  return (
    <RepartidorHub
      hub={{
        perfil: repartidor.data,
        ubicacion: {
          latitude: location.data?.latitude ?? null,
          longitude: location.data?.longitude ?? null,
          actualizadaLabel: location.data
            ? "Última ubicación registrada"
            : "Sin ubicación Redis",
        },
        kpis: [
          {
            label: "Disponibilidad",
            value: repartidor.data.disponible ? "Activo" : "Pausado",
            detail: repartidor.data.disponible
              ? "Recibiendo pedidos"
              : "No recibe pedidos",
          },
          {
            label: "En curso",
            value: String(pedidosActivos.length),
            detail: "Pedidos activos asignados",
          },
          {
            label: "Entregados",
            value: String(pedidosEntregados.length),
            detail: "Pedidos cerrados",
          },
          {
            label: "Asignados",
            value: String(pedidosData.length),
            detail: "Total visible para tu cuenta",
          },
        ],
        accesosRapidos: [
          {
            href: "/repartidor/pedidos",
            label: "Ver pedidos",
            description: "Tomar pedidos disponibles y revisar tus entregas.",
          },
          {
            href: "/repartidor/disponibilidad",
            label: "Ver disponibilidad",
            description: "Revisar estado operativo y ubicación actual.",
          },
        ],
      }}
      pedidoActivo={
        activePedido
          ? {
              idPedido: activePedido.idPedido,
              fechaHora: activePedido.fechaHora,
              estado: activePedido.estado,
              total: activePedido.total,
              establecimientoNombre: getNombreLocal(
                activePedido.idEstablecimiento
              ),
              direccion: direccionActiva?.data
                ? {
                    calle: direccionActiva.data.calle,
                    numero: direccionActiva.data.numero,
                  }
                : undefined,
            }
          : null
      }
      pedidosRecientes={pedidosData.slice(0, 3).map((pedido) => ({
        idPedido: pedido.idPedido,
        fechaHora: pedido.fechaHora,
        estado: pedido.estado,
        total: pedido.total,
        establecimientoNombre: getNombreLocal(pedido.idEstablecimiento),
      }))}
    />
  )
}
