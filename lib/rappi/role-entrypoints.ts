export type RoleEntrypoint = {
  readonly href: string
  readonly label: string
  readonly title: string
  readonly description: string
}

export const roleEntrypoints = [
  {
    href: '/admin',
    label: 'Admin',
    title: 'Gestionar establecimiento',
    description: 'Locales, productos, pedidos recibidos y metricas.',
  },
  {
    href: '/repartidor',
    label: 'Repartidor',
    title: 'Ver turno',
    description: 'Disponibilidad, ubicacion actual y pedidos asignados.',
  },
  {
    href: '/usuario',
    label: 'Usuario',
    title: 'Comprar y revisar pedidos',
    description: 'Establecimientos, historial de pedidos y direcciones.',
  },
] as const satisfies readonly RoleEntrypoint[]
