'use client'

import { Location01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart/store'
import { cn } from '@/lib/utils'
import type { DireccionEntrega } from '@/types/domain'

function formatDireccion(direccion: DireccionEntrega) {
  return `${direccion.calle} ${direccion.numero}, ${direccion.ciudad} (${direccion.codigoPostal})`
}

interface CartAddressPickerProps {
  direcciones: DireccionEntrega[]
}

export function CartAddressPicker({ direcciones }: CartAddressPickerProps) {
  const selectedDireccionId = useCartStore((state) => state.selectedDireccionId)
  const setSelectedDireccionId = useCartStore(
    (state) => state.setSelectedDireccionId
  )

  useEffect(() => {
    if (direcciones.length === 0) return

    const isCurrentValid = direcciones.some(
      (direccion) => direccion.idDireccion === selectedDireccionId
    )

    if (!isCurrentValid) {
      setSelectedDireccionId(direcciones[0].idDireccion)
    }
  }, [direcciones, selectedDireccionId, setSelectedDireccionId])

  if (direcciones.length === 0) {
    return (
      <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon
              icon={Location01Icon}
              className="size-5"
              strokeWidth={2}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-semibold">Dirección de entrega</p>
            <p className="text-sm text-muted-foreground">
              Agregá al menos una dirección para poder confirmar el pedido.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/usuario">Gestionar direcciones</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon
              icon={Location01Icon}
              className="size-5"
              strokeWidth={2}
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Dirección de entrega</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Elegí dónde querés recibir el pedido.
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/usuario">Gestionar</Link>
        </Button>
      </div>

      <fieldset className="space-y-2">
        <legend className="sr-only">Seleccionar dirección de entrega</legend>
        {direcciones.map((direccion) => {
          const isSelected = selectedDireccionId === direccion.idDireccion

          return (
            <label
              key={direccion.idDireccion}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border/80 hover:bg-muted/40'
              )}
            >
              <input
                type="radio"
                name="direccionEntrega"
                value={direccion.idDireccion}
                checked={isSelected}
                onChange={() =>
                  setSelectedDireccionId(direccion.idDireccion)
                }
                className="mt-1 size-4 shrink-0 accent-primary"
              />
              <span className="min-w-0 text-sm leading-snug">
                {formatDireccion(direccion)}
              </span>
            </label>
          )
        })}
      </fieldset>
    </section>
  )
}
