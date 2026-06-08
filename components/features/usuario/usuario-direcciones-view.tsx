'use client'

import { useActionState, useEffect, useState } from 'react'

import { EmptyState } from '@/components/shared/query-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  deleteDireccionAction,
  saveDireccionAction,
  type UsuarioActionState,
} from '@/lib/usuario/actions'
import type { DireccionEntrega } from '@/types/domain'

const initialState: UsuarioActionState = {}

interface UsuarioDireccionesViewProps {
  direcciones: DireccionEntrega[]
}

function formatDireccion(direccion: DireccionEntrega) {
  return `${direccion.calle} ${direccion.numero}, ${direccion.ciudad} (${direccion.codigoPostal})`
}

interface DireccionFormProps {
  direccion?: DireccionEntrega
  onDone: () => void
}

function DireccionForm({ direccion, onDone }: DireccionFormProps) {
  const [state, formAction, pending] = useActionState(
    saveDireccionAction,
    initialState
  )

  useEffect(() => {
    if (state.success) {
      onDone()
    }
  }, [state.success, onDone])

  const fieldId = direccion?.idDireccion ?? 'nueva'

  return (
    <form
      action={formAction}
      className="w-full max-w-md space-y-3 rounded-xl border bg-muted/30 p-4"
    >
      {direccion ? (
        <input
          type="hidden"
          name="idDireccion"
          value={direccion.idDireccion}
          readOnly
        />
      ) : null}

      <Input
        id={`calle-${fieldId}`}
        name="calle"
        placeholder="Calle"
        aria-label="Calle"
        defaultValue={direccion?.calle ?? ''}
        required
      />

      <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_5.5rem] gap-3 sm:grid-cols-[5rem_minmax(0,1fr)_6rem]">
        <Input
          id={`numero-${fieldId}`}
          name="numero"
          placeholder="Nº"
          aria-label="Número"
          defaultValue={direccion?.numero ?? ''}
          required
        />
        <Input
          id={`ciudad-${fieldId}`}
          name="ciudad"
          placeholder="Ciudad"
          aria-label="Ciudad"
          defaultValue={direccion?.ciudad ?? ''}
          required
        />
        <Input
          id={`codigo-postal-${fieldId}`}
          name="codigoPostal"
          placeholder="CP"
          aria-label="Código postal"
          defaultValue={direccion?.codigoPostal ?? ''}
          required
        />
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

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending
            ? 'Guardando…'
            : direccion
              ? 'Guardar cambios'
              : 'Agregar dirección'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function DireccionDeleteButton({ idDireccion }: { idDireccion: number }) {
  const [state, formAction, pending] = useActionState(
    deleteDireccionAction,
    initialState
  )

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="idDireccion" value={idDireccion} readOnly />
      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={pending}
        className="text-destructive hover:text-destructive"
      >
        {pending ? 'Eliminando…' : 'Eliminar'}
      </Button>
      {state.error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}

export function UsuarioDireccionesView({
  direcciones,
}: UsuarioDireccionesViewProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  return (
    <div className="relative">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Direcciones de entrega</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestioná las direcciones donde podés recibir pedidos.
          </p>
        </div>
        {!showCreate && editingId == null ? (
          <Button type="button" size="sm" onClick={() => setShowCreate(true)}>
            Agregar dirección
          </Button>
        ) : null}
      </div>

      {showCreate ? (
        <div className="mt-5">
          <DireccionForm onDone={() => setShowCreate(false)} />
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {direcciones.length === 0 && !showCreate ? (
          <EmptyState title="Todavía no tenés direcciones guardadas." />
        ) : null}

        {direcciones.map((direccion) =>
          editingId === direccion.idDireccion ? (
            <DireccionForm
              key={direccion.idDireccion}
              direccion={direccion}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <article
              key={direccion.idDireccion}
              className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-medium">{formatDireccion(direccion)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowCreate(false)
                    setEditingId(direccion.idDireccion)
                  }}
                >
                  Editar
                </Button>
                <DireccionDeleteButton idDireccion={direccion.idDireccion} />
              </div>
            </article>
          )
        )}
      </div>
    </div>
  )
}
