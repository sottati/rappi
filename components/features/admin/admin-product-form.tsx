'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  saveCatalogProductAction,
  setProductAvailabilityAction,
  type AdminActionState,
} from '@/lib/admin/actions'
import type { RestaurantCatalogProduct } from '@/lib/db/mongodb/types'

const initialState: AdminActionState = {}

const fieldClassName =
  'w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 md:text-sm'

interface AdminProductFormProps {
  producto?: RestaurantCatalogProduct
  categoriaNombre?: string
  mode: 'create' | 'edit'
}

export function AdminProductForm({
  producto,
  categoriaNombre = '',
  mode,
}: AdminProductFormProps) {
  const [state, formAction, pending] = useActionState(
    saveCatalogProductAction,
    initialState
  )

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
      {mode === 'edit' && producto ? (
        <input type="hidden" name="idProducto" value={producto.idProducto} readOnly />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="producto-nombre" className="text-sm font-medium">
            Nombre
          </label>
          <Input
            id="producto-nombre"
            name="nombre"
            defaultValue={producto?.nombre ?? ''}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="producto-descripcion" className="text-sm font-medium">
            Descripción
          </label>
          <textarea
            id="producto-descripcion"
            name="descripcion"
            rows={3}
            defaultValue={producto?.descripcion ?? ''}
            required
            className={fieldClassName}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="producto-categoria" className="text-sm font-medium">
            Categoría
          </label>
          <Input
            id="producto-categoria"
            name="categoriaNombre"
            defaultValue={categoriaNombre}
            placeholder="Hamburguesas"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="producto-foto" className="text-sm font-medium">
            URL de foto
          </label>
          <Input
            id="producto-foto"
            name="foto"
            type="url"
            defaultValue={producto?.foto ?? ''}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="producto-precio" className="text-sm font-medium">
            Precio
          </label>
          <Input
            id="producto-precio"
            name="precio"
            type="number"
            min="0"
            step="0.01"
            defaultValue={producto?.precio ?? ''}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="producto-promo" className="text-sm font-medium">
            Promoción (%)
          </label>
          <Input
            id="producto-promo"
            name="promocionPorcentaje"
            type="number"
            min="0"
            max="100"
            defaultValue={producto?.promocionPorcentaje ?? 0}
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="producto-disponible"
            name="disponible"
            type="checkbox"
            defaultChecked={producto?.disponible ?? true}
            className="size-4 rounded border border-border"
          />
          <label htmlFor="producto-disponible" className="text-sm font-medium">
            Disponible para venta
          </label>
        </div>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? 'Guardando…'
            : mode === 'create'
              ? 'Crear producto'
              : 'Guardar cambios'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/productos">Volver al catálogo</Link>
        </Button>
      </div>
    </form>
  )
}

interface AdminProductAvailabilityToggleProps {
  idProducto: number
  disponible: boolean
}

export function AdminProductAvailabilityToggle({
  idProducto,
  disponible,
}: AdminProductAvailabilityToggleProps) {
  const [state, formAction, pending] = useActionState(
    setProductAvailabilityAction,
    initialState
  )

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="idProducto" value={idProducto} readOnly />
      <input type="hidden" name="disponible" value={String(!disponible)} readOnly />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending
          ? 'Actualizando…'
          : disponible
            ? 'Marcar no disponible'
            : 'Marcar disponible'}
      </Button>
      {state.error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  )
}
