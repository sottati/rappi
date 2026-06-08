import { asc, desc, eq } from 'drizzle-orm'
import { EstadoPedido } from '@/types/domain'
import type {
  CuentaApp,
  DetallePedido,
  DireccionEntrega,
  Establecimiento,
  PedidoConDetalle,
  Producto,
  Repartidor,
} from '@/types/domain'
import type { QueryResult } from '../helpers'
import { fail, ok, shouldUseMockData } from '../helpers'
import { getDrizzleDb } from './drizzle'
import {
  mockCuentasApp,
  mockDireccionesEntrega,
  mockEstablecimientos,
  mockPedidos,
  mockProductos,
  mockRepartidores,
} from './mock'
import {
  cuentaApp,
  detallePedido,
  direccionEntrega,
  establecimiento,
  pedido,
  producto,
  repartidor,
} from './schema'
import type {
  CuentaAppSelect,
  DetallePedidoSelect,
  DireccionEntregaSelect,
  EstablecimientoSelect,
  PedidoSelect,
  ProductoSelect,
  RepartidorSelect,
} from './schema'

function mapDetalle(row: DetallePedidoSelect): DetallePedido {
  return {
    idDetalle: row.idDetalle,
    idPedido: row.idPedido,
    idProductoCatalogo: row.idProductoCatalogo,
    nombreProducto: row.nombreProducto,
    cantidad: row.cantidad,
    precioUnitario: row.precioUnitario,
  }
}

function mapPedido(
  row: PedidoSelect & { detalles: DetallePedidoSelect[] }
): PedidoConDetalle {
  return {
    idPedido: row.idPedido,
    idCliente: row.idCliente,
    idEstablecimiento: row.idEstablecimiento,
    idRepartidor: row.idRepartidor,
    idDireccion: row.idDireccion,
    fechaHora: row.fechaHora,
    estado: row.estado,
    total: row.total,
    detalles: row.detalles.map(mapDetalle),
  }
}

function mapEstablecimiento(row: EstablecimientoSelect): Establecimiento {
  return {
    idEstablecimiento: row.idEstablecimiento,
    nombre: row.nombre,
    tipo: row.tipo,
    direccion: row.direccion,
    email: row.email,
    telefono: row.telefono,
  }
}

function mapProducto(row: ProductoSelect): Producto {
  return {
    idProducto: row.idProducto,
    idEstablecimiento: row.idEstablecimiento,
    nombre: row.nombre,
    descripcion: row.descripcion,
    precio: row.precio,
    promocionPorcentaje: row.promocionPorcentaje,
    disponible: row.disponible,
    foto: row.foto,
  }
}

function mapRepartidor(row: RepartidorSelect): Repartidor {
  return {
    idRepartidor: row.idRepartidor,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    telefono: row.telefono,
    disponible: row.disponible,
    coordenadaActual: row.coordenadaActual,
  }
}

function mapDireccionEntrega(row: DireccionEntregaSelect): DireccionEntrega {
  return {
    idDireccion: row.idDireccion,
    idCliente: row.idCliente,
    calle: row.calle,
    numero: row.numero,
    ciudad: row.ciudad,
    codigoPostal: row.codigoPostal,
  }
}

export interface CreatePedidoFromCartSnapshotItem {
  idProductoCatalogo: number
  nombreProducto: string
  cantidad: number
  precioUnitario: number
}

export interface CreatePedidoFromCartSnapshotInput {
  idCliente: number
  idEstablecimiento: number
  idDireccion: number
  idRepartidor?: number | null
  items: CreatePedidoFromCartSnapshotItem[]
}

function calculatePedidoTotal(items: CreatePedidoFromCartSnapshotItem[]) {
  return items.reduce(
    (total, item) => total + item.precioUnitario * item.cantidad,
    0
  )
}

function validatePedidoSnapshotInput(input: CreatePedidoFromCartSnapshotInput) {
  if (input.items.length === 0) return 'El pedido no tiene items.'

  const invalidItem = input.items.find(
    (item) =>
      item.idProductoCatalogo <= 0 ||
      item.nombreProducto.trim().length === 0 ||
      item.cantidad <= 0 ||
      item.precioUnitario < 0
  )

  return invalidItem ? 'El pedido tiene items invalidos.' : null
}

export async function createPedidoFromCartSnapshot(
  input: CreatePedidoFromCartSnapshotInput
): Promise<QueryResult<PedidoConDetalle>> {
  const validationError = validatePedidoSnapshotInput(input)
  if (validationError) return fail(validationError)

  const total = calculatePedidoTotal(input.items)

  if (shouldUseMockData()) {
    const idPedido =
      Math.max(0, ...mockPedidos.map((item) => item.idPedido)) + 1
    const nextDetalleId =
      Math.max(
        0,
        ...mockPedidos.flatMap((item) =>
          item.detalles.map((detalle) => detalle.idDetalle)
        )
      ) + 1
    const detalles = input.items.map((item, index) => ({
      idDetalle: nextDetalleId + index,
      idPedido,
      idProductoCatalogo: item.idProductoCatalogo,
      nombreProducto: item.nombreProducto,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
    }))

    const created: PedidoConDetalle = {
      idPedido,
      idCliente: input.idCliente,
      idEstablecimiento: input.idEstablecimiento,
      idRepartidor: input.idRepartidor ?? null,
      idDireccion: input.idDireccion,
      fechaHora: new Date(),
      estado: EstadoPedido.Pendiente,
      total,
      detalles,
    }
    mockPedidos.push(created)
    return ok(created)
  }

  try {
    const result = await getDrizzleDb().transaction(async (tx) => {
      const [pedidoRow] = await tx
        .insert(pedido)
        .values({
          idCliente: input.idCliente,
          idEstablecimiento: input.idEstablecimiento,
          idRepartidor: input.idRepartidor ?? null,
          idDireccion: input.idDireccion,
          total,
        })
        .returning()

      const detalleRows = await tx
        .insert(detallePedido)
        .values(
          input.items.map((item) => ({
            idPedido: pedidoRow.idPedido,
            idProductoCatalogo: item.idProductoCatalogo,
            nombreProducto: item.nombreProducto.trim(),
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
          }))
        )
        .returning()

      return mapPedido({ ...pedidoRow, detalles: detalleRows })
    })

    return ok(result)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to create pedido')
  }
}

export async function getPedidos(): Promise<QueryResult<PedidoConDetalle[]>> {
  if (shouldUseMockData()) {
    return ok(
      [...mockPedidos].sort(
        (a, b) => b.fechaHora.getTime() - a.fechaHora.getTime()
      )
    )
  }

  try {
    const rows = await getDrizzleDb().query.pedido.findMany({
      with: { detalles: true },
      orderBy: desc(pedido.fechaHora),
    })
    return ok(rows.map(mapPedido))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch pedidos')
  }
}

export async function getPedidoById(
  idPedido: number
): Promise<QueryResult<PedidoConDetalle | null>> {
  if (shouldUseMockData()) {
    return ok(mockPedidos.find((p) => p.idPedido === idPedido) ?? null)
  }

  try {
    const row = await getDrizzleDb().query.pedido.findFirst({
      with: { detalles: true },
      where: eq(pedido.idPedido, idPedido),
    })
    return ok(row ? mapPedido(row) : null)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch pedido')
  }
}

export async function getPedidosByEstado(
  estado: EstadoPedido
): Promise<QueryResult<PedidoConDetalle[]>> {
  if (shouldUseMockData()) {
    return ok(mockPedidos.filter((p) => p.estado === estado))
  }

  try {
    const rows = await getDrizzleDb().query.pedido.findMany({
      with: { detalles: true },
      where: eq(pedido.estado, estado),
      orderBy: desc(pedido.fechaHora),
    })
    return ok(rows.map(mapPedido))
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : 'Failed to fetch pedidos by estado'
    )
  }
}

export async function getPedidosByCliente(
  idCliente: number
): Promise<QueryResult<PedidoConDetalle[]>> {
  if (shouldUseMockData()) {
    return ok(mockPedidos.filter((p) => p.idCliente === idCliente))
  }

  try {
    const rows = await getDrizzleDb().query.pedido.findMany({
      with: { detalles: true },
      where: eq(pedido.idCliente, idCliente),
      orderBy: desc(pedido.fechaHora),
    })
    return ok(rows.map(mapPedido))
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : 'Failed to fetch pedidos by cliente'
    )
  }
}

export async function getPedidosByEstablecimiento(
  idEstablecimiento: number
): Promise<QueryResult<PedidoConDetalle[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockPedidos.filter((p) => p.idEstablecimiento === idEstablecimiento)
    )
  }

  try {
    const rows = await getDrizzleDb().query.pedido.findMany({
      with: { detalles: true },
      where: eq(pedido.idEstablecimiento, idEstablecimiento),
      orderBy: desc(pedido.fechaHora),
    })
    return ok(rows.map(mapPedido))
  } catch (e) {
    return fail(
      e instanceof Error
        ? e.message
        : 'Failed to fetch pedidos by establecimiento'
    )
  }
}

export async function getEstablecimientos(): Promise<
  QueryResult<Establecimiento[]>
> {
  if (shouldUseMockData()) {
    return ok([...mockEstablecimientos].sort((a, b) => a.nombre.localeCompare(b.nombre)))
  }

  try {
    const rows = await getDrizzleDb().query.establecimiento.findMany({
      orderBy: asc(establecimiento.nombre),
    })
    return ok(rows.map(mapEstablecimiento))
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : 'Failed to fetch establecimientos'
    )
  }
}

export async function getEstablecimientoById(
  idEstablecimiento: number
): Promise<QueryResult<Establecimiento | null>> {
  if (shouldUseMockData()) {
    return ok(
      mockEstablecimientos.find(
        (item) => item.idEstablecimiento === idEstablecimiento
      ) ?? null
    )
  }

  try {
    const row = await getDrizzleDb().query.establecimiento.findFirst({
      where: eq(establecimiento.idEstablecimiento, idEstablecimiento),
    })
    return ok(row ? mapEstablecimiento(row) : null)
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : 'Failed to fetch establecimiento'
    )
  }
}

export interface UpdateEstablecimientoInput {
  nombre: string
  tipo: string
  direccion: string
  telefono: string
}

export async function updateEstablecimiento(
  idEstablecimiento: number,
  data: UpdateEstablecimientoInput
): Promise<QueryResult<Establecimiento>> {
  const payload = {
    nombre: data.nombre.trim(),
    tipo: data.tipo.trim(),
    direccion: data.direccion.trim(),
    telefono: data.telefono.trim(),
  }

  if (shouldUseMockData()) {
    const item = mockEstablecimientos.find(
      (establecimientoItem) =>
        establecimientoItem.idEstablecimiento === idEstablecimiento
    )

    if (!item) {
      return fail('Establecimiento no encontrado.')
    }

    Object.assign(item, payload)
    return ok(item)
  }

  try {
    const rows = await getDrizzleDb()
      .update(establecimiento)
      .set(payload)
      .where(eq(establecimiento.idEstablecimiento, idEstablecimiento))
      .returning()

    const row = rows[0]
    if (!row) {
      return fail('Establecimiento no encontrado.')
    }

    return ok(mapEstablecimiento(row))
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : 'Failed to update establecimiento'
    )
  }
}

export async function getDireccionesByCliente(
  idCliente: number
): Promise<QueryResult<DireccionEntrega[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockDireccionesEntrega.filter((item) => item.idCliente === idCliente)
    )
  }

  try {
    const rows = await getDrizzleDb().query.direccionEntrega.findMany({
      where: eq(direccionEntrega.idCliente, idCliente),
      orderBy: asc(direccionEntrega.idDireccion),
    })
    return ok(rows.map(mapDireccionEntrega))
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : 'Failed to fetch direcciones by cliente'
    )
  }
}

export async function getProductosByEstablecimiento(
  idEstablecimiento: number
): Promise<QueryResult<Producto[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockProductos
        .filter((item) => item.idEstablecimiento === idEstablecimiento)
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
    )
  }

  try {
    const rows = await getDrizzleDb().query.producto.findMany({
      where: eq(producto.idEstablecimiento, idEstablecimiento),
      orderBy: asc(producto.nombre),
    })
    return ok(rows.map(mapProducto))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch productos')
  }
}

export async function getRepartidoresDisponibles(): Promise<
  QueryResult<Repartidor[]>
> {
  if (shouldUseMockData()) {
    return ok(mockRepartidores.filter((r) => r.disponible))
  }

  try {
    const rows = await getDrizzleDb().query.repartidor.findMany({
      where: eq(repartidor.disponible, true),
    })
    return ok(rows.map(mapRepartidor))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch repartidores')
  }
}

export async function getRepartidorById(
  idRepartidor: number
): Promise<QueryResult<Repartidor | null>> {
  if (shouldUseMockData()) {
    return ok(
      mockRepartidores.find((r) => r.idRepartidor === idRepartidor) ?? null
    )
  }

  try {
    const row = await getDrizzleDb().query.repartidor.findFirst({
      where: eq(repartidor.idRepartidor, idRepartidor),
    })
    return ok(row ? mapRepartidor(row) : null)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch repartidor')
  }
}

export async function getPedidosByRepartidor(
  idRepartidor: number
): Promise<QueryResult<PedidoConDetalle[]>> {
  if (shouldUseMockData()) {
    return ok(mockPedidos.filter((p) => p.idRepartidor === idRepartidor))
  }

  try {
    const rows = await getDrizzleDb().query.pedido.findMany({
      with: { detalles: true },
      where: eq(pedido.idRepartidor, idRepartidor),
      orderBy: desc(pedido.fechaHora),
    })
    return ok(rows.map(mapPedido))
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : 'Failed to fetch pedidos by repartidor'
    )
  }
}

function mapCuentaApp(row: CuentaAppSelect): CuentaApp {
  return {
    idCuenta: row.idCuenta,
    email: row.email,
    contrasenia: row.contrasenia,
    rol: row.rol,
    nombreVisible: row.nombreVisible,
    idCliente: row.idCliente,
    idRepartidor: row.idRepartidor,
    idEstablecimiento: row.idEstablecimiento,
  }
}

export async function authenticateCuenta(
  email: string,
  password: string
): Promise<QueryResult<CuentaApp>> {
  const normalizedEmail = email.trim().toLowerCase()

  if (shouldUseMockData()) {
    const cuenta = mockCuentasApp.find(
      (item) =>
        item.email.toLowerCase() === normalizedEmail &&
        item.contrasenia === password
    )
    if (!cuenta) return fail('Email o contraseña incorrectos.')
    return ok(cuenta)
  }

  try {
    const row = await getDrizzleDb().query.cuentaApp.findFirst({
      where: eq(cuentaApp.email, normalizedEmail),
    })
    if (!row || row.contrasenia !== password) {
      return fail('Email o contraseña incorrectos.')
    }
    return ok(mapCuentaApp(row))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Error al autenticar')
  }
}

export const getOrders = getPedidos
export const getOrderById = getPedidoById
export const getOrdersByStatus = getPedidosByEstado
export const getActiveRestaurants = getEstablecimientos
export const getAvailableDeliveryPersons = getRepartidoresDisponibles
export const getOrdersByDeliveryPerson = getPedidosByRepartidor
