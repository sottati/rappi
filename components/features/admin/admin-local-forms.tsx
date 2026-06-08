'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  updateEstablecimientoAction,
  updateRestaurantProfileAction,
  type AdminActionState,
} from '@/lib/admin/actions'
import type { Establecimiento } from '@/types/domain'

const initialState: AdminActionState = {}

const fieldClassName =
  'w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 md:text-sm'

interface AdminEstablecimientoFormProps {
  establecimiento: Establecimiento
}

export function AdminEstablecimientoForm({
  establecimiento,
}: AdminEstablecimientoFormProps) {
  const [state, formAction, pending] = useActionState(
    updateEstablecimientoAction,
    initialState
  )

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-semibold">Datos operativos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Información base del local en PostgreSQL. El email es de solo lectura.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="establecimiento-nombre" className="text-sm font-medium">
            Nombre
          </label>
          <Input
            id="establecimiento-nombre"
            name="nombre"
            defaultValue={establecimiento.nombre}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="establecimiento-tipo" className="text-sm font-medium">
            Tipo
          </label>
          <Input
            id="establecimiento-tipo"
            name="tipo"
            defaultValue={establecimiento.tipo}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="establecimiento-direccion" className="text-sm font-medium">
            Dirección
          </label>
          <Input
            id="establecimiento-direccion"
            name="direccion"
            defaultValue={establecimiento.direccion}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="establecimiento-telefono" className="text-sm font-medium">
            Teléfono
          </label>
          <Input
            id="establecimiento-telefono"
            name="telefono"
            defaultValue={establecimiento.telefono}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="establecimiento-email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="establecimiento-email"
            name="email"
            defaultValue={establecimiento.email}
            readOnly
            disabled
          />
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

      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar datos operativos'}
      </Button>
    </form>
  )
}

interface AdminPerfilComercialFormProps {
  descripcionComercial?: string
  horarioDia?: string
  horarioAbre?: string
  horarioCierra?: string
  zonasEntrega?: string[]
  mediosPago?: string[]
}

export function AdminPerfilComercialForm({
  descripcionComercial = '',
  horarioDia = '',
  horarioAbre = '',
  horarioCierra = '',
  zonasEntrega = [],
  mediosPago = [],
}: AdminPerfilComercialFormProps) {
  const [state, formAction, pending] = useActionState(
    updateRestaurantProfileAction,
    initialState
  )

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-semibold">Perfil comercial</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Contenido enriquecido del local en MongoDB (`restaurant_profiles`).
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="descripcion-comercial" className="text-sm font-medium">
          Descripción comercial
        </label>
        <textarea
          id="descripcion-comercial"
          name="descripcionComercial"
          rows={4}
          defaultValue={descripcionComercial}
          className={fieldClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="horario-dia" className="text-sm font-medium">
            Horario (días)
          </label>
          <Input
            id="horario-dia"
            name="horarioDia"
            placeholder="lunes-domingo"
            defaultValue={horarioDia}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="horario-abre" className="text-sm font-medium">
            Abre
          </label>
          <Input
            id="horario-abre"
            name="horarioAbre"
            placeholder="11:00"
            defaultValue={horarioAbre}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="horario-cierra" className="text-sm font-medium">
            Cierra
          </label>
          <Input
            id="horario-cierra"
            name="horarioCierra"
            placeholder="23:30"
            defaultValue={horarioCierra}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="zonas-entrega" className="text-sm font-medium">
            Zonas de entrega
          </label>
          <Input
            id="zonas-entrega"
            name="zonasEntrega"
            placeholder="Palermo, Recoleta"
            defaultValue={zonasEntrega.join(', ')}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="medios-pago" className="text-sm font-medium">
            Medios de pago
          </label>
          <Input
            id="medios-pago"
            name="mediosPago"
            placeholder="tarjeta, efectivo"
            defaultValue={mediosPago.join(', ')}
          />
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

      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar perfil comercial'}
      </Button>
    </form>
  )
}
