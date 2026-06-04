'use client'

import {
  Add01Icon,
  ArrowLeft01Icon,
  Remove01Icon,
  Restaurant01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatArs, type ProductoDetalle } from '@/lib/rappi'

function getPrecioFinal(precio: number, promocionPorcentaje: number) {
  if (promocionPorcentaje <= 0) return precio
  return Math.round(precio * (1 - promocionPorcentaje / 100))
}

interface ProductDetailViewProps {
  detalle: ProductoDetalle
}

export function ProductDetailView({ detalle }: ProductDetailViewProps) {
  const { producto, establecimiento, presentacion } = detalle
  const [imgError, setImgError] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const precioFinal = getPrecioFinal(producto.precio, producto.promocionPorcentaje)
  const tienePromo = producto.promocionPorcentaje > 0
  const establecimientoHref = `/restaurantes/${establecimiento.idEstablecimiento}`

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/restaurantes" className="transition-colors hover:text-foreground">
          Restaurantes
        </Link>
        <span aria-hidden>/</span>
        <Link href={establecimientoHref} className="transition-colors hover:text-foreground">
          {establecimiento.nombre}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground">{producto.nombre}</span>
      </nav>

      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link href={establecimientoHref}>
          <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" strokeWidth={2} />
          Volver al menú
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-muted/40">
            <div className="flex aspect-square max-h-[420px] w-full items-center justify-center p-6 sm:p-10">
              {producto.foto && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={producto.foto}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-2xl font-semibold text-muted-foreground">
                  {producto.nombre.slice(0, 2)}
                </span>
              )}
            </div>
          </div>

          <section className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {presentacion.categoria}
                </span>
                {tienePromo ? (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
                    -{producto.promocionPorcentaje}%
                  </span>
                ) : null}
                {!producto.disponible ? (
                  <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                    No disponible
                  </span>
                ) : null}
              </div>

              <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
                {producto.nombre}
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                {producto.descripcion}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Ingredientes</h2>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {presentacion.ingredientes.map((ingrediente) => (
                  <li
                    key={ingrediente}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-primary/70" />
                    {ingrediente}
                  </li>
                ))}
              </ul>
              {presentacion.nota ? (
                <p className="text-sm text-muted-foreground">{presentacion.nota}</p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 lg:sticky lg:top-28">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HugeiconsIcon icon={Restaurant01Icon} className="size-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{establecimiento.nombre}</p>
              <p className="truncate text-xs text-muted-foreground">{establecimiento.direccion}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Precio</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold">{formatArs(precioFinal)}</span>
              {tienePromo ? (
                <span className="text-sm text-muted-foreground line-through">
                  {formatArs(producto.precio)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Cantidad</p>
            <div className="inline-flex items-center rounded-full border border-border">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                aria-label="Quitar uno"
                disabled={quantity <= 1 || !producto.disponible}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                <HugeiconsIcon icon={Remove01Icon} className="size-4" strokeWidth={2} />
              </Button>
              <span className="min-w-8 text-center text-sm font-medium tabular-nums">
                {quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                aria-label="Agregar uno"
                disabled={!producto.disponible}
                onClick={() => setQuantity((current) => current + 1)}
              >
                <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={2} />
              </Button>
            </div>
          </div>

          <Button
            type="button"
            className="w-full rounded-full"
            size="lg"
            disabled={!producto.disponible}
          >
            Agregar {formatArs(precioFinal * quantity)}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Mock sin carrito persistente.
          </p>
        </aside>
      </div>
    </div>
  )
}
