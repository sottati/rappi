'use server'

import { revalidatePath } from 'next/cache'

import { postgres } from '@/lib/db'
import type { DireccionEntregaInput } from '@/lib/db/postgres/queries'
import { getUsuarioScope } from '@/lib/usuario/scope'

export interface UsuarioActionState {
  error?: string
  success?: string
}

function parseDireccionInput(formData: FormData): DireccionEntregaInput | null {
  const calle = String(formData.get('calle') ?? '').trim()
  const numero = String(formData.get('numero') ?? '').trim()
  const ciudad = String(formData.get('ciudad') ?? '').trim()
  const codigoPostal = String(formData.get('codigoPostal') ?? '').trim()

  if (!calle || !numero || !ciudad || !codigoPostal) {
    return null
  }

  return { calle, numero, ciudad, codigoPostal }
}

export async function saveDireccionAction(
  _prevState: UsuarioActionState,
  formData: FormData
): Promise<UsuarioActionState> {
  const scope = await getUsuarioScope()
  if (!scope.ok) {
    return { error: scope.error }
  }

  const input = parseDireccionInput(formData)
  if (!input) {
    return { error: 'Completá todos los campos de la dirección.' }
  }

  const rawId = String(formData.get('idDireccion') ?? '').trim()
  const idDireccion = rawId ? Number.parseInt(rawId, 10) : null

  if (idDireccion != null && Number.isNaN(idDireccion)) {
    return { error: 'Id de dirección inválido.' }
  }

  const result =
    idDireccion == null
      ? await postgres.queries.createDireccionEntrega(scope.idCliente, input)
      : await postgres.queries.updateDireccionEntrega(
          idDireccion,
          scope.idCliente,
          input
        )

  if (result.error || !result.data) {
    return { error: result.error ?? 'No se pudo guardar la dirección.' }
  }

  revalidatePath('/usuario')

  return {
    success:
      idDireccion == null
        ? 'Dirección agregada.'
        : 'Dirección actualizada.',
  }
}

export async function deleteDireccionAction(
  _prevState: UsuarioActionState,
  formData: FormData
): Promise<UsuarioActionState> {
  const scope = await getUsuarioScope()
  if (!scope.ok) {
    return { error: scope.error }
  }

  const idDireccion = Number.parseInt(
    String(formData.get('idDireccion') ?? ''),
    10
  )

  if (Number.isNaN(idDireccion)) {
    return { error: 'Id de dirección inválido.' }
  }

  const result = await postgres.queries.deleteDireccionEntrega(
    idDireccion,
    scope.idCliente
  )

  if (result.error) {
    return { error: result.error }
  }

  revalidatePath('/usuario')

  return { success: 'Dirección eliminada.' }
}
