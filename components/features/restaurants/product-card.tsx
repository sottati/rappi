'use client'

// Muestra un producto en el catálogo de un establecimiento
// Recibe los datos del producto via props

import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart/store'
import { formatArs, getProductoPath } from '@/lib/rappi'
import { cn } from '@/lib/utils'
import type { Producto } from '@/types/domain'

function getPrecioFinal(producto: Producto) {
  if (producto.promocionPorcentaje <= 0) return producto.precio
  return Math.round(producto.precio * (1 - producto.promocionPorcentaje / 100))
}

interface ProductCardProps {
  producto: Producto
  idEstablecimiento: number
  restaurantName: string
  restaurantLogoSrc?: string
  deliveryMinutes?: number
  deliveryFee?: number
  className?: string
}

export function ProductCard({
  producto,
  idEstablecimiento,
  restaurantName,
  restaurantLogoSrc,
  deliveryMinutes,
  deliveryFee,
  className,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const currentRestaurantId = useCartStore((state) => state.restaurantId)
  const precioFinal = getPrecioFinal(producto)
  const tienePromo = producto.promocionPorcentaje > 0
  const href = getProductoPath(idEstablecimiento, producto.idProducto)

  const handleAdd = () => {
    if (
      currentRestaurantId !== null &&
      currentRestaurantId !== idEstablecimiento &&
      !window.confirm(
        'Tu carrito tiene productos de otro local. ¿Querés reemplazarlo?'
      )
    ) {
      return
    }

    addItem({
      idProducto: producto.idProducto,
      idEstablecimiento,
      restaurantName,
      restaurantLogoSrc,
      deliveryMinutes,
      deliveryFee,
      name: producto.nombre,
      description: producto.descripcion,
      unitPrice: precioFinal,
      imageSrc: producto.foto,
    })
  }

  return (
    <article
      className={cn(
        'flex gap-3 rounded-2xl border border-border/80 bg-card p-3 transition-colors hover:border-primary/30',
        !producto.disponible && 'opacity-60',
        className
      )}
    >
      <Link
        href={href}
        className="flex min-w-0 flex-1 gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/50 sm:size-24">
          {producto.foto && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={producto.foto}
              alt=""
              className="size-full object-contain p-2"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-xs font-semibold text-muted-foreground">
              {producto.nombre.slice(0, 2)}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm leading-tight font-semibold sm:text-base">
                {producto.nombre}
              </h3>
              {tienePromo ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
                  -{producto.promocionPorcentaje}%
                </span>
              ) : null}
            </div>
            <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
              {producto.descripcion}
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold sm:text-base">
              {formatArs(precioFinal)}
            </span>
            {tienePromo ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatArs(producto.precio)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex shrink-0 items-end">
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={!producto.disponible}
          aria-label={`Agregar ${producto.nombre}`}
          onClick={handleAdd}
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={2} />
          Agregar
        </Button>
      </div>
    </article>
  )
}
