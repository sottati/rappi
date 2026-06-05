import { EstadoPedido } from '@/types/domain'

import {
  getMockPedidosByRepartidor,
  getRepartidorPedidoPath,
  mockRepartidorId,
  type MockPedidoVista,
} from './orders-content'

export interface RepartidorPerfilMock {
  idRepartidor: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  disponible: boolean
}

export interface RepartidorUbicacionMock {
  latitude: number
  longitude: number
  actualizadaLabel: string
}

export interface RepartidorHubKpi {
  label: string
  value: string
  detail?: string
}

export interface RepartidorAccesoRapido {
  href: string
  label: string
  description: string
}

export interface RepartidorHubMock {
  perfil: RepartidorPerfilMock
  ubicacion: RepartidorUbicacionMock
  kpis: RepartidorHubKpi[]
  accesosRapidos: RepartidorAccesoRapido[]
}

export const mockRepartidorPerfil: RepartidorPerfilMock = {
  idRepartidor: mockRepartidorId,
  nombre: 'Lucia',
  apellido: 'Gomez',
  email: 'lucia.gomez@example.com',
  telefono: '+54 11 5555-1001',
  disponible: true,
}

/** Ubicación mock (Redis en producción). Zona Palermo, cerca de Burger Palermo. */
export const mockRepartidorUbicacion: RepartidorUbicacionMock = {
  latitude: -34.5889,
  longitude: -58.4302,
  actualizadaLabel: 'Hace 2 min',
}

export const mockRepartidorHub: RepartidorHubMock = {
  perfil: mockRepartidorPerfil,
  ubicacion: mockRepartidorUbicacion,
  kpis: [
    { label: 'Disponibilidad', value: 'Activo', detail: 'Recibiendo pedidos' },
    { label: 'En curso', value: '1', detail: 'Pedido en camino' },
    { label: 'Entregas hoy', value: '3', detail: 'Meta diaria: 8' },
    { label: 'Calificación', value: '4.9', detail: 'Últimos 30 días' },
  ],
  accesosRapidos: [
    {
      href: '/repartidor/pedidos',
      label: 'Ver pedidos asignados',
      description: 'Listado completo de entregas activas e historial reciente.',
    },
    {
      href: '/repartidor/disponibilidad',
      label: 'Gestionar disponibilidad',
      description: 'Activar o pausar turno y revisar ubicación en mapa.',
    },
    {
      href: '/repartidor/pedidos/1',
      label: 'Entrega en curso',
      description: 'Burger Palermo → Av. Corrientes 1234',
    },
  ],
}

export function getMockRepartidorPedidoActivo(): MockPedidoVista | null {
  return (
    getMockPedidosByRepartidor(mockRepartidorId).find(
      (pedido) => pedido.estado === EstadoPedido.EnCamino,
    ) ?? null
  )
}

export function getMockRepartidorPedidosRecientes(limit = 3): MockPedidoVista[] {
  return getMockPedidosByRepartidor(mockRepartidorId).slice(0, limit)
}

export { getRepartidorPedidoPath }
