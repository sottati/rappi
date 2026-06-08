'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getAdminScope } from '@/lib/admin/scope'
import { mongodb, postgres } from '@/lib/db'
import type { CatalogProductInput } from '@/lib/db/mongodb/types'

export interface AdminActionState {
  error?: string
  success?: string
}

function parseCatalogProductInput(formData: FormData): CatalogProductInput | null {
  const nombre = String(formData.get('nombre') ?? '').trim()
  const descripcion = String(formData.get('descripcion') ?? '').trim()
  const categoriaNombre = String(formData.get('categoriaNombre') ?? '').trim()
  const precio = Number.parseFloat(String(formData.get('precio') ?? ''))
  const promocionPorcentaje = Number.parseInt(
    String(formData.get('promocionPorcentaje') ?? '0'),
    10
  )
  const foto = String(formData.get('foto') ?? '').trim()
  const disponible = formData.get('disponible') === 'on'

  if (!nombre || !descripcion || !categoriaNombre) {
    return null
  }

  if (!Number.isFinite(precio) || precio < 0) {
    return null
  }

  if (
    !Number.isFinite(promocionPorcentaje) ||
    promocionPorcentaje < 0 ||
    promocionPorcentaje > 100
  ) {
    return null
  }

  return {
    nombre,
    descripcion,
    categoriaNombre,
    precio,
    promocionPorcentaje,
    foto,
    disponible,
  }
}

function parseCommaList(raw: string): string[] {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function updateEstablecimientoAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const scope = await getAdminScope()
  if (!scope.ok) {
    return { error: scope.error }
  }

  const nombre = String(formData.get('nombre') ?? '').trim()
  const tipo = String(formData.get('tipo') ?? '').trim()
  const direccion = String(formData.get('direccion') ?? '').trim()
  const telefono = String(formData.get('telefono') ?? '').trim()

  if (!nombre || !tipo || !direccion || !telefono) {
    return { error: 'Completá todos los campos operativos del establecimiento.' }
  }

  const updated = await postgres.queries.updateEstablecimiento(
    scope.idEstablecimiento,
    { nombre, tipo, direccion, telefono }
  )

  if (updated.error || !updated.data) {
    return { error: updated.error ?? 'No se pudo actualizar el establecimiento.' }
  }

  const syncedCatalog = await mongodb.queries.syncCatalogHeader(
    scope.idEstablecimiento,
    updated.data.nombre,
    updated.data.tipo
  )

  if (syncedCatalog.error) {
    return { error: syncedCatalog.error }
  }

  const profile = await mongodb.queries.getRestaurantProfile(scope.idEstablecimiento)
  if (!profile.error && profile.data) {
    await mongodb.queries.upsertRestaurantProfile(scope.idEstablecimiento, {
      nombre: updated.data.nombre,
      descripcionComercial: profile.data.descripcionComercial,
      horarios: profile.data.horarios,
      zonasEntrega: profile.data.zonasEntrega,
      mediosPago: profile.data.mediosPago,
    })
  }

  revalidatePath('/admin/local')
  revalidatePath('/admin/productos')
  revalidatePath('/restaurantes')

  return { success: 'Datos operativos actualizados.' }
}

export async function updateRestaurantProfileAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const scope = await getAdminScope()
  if (!scope.ok) {
    return { error: scope.error }
  }

  const establecimiento = await postgres.queries.getEstablecimientoById(
    scope.idEstablecimiento
  )

  if (establecimiento.error || !establecimiento.data) {
    return {
      error:
        establecimiento.error ?? 'No se encontró el establecimiento asociado.',
    }
  }

  const descripcionComercial = String(formData.get('descripcionComercial') ?? '').trim()
  const horarioDia = String(formData.get('horarioDia') ?? '').trim()
  const horarioAbre = String(formData.get('horarioAbre') ?? '').trim()
  const horarioCierra = String(formData.get('horarioCierra') ?? '').trim()
  const zonasEntrega = parseCommaList(String(formData.get('zonasEntrega') ?? ''))
  const mediosPago = parseCommaList(String(formData.get('mediosPago') ?? ''))

  const horarios =
    horarioDia && horarioAbre && horarioCierra
      ? [{ dia: horarioDia, abre: horarioAbre, cierra: horarioCierra }]
      : undefined

  const saved = await mongodb.queries.upsertRestaurantProfile(
    scope.idEstablecimiento,
    {
      nombre: establecimiento.data.nombre,
      descripcionComercial: descripcionComercial || undefined,
      horarios,
      zonasEntrega: zonasEntrega.length > 0 ? zonasEntrega : undefined,
      mediosPago: mediosPago.length > 0 ? mediosPago : undefined,
    }
  )

  if (saved.error || !saved.data) {
    return { error: saved.error ?? 'No se pudo guardar el perfil comercial.' }
  }

  revalidatePath('/admin/local')
  revalidatePath('/restaurantes')

  return { success: 'Perfil comercial actualizado.' }
}

export async function saveCatalogProductAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const scope = await getAdminScope()
  if (!scope.ok) {
    return { error: scope.error }
  }

  const input = parseCatalogProductInput(formData)
  if (!input) {
    return { error: 'Revisá los datos del producto.' }
  }

  const rawId = String(formData.get('idProducto') ?? '').trim()
  const idProducto = rawId ? Number.parseInt(rawId, 10) : null

  if (idProducto != null && Number.isNaN(idProducto)) {
    return { error: 'Id de producto inválido.' }
  }

  const result =
    idProducto == null
      ? await mongodb.queries.addCatalogProduct(scope.idEstablecimiento, input)
      : await mongodb.queries.updateCatalogProduct(
          scope.idEstablecimiento,
          idProducto,
          input
        )

  if (result.error || !result.data) {
    return { error: result.error ?? 'No se pudo guardar el producto.' }
  }

  revalidatePath('/admin/productos')
  revalidatePath(`/admin/productos/${result.data.idProducto}`)
  revalidatePath(`/restaurantes/${scope.idEstablecimiento}`)

  if (idProducto == null) {
    redirect(`/admin/productos/${result.data.idProducto}`)
  }

  return { success: 'Producto actualizado.' }
}

export async function setProductAvailabilityAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const scope = await getAdminScope()
  if (!scope.ok) {
    return { error: scope.error }
  }

  const idProducto = Number.parseInt(String(formData.get('idProducto') ?? ''), 10)
  const disponible = formData.get('disponible') === 'true'

  if (Number.isNaN(idProducto)) {
    return { error: 'Id de producto inválido.' }
  }

  const result = await mongodb.queries.setCatalogProductAvailability(
    scope.idEstablecimiento,
    idProducto,
    disponible
  )

  if (result.error) {
    return { error: result.error }
  }

  revalidatePath('/admin/productos')
  revalidatePath(`/admin/productos/${idProducto}`)
  revalidatePath(`/restaurantes/${scope.idEstablecimiento}`)

  return {
    success: disponible
      ? 'Producto marcado como disponible.'
      : 'Producto marcado como no disponible.',
  }
}
