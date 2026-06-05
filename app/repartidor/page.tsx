import { RepartidorHub } from '@/components/features/repartidor/repartidor-hub'
import {
  getMockRepartidorPedidoActivo,
  getMockRepartidorPedidosRecientes,
  mockRepartidorHub,
} from '@/lib/rappi'

export default function RepartidorPage() {
  return (
    <RepartidorHub
      hub={mockRepartidorHub}
      pedidoActivo={getMockRepartidorPedidoActivo()}
      pedidosRecientes={getMockRepartidorPedidosRecientes()}
    />
  )
}
