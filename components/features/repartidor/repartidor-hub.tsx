import Link from "next/link"

import { OrderStatusBadge } from "@/components/features/orders/order-status-badge"
import { StatCard } from "@/components/shared/stat-card"
import {
  formatArs,
  formatPedidoFecha,
  getRepartidorPedidoPath,
} from "@/lib/rappi"
import type { EstadoPedido } from "@/types/domain"

export interface RepartidorHubData {
  perfil: {
    idRepartidor: number
    nombre: string
    apellido: string
    email: string
    telefono: string
    disponible: boolean
  }
  ubicacion: {
    latitude: number | null
    longitude: number | null
    actualizadaLabel: string
  }
  kpis: Array<{
    label: string
    value: string
    detail?: string
  }>
  accesosRapidos: Array<{
    href: string
    label: string
    description: string
  }>
}

export interface RepartidorPedidoResumen {
  idPedido: number
  fechaHora: Date
  estado: EstadoPedido
  total: number
  establecimientoNombre: string
  direccion?: {
    calle: string
    numero: string
  }
}

interface RepartidorHubProps {
  hub: RepartidorHubData
  pedidoActivo: RepartidorPedidoResumen | null
  pedidosRecientes: RepartidorPedidoResumen[]
}

export function RepartidorHub({
  hub,
  pedidoActivo,
  pedidosRecientes,
}: RepartidorHubProps) {
  const { perfil, ubicacion, kpis, accesosRapidos } = hub

  return (
    <section className="grid gap-6">
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Turno activo</p>
            <h2 className="text-xl font-semibold">
              {perfil.nombre} {perfil.apellido}
            </h2>
            <p className="text-sm text-muted-foreground">{perfil.email}</p>
          </div>
          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${
              perfil.disponible
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {perfil.disponible ? "● Disponible" : "○ No disponible"}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            detail={kpi.detail}
          />
        ))}
      </div>

      {pedidoActivo ? (
        <section className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Entrega en curso</h2>
            <OrderStatusBadge estado={pedidoActivo.estado} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Pedido</p>
              <p className="font-medium">#{pedidoActivo.idPedido}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Local</p>
              <p className="font-medium">
                {pedidoActivo.establecimientoNombre}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Destino</p>
              <p className="font-medium">
                {pedidoActivo.direccion
                  ? `${pedidoActivo.direccion.calle} ${pedidoActivo.direccion.numero}`
                  : "Sin dato"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-medium">{formatArs(pedidoActivo.total)}</p>
            </div>
          </div>

          <Link
            href={getRepartidorPedidoPath(pedidoActivo.idPedido)}
            className="mt-4 inline-flex text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Ver detalle de entrega →
          </Link>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold">Ubicación</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Latitud</dt>
              <dd className="font-medium tabular-nums">
                {ubicacion.latitude ?? "Sin dato"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Longitud</dt>
              <dd className="font-medium tabular-nums">
                {ubicacion.longitude ?? "Sin dato"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Última actualización</dt>
              <dd className="font-medium">{ubicacion.actualizadaLabel}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold">Pedidos recientes</h2>
          {pedidosRecientes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin entregas asignadas.
            </p>
          ) : (
            <ul className="divide-y">
              {pedidosRecientes.map((pedido) => (
                <li key={pedido.idPedido}>
                  <Link
                    href={getRepartidorPedidoPath(pedido.idPedido)}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-primary"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        #{pedido.idPedido} · {pedido.establecimientoNombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPedidoFecha(pedido.fechaHora)}
                      </p>
                    </div>
                    <OrderStatusBadge estado={pedido.estado} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/repartidor/pedidos"
            className="mt-2 inline-flex text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Ver todos →
          </Link>
        </section>
      </div>

      <div className="rounded-xl border border-border/80 bg-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">Accesos rápidos</h2>
        </div>
        <div className="divide-y">
          {accesosRapidos.map((acceso) => (
            <Link
              key={acceso.href}
              href={acceso.href}
              className="block p-4 transition-colors hover:bg-muted"
            >
              <p className="text-sm font-medium">{acceso.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {acceso.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
